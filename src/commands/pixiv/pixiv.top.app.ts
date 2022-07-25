import { AppCommand, AppFunc, BaseSession } from 'kbotify';
import * as pixiv from './common';
import axios from 'axios';

class Top extends AppCommand {
    code = 'top'; // 只是用作标记
    trigger = 'top'; // 用于触发的文字
    intro = 'Top illustrations';
    func: AppFunc<BaseSession> = async (session) => {
        if (pixiv.common.isRateLimited(session, 6, this.trigger)) return;
        pixiv.common.logInvoke(`.pixiv ${this.trigger}`, session);
        async function sendCard(data: any) {
            const loadingBarMessageID = (await session.sendCard(pixiv.cards.resaving("多张图片"))).msgSent?.msgId
            if (loadingBarMessageID == undefined) {
                return pixiv.common.log("Message sending failed");
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
            await session.updateMessage(loadingBarMessageID, [pixiv.cards.top(link, pid, session, {})]);
        }
        if (session.args.length === 0) {
            axios({
                url: `http://pixiv.lolicon.ac.cn/ranklist`,
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
        } else {
            const duration = session.args.length > 1 ? undefined : "LAST_WEEK"
            axios({
                url: `http://pixiv.lolicon.ac.cn/topInTag`,
                method: "GET",
                params: {
                    keyword: encodeURI(session.args.join(" ")),
                    duration: duration
                }
            }).then((res: any) => {
                if (res.data.length == 0) {
                    return session.reply(`没有找到任何关于标签**「${session.args[0]}」**的插画……可能是命令使用方式错误，输入 \`.pixiv help top\` 查看详细使用帮助\n如确定使用方式无误，则没有关于此标签**「${session.args[0]}」**的任何插画，请更换关键词再试一遍`);
                } else if (res.data.length <= 10) {
                    session.replyTemp(`关于标签**「${session.args[0]}」**的插画数量极少（小于十张）……这有可能是正常现象（\`.pixiv top\` 只会返回本周发表的插画）\n但也可能是命令使用方式错误，输入 \`.pixiv help top\` 查看详细使用帮助`);
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

export const top = new Top();


