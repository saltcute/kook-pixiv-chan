import { AppCommand, AppFunc, BaseSession } from 'kbotify';
import * as pixiv from './common';
import axios from 'axios';
import config from 'configs/config';
import { bot } from 'init/client';

class Random extends AppCommand {
    code = 'random'; // 只是用作标记
    trigger = 'random'; // 用于触发的文字
    intro = 'Recommendation';
    func: AppFunc<BaseSession> = async (session) => {
        if (pixiv.common.isRateLimited(session, 10, this.trigger)) return;
        pixiv.common.logInvoke(`.pixiv ${this.trigger}`, session);
        async function sendCard(data: any) {
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
            bot.logger.info(`Processing ended, presenting to user`);
            await session.updateMessage(loadingBarMessageID, [pixiv.cards.random(link, pid, {})]);
        }
        axios({
            url: `${config.pixivAPIBaseURL}/recommend`,
            method: "GET"
        }).then((res: any) => {
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
    };
}

export const random = new Random();


