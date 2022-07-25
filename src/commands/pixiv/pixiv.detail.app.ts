import { AppCommand, AppFunc, BaseSession } from 'kbotify';
import * as pixiv from './common';
import axios from 'axios';

class Detail extends AppCommand {
    code = 'detail'; // 只是用作标记
    trigger = 'detail'; // 用于触发的文字
    intro = 'Detail';
    func: AppFunc<BaseSession> = async (session) => {
        if (pixiv.common.isRateLimited(session, 3, this.trigger)) return;
        pixiv.common.logInvoke(`.pixiv ${this.trigger}`, session);
        async function sendCard(data: any) {
            if (data.x_restrict !== 0) {
                return session.sendCard(pixiv.cards.detail(data, pixiv.common.akarin));
            }
            const loadingBarMessageID = (await session.sendCard(pixiv.cards.resaving(`\`${data.id}_p0.jpg\``))).msgSent?.msgId
            if (loadingBarMessageID == undefined) {
                return pixiv.common.log("Message sending failed");
            }
            const detectionResult = (await pixiv.aligreen.imageDetectionSync([data]))[data.id]
            var uploadResult: {
                link: string;
                pid: string;
            } = { link: pixiv.common.akarin, pid: "没有了" };
            await pixiv.common.uploadImage(data, detectionResult, session).then((res) => {
                uploadResult = res;
            }).catch((e) => {
                if (e) {
                    console.error(e);
                    session.sendCardTemp(pixiv.cards.error(e, true));
                }
            });
            pixiv.common.log(`Process ended, presenting to user`);
            session.updateMessage(loadingBarMessageID, [pixiv.cards.detail(data, uploadResult.link)])
        }
        if (session.args.length === 0) {
            return session.reply("使用 `.pixiv help detail` 查询指令详细用法")
        } else {
            if (isNaN(parseInt(session.args[0]))) {
                return session.reply(`插画ID必须是纯数字！请输入一个合法的插画ID（收到 ${session.args[0]}）\n（使用 \`.pixiv help detail\` 查询指令详细用法）`)
            }
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
                if (res.data.hasOwnProperty("status") && res.data.status == 400) {
                    return session.reply("插画ID不合法！")
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

export const detail = new Detail();


