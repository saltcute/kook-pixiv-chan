import { Card, TextMessage } from "kbotify";
import { ButtonClickEvent } from 'kaiheila-bot-root';
import { bot } from "init/client";
import * as pixiv from 'commands/pixiv/common'

export function countDownTextTrigger(event: ButtonClickEvent, callback: (msg: string) => any) {
    const trigger = (eve: TextMessage) => {
        if (eve.authorId != event.userId) return;
        if (eve.channelId != event.channelId) return;
        if (eve.content.split(" ").length == 0) return;
        bot.API.message.update(event.targetMsgId, new Card().addText(`已接收关键字，正在处理请求…`).toString(), undefined, event.userId);
        bot.message.off("text", trigger)
        clearTimeout(timeout)
        callback(eve.content);
        bot.message.off("text", trigger);
    }
    bot.message.on("text", trigger);
    var count: number = 60;
    var timeout: NodeJS.Timeout;
    const counter = () => {
        if (count == 0) {
            bot.API.message.update(event.targetMsgId, new Card().addText(`超时未收到关键字…将在3秒后返回上级菜单`).toString(), undefined, event.userId);
            bot.message.off("text", trigger)
            setTimeout(() => {
                bot.API.message.update(event.targetMsgId, pixiv.cards.GUI.command.list().toString(), undefined, event.userId);
            }, 3000);
            clearTimeout(timeout)
            return;
        }
        bot.API.message.update(event.targetMsgId, new Card().addText(`请在 ${count} 秒内发送直接发送关键字以进行搜索`).toString(), undefined, event.userId);
        count--;
        timeout = setTimeout(counter, 1000);
    }
    counter();
}