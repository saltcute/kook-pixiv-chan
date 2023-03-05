import { author } from 'commands/pixiv/pixiv.author.app';
import { bot } from 'init/client';
import * as pixiv from 'commands/pixiv/common';
import * as pixivadmin from 'commands/pixiv/admin/common'
import { BaseSession, ButtonClickedEvent } from "kasumi.js";
import { types } from 'pixnode';
import axios from 'axios';
import config from 'configs/config';
export default async function (event: ButtonClickedEvent, action: string[], data: {
    username: string,
    avatar: string,
    uid: number,
    links: string[]
}) {
    let session = new BaseSession([], event, bot);
    if (await pixiv.users.reachesCommandLimit(session, 'author')) return;
    if (await pixiv.users.reachesIllustLimit(session)) return;
    if (pixivadmin.common.isGlobalBanned(session)) return pixivadmin.common.notifyGlobalBan(session);
    if (pixiv.common.isBanned(session, 'author')) return;
    if (pixiv.common.isRateLimited(session, 6, 'author')) return;
    const sendCard = async (data: types.illustration[]) => {
        var r18: number = 0;
        var detection: number = 0;
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
        const detectionResults = await pixiv.aligreen.imageDetectionSync(datas);
        if (!detectionResults) {
            bot.logger.error("ImageDetection: No detection result was returned");
            return session.sendTemp("所有图片的阿里云检测均返回失败，这极有可能是因为国际网络线路不稳定，请稍后再试。");
        }
        for (const val of datas) {
            if (detectionResults[val.id]) {
                if (!pixiv.linkmap.isInDatabase(val.id, "0") && detectionResults[val.id].success) detection++;
                promises.push(pixiv.common.uploadImage(val, detectionResults[val.id], session));
            }
        }
        var uploadResults: {
            link: string;
            pid: string;
        }[] = [];
        await Promise.all(promises).then((res) => {
            uploadResults = res;
        });;
        for (var val of uploadResults) {
            link.push(val.link);
            pid.push(val.pid);
        }
        bot.logger.debug(`UserInterface: Presenting card to user`);
        session.updateTemp(event.targetMsgId, [pixiv.cards.author(data[0], r18, link, pid, {}).addModule(pixiv.cards.GUI.returnButton([{ action: 'portal.error.reset' }]))])
            .then(() => {
                pixiv.users.logInvoke(session, 'author', datas.length, detection)
            });;
    }
    if (pixiv.common.isForbittedUser(data.uid.toString())) {
        bot.logger.debug(`UserInterface: User violates user blacklist: ${data.uid}. Banned the user for 30 seconds`);
        pixiv.common.registerBan(session.authorId, 'author', 30);
        return session.reply(`您已触犯用户黑名单并被禁止使用 \`.pixiv ${'author'}\` 指令至 ${new Date(pixiv.common.getBanEndTimestamp(session.authorId, 'author')).toLocaleString("zh-cn")}`);
    }
    axios({
        baseURL: config.pixivAPIBaseURL,
        url: "/creator/illustration",
        method: "GET",
        params: {
            keyword: data.uid,
            user: {
                id: session.author.id,
                identifyNum: session.author.identify_num,
                username: session.author.username,
                avatar: session.author.avatar
            }
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
        sendCard(res.data).catch((e) => {
            bot.logger.error(e);
        })
    }).catch((e: any) => {
        if (e) {
            bot.logger.error(e);
            session.sendTemp(pixiv.cards.error(e.stack));
        }
    });
}