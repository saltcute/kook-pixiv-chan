import { AppCommand, AppFunc, BaseSession } from 'kbotify';
import auth from '../../configs/auth';
import * as pixiv from './common';
import * as pixivadmin from './admin/common';
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
        if (pixiv.common.isRateLimited(session, 15, this.trigger)) return;
        pixiv.common.logInvoke(`.pixiv ${this.trigger}`, session);
        if (session.args.length === 0) {
            return session.reply("使用 `.pixiv help refresh` 查询指令详细用法")
        } else {
            const illust_id = session.args[0].toString();
            if (pixiv.linkmap.isInDatabase(illust_id, "0")) {
                pixiv.common.getNotifications(session);
                var rtLink = pixiv.linkmap.getLink(illust_id, "0");
                pixiv.common.log(`Refreshing ${illust_id}_0.jpg`);
                axios({
                    url: `${config.pixivAPIBaseURL}/illustrationDetail`,
                    params: {
                        keyword: illust_id
                    }
                }).then(async (res: any) => {
                    if (res.data.hasOwnProperty("status") && res.data.status === 404) {
                        return session.reply("插画不存在或已被删除！")
                    }
                    if (res.data.hasOwnProperty("status") && res.data.status == 400) {
                        return session.reply("插画ID不合法！")
                    }
                    if (res.data.hasOwnProperty("code") && res.data.code == 500) {
                        return session.reply("Pixiv官方服务器不可用，请稍后再试");
                    }
                    const val = res.data;
                    if (val.x_restrict > 0) {
                        return session.reply("无法刷新 R-18/R-18G 插画的缓存");
                    }
                    const sendResult = (await session.sendCard(pixiv.cards.resaving("多张图片")));
                    const loadingBarMessageID = sendResult.msgSent?.msgId;
                    if (sendResult.resultType != "SUCCESS" || loadingBarMessageID == undefined) {
                        console.log(sendResult.detail);
                        return pixiv.common.log("Message sending failed");
                    }
                    pixiv.common.getNotifications(session);
                    const detectionResult = (await pixiv.aligreen.imageDetectionSync([val], true))[val.id];
                    var buffer: Buffer = await sharp(await pixiv.common.stream2buffer(got.stream(pixiv.common.getProxiedImageLink(val.image_urls.large.replace(/\/c\/[a-zA-z0-9]+/gm, ""))))).resize(config.resizeWidth, config.resizeHeight, { fit: "outside" }).jpeg().toBuffer();
                    var blur = 0;
                    if (detectionResult.success) {
                        blur = detectionResult.blur;
                        if (blur > 0) buffer = await sharp(buffer).blur(blur).jpeg().toBuffer();

                        var bodyFormData = new FormData();
                        bodyFormData.append('file', buffer, "1.jpg");
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
                                console.error(e);
                                session.sendCardTemp(pixiv.cards.error(e, true));
                            }
                        });
                        pixiv.common.log(`Refreshing stage 1 ended with ${blur}px of gaussian blur (Aliyun)`);
                        var uncensored = false;
                        var tyblur = 0;
                        for (let i = 1; i <= 5; ++i) {
                            await axios({
                                url: rtLink,
                                method: "GET"
                            }).then(() => {
                                pixiv.common.log(`Uncensoring success with ${tyblur}px of gaussian blur`);
                                uncensored = true;
                            }).catch(async () => {
                                pixiv.common.log(`Uncensoring failed, try ${7 * i}px of gaussian blur`);
                                var bodyFormData = new FormData();
                                bodyFormData.append('file', await sharp(buffer).blur(7 * i).jpeg().toBuffer(), "1.jpg");
                                tyblur = 7 * i;
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
                                        console.error(e);
                                        session.sendCardTemp(pixiv.cards.error(e, true));
                                    }
                                });
                            })
                            if (uncensored) break;
                        }
                        pixiv.common.log(`Refreshing stage 2 ended with ${blur + tyblur}px of gaussian blur (trial & error)`);
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
                            if (detectionResult.success) pixiv.linkmap.addMap(val.id, "0", pixiv.common.akarin, detectionResult);
                        } else {
                            session.updateMessage(loadingBarMessageID, [pixiv.cards.detail(val, rtLink)]);
                            if (detectionResult.success) pixiv.linkmap.addMap(val.id, "0", rtLink, detectionResult);
                        }
                    } else {
                        pixiv.common.log("Detection failed, returned");
                        session.sendCardTemp([pixiv.cards.error(`// 阿里云远端返回错误，这（在大多数情况下）**不是**Pixiv酱的问题\n插画仍会加载但可能会显示出错\n// 信息:\n${JSON.stringify(detectionResult, null, 4)}`, false)]);
                        console.log(detectionResult);
                        session.updateMessage(loadingBarMessageID, [pixiv.cards.detail(val, pixiv.common.akarin)]);
                    }
                }).catch((e: any) => {
                    if (e) {
                        console.error(e);
                        session.sendCardTemp(pixiv.cards.error(e, true));
                    }
                });
            } else {
                return session.reply(`此插画（${illust_id}）当前没有缓存或插画 ID 错误！（使用 \`.pixiv help refresh\` 查询指令详细用法）`);
            }
        };
    }
}

export const refresh = new Refresh();

