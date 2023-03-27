import axios from "axios";
import auth from "configs/auth";
import config from "configs/config";
import FormData from "form-data";
import { bot } from "init/client";
import { MessageType } from "kasumi.js/dist/type";
import { types } from "pixnode";
import sharp from "sharp";
import * as pixiv from '../common';
import * as fs from 'fs';
import upath from 'upath';
import dailyCmd from './pixiv.daily.app';
import schedule from 'node-schedule';

class Time {
    static readonly DAY = 86400;
    static readonly HOUR = 3600;
    static readonly MINUTE = 60;
    static readonly SECOND = 1;
    private static wholeDivision(a: number, b: number) {
        return Math.floor(a / b);
    }
    private static wholeModulo(a: number, b: number) {
        return Math.floor(a % b);
    }
    static timeDivision(time: number) {
        let d, h, m, s;
        d = this.wholeDivision(time, this.DAY);
        time = this.wholeModulo(time, this.DAY);
        h = this.wholeDivision(time, this.HOUR);
        time = this.wholeModulo(time, this.HOUR);
        m = this.wholeDivision(time, this.MINUTE);
        time = this.wholeModulo(time, this.MINUTE);
        s = this.wholeDivision(time, this.SECOND);
        time = this.wholeModulo(time, this.SECOND);
        return [d, h, m, s];
    }

    static timeToString(time: number) {
        let res = "";
        const [d, h, m, s] = this.timeDivision(time);
        if (d) res += `${d}天`;
        if (h) res += `${h}小时`;
        if (m) res += `${m}分钟`;
        if (s) res += `${s}秒`;
        return res;
    }
}

