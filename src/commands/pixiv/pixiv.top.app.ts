import { AppCommand, AppFunc, BaseSession } from 'kbotify';
import * as pixiv from './common';
import * as pixivadmin from './admin/common'
import axios from 'axios';
import config from 'configs/config';
import { bot } from 'init/client';

class Top extends AppCommand {
    code = 'top'; // 只是用作标记
    trigger = 'top'; // 用于触发的文字
    intro = 'Top illustrations';
    func: AppFunc<BaseSession> = async (session) => {
        if (await pixiv.users.reachesCommandLimit(session, this.trigger)) return;
        if (await pixiv.users.reachesIllustLimit(session)) return;
        if (pixivadmin.common.isGlobalBanned(session)) return pixivadmin.common.notifyGlobalBan(session);
        if (pixiv.common.isBanned(session, this.trigger)) return;
        if (pixiv.common.isRateLimited(session, 6, this.trigger)) return;
        pixiv.common.logInvoke(`.pixiv ${this.trigger}`, session);
        const sendCard = async (data: any, durationName: string) => {
            var sendSuccess = false;
            var mainCardMessageID = "";
            if (isGUI) {
                await bot.API.message.update(msgID, pixiv.cards.resaving("多张图片").toString(), undefined, session.userId);
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
                    console.error(e);
                    session.sendCardTemp(pixiv.cards.error(e, true));
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
            bot.logger.info(`UserInterface: Presenting card to user`);
            if (isGUI) {
                bot.API.message.update(msgID, pixiv.cards.top(link, pid, durationName, {}).addModule(pixiv.cards.GUI.returnButton([{ action: "GUI.run.command.top", text: "上级" }, { action: "GUI.view.command.list", text: "命令列表" }])).toString(), undefined, session.userId);
            } else {
                if (session.guild) {
                    session.updateMessage(mainCardMessageID, [pixiv.cards.top(link, pid, durationName, {})])
                        .then(async () => {
                            pixiv.users.logInvoke(session, this.trigger, datas.length, detection);
                        })
                        .catch((e) => {
                            bot.logger.error(`UserInterface: Failed updating message ${mainCardMessageID}`);
                            if (e) bot.logger.error(e);
                        });
                } else {
                    session.sendCard([pixiv.cards.top(link, pid, durationName, {})])
                        .then((res) => {
                            const msgID = res.msgSent?.msgId;
                            pixiv.users.logInvoke(session, this.trigger, datas.length, detection)
                        })
                        .catch((e) => {
                            bot.logger.error(`UserInterface: Failed sending message`);
                            if (e) bot.logger.error(e);
                        });
                }
            }
        }
        const durationList = {
            month: "MONTH",
            week: "WEEK",
            original: "WEEK_ORIGINAL",
            rookie: "WEEK_ROOKIE",
            day: "DAY",
            male: "DAY_MALE",
            female: "DAY_FEMALE",
            manga: "DAY_MANGA"
        };
        const durationNameList = {
            month: "本月",
            week: "本周",
            original: "本周原创",
            rookie: "本周新人",
            day: "今日",
            male: "今日男性向",
            female: "今日女性向",
            manga: "今日漫画"
        }
        var duration: string;
        var durationName: string;
        const selection: string = session.args[0].toLowerCase();
        const GUIString: string = session.args[1];
        var isGUI: boolean = false;
        var msgID: string = "";
        if (GUIString && GUIString.split(".")[0] == "GUI") {
            const UUID = GUIString.split(".")[1];
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
        if (pixiv.common.isObjKey(selection, durationList)) {
            duration = durationList[selection];
            durationName = durationNameList[selection]
        } else {
            if (session.args.length > 0 && !isGUI) return session.replyTemp(`您是否想要搜索拥有某个标签的插画？此功能已被迁移至 \`.pixiv tag\` 命令，使用方法与先前无异，只需将 \`top\` 换成 \`tag\` 即可\n\`\`\`\n.pixiv tag ${session.args.join(" ")}\n\`\`\`\n同时也有新功能加入！详情请发送 \`.pixiv help tag\`\n亦或可能是您的参数错误，发送 \`.pixiv help top\` 查看参数列表`);
            duration = durationList.week;
            durationName = durationNameList.week;
        }
        axios({
            baseURL: config.pixivAPIBaseURL,
            url: "/illustration/ranklist",
            method: "GET",
            params: {
                duration: duration,
                user: {
                    id: session.user.id,
                    identifyNum: session.user.identifyNum,
                    username: session.user.username,
                    avatar: session.user.avatar
                }
            }
        }).then((res: any) => {
            if (res.data.hasOwnProperty("code") && res.data.code == 500) {
                return session.replyTemp("Pixiv官方服务器不可用，请稍后再试");
            }
            if (res.data.length == 0) {
                return session.replyTemp(`无法找到任何插画，这多半是出错了`);
            }
            pixiv.common.getNotifications(session);
            sendCard(res.data, durationName);
        }).catch((e: any) => {
            if (e) {
                console.error(e);
                session.sendCardTemp(pixiv.cards.error(e, true));
            }
        });
    };
}

export const top = new Top();


