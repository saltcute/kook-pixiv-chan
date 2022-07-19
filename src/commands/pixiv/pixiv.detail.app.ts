import { AppCommand, AppFunc, BaseSession } from 'kbotify';
import * as pixiv from './common';
import axios from 'axios';

class Detail extends AppCommand {
    code = 'detail'; // 只是用作标记
    trigger = 'detail'; // 用于触发的文字
    intro = 'Detail';
    func: AppFunc<BaseSession> = async (session) => {
        async function sendCard(data: any) {
            if (data.x_restrict !== 0) {
                return session.sendCard(pixiv.cards.detail(data, pixiv.common.akarin));
            }
            const loadingBarMessageID = (await session.sendCard(pixiv.cards.resaving(`\`${data.id}_p0.jpg\``))).msgSent?.msgId
            if (loadingBarMessageID == undefined) {
                return pixiv.common.log("Send message failed");
            }
            const detectionResult = (await pixiv.aligreen.imageDetectionSync([data]))[data.id]
            const uploadResult = await pixiv.common.uploadImage(data, detectionResult, session);
            session.updateMessage(loadingBarMessageID, [pixiv.cards.detail(data, uploadResult.link)])
        }
        if (session.args.length === 0) {
            pixiv.common.log(`From ${session.user.nickname} (ID ${session.user.id}), invoke ".pixiv ${this.trigger}"`);
            return session.reply("使用 `.pixiv help detail` 查询指令详细用法")
        } else {
            pixiv.common.log(`From ${session.user.nickname} (ID ${session.user.id}), invoke ".pixiv ${this.trigger} ${session.args[0]}"`);
            axios({
                url: `http://pixiv.lolicon.ac.cn/illustrationDetail`,
                method: "GET",
                params: {
                    keyword: session.args[0]
                }
            }).then((res: any) => {
                if (res.data.hasOwnProperty("status") && res.data.status === 404) {
                    return session.reply("插画不存在或已被删除！")
                }
                if (res.data.hasOwnProperty("code") && res.data.code == 400) {
                    return session.reply("请输入一个合法的插画ID（使用 `.pixiv help detail` 查询指令详细用法）")
                }
                pixiv.common.getNotifications(session);
                sendCard(res.data);
            }).catch((e: any) => {
                session.sendCard(pixiv.cards.error(e));
            });
        }
    };
}

export const detail = new Detail();


