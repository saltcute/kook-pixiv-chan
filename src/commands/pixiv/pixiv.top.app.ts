import { AppCommand, AppFunc, BaseSession } from 'kbotify';
import * as pixiv from './common';
import axios from 'axios';

class Top extends AppCommand {
    code = 'top'; // 只是用作标记
    trigger = 'top'; // 用于触发的文字
    intro = 'Top illustrations';
    func: AppFunc<BaseSession> = async (session) => {
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
            pixiv.common.log(`Process ended, presenting to user`);
            await session.updateMessage(loadingBarMessageID, [pixiv.cards.top(link, pid, session, {})]);
        }
        if (session.args.length === 0) {
            pixiv.common.log(`From ${session.user.nickname} (ID ${session.user.id}), invoke ".pixiv ${this.trigger}"`);
            axios({
                url: `http://pixiv.lolicon.ac.cn/ranklist`,
                method: "GET"
            }).then((res: any) => {
                pixiv.common.getNotifications(session);
                sendCard(res.data);
            }).catch((e: any) => {
                session.sendCard(pixiv.cards.error(e));
            });
        } else {
            pixiv.common.log(`From ${session.user.nickname} (ID ${session.user.id}), invoke ".pixiv ${this.trigger} ${session.args[0]}"`);
            axios({
                url: `http://pixiv.lolicon.ac.cn/topInTag`,
                method: "GET",
                params: {
                    keyword: session.args[0]
                }
            }).then((res: any) => {
                if (res.data.length == 0) {
                    return session.reply(`没有找到任何插画……可能是命令使用方式错误，输入 \`.pixiv help top\` 查看详细使用帮助\n如确定使用方式无误，则没有关于此标签**「${session.args[0]}」**的任何插画，请更换关键词再试一遍`);
                } else if (res.data.length <= 10) {
                    session.reply(`关于标签**「${session.args[0]}」**的插画数量极少……Pixiv酱仍会为你获取可用的插画\n但也可能是命令使用方式错误，输入 \`.pixiv help top\` 查看详细使用帮助`);
                }
                pixiv.common.getNotifications(session);
                sendCard(res.data);
            }).catch((e: any) => {
                session.sendCard(pixiv.cards.error(e));
            });
        }
    };
}

export const top = new Top();


