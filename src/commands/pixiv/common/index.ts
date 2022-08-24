export * from './cards';
export * from './users';
export * from './keygen';
export * from './nsfwjs';
export * from './linkmap';
export * from './aligreen';
import axios from 'axios';
import auth from 'configs/auth';
import { cards } from './cards';
import got from 'got/dist/source';
import { bot } from 'init/client';
import config from 'configs/config';
import { linkmap } from './linkmap';
import tagBanList from './tagBanList';
import userBanList from './userBanList';
import { BaseSession, Card } from 'kbotify';
import FormData, { Stream } from 'form-data';
import * as pixivadmin from '../admin/common';
const sharp = require('sharp');

export namespace type {
    export type detectionResult = {
        success: boolean,
        status: number,
        blur: number,
        reason?: blurReason
    }
    export type blurReason = {
        terrorism?: banResult,
        ad?: banResult,
        live?: banResult,
        porn?: banResult,
    };
    export type banResult = {
        ban: boolean,
        label?: string,
        probability: number
    }
}

export namespace common {
    export const akarin = "https://img.kookapp.cn/assets/2022-07/vlOSxPNReJ0dw0dw.jpg";

    export function isObjKey<T>(key: PropertyKey, obj: T): key is keyof T {
        return key in obj;
    }

    export function pid2Markdown(pid: string) {
        if (isNaN(parseInt(pid))) {
            return pid;
        } else {
            return `[${pid}](https://www.pixiv.net/artworks/${pid})`;
        }
    }

    export function getProxiedImageLink(original: string): string {
        return original.replace("https://i.pximg.net", config.pixivImageProxyBaseURL)
    }


    //======================Logging======================
    export function logInvoke(command: string, session: BaseSession) {
        bot.logger.info(`From ${session.user.username}#${session.user.identifyNum} as ${session.user.nickname} (ID ${session.user.id}) in (${session.guildId}/${session.channel.id}), invoke ${command} ${session.args.join(" ")}`);
    }

    export function isForbittedTag(tag: string) {
        if (tagBanList.includes(tag)) {
            return true;
        } else {
            return false;
        }
    }

    export function isForbittedUser(userid: string) {
        const id = parseInt(userid);
        if (isNaN(id)) return false;
        if (userBanList.includes(id)) {
            return true;
        } else {
            return false;
        }
    }

