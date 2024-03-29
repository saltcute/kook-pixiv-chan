import { AppCommand, AppFunc, BaseSession } from 'kbotify';
import auth from '../../configs/auth';
import * as pixiv from './common';
import * as pixivadmin from './admin/common';
import axios from 'axios';
import config from '../../configs/config';
import FormData from 'form-data';
import sharp from 'sharp';
import got from 'got';
import { bot } from 'init/client';

class Refresh extends AppCommand {
    code = 'refresh'; // 只是用作标记
    trigger = 'refresh'; // 用于触发的文字
    intro = 'Refresh';
    func: AppFunc<BaseSession> = async (session) => {
        if (await pixiv.users.reachesCommandLimit(session, this.trigger)) return;
        if (await pixiv.users.reachesIllustLimit(session)) return;
        if (pixivadmin.common.isGlobalBanned(session)) return pixivadmin.common.notifyGlobalBan(session);
        if (pixiv.common.isBanned(session, this.trigger)) return;
        if (pixiv.common.isRateLimited(session, 15, this.trigger)) return;
        pixiv.common.logInvoke(`.pixiv ${this.trigger}`, session);
        if (session.args.length === 0) {
            return session.reply("使用 `.pixiv help refresh` 查询指令详细用法")
        } else {
            const illust_id = session.args[0].toString();
            if (pixiv.linkmap.isInDatabase(illust_id, "0")) {
                pixiv.common.getNotifications(session);
                var rtLink = pixiv.linkmap.getLink(illust_id, "0");
                bot.logger.debug(`ImageProcessing: Refreshing ${illust_id}_0.jpg`);
                axios({
                    baseURL: config.pixivAPIBaseURL,
                    url: "/illustration/detail",
                    method: "GET",
                    params: {
                        keyword: illust_id,
                        user: {
                            id: session.user.id,
                            identifyNum: session.user.identifyNum,
                            username: session.user.username,
                            avatar: session.user.avatar
                        }
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
                    for (const val of res.data.tags) {
                        const tag = val.name;
                        if (pixiv.common.isForbittedTag(tag)) {
                            bot.logger.debug(`UserInterface: User violates tag blacklist: ${tag}. Banned the user for 30 seconds`);
                            pixiv.common.registerBan(session.userId, this.trigger, 30);
                            return session.reply(`此插画包含标签黑名单中的标签，您已被暂时停止使用 \`.pixiv ${this.trigger}\` 指令 30秒`);
                        }
                    }
                    const val = res.data;
                    if (val.x_restrict > 0) {
                        return session.reply("无法刷新 R-18/R-18G 插画的缓存");
                    }
                    var sendSuccess = false;
                    var mainCardMessageID = "";
                    if (session.guild) {
                        await session.sendCard(pixiv.cards.resaving(val.id)).then((res) => {
                            if (res.resultType == "SUCCESS" && res.msgSent?.msgId !== undefined) {
                                sendSuccess = true;
                                mainCardMessageID = res.msgSent?.msgId;
                            }
                        }).catch((e) => {
                            if (e) {
                                if (e.code == 40012) { // Slow-mode limit
                                    bot.logger.warn("UserInterface: Bot is limited by slow-mode, no operation can be done");
                                } else {
                                    bot.logger.error(e);
                                }
                            }
                            sendSuccess = false;
                        });
                        if (!sendSuccess) return;
                    }
                    pixiv.common.getNotifications(session);
                    const detectionResult = (await pixiv.aligreen.imageDetectionSync([val], true))[val.id];
                    if (!detectionResult) {
                        bot.logger.error("ImageDetection: No detection result was returned");
                        return session.sendTemp("所有图片的阿里云检测均返回失败，这极有可能是因为国际网络线路不稳定，请稍后再试。");
                    }
                    var buffer: Buffer = await sharp(await pixiv.common.stream2buffer(got.stream(pixiv.common.getProxiedImageLink(val.image_urls.large.replace(/\/c\/[a-zA-z0-9]+/gm, ""))))).resize(config.resizeWidth, config.resizeHeight, { fit: "outside" }).jpeg().toBuffer();
                    var blur = 0;
                    if (detectionResult.success) {
                        blur = detectionResult.blur;
                        if (blur > 0) buffer = await sharp(buffer).blur(blur).jpeg().toBuffer();

                        var bodyFormData = new FormData();
                        bodyFormData.append('file', buffer, "image.jpg");
                        rtLink = await pixiv.common.uploadFile(session, val, bodyFormData)
                        bot.logger.debug(`ImageProcessing: Ended stage 1 refreshing with ${blur}px of gaussian blur (Aliyun)`);
                        var uncensored = false;
                        var tyblur = 0;
                        for (let i = 1; i <= 5; ++i) {
                            await axios({
                                url: rtLink,
                                method: "GET"
                            }).then(() => {
                                bot.logger.debug(`ImageProcessing: Uncensoring success with ${tyblur}px of gaussian blur`);
                                uncensored = true;
                            }).catch(async () => {
                                bot.logger.warn(`ImageProcessing: Uncensoring failed, try ${7 * i}px of gaussian blur`);
                                var bodyFormData = new FormData();
                                bodyFormData.append('file', await sharp(buffer).blur(7 * i).jpeg().toBuffer(), "1.jpg");
                                tyblur = 7 * i;
                                rtLink = await pixiv.common.uploadFile(session, val, bodyFormData)
                            })
                            if (uncensored) break;
                        }
                        bot.logger.debug(`ImageProcessing: Ended stage 2 refreshing with ${blur + tyblur}px of gaussian blur (trial & error)`);
                        bot.logger.debug(`UserInterface: Presenting card to user`);
                        const isVIP = (await pixiv.common.getApexVIPStatus(session.userId)).data.is_vip;
                        if (!uncensored) {
                            if (session.guild) {
                                session.updateMessage(mainCardMessageID, [{
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
                            }
                            if (detectionResult.success) pixiv.linkmap.addMap(val.id, "0", pixiv.common.akarin, detectionResult);
                        } else {
                            if (session.guild) {
                                session.updateMessage(mainCardMessageID, [pixiv.cards.detail(val, rtLink, { isVIP })])
                                    .then(() => {
                                        pixiv.users.logInvoke(session, this.trigger, 0, 0)
                                    })
                                    .catch((e) => {
                                        bot.logger.error(`UserInterface: Failed updating message ${mainCardMessageID}`);
                                        if (e) bot.logger.error(e);
                                    });
                            } else {
                                session.sendCard([pixiv.cards.detail(val, rtLink, { isVIP })])
                                    .then(() => {
                                        pixiv.users.logInvoke(session, this.trigger, 0, 0)
                                    })
                                    .catch((e) => {
                                        bot.logger.error(`UserInterface: Failed sending message`);
                                        if (e) bot.logger.error(e);
                                    });
                            }
                            if (detectionResult.success) pixiv.linkmap.addMap(val.id, "0", rtLink, detectionResult);
                        }
                    } else {
                        bot.logger.error("ImageDetection: Detection failed with remote returning");
                        bot.logger.error(detectionResult);
                        session.sendCardTemp([pixiv.cards.error(`// 阿里云远端返回错误，\n这（在大多数情况下）不是Pixiv酱的问题\n如果显示 code:592 则表示连接超时\n通常仅需过一会再试即可\n// 信息:\n${JSON.stringify(detectionResult, null, 4)}`, false)]);
                    }
                }).catch((e: any) => {
                    if (e) {
                        bot.logger.error(e);
                        session.sendCardTemp(pixiv.cards.error(e.stack));
                    }
                });
            } else {
                return session.reply(`此插画（${illust_id}）当前没有缓存或插画 ID 错误！（使用 \`.pixiv help refresh\` 查询指令详细用法）`);
            }
        };
    }
}

export const refresh = new Refresh();

