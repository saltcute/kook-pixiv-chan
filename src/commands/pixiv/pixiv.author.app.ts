import { AppCommand, AppFunc, BaseSession, Card } from 'kbotify';
import * as pixiv from './common';
import * as pixivadmin from './admin/common'
import axios from 'axios';
import config from 'configs/config';
import { bot } from 'init/client';
import { types } from 'pixnode';
import FormData from 'form-data';
import sharp from 'sharp';

class Author extends AppCommand {
    code = 'author'; // 只是用作标记
    trigger = 'author'; // 用于触发的文字
    intro = 'Author';
    func: AppFunc<BaseSession> = async (session) => {
        if (await pixiv.users.reachesCommandLimit(session, this.trigger)) return;
        if (await pixiv.users.reachesIllustLimit(session)) return;
        if (pixivadmin.common.isGlobalBanned(session)) return pixivadmin.common.notifyGlobalBan(session);
        if (pixiv.common.isBanned(session, this.trigger)) return;
        if (pixiv.common.isRateLimited(session, 6, this.trigger)) return;
        pixiv.common.logInvoke(`.pixiv ${this.trigger}`, session);
        const sendCard = async (data: types.illustration[]) => {
            var sendSuccess = false;
            var mainCardMessageID = "";
            if (isGUI) {
            } else {
                if (session.guild) {
                    await session.sendCard(pixiv.cards.resaving("多张图片")).then((res) => {
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
            }
            var r18: number = 0;
            var detection: number = 0;
            var link: string[] = [];
            var pid: string[] = [];
            var datas: any[] = [];
            var promises: Promise<any>[] = [];
            for (const k in data) {
                for (const val of data[k].tags) {
                    const tag = val.name;
                    if (pixiv.common.isForbittedTag(tag)) {
                        continue;
                    }
                }
                if (data[k].x_restrict !== 0) {
                    continue;
                }
                datas.push(data[k]);
                if (datas.length >= 9) break;
            }
            const detectionResults = await pixiv.aligreen.imageDetectionSync(datas);
            if (!detectionResults) {
                bot.logger.error("ImageDetection: No detection result was returned");
                return session.sendTemp("所有图片的阿里云检测均返回失败，这极有可能是因为国际网络线路不稳定，请稍后再试。");
            }
            for (const val of datas) {
                if (!pixiv.linkmap.isInDatabase(val.id, "0") && detectionResults[val.id].success) detection++;
                promises.push(pixiv.common.uploadImage(val, detectionResults[val.id], session));
            }
            var uploadResults: {
                link: string;
                pid: string;
            }[] = [];
            await Promise.all(promises).then((res) => {
                uploadResults = res;
            }).catch((e) => {
                if (e) {
                    bot.logger.error(e);
                    session.sendCardTemp(pixiv.cards.error(e.stack));
                }
            });
            for (var val of uploadResults) {
                link.push(val.link);
                pid.push(val.pid);
            }
            while (link.length <= 9) {
                link.push(pixiv.common.akarin);
                pid.push("没有了");
            }
            bot.logger.debug(`UserInterface: Presenting card to user`);
            if (isGUI) {
                bot.API.message.update(msgID, pixiv.cards.author(data[0], r18, link, pid, {}).addModule(pixiv.cards.GUI.returnButton([{ action: "GUI.view.command.list" }])).toString(), undefined, session.userId);
            } else {
                if (session.guild) {
                    await session.updateMessage(mainCardMessageID, [pixiv.cards.author(data[0], r18, link, pid, {})])
                        .then(() => {
                            pixiv.users.logInvoke(session, this.trigger, datas.length, detection)
                        })
                        .catch((e) => {
                            bot.logger.error(`UserInterface: Failed updating message ${mainCardMessageID}`);
                            if (e) bot.logger.error(e);
                        });
                } else {
                    session.sendCard([pixiv.cards.author(data[0], r18, link, pid, {})])
                        .then(() => {
                            pixiv.users.logInvoke(session, this.trigger, datas.length, detection)
                        })
                        .catch((e) => {
                            bot.logger.error(`UserInterface: Failed sending message`);
                            if (e) bot.logger.error(e);
                        });
                }
            }
        }
        if (session.args.length === 0) {
            return session.reply("使用 `.pixiv help author` 查询指令详细用法")
        } else {
            if (pixiv.common.isForbittedUser(session.args[0])) {
                bot.logger.debug(`UserInterface: User violates user blacklist: ${session.args[0]}. Banned the user for 30 seconds`);
                pixiv.common.registerBan(session.userId, this.trigger, 30);
                return session.reply(`您已触犯用户黑名单并被禁止使用 \`.pixiv ${this.trigger}\` 指令至 ${new Date(pixiv.common.getBanEndTimestamp(session.userId, this.trigger)).toLocaleString("zh-cn")}`);
            }
            if (isNaN(parseInt(session.args[0]))) {
                axios({
                    baseURL: config.pixivAPIBaseURL,
                    url: "/creator/search",
                    method: "GET",
                    params: {
                        keyword: session.args[0],
                        user: {
                            id: session.user.id,
                            identifyNum: session.user.identifyNum,
                            username: session.user.username,
                            avatar: session.user.avatar
                        }
                    }
                }).then(async (res: any) => {
                    if (res.data.length === 0) {
                        return session.reply("用户不存在或此用户没有上传过插画！")
                    }
                    if (res.data.hasOwnProperty("code") && res.data.code == 400) {
                        return session.reply("请输入一个合法的用户ID（使用 `.pixiv help author` 查询指令详细用法）")
                    }
                    if (res.data.hasOwnProperty("code") && res.data.code == 500) {
                        return session.reply("Pixiv官方服务器不可用，请稍后再试");
                    }
                    let messageId = (await session.sendCard(new Card().addText("正在加载……请稍候").addModule(pixiv.cards.getCommercials()))).msgSent?.msgId;
                    if (!messageId) return;
                    let data: {
                        user_previews: {
                            illusts: types.illustration[],
                            [key: string]: any
                        }[],
                        next_url: string
                    } = res.data;
                    let users = [];
                    for (let index = 0; index < data.user_previews.length && index < 3; ++index) {
                        let val = data.user_previews[index];
                        let detections = await pixiv.aligreen.imageDetectionSync(val.illusts);
                        let promises: Promise<any>[] = [];
                        for (const illust of val.illusts) {
                            promises.push(pixiv.common.uploadImage(illust, detections[illust.id], session));
                        }
                        var uploadResults: {
                            link: string;
                            pid: string;
                        }[] = [];
                        await Promise.all(promises).then((res) => {
                            uploadResults = res;
                        }).catch((e) => {
                            if (e) {
                                bot.logger.error(e);
                                session.sendCardTemp(pixiv.cards.error(e.stack));
                            }
                        });
                        const avatarDetection = await pixiv.aligreen.simpleImageDetection(val.user.profile_image_urls.medium, val.user.id);
                        let avatarBuffer: Buffer = (await axios({
                            url: pixiv.common.getProxiedImageLink(val.user.profile_image_urls.medium),
                            responseType: 'arraybuffer'
                        })).data;
                        let avatarSharp = sharp(avatarBuffer);
                        if (avatarDetection.blur) {
                            avatarSharp.blur(avatarDetection.blur);
                        }
                        avatarBuffer = await avatarSharp.jpeg().toBuffer();
                        let avatarLink = await pixiv.common.simpleUploadFile(avatarBuffer);
                        users.push({
                            username: val.user.name,
                            avatar: avatarLink,
                            uid: val.user.id,
                            links: uploadResults.map(val => val.link)
                        });
                    }
                    session.updateMessage(messageId, [pixiv.cards.searchForAuthor(users)]);
                }).catch((e: any) => {
                    if (e) {
                        bot.logger.error(e);
                        session.sendCardTemp(pixiv.cards.error(e.stack));
                    }
                });
                // return session.reply("请输入一个合法的用户ID（使用 `.pixiv help author` 查询指令详细用法）");
            } else {
                const selection = session.args[1];
                var isGUI: boolean = false;
                var msgID: string = "";
                if (selection && selection.split(".")[0] == "GUI") {
                    const UUID = selection.split(".")[1];
                    await bot.axios({
                        url: "/v3/message/view",
                        method: "GET",
                        params: {
                            msg_id: UUID
                        }
                    }).then(() => {
                        isGUI = true;
                        msgID = UUID;
                    }).catch((e) => {
                        bot.logger.warn("GUI:Unknown GUI msgID");
                        bot.logger.warn(e);
                        isGUI = false;
                    })
                }
                axios({
                    baseURL: config.pixivAPIBaseURL,
                    url: "/creator/illustration",
                    method: "GET",
                    params: {
                        keyword: session.args[0],
                        user: {
                            id: session.user.id,
                            identifyNum: session.user.identifyNum,
                            username: session.user.username,
                            avatar: session.user.avatar
                        }
                    }
                }).then((res: any) => {
                    if (res.data.length === 0) {
                        return session.reply("用户不存在或此用户没有上传过插画！")
                    }
                    if (res.data.hasOwnProperty("code") && res.data.code == 400) {
                        return session.reply("请输入一个合法的用户ID（使用 `.pixiv help author` 查询指令详细用法）")
                    }
                    if (res.data.hasOwnProperty("code") && res.data.code == 500) {
                        return session.reply("Pixiv官方服务器不可用，请稍后再试");
                    }
                    pixiv.common.getNotifications(session);
                    sendCard(res.data);
                }).catch((e: any) => {
                    if (e) {
                        bot.logger.error(e);
                        session.sendCardTemp(pixiv.cards.error(e.stack));
                    }
                });
            }
        }
    };
}

export const author = new Author();


