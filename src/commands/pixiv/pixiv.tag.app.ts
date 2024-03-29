import { AppCommand, AppFunc, BaseSession } from 'kbotify';
import * as pixiv from './common';
import * as pixivadmin from './admin/common'
import axios from 'axios';
import config from 'configs/config';
import { bot } from 'init/client';
import { types } from 'pixnode';

class Tag extends AppCommand {
    code = 'tag'; // 只是用作标记
    trigger = 'tag'; // 用于触发的文字
    intro = 'Search tags';
    func: AppFunc<BaseSession> = async (session) => {
        if (await pixiv.users.reachesCommandLimit(session, this.trigger)) return;
        if (await pixiv.users.reachesIllustLimit(session)) return;
        if (pixivadmin.common.isGlobalBanned(session)) return pixivadmin.common.notifyGlobalBan(session);
        if (pixiv.common.isBanned(session, this.trigger)) return;
        if (pixiv.common.isRateLimited(session, 6, this.trigger)) return;
        pixiv.common.logInvoke(`.pixiv ${this.trigger}`, session);
        const sendCard = async (data: types.illustration[], tags: string[], durationName: string) => {
            var sendSuccess = false;
            var mainCardMessageID = "";
            if (session.guild) {
                if (isGUI) {
                    await bot.API.message.update(msgID, pixiv.cards.resaving("多张图片").toString(), undefined, session.userId);
                } else {
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
            var detection: number = 0;
            var link: string[] = [];
            var pid: string[] = [];
            var datas: any[] = [];
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
            const detectionResults = await pixiv.aligreen.imageDetectionSync(datas);
            if (!detectionResults) {
                bot.logger.error("ImageDetection: No detection result was returned");
                return session.sendTemp("所有图片的阿里云检测均返回失败，这极有可能是因为国际网络线路不稳定，请稍后再试。");
            }
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
                bot.API.message.update(msgID, pixiv.cards.tag(link, pid, tags, durationName, {}).addModule(pixiv.cards.GUI.returnButton([{ action: "GUI.view.command.list" }])).toString(), undefined, session.userId);
            } else {
                if (session.guild) {
                    session.updateMessage(mainCardMessageID, [pixiv.cards.tag(link, pid, tags, durationName, {})])
                        .then(() => {
                            pixiv.users.logInvoke(session, this.trigger, datas.length, detection)
                        })
                        .catch((e) => {
                            bot.logger.error(`UserInterface: Failed updating message ${mainCardMessageID}`);
                            if (e) bot.logger.error(e);
                        });
                } else {
                    session.sendCard([pixiv.cards.tag(link, pid, tags, durationName, {})])
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
            return session.reply("使用 `.pixiv help tag` 查询指令详细用法")
        } else {
            const durationList = {
                month: "LAST_MONTH",
                week: "LAST_WEEK",
                day: "LAST_DAY",
            };
            const durationNameList = {
                month: "本月",
                week: "本周",
                day: "今日",
            }
            var duration: string;
            var durationName: string;
            var tags: string[] = session.args;
            var isGUI: boolean = false;
            var msgID: string = "";
            var selection: string = tags[0];
            if (selection.split(".")[0] == "GUI") {
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
                tags = tags.slice(1);
            }
            selection = tags[0].toLowerCase();
            if (pixiv.common.isObjKey(selection, durationList)) {
                duration = durationList[selection];
                durationName = durationNameList[selection]
                tags = tags.slice(1);
            } else {
                if (session.args.length > 1) {
                    duration = durationList.month;
                    durationName = durationNameList.month;
                } else {
                    duration = durationList.week;
                    durationName = durationNameList.week;
                }
                tags = tags;
            }
            for (const tag of tags) {
                if (pixiv.common.isForbittedTag(tag)) {
                    bot.logger.debug(`UserInterface: User violates tag blacklist: ${tag}. Banned the user for 30 seconds`);
                    pixiv.common.registerBan(session.userId, this.trigger, 30);
                    return session.reply(`您已触犯标签黑名单并被禁止使用 \`.pixiv ${this.trigger}\` 指令至 ${new Date(pixiv.common.getBanEndTimestamp(session.userId, this.trigger)).toLocaleString("zh-cn")}`);
                }
            }
            axios({
                baseURL: config.pixivAPIBaseURL,
                url: "/illustration/tag",
                method: "GET",
                params: {
                    keyword: tags.join(" "),
                    duration: duration,
                    user: {
                        id: session.user.id,
                        identifyNum: session.user.identifyNum,
                        username: session.user.username,
                        avatar: session.user.avatar
                    }
                }
            }).then(async (res: any) => {
                if (res.data.length == 0) {
                    return session.reply(`没有找到任何${tags.length > 1 ? "同时拥有" : "关于"}${tags.slice(0, 2).map(str => `「${str}」`).join("、")}${tags.length > 2 ? "等" : ""}标签的插画……可能是命令使用方式错误，输入 \`.pixiv help tag\` 查看详细使用帮助\n如确定使用方式无误，则${durationName}没有任何符合所给要求的插画，请更换关键词再试一遍`);
                } else if (res.data.length <= 10) {
                    await session.replyTemp(`${durationName}${tags.length > 1 ? "同时拥有" : "关于"}${tags.slice(0, 2).map(str => `「${str}」`).join("、")}${tags.length > 2 ? "等" : ""}标签的插画数量极少（小于十张；包括无法显示的 R-18 插画）\n请尝试更换关键词`);
                }
                if (res.data.hasOwnProperty("code") && res.data.code == 500) {
                    return session.reply("Pixiv官方服务器不可用，请稍后再试");
                }
                pixiv.common.getNotifications(session);
                sendCard(res.data, tags, durationName);
            }).catch((e: any) => {
                if (e) {
                    bot.logger.error(e);
                    session.sendCardTemp(pixiv.cards.error(e.stack));
                }
            });
        }
    };
}

export const tag = new Tag();


