import { AppCommand, AppFunc, BaseSession } from 'kbotify';
import * as pixiv from './common';
import axios from 'axios';

class Random extends AppCommand {
    code = 'random'; // 只是用作标记
    trigger = 'random'; // 用于触发的文字
    intro = 'Recommendation';
    func: AppFunc<BaseSession> = async (session) => {
        const lastExecutionTimestamp = pixiv.common.lastExecutionTimestamp(session.userId);
        if (lastExecutionTimestamp !== -1 && Date.now() - lastExecutionTimestamp <= 10 * 1000) {
            return session.reply(`您已达到速率限制。每个用户10秒内只能发起一次 \`.pixiv random\` 指令，请于 ${Math.round((lastExecutionTimestamp + 10 * 1000 - Date.now()) / 1000)} 秒后再试。`);
        }
        pixiv.common.registerExecution(session.userId);
        async function sendCard(data: any) {
            const loadingBarMessageID = (await session.sendCard(pixiv.cards.resaving("多张图片"))).msgSent?.msgId
            if (loadingBarMessageID == undefined) {
                return pixiv.common.log("Send message failed");
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
            const uploadResults = await Promise.all(promises);
            for (var val of uploadResults) {
                link.push(val.link);
                pid.push(val.pid);
            }
            while (link.length <= 9) {
                link.push(pixiv.common.akarin);
                pid.push("没有了");
            }
            await session.updateMessage(loadingBarMessageID, [pixiv.cards.random(link, pid, {})]);
        }
        pixiv.common.log(`From ${session.user.nickname} (ID ${session.user.id}), invoke ".pixiv ${this.trigger}"`);
        axios({
            url: `http://pixiv.lolicon.ac.cn/recommend`,
            method: "GET"
        }).then((res: any) => {
            pixiv.common.getNotifications(session);
            sendCard(res.data);
        }).catch((e: any) => {
            session.sendCard(pixiv.cards.error(e));
        });
    };
}

export const random = new Random();


