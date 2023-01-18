import { AppCommand, AppFunc, BaseSession } from 'kbotify';
import * as pixiv from './common';
import * as pixivadmin from './admin/common'
import axios from 'axios';
import config from 'configs/config';
import { bot } from 'init/client';
import { types } from 'pixnode';

class Detail extends AppCommand {
    code = 'detail'; // 只是用作标记
    trigger = 'detail'; // 用于触发的文字
    intro = 'Detail';
    func: AppFunc<BaseSession> = async (session) => {
        if (await pixiv.users.reachesCommandLimit(session, this.trigger)) return;
        if (await pixiv.users.reachesIllustLimit(session)) return;
        if (pixivadmin.common.isGlobalBanned(session)) return pixivadmin.common.notifyGlobalBan(session);
        if (pixiv.common.isBanned(session, this.trigger)) return;
        if (pixiv.common.isRateLimited(session, 3, this.trigger)) return;
        pixiv.common.logInvoke(`.pixiv ${this.trigger}`, session);
        const sendCard = async (data: types.illustration) => {
            const isVIP = (await pixiv.common.getApexVIPStatus(session.userId)).data.is_vip;
            if (data.x_restrict !== 0) {
                return session.sendCard(pixiv.cards.detail(data, pixiv.common.akarin, {
                    isVIP
                }));
            }
            var detection = 0;
            var sendSuccess = false;
            var mainCardMessageID = "";
            if (isGUI) {
                await bot.API.message.update(msgID, pixiv.cards.resaving(data.id).toString(), undefined, session.userId);
            } else {
                if (session.guild) {
                    await session.sendCard(pixiv.cards.resaving(data.id)).then((res) => {
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
            const detectionResult = (await pixiv.aligreen.imageDetectionSync([data]))[data.id];
            if (!detectionResult) {
                bot.logger.error("ImageDetection: No detection result was returned");
                return session.sendTemp("所有图片的阿里云检测均返回失败，这极有可能是因为国际网络线路不稳定，请稍后再试。");
            }
            var uploadResult: {
                link: string;
                pid: number;
            } = { link: pixiv.common.akarin, pid: -1 };
            if (!pixiv.linkmap.isInDatabase(data.id, "0") && detectionResult.success) detection++;
            await pixiv.common.uploadImage(data, detectionResult, session).then((res) => {
                uploadResult = res;
            }).catch((e) => {
                if (e) {
                    bot.logger.error(e);
                    session.sendCardTemp(pixiv.cards.error(e.stack));
                }
            });
            bot.logger.debug(`UserInterface: Presenting card to user`);
            if (isGUI) {
                bot.API.message.update(msgID, pixiv.cards.detail(data, uploadResult.link, { isVIP }).addModule(pixiv.cards.GUI.returnButton([{ action: "GUI.view.command.list" }])).toString(), undefined, session.userId);
            } else {
                if (session.guild) {
                    session.updateMessage(mainCardMessageID, [pixiv.cards.detail(data, uploadResult.link, { isVIP })])
                        .then(() => {
                            pixiv.users.logInvoke(session, this.trigger, 1, detection)
                        })
                        .catch((e) => {
                            bot.logger.error(`UserInterface: Failed updating message ${mainCardMessageID}`);
                            if (e) bot.logger.error(e);
                        });
                } else {
                    session.sendCard([pixiv.cards.detail(data, uploadResult.link, { isVIP })])
                        .then(() => {
                            pixiv.users.logInvoke(session, this.trigger, 1, detection)
                        })
                        .catch((e) => {
                            bot.logger.error(`UserInterface: Failed sending message`);
                            if (e) bot.logger.error(e);
                        });
                }
            }
        }
        if (session.args.length === 0) {
            return session.reply("使用 `.pixiv help detail` 查询指令详细用法")
        } else {
            if (isNaN(parseInt(session.args[0]))) {
                return session.reply(`插画ID必须是纯数字！请输入一个合法的插画ID（收到 ${session.args[0]}）\n（使用 \`.pixiv help detail\` 查询指令详细用法）`)
            }
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
                url: "/illustration/detail",
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
                if (res.data.hasOwnProperty("status") && res.data.status === 404) {
                    return session.reply("插画不存在或已被删除！")
                }
                if (res.data.hasOwnProperty("status") && res.data.status == 400) {
                    return session.reply("插画ID不合法！")
                }
                if (res.data.hasOwnProperty("code") && res.data.code == 500) {
                    return session.reply("Pixiv官方服务器不可用，请稍后再试");
                }
                if (pixiv.common.isForbittedUser(res.data.user.uid)) {
                    bot.logger.debug(`UserInterface: User violates user blacklist: ${res.data.user.uid}. Banned the user for 30 seconds`);
                    pixiv.common.registerBan(session.userId, this.trigger, 30);
                    return session.reply(`此插画来自用户黑名单中的用户，您已被暂时停止使用 \`.pixiv ${this.trigger}\` 指令 30秒`);
                }
                for (const val of res.data.tags) {
                    const tag = val.name;
                    if (pixiv.common.isForbittedTag(tag)) {
                        bot.logger.debug(`UserInterface: User violates tag blacklist: ${tag}. Banned the user for 30 seconds`);
                        pixiv.common.registerBan(session.userId, this.trigger, 30);
                        return session.reply(`此插画包含标签黑名单中的标签，您已被暂时停止使用 \`.pixiv ${this.trigger}\` 指令 30秒`);
                    }
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
    };
}

export const detail = new Detail();


