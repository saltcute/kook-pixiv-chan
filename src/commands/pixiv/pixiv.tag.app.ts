import { AppCommand, AppFunc, BaseSession } from 'kbotify';
import * as pixiv from './common';
import axios from 'axios';
import config from 'configs/config';
import { bot } from 'init/client';

class Tag extends AppCommand {
    code = 'tag'; // 只是用作标记
    trigger = 'tag'; // 用于触发的文字
    intro = 'Search tags';
    func: AppFunc<BaseSession> = async (session) => {
        if (pixiv.common.isBanned(session, this.trigger)) return;
        if (pixiv.common.isRateLimited(session, 6, this.trigger)) return;
        pixiv.common.logInvoke(`.pixiv ${this.trigger}`, session);
        async function sendCard(data: any, tags: string[], durationName: string) {
            const sendResult = (await session.sendCard(pixiv.cards.resaving("多张图片")));
            const loadingBarMessageID = sendResult.msgSent?.msgId;
            if (sendResult.resultType != "SUCCESS" || loadingBarMessageID == undefined) {
                bot.logger.error(sendResult.detail);
                return bot.logger.error("Message sending failed");
            }
            var link: string[] = [];
            var pid: string[] = [];
            var datas: any[] = [];
            var promises: Promise<any>[] = [];
            for (const k in data) {
                if (data[k].x_restrict !== 0) {
                    continue;
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
            await session.updateMessage(loadingBarMessageID, [pixiv.cards.tag(link, pid, tags, durationName, {})]);
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
            var tags: string[] = [];
            const selection: string = session.args[0].toLowerCase();
            if (pixiv.common.isObjKey(selection, durationList)) {
                duration = durationList[selection];
                durationName = durationNameList[selection]
                tags = session.args.slice(1);
            } else {
                if (session.args.length > 1) {
                    duration = durationList.month;
                    durationName = durationNameList.month;
                } else {
                    duration = durationList.week;
                    durationName = durationNameList.week;
                }
                tags = session.args;
            }
            for (const tag of tags) {
                if (pixiv.common.isForbittedTag(tag)) {
                    bot.logger.info(`Violating tag blacklist: ${tag}, banned the user for 30 seconds`);
                    pixiv.common.registerBan(session.userId, this.trigger, 30);
                    session.reply(`您已触犯标签黑名单并被禁止使用 \`.pixiv ${this.trigger}\` 指令至 ${new Date(pixiv.common.getBanEndTimestamp(session.userId, this.trigger)).toLocaleString("zh-cn")}`);
                    return;
                }
            }
            axios({
                url: `${config.pixivAPIBaseURL}/topInTag`,
                method: "GET",
                params: {
                    keyword: tags.join(" "),
                    duration: duration
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
                    console.error(e);
                    session.sendCardTemp(pixiv.cards.error(e, true));
                }
            });
        }
    };
}

export const tag = new Tag();


