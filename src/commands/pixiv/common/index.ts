export * from './cards';
export * from './linkmap';
export * from './nsfwjs'
export * from './aligreen'
import { tagBanList } from './tagBanList';
import FormData, { Stream } from 'form-data';
import { BaseSession } from 'kbotify';
import { linkmap } from './linkmap';
import config from 'configs/config';
import got from 'got/dist/source';
import axios from 'axios';
import auth from 'configs/auth';
import { cards } from './cards';
import * as pixivadmin from '../admin/common'
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

    export function pid2Markdown(pid: string) {
        if (isNaN(parseInt(pid))) {
            return pid;
        } else {
            return `[${pid}](https://www.pixiv.net/artworks/${pid})`;
        }
    }


    //======================Logging======================
    export function log(output: string) {
        console.log(`[${new Date().toLocaleTimeString()}] ${output.toString().replaceAll("\n", `\n[${new Date().toLocaleTimeString()}] `)}`);
    }
    export function err(output: string) {
        console.error(`[${new Date().toLocaleTimeString()}] ${output.toString().replaceAll("\n", `\n[${new Date().toLocaleTimeString()}] `)}`);
    }
    export function logInvoke(command: string, session: BaseSession) {
        log(`From ${session.user.nickname} (ID ${session.user.id}), invoke "${command} ${session.args.join(" ")}"`);

    }

    export function isForbittedTag(tag: string) {
        if (tagBanList.includes(tag)) {
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

    export async function uploadImage(data: any, detectionResult: type.detectionResult, session: BaseSession): Promise<{ link: string, pid: string }> {
        var val = data;
        if (linkmap.isInDatabase(val.id, "0")) {
            log(`${val.id} in database, skipped`);
            return { link: linkmap.getLink(val.id, "0"), pid: val.id };
        }

        const master1200 = val.image_urls.large.replace("i.pximg.net", config.pixivProxyHostname); // Get image link
        log(`Downloading ${master1200}`);
        var bodyFormData = new FormData();
        const stream = got.stream(master1200);                               // Get readable stream from origin
        log(`Download ${val.id} success, starts blurring`);
        var buffer = await sharp(await stream2buffer(stream)).resize(512).jpeg().toBuffer(); // Resize stream and convert to buffer
        var blur = 0;
        if (detectionResult.success) {
            blur = detectionResult.blur;
            if (blur > 0) buffer = await sharp(buffer).blur(blur).jpeg().toBuffer();
        } else {
            log("Detection failed, returned");
            session.sendCard([cards.error(`// 阿里云远端返回错误，这（在大多数情况下）**不是**Pixiv酱的问题\n插画仍会加载但可能会显示出错\n// 信息:\n${JSON.stringify(detectionResult, null, 4)}`, false)]);
            console.log(detectionResult);
        }

        log(`Finished blurring ${val.id} with ${blur}px of gaussian blur, starts uploading`);
        bodyFormData.append('file', buffer, "1.jpg");
        var rtLink = "";
        //Upload image to KOOK's server
        await axios({
            method: "post",
            url: "https://www.kookapp.cn/api/v3/asset/create",
            data: bodyFormData,
            headers: {
                'Authorization': `Bot ${auth.assetUploadToken} `,
                ...bodyFormData.getHeaders()
            }
        }).then((res: any) => {
            log(`Upload ${val.id} success`);
            rtLink = res.data.data.url
        }).catch((e: any) => {
            log(`Upload ${val.id} failed`);
            if (e) {
                session.sendCard(cards.error(e, true),);
            }
        });
        if (detectionResult.success) linkmap.addMap(val.id, "0", rtLink, detectionResult);
        return { link: rtLink, pid: val.id };
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
    var rateControl: { [key: string]: number } = {};
    export function registerExecution(id: string) {
        rateControl[id] = Date.now();
    }
    export function isRateLimited(session: BaseSession, limit: number, command: string): boolean {
        const lastExecutionTimestamp = common.lastExecutionTimestamp(session.userId);
        if (!pixivadmin.common.isAdmin(session.userId) && lastExecutionTimestamp !== -1 && Date.now() - lastExecutionTimestamp <= limit * 1000) {
            session.reply(`您已达到速率限制。每个用户每${limit}秒内只能发起一次 \`${command}\` 指令，请于 ${Math.round((lastExecutionTimestamp + limit * 1000 - Date.now()) / 1000)} 秒后再试。`);
            return true;
        } else {
            common.registerExecution(session.userId);
            return false;
        }
    }
    /**
     * Get timestamp of the last execution of a user 
     * @param id User id
     * @returns Timestamp of last execution if exist. If not, returns `-1`
     */
    export function lastExecutionTimestamp(id: string): number {
        if (rateControl.hasOwnProperty(id)) {
            return rateControl[id];
        } else {
            return -1;
        }
    }
}