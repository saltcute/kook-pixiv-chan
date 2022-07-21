import { AppCommand, AppFunc, BaseSession } from 'kbotify';
import auth from '../../configs/auth';
import * as pixiv from './common';
import axios from 'axios';
import config from '../../configs/config';
import FormData from 'form-data';
import sharp from 'sharp';
import got from 'got';

class Refresh extends AppCommand {
    code = 'refresh'; // 只是用作标记
    trigger = 'refresh'; // 用于触发的文字
    intro = 'Refresh';
    func: AppFunc<BaseSession> = async (session) => {
        if (session.args.length === 0) {
            pixiv.common.log(`From ${session.user.nickname} (ID ${session.user.id}), invoke ".pixiv ${this.trigger}"`);
            return session.reply("使用 `.pixiv help refresh` 查询指令详细用法")
        } else {
            pixiv.common.log(`From ${session.user.nickname} (ID ${session.user.id}), invoke ".pixiv ${this.trigger} ${session.args[0]}"`);
            const illust_id = session.args[0].toString();
            if (pixiv.linkmap.isInDatabase(illust_id)) {
                pixiv.common.getNotifications(session);
                var rtLink = pixiv.linkmap.getLink(illust_id, "0");
                if (rtLink == pixiv.common.akarin) {
                    return session.reply("插画因为 R-18/R-18G 无法刷新缓存");
                }
                pixiv.common.log(`Refreshing ${illust_id}_0.jpg`);
                axios({
                    url: `http://pixiv.lolicon.ac.cn/illustrationDetail`,
                    params: {
                        keyword: illust_id
                    }
                }).then(async (res: any) => {
                    if (res.data.hasOwnProperty("status") && res.data.status === 404) {
                        return session.reply("插画不存在或已被删除！")
                    }
                    const val = res.data;
                    if (val.x_restrict > 0) {
                        return session.reply("插画因为 R-18/R-18G 无法刷新缓存");
                    }
                    var loadingBarMessageID: string | undefined = (await session.sendCard([pixiv.cards.resaving(`\`${val.id}_p0.jpg\``)])).msgSent?.msgId;
                    if (loadingBarMessageID == undefined) {
                        pixiv.common.log("Send message failed");
                        return;
                    }
                    pixiv.common.getNotifications(session);
                    const detectionResult = pixiv.linkmap.isInDatabase(val.id) ? pixiv.linkmap.getDetection(val.id, "0") : (await pixiv.aligreen.imageDetectionSync([val]))[val.id];
                    var buffer: Buffer = await sharp(await pixiv.common.stream2buffer(got.stream(val.image_urls.large.replace("i.pximg.net", config.pixivProxyHostname)))).resize(512).jpeg().toBuffer();
                    var blur = 0;
                    if (detectionResult.hasOwnProperty("blur") && detectionResult.blur > 0) {
                        blur = detectionResult.blur;
                    } else {
                        blur = 7;
                    }
                    buffer = await sharp(buffer).blur(blur).jpeg().toBuffer();
                    var uncensored = false;
                    for (let i = 1; i <= 5; ++i) {
                        await axios({
                            url: rtLink,
                            method: "GET"
                        }).then(() => {
                            pixiv.common.log("Uncensoring done");
                            uncensored = true;
                        }).catch(async () => {
                            pixiv.common.log(`Uncensoring failed, try ${7 * i}px of gaussian blur`);
                            var bodyFormData = new FormData();
                            bodyFormData.append('file', await sharp(buffer).blur(7 * i).jpeg().toBuffer(), "1.jpg");
                            await axios({
                                method: "post",
                                url: "https://www.kookapp.cn/api/v3/asset/create",
                                data: bodyFormData,
                                headers: {
                                    'Authorization': `Bot ${auth.assetUploadToken}`,
                                    ...bodyFormData.getHeaders()
                                }
                            }).then((res: any) => {
                                rtLink = res.data.data.url
                            }).catch((e: any) => {
                                if (e) {
                                    session.sendCard(pixiv.cards.error(e));
                                }
                            });
                        })
                        if (uncensored) break;
                    }
                    pixiv.common.log(`Process ended, presenting to user`);
                    if (!uncensored) {
                        session.updateMessage(loadingBarMessageID, [{
                            "type": "card",
                            "theme": "danger",
                            "size": "lg",
                            "modules": [
                                {
                                    "type": "section",
                                    "text": {
                                        "type": "kmarkdown",
                                        "content": `给 \`${val.id}_p0.jpg\` 施加了超过 100px 高斯模糊都救不回来…？属于是世间奇图了，请务必反馈到 Pixiv 酱的[交流服务器](https://kook.top/iOOsLu)中`
                                    }
                                }
                            ]
                        }])
                        if (detectionResult !== undefined) pixiv.linkmap.addMap(val.id, "0", pixiv.common.akarin, detectionResult);
                    } else {
                        session.updateMessage(loadingBarMessageID, [pixiv.cards.detail(val, rtLink)]);
                        if (detectionResult !== undefined) pixiv.linkmap.addMap(val.id, "0", rtLink, detectionResult);
                    }
                }).catch((e: any) => {
                    session.sendCard(pixiv.cards.error(e));
                });
            } else {
                return session.reply(`此插画（${illust_id}）当前没有缓存！（使用 \`.pixiv help refresh\` 查询指令详细用法）`);
            }
        };
    }
}

export const refresh = new Refresh();

