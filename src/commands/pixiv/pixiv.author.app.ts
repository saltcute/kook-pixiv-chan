import { AppCommand, AppFunc, BaseSession } from 'kbotify';
import * as pixiv from './common';
import * as pixivadmin from './admin/common'
import axios from 'axios';
import config from 'configs/config';
import { bot } from 'init/client';

class Author extends AppCommand {
    code = 'author'; // 只是用作标记
    trigger = 'author'; // 用于触发的文字
    intro = 'Author';
    func: AppFunc<BaseSession> = async (session) => {
        if (pixivadmin.common.isGlobalBanned(session)) return pixivadmin.common.notifyGlobalBan(session);
        if (pixiv.common.isBanned(session, this.trigger)) return;
        if (pixiv.common.isRateLimited(session, 6, this.trigger)) return;
        pixiv.common.logInvoke(`.pixiv ${this.trigger}`, session);
        async function sendCard(data: any) {
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
            var r18: number = 0;
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
            await session.updateMessage(mainCardMessageID, [pixiv.cards.author(data[0], r18, link, pid, session, {})]).catch((e) => {
                bot.logger.error(`Update message ${mainCardMessageID} failed!`);
                if (e) bot.logger.error(e);
            });
        }
        if (session.args.length === 0) {
            return session.reply("使用 `.pixiv help author` 查询指令详细用法")
        } else {
            if (pixiv.common.isForbittedUser(session.args[0])) {
                bot.logger.info(`Violating user blacklist: ${session.args[0]}, banned the user for 30 seconds`);
                pixiv.common.registerBan(session.userId, this.trigger, 30);
                return session.reply(`您已触犯用户黑名单并被禁止使用 \`.pixiv ${this.trigger}\` 指令至 ${new Date(pixiv.common.getBanEndTimestamp(session.userId, this.trigger)).toLocaleString("zh-cn")}`);
            }
            if (isNaN(parseInt(session.args[0]))) {
                return session.reply("请输入一个合法的用户ID（使用 `.pixiv help author` 查询指令详细用法）");
            }
            axios({
                baseURL: config.pixivAPIBaseURL,
                url: "/illustration/creator",
                method: "GET",
                params: {
                    keyword: session.args[0],
                    user: session.userId
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
                    console.error(e);
                    session.sendCardTemp(pixiv.cards.error(e, true));
                }
            });
        }
    };
}

export const author = new Author();