    export async function stream2buffer(stream: Stream): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
            const _buf = Array<any>();
            stream.on("data", chunk => _buf.push(chunk));
            stream.on("end", () => resolve(Buffer.concat(_buf)));
            stream.on("error", err => reject(`error converting stream - ${err}`));
        });
    }

    /**
     * Check every asset token and mark active ones
     */
    export async function tokenPoolInit() {
        bot.logger.info("Initialization: Checking uploader availibility");
        await bot.API.message.create(9, config.uploaderOnlineMessageDestination, "----------------------Uploader Check Started---------------------");
        var promises: Promise<any>[] = [];
        for (const idx in auth.assetUploadTokens) {
            const val = auth.assetUploadTokens[idx].token;
            promises.push(
                axios({
                    url: "https://www.kookapp.cn/api/v3/message/create",
                    method: "POST",
                    data: {
                        type: 9,
                        content: `Uploader node #${parseInt(idx) + 1} out of ${auth.assetUploadTokens.length} goes online for ${config.appname}`,
                        target_id: config.uploaderOnlineMessageDestination
                    },
                    headers: {
                        'Authorization': `Bot ${val}`
                    }
                }).then((res) => {
                    if (res.data.code == 0) {
                        auth.assetUploadTokens[idx].active = true;
                        bot.logger.info(`Initialization: Uploader #${parseInt(idx) + 1} online`)
                    } else {
                        auth.assetUploadTokens[idx].active = false;
                        bot.logger.warn(`Initialization: Uploader #${parseInt(idx) + 1} is unavailable, message: ${res.data.message}`);
                    }
                }).catch((e) => {
                    auth.assetUploadTokens[idx].active = false;
                    bot.logger.warn(`Initialization: Uploader #${parseInt(idx) + 1} unavailable, message: ${e.message}`);
                })
            );
        }
        await Promise.all(promises).then(async () => {
            await getNextToken();
            await bot.API.message.create(9, config.uploaderOnlineMessageDestination, "---------------------Uploader Check Finished---------------------");
            bot.logger.info("Initialization: Uploader check passed");
        }).catch((e) => {
            bot.logger.fatal("Initialization: Checking uploader availibility failed. Error message:");
            bot.logger.fatal(e);
            process.exit();
        })
    }
    var currentIndex = 0;
    export async function cycleThroughTokens() {
        const lastIndex = currentIndex;
        while (!auth.assetUploadTokens[currentIndex].active) {
            currentIndex++;
            if (currentIndex >= auth.assetUploadTokens.length) {
                currentIndex = 0;
            }
            if (lastIndex == currentIndex) {
                return true;
            }
        }
        return false;
    }
    export async function getNextToken() {
        if (await cycleThroughTokens()) {
            await bot.API.message.create(9, config.uploaderOnlineMessageDestination, `${config.adminList.map(str => `(met)${str}(met)`).join(" ")} FATAL: NO UPLOADER AVAILABLE. PIXIV CHAN IS GOING OFFLINE IMMEDIATELY`)
                .catch(() => {
                    bot.logger.error("Initialization: Cannot send offline notifications to admins. The application is going down anyways.");
                });
            bot.logger.fatal("Initialization: NO UPLOADER AVAILABLE. PIXIV CHAN IS GOING OFFLINE IMMEDIATELY");
            process.exit();
        }
        return auth.assetUploadTokens[currentIndex].token;
    }
    export function deactiveCurrentToken() {
        auth.assetUploadTokens[currentIndex].active = false;
    }
    export async function uploadFile(session: BaseSession, val: any, bodyFormData: FormData) {
        var rtLink = "";
        await axios({
            method: "post",
            url: "https://www.kookapp.cn/api/v3/asset/create",
            data: bodyFormData,
            headers: {
                'Authorization': `Bot ${await getNextToken()}`,
                ...bodyFormData.getHeaders()
            }
        }).then((res: any) => {
            bot.logger.info(`ImageProcessing: Upload ${val.id} success`);
            rtLink = res.data.data.url
        }).catch(async () => {
            bot.logger.error(`ImageProcessing: Upload ${val.id} failed, forcing token offline`);
            bot.logger.info(`ImageProcessing: Retrying with another token`);
            deactiveCurrentToken();
            if (await cycleThroughTokens()) {
                await session.replyCard(new Card()
                    .addTitle("FATAL ERROR | 致命错误")
                    .addDivider()
                    .addText("**所有**图片上传机器人均不可用！Pixiv酱将立即下线并通知管理员修复。请耐心等待，通常情况下下，这个问题可以被很快解决。")
                )
                process.exit();
            }
            uploadFile(session, val, bodyFormData);
        });
        return rtLink;
    }
    export async function uploadImage(data: any, detectionResult: type.detectionResult, session: BaseSession): Promise<{ link: string, pid: string }> {
        var val = data;
        if (linkmap.isInDatabase(val.id, "0")) {
            bot.logger.info(`ImageDetection: ${val.id} in database, skipped`);
            return { link: linkmap.getLink(val.id, "0"), pid: val.id };
        }

        const master1200 = common.getProxiedImageLink(val.image_urls.large.replace(/\/c\/[a-zA-z0-9]+/gm, "")); // Get image link
        bot.logger.info(`ImageProcessing: Downloading ${master1200}`);
        var bodyFormData = new FormData();
        const stream = got.stream(master1200);                               // Get readable stream from origin
        var buffer = await sharp(await stream2buffer(stream)).resize(config.resizeWidth, config.resizeHeight, { fit: "outside" }).jpeg().toBuffer(); // Resize stream and convert to buffer
        var blur = 0;
        if (detectionResult.success) {
            blur = detectionResult.blur;
            if (blur > 0) buffer = await sharp(buffer).blur(blur).jpeg().toBuffer();
            bot.logger.info(`ImageProcessing: Finished blurring ${val.id} with ${blur}px of gaussian blur`);
            bodyFormData.append('file', buffer, "image.jpg");
            var rtLink = await uploadFile(session, val, bodyFormData);
            //Upload image to KOOK's server
            if (detectionResult.success) linkmap.addMap(val.id, "0", rtLink, detectionResult);
            return { link: rtLink, pid: val.id };
        } else {
            bot.logger.error("ImageDetection: Failed detecting the image. Replacing the image with Akarin");
            bot.logger.error(detectionResult);
            session.sendCardTemp([cards.error(`// 阿里云远端返回错误，这（在大多数情况下）**不是**Pixiv酱的问题\n插画仍会加载但可能会显示出错\n// 信息:\n${JSON.stringify(detectionResult, null, 4)}`, false)]);
            return { link: akarin, pid: val.id };
        }
    }

    //================Notification================
    var noticed: string[] = [];
    var notification: string = "";
    var enableNotification = false;
    export function deleteNotifications() {
        enableNotification = false;
    }
    export function addNotifications(content: string) {
        notification = content;
        enableNotification = true;
        noticed = [];
    }
    export function getNotifications(session: BaseSession) {
        if (enableNotification && !noticed.includes(session.user.id)) {
            noticed.push(session.user.id)
            return session.sendCardTemp([cards.notification(notification)]);
        }
    }

    //================Rate control================
    var rateControl: { [key: string]: { [key: string]: number } } = {};
    export function registerExecution(id: string, trigger: string) {
        rateControl[id] = {
            ...rateControl[id],
            [trigger]: Date.now()
        }
    }
    export function isRateLimited(session: BaseSession, limit: number, trigger: string): boolean {
        const lastExecutionTimestamp = common.getLastExecutionTimestamp(session.userId, trigger);
        if (!pixivadmin.common.isAdmin(session.userId) && lastExecutionTimestamp !== -1 && Date.now() - lastExecutionTimestamp <= limit * 1000) {
            session.replyTemp(`您已达到速率限制。每个用户每 ${limit} 秒内只能发起一次 \`.pixiv ${trigger}\` 指令，请于 ${Math.round((lastExecutionTimestamp + limit * 1000 - Date.now()) / 1000)} 秒后再试。`);
            return true;
        } else {
            common.registerExecution(session.userId, trigger);
            return false;
        }
    }
    /**
     * Get timestamp of the last execution of a user 
     * @param id User id
     * @returns Timestamp of last execution if exist. If not, returns `-1`
     */
    export function getLastExecutionTimestamp(id: string, trigger: string): number {
        if (rateControl.hasOwnProperty(id))
            if (rateControl[id].hasOwnProperty(trigger)) return rateControl[id][trigger];
            else return -1
        else return -1;
    }

    // Bad actor ban
    var ban: { [key: string]: { [key: string]: number } } = {};
    /**
     * Ban a user from using a command
     * @param id User Id
     * @param trigger Trigger of command
     * @param time Total time of the ban in seconds
     */
    export function registerBan(id: string, trigger: string, time: number) {
        ban[id] = {
            ...ban[id],
            [trigger]: Date.now() + time * 1000
        }
    }
    export function isBanned(session: BaseSession, trigger: string): boolean {
        const banEndTimestamp = common.getBanEndTimestamp(session.userId, trigger);
        if (!pixivadmin.common.isAdmin(session.userId) && Date.now() < banEndTimestamp) {
            session.replyTemp(`您已被禁止使用 \`.pixiv ${trigger}\` 指令至 ${new Date(banEndTimestamp).toLocaleString("zh-cn")}，请于 ${Math.round((banEndTimestamp - Date.now()) / 1000)} 秒后再试`);
            return true;
        } else {
            return false;
        }
    }
    /**
     * Get timestamp of the last execution of a user 
     * @param id User id
     * @returns Timestamp of last execution if exist. If not, returns `-1`
     */
    export function getBanEndTimestamp(id: string, trigger: string): number {
        if (ban.hasOwnProperty(id))
            if (ban[id].hasOwnProperty(trigger)) return ban[id][trigger];
            else return -1
        else return -1;
    }
}