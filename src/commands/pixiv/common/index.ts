export * from './cards';
export * from './users';
export * from './keygen';
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
import { types } from 'pixnode';
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
    /**
     * Placeholder for forbidden images
     * 
     * R-18, network failure, etc.
     */
    export const akarin = "https://img.kookapp.cn/assets/2022-07/vlOSxPNReJ0dw0dw.jpg";

    /**
     * Check if key is in obkect
     * @param key key
     * @param obj object
     * @returns Whether or not the key is in the object
     */
    export function isObjKey<T extends object>(key: PropertyKey, obj: T): key is keyof T {
        return key in obj;
    }
    /**
     * Suffle the input array
     * 
     * The array will be modified
     * @param array The array to be suffled
     */
    export function shuffleArray(array: any[]) {
        var m = array.length, t, i;
        while (m) {
            i = Math.floor(Math.random() * m--);
            t = array[m];
            array[m] = array[i];
            array[i] = t;
        }
    }

    /**
     * Check if user is VIP for Apex助手
     * @param uid KOOK user id
     */
    export async function getApexVIPStatus(uid: string): Promise<{
        status: number,
        data: {
            id: string,
            is_exist: boolean,
            is_vip: boolean,
            originData: {
                name: string,
                uid: string,
                pid: string
            }
        }
    }> {
        const res = await axios({
            baseURL: config.connectApexHost,
            url: '/user/view',
            params: {
                user_id: uid
            },
            method: 'GET',
            headers: {
                'Authorization': config.connectApexToken
            }
        }).catch((e) => {
            bot.logger.warn("ApexConnect: Checking Apex助手 status failed");
            bot.logger.warn(e);
            return {
                data: {
                    status: -1,
                    data: {
                        id: "-1",
                        is_exist: false,
                        is_vip: false,
                        originData: {
                            name: 'Unknown',
                            uid: "-1",
                            pid: "-1"
                        }
                    }
                }
            };
        })
        return res.data;
    }

    export async function sendApexImage(data: any) {
        return axios({
            baseURL: config.connectApexHost,
            url: '/user/update',
            method: 'POST',
            data: data,
            headers: {
                'Authorization': config.connectApexToken
            }
        });
    }

    export async function getApexImagePreview(image: string, uid: string): Promise<{
        url: string
    }> {
        const res = (await axios({
            baseURL: config.previewApexHost,
            url: 'stat_img',
            params: {
                bg: image,
                mode: 'search',
                type: 'uid',
                player: uid
            }
        }).catch((e) => {
            bot.logger.warn("ApexConnect: Getting Apex image preview failed");
            bot.logger.warn(e);
            return {
                data: {
                    url: akarin
                }
            }
        })).data;
        return res;
    }

    /**
     * Convert illustration id string to Markdown link
     * @param pid Pixiv illustartion id
     * @returns clickable link to the artwork page on Pixiv in Markdown
     */
    export function pid2Markdown(pid: string) {
        if (isNaN(parseInt(pid))) {
            return pid;
        } else {
            return `[${pid}](https://www.pixiv.net/artworks/${pid})`;
        }
    }

    /**
     * Get proxied Pixiv image link
     * @param original original i.pximg.net link
     * @returns reverse proxied image link
     */
    export function getProxiedImageLink(original: string): string {
        return original.replace("https://i.pximg.net", config.pixivImageProxyBaseURL)
    }


    //======================Logging======================
    /**
     * Log an execution of command
     * @param command command name
     * @param session kbotify session
     */
    export function logInvoke(command: string, session: BaseSession) {
        bot.logger.debug(`InvokedCommand: From ${session.user.username}#${session.user.identifyNum} (ID ${session.user.id}) in (${session.guildId}/${session.channel.id}), invoke ${command} ${session.args.join(" ")}`);
    }

    /**
     * Check if the tag is forbbiden
     * @param tag Pixiv illustration tag
     * @returns Whether the tag is forbidden from query
     */
    export function isForbittedTag(tag: string) {
        if (tagBanList.includes(tag)) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Check if the user is forbidden
     * @param userid Pixiv user ID
     * @returns Whether the user is forbidden from query
     */
    export function isForbittedUser(userid: string) {
        const id = parseInt(userid);
        if (isNaN(id)) return false;
        if (userBanList.includes(id)) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Get detail of illustration from Pixiv web API
     * @param illustID Pixiv illsutration ID
     * @returns illustration data from Pixiv web API
     */
    export async function getIllustDetail(illustID: string) {
        return axios({
            baseURL: config.pixivAPIBaseURL,
            url: "/illustration/detail",
            method: "GET",
            params: {
                keyword: illustID
            }
        })
    }

    /**
     * Convert a stream to buffer
     * @param stream stream
     * @returns buffer
     */
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
    /**
     * Check through every token provided in auth.ts and
     * make sure they are capable of uploading files
     * @returns Whether or not there were at least one available token
     */
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
    /**
     * Get the next token to use
     * @returns KOOK bot token
     */
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
    /**
     * Mark the current token as inactive
     */
    export function deactiveCurrentToken() {
        auth.assetUploadTokens[currentIndex].active = false;
    }
    /**
     * Upload a file to KOOK's server
     * @param session kbotify session
     * @param val illustration data from Pixiv web API 
     * @param bodyFormData form data to be uploaded
     * @returns The link to the uploaded file
     */
    export async function uploadFile(session: BaseSession, val: any, bodyFormData: FormData) {
        var rtLink: string | undefined = undefined;
        while (!rtLink) {
            rtLink = await axios({
                method: "post",
                url: "https://www.kookapp.cn/api/v3/asset/create",
                data: bodyFormData,
                headers: {
                    'Authorization': `Bot ${await getNextToken()}`,
                    ...bodyFormData.getHeaders()
                }
            }).then((res: any) => {
                bot.logger.debug(`ImageProcessing: Upload ${val.id} success`);
                return res.data.data.url
            }).catch(async () => {
                bot.logger.error(`ImageProcessing: Upload ${val.id} failed, forcing token offline`);
                bot.logger.debug(`ImageProcessing: Retrying with another token`);
                deactiveCurrentToken();
                if (await cycleThroughTokens()) {
                    await session.replyCard(new Card()
                        .addTitle("FATAL ERROR | 致命错误")
                        .addDivider()
                        .addText("**所有**图片上传机器人均不可用！Pixiv酱将立即下线并通知管理员修复。请耐心等待，通常情况下下，这个问题可以被很快解决。")
                    )
                    process.exit();
                }
            });
        }
        return rtLink;
    }
    /**
     * Detect if a image needs to be blurred and
     * upload it to KOOK's server
     * @param data illustration data from Pixiv web API
     * @param detectionResult Aliyun Image Green detection result
     * @param session kbotify session
     * @returns link to the image on img.kookapp.cn and its pixiv id
     */
    export async function uploadImage(data: types.illustration, detectionResult: type.detectionResult, session: BaseSession): Promise<{ link: string, pid: number }> {
        var val = data;
        if (linkmap.isInDatabase(val.id, "0")) {
            bot.logger.debug(`ImageDetection: ${val.id} in database, skipped`);
            return { link: linkmap.getLink(val.id, "0"), pid: val.id };
        }

        const master1200 = common.getProxiedImageLink(val.image_urls.large.replace(/\/c\/[a-zA-z0-9]+/gm, "")); // Get image link
        bot.logger.debug(`ImageProcessing: Downloading ${master1200}`);
        var bodyFormData = new FormData();
        const stream = got.stream(master1200);                               // Get readable stream from origin
        var buffer = await sharp(await stream2buffer(stream)).resize(config.resizeWidth, config.resizeHeight, { fit: "outside" }).jpeg().toBuffer(); // Resize stream and convert to buffer
        var blur = 0;
        if (detectionResult.success) {
            blur = detectionResult.blur;
            if (blur > 0) buffer = await sharp(buffer).blur(blur).jpeg().toBuffer();
            bot.logger.debug(`ImageProcessing: Finished blurring ${val.id} with ${blur}px of gaussian blur`);
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
    /**
     * Remove current notification
     */
    export function deleteNotifications() {
        enableNotification = false;
    }
    /**
     * Set notification to be pushed to every user
     * @param content kMarkdown content of the notification
     */
    export function addNotifications(content: string) {
        notification = content;
        enableNotification = true;
        noticed = [];
    }
    /**
     * If there were a notification and the user hasn't read the it,
     * send it to the user and record.
     * @param session kbotify session
     * @returns kbotify funcResult
     */
    export function getNotifications(session: BaseSession) {
        if (enableNotification && !noticed.includes(session.user.id)) {
            noticed.push(session.user.id)
            return session.sendCardTemp([cards.notification(notification)]);
        }
    }

    //================Rate control================
    var rateControl: { [key: string]: { [key: string]: number } } = {};
    /**
     * Record execution of command from the user
     * @param id KOOK user id
     * @param trigger commnad trigger
     */
    export function registerExecution(id: string, trigger: string) {
        rateControl[id] = {
            ...rateControl[id],
            [trigger]: Date.now()
        }
    }
    /**
     * Check if user is rate limited
     * @param session kbotify session
     * @param limit rate limit in seconds for the command
     * @param trigger command trigger
     * @returns Whether or not the user shall be limited
     */
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

    /**
     * Check if a user has been banned
     * @param session kbotify session
     * @param trigger command trigger
     * @returns Whether or not the user is banned
     */
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
