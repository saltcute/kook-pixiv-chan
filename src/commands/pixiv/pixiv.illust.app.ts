import { AppCommand, AppFunc, BaseSession } from 'kbotify';
import * as pixiv from './common';
import axios from 'axios';

class Illust extends AppCommand {
    code = 'illust'; // 只是用作标记
    trigger = 'illust'; // 用于触发的文字
    intro = 'Illustration';
    func: AppFunc<BaseSession> = async (session) => {
        if (pixiv.common.isRateLimited(session, 3, `.pixiv ${this.trigger}`)) return;
        pixiv.common.logInvoke(`.pixiv ${this.trigger}`, session);
        async function sendCard(data: any) {
            if (data.x_restrict !== 0) {
                return session.sendCard(pixiv.cards.illust(data, pixiv.common.akarin));
            }
            const loadingBarMessageID = (await session.sendCard(pixiv.cards.resaving(`\`${data.id}_p0.jpg\``))).msgSent?.msgId
            if (loadingBarMessageID == undefined) {
                return pixiv.common.log("Send message failed");
            }
            const detectionResult = (await pixiv.aligreen.imageDetectionSync([data]))[data.id];
            var uploadResult: {
                link: string;
                pid: string;
            } = { link: pixiv.common.akarin, pid: "没有了" };
            await pixiv.common.uploadImage(data, detectionResult, session).then((res) => {
                uploadResult = res;
            }).catch((e) => {
                if (e) {
                    console.error(e);
                    session.sendCard(pixiv.cards.error(e, true));
                }
            });
            pixiv.common.log(`Process ended, presenting to user`);
            session.updateMessage(loadingBarMessageID, [pixiv.cards.illust(data, uploadResult.link)])
        }
        if (session.args.length === 0) {
            return session.reply("使用 `.pixiv help illust` 查询指令详细用法")
        } else {
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
                    return session.reply("请输入一个合法的插画ID（使用 `.pixiv help illust` 查询指令详细用法）")
                }
                pixiv.common.getNotifications(session);
                sendCard(res.data);
            }).catch((e: any) => {
                if (e) {
                    console.error(e);
                    session.sendCard(pixiv.cards.error(e, true));
                }
            });
        }
    };
}

export const illust = new Illust();


