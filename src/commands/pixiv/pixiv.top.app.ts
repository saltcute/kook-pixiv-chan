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
        if (pixivadmin.common.isGlobalBanned(session)) return pixivadmin.common.notifyGlobalBan(session);
        if (pixiv.common.isBanned(session, this.trigger)) return;
        if (pixiv.common.isRateLimited(session, 6, this.trigger)) return;
        pixiv.common.logInvoke(`.pixiv ${this.trigger}`, session);
        async function sendCard(data: any, durationName: string) {
            var sendSuccess = false;
            var mainCardMessageID = "";
            if (session.guild) {
                await session.sendCard(pixiv.cards.resaving("多张图片")).then((res) => {
                    if (res.resultType == "SUCCESS" && res.msgSent?.msgId !== undefined) {
                        sendSuccess = true;
                        mainCardMessageID = res.msgSent?.msgId;
                    }
                }).catch((e) => {
                    if (e) {
                        if (e.code == 40012) { // Slow-mode limit
                            bot.logger.warn("Limited by slow-mode, no operation was done");
                        } else {
                            bot.logger.error(e);
                        }
                    }
                    sendSuccess = false;
                });
                if (!sendSuccess) return;
            }
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
            const detectionResults = await pixiv.aligreen.imageDetectionSync(datas)
            for (const val of datas) {
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
            bot.logger.info(`Process ended, presenting to user`);
            if (session.guild) {
                session.updateMessage(mainCardMessageID, [pixiv.cards.top(link, pid, durationName, {})]).catch((e) => {
                    bot.logger.error(`Update message ${mainCardMessageID} failed!`);
                    if (e) bot.logger.error(e);
                });
            } else {
                session.sendCard([pixiv.cards.top(link, pid, durationName, {})]).catch((e) => {
                    bot.logger.error(`Send message failed!`);
                    if (e) bot.logger.error(e);
                });
            }
        }
        const durationList = {
            month: "MONTH",
            week: "WEEK",
            week_original: "WEEK_ORIGINAL",
            week_rookie: "WEEK_ROOKIE",
            day: "DAY",
            day_male: "DAY_MALE",
            day_female: "DAT_FEMALE",
            day_manga: "DAY_MANGA"
        };
        const durationNameList = {
            month: "本月",
            week: "本周",
            week_original: "本周原创",
            week_rookie: "本周新人",
            day: "今日",
            day_male: "今日男性向",
            day_female: "今日女性向",
            day_manga: "今日漫画"
        }
        var duration: string;
        var durationName: string;
        const selection: string = session.args.join("_").toLowerCase();
        if (pixiv.common.isObjKey(selection, durationList)) {
            duration = durationList[selection];
            durationName = durationNameList[selection]
        } else {
            if (session.args.length > 0) return session.replyTemp(`您是否想要搜索拥有某个标签的插画？此功能已被迁移至 \`.pixiv tag\` 命令，使用方法与先前无异，只需将 \`top\` 换成 \`tag\` 即可\n\`\`\`\n.pixiv tag ${session.args.join(" ")}\n\`\`\`\n同时也有新功能加入！详情请发送 \`.pixiv help tag\`\n亦或可能是您的参数错误，发送 \`.pixiv help top\` 查看参数列表`);
            duration = durationList.week;
            durationName = durationNameList.week;
        }
        axios({
            url: `${config.pixivAPIBaseURL}/ranklist`,
            method: "GET",
            params: {
                duration: duration
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