class Daily {
    constructor() {
        this.load();
        this.schedule();
    }
    private map: {
        [id: string]: {
            next: number,
            interval: number
        }
    } = {};
    private _save() {
        const data = JSON.stringify(this.map);
        fs.writeFileSync(upath.join(__dirname, 'daily.json'), data, { encoding: 'utf-8' });
    }
    save() {
        do {
            try {
                this._save();
                this._load();
                break;
            } catch (e) {
                dailyCmd.logger.error(e);
            }
        } while (true);
    }
    private _load() {
        if (fs.existsSync(upath.join(__dirname, 'daily.json'))) {
            const data = JSON.parse(fs.readFileSync(upath.join(__dirname, 'daily.json'), { encoding: 'utf-8' }));
            this.map = data;
        } else {
            this.map = {};
        }
    }
    load() {
        this._load();
        this.save();
    }
    schedule() {
        for (const channelId in this.map) {
            this.callback(channelId, false, false);
        }
    }
    callback(id: string, override: boolean = false, immediatResponse: boolean = false) {
        const time = this.map[id];
        if (time) {
            if (time.interval < 1800 * 1000) time.interval = 1800 * 1000;
            schedule.cancelJob(id);
            if (override || time.next < Date.now()) time.next = Date.now() + time.interval;
            schedule.scheduleJob(id, time.next, () => {
                this.callback(id, false, true);
            });
            if (!immediatResponse) this.exec(id);
        }
    }
    register(channelId: string, timeString: string) {
        let time = 0;
        let match = timeString?.match(/(?:(\d+)d|(\d+)h|(\d+)m|(\d+)s)/gm);
        if (match) {
            match.forEach(v => {
                let coefficient = parseInt(v);
                switch (v.charAt(v.length - 1)) {
                    case 'd': time += coefficient * Time.DAY; break;
                    case 'h': time += coefficient * Time.HOUR; break;
                    case 'm': time += coefficient * Time.MINUTE; break;
                    default: time += coefficient * Time.SECOND; break;
                }
            });
        }
        else time = 86400;
        if (time < 1800) time = 1800;
        this.map[channelId] = {
            next: -1,
            interval: time * 1000
        }
        this.callback(channelId, true, false);
        return Time.timeToString(time);
    }
    unregister(channelId: string) {
        let time = this.map[channelId] || -1;
        delete this.map[channelId];
        return Time.timeToString(time.interval);
    }
    async uploadFile(val: any, bodyFormData: FormData) {
        var rtLink: string | undefined = undefined;
        while (!rtLink) {
            rtLink = await axios({
                method: "post",
                url: "https://www.kookapp.cn/api/v3/asset/create",
                data: bodyFormData,
                headers: {
                    'Authorization': `Bot ${await pixiv.common.getNextToken()}`,
                    ...bodyFormData.getHeaders()
                }
            }).then((res: any) => {
                dailyCmd.logger.debug(`ImageProcessing: Upload ${val.id} success`);
                return res.data.data.url
            }).catch(async () => {
                dailyCmd.logger.error(`ImageProcessing: Upload ${val.id} failed, forcing token offline`);
                dailyCmd.logger.debug(`ImageProcessing: Retrying with another token`);
                pixiv.common.deactiveCurrentToken();
                if (await pixiv.common.cycleThroughTokens()) {
                    dailyCmd.logger.fatal('NO UPLOADER TOKEN IS AVALIABLE. PIXIV CHAN IS GOING DOWN IMMEDIATLY');
                    process.exit();
                }
            });
        }
        return rtLink;
    }
    async uploadImage(data: types.illustration, detectionResult: pixiv.type.detectionResult): Promise<{ link: string, pid: number }> {
        var val = data;
        if (pixiv.linkmap.isInDatabase(val.id, "0")) {
            dailyCmd.logger.debug(`ImageDetection: ${val.id} in database, skipped`);
            return { link: pixiv.linkmap.getLink(val.id, "0"), pid: val.id };
        }

        const master1200 = pixiv.common.getProxiedImageLink(val.image_urls.large.replace(/\/c\/[a-zA-z0-9]+/gm, "")); // Get image link
        dailyCmd.logger.debug(`ImageProcessing: Downloading ${master1200}`);
        var bodyFormData = new FormData();
        const stream = (await axios.get(master1200, { responseType: 'arraybuffer' })).data                        // Get readable stream from origin
        var buffer = await sharp(stream).resize(config.resizeWidth, config.resizeHeight, { fit: "outside" }).jpeg().toBuffer(); // Resize stream and convert to buffer
        var blur = 0;
        if (detectionResult.success) {
            blur = detectionResult.blur;
            if (blur > 0) buffer = await sharp(buffer).blur(blur).jpeg().toBuffer();
            dailyCmd.logger.debug(`ImageProcessing: Finished blurring ${val.id} with ${blur}px of gaussian blur`);
            bodyFormData.append('file', buffer, "image.jpg");
            var rtLink = await this.uploadFile(val, bodyFormData);
            //Upload image to KOOK's server
            if (detectionResult.success) pixiv.linkmap.addMap(val.id, "0", rtLink, detectionResult);
            return { link: rtLink, pid: val.id };
        } else {
            dailyCmd.logger.error("ImageDetection: Failed detecting the image. Replacing the image with Akarin");
            dailyCmd.logger.error(detectionResult);
            return { link: pixiv.common.akarin, pid: val.id };
        }
    }
    async exec(channelId: string) {
        const sendCard = async (data: types.illustration[]) => {
            var detection: number = 0;
            var link: string[] = [];
            var pid: string[] = [];
            var datas: types.illustration[] = [];
            var promises: Promise<any>[] = [];
            for (const k in data) {
                if (data[k].x_restrict !== 0) {
                    continue;
                }
                for (const val of data[k].tags) {
                    const tag = val.name;
                    if (pixiv.common.isForbittedTag(tag)) {
                        continue;
                    }
                }
                datas.push(data[k]);
                if (datas.length >= 9) break;
            }
            const detectionResults = await pixiv.aligreen.imageDetectionSync(datas)
            if (!detectionResults) return;
            for (const val of datas) {
                if (detectionResults[val.id]) {
                    if (!pixiv.linkmap.isInDatabase(val.id, "0") && detectionResults[val.id].success) detection++;
                    promises.push(this.uploadImage(val, detectionResults[val.id]));
                }
            }
            var uploadResults: {
                link: string;
                pid: string;
            }[] = await Promise.all(promises).catch((e) => {
                if (e) {
                    dailyCmd.logger.error(e);
                }
            }) || [];
            for (let val of uploadResults) {
                link.push(val.link);
                pid.push(val.pid);
            }
            dailyCmd.logger.debug(`UserInterface: Presenting card to user`);
            bot.API.message.create(MessageType.CardMessage, channelId, pixiv.cards.random(link, pid, {}));
        }
        await axios({
            baseURL: config.pixivAPIBaseURL,
            headers: {
                'Authorization': auth.remoteLinkmapToken,
                'uuid': auth.remoteLinkmapUUID
            },
            url: "/illustration/recommend",
            method: "GET",
        }).then(async (res: any) => {
            if (res.data.hasOwnProperty("code") && res.data.code == 500) return;
            await sendCard(res.data);
        }).catch(async (e: any) => {
            if (e) {
                dailyCmd.logger.error(e);
            }
        });
    };
}

const daily = new Daily();

export default daily;
