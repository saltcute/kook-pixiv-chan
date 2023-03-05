import { Card, MarkdownMessageEvent, PlainTextMessageEvent } from "kasumi.js";
import { ButtonClickedEvent } from "kasumi.js";
import { bot } from "init/client";
import * as pixiv from 'commands/pixivchan/pixiv/common'

export function countDownTextTrigger(event: ButtonClickedEvent, callback: (msg: string) => any) {
    const trigger = (eve: PlainTextMessageEvent | MarkdownMessageEvent) => {
        if (eve.authorId != event.authorId) return;
        if (eve.channelId != event.channelId) return;
        if (eve.content.split(" ").length == 0) return;
        bot.API.message.update(event.targetMsgId, new Card().addText(`已接收关键字，正在处理请求…`), undefined, event.authorId);
        bot.message.off('allTextMessages', trigger)
        clearTimeout(timeout)
        callback(eve.content);
    }
    bot.message.on('allTextMessages', trigger);
    var count: number = 60;
    var timeout: NodeJS.Timeout;
    const counter = () => {
        if (count == 0) {
            bot.API.message.update(event.targetMsgId, new Card().addText(`超时未收到关键字…将在3秒后返回上级菜单`), undefined, event.authorId);
            bot.message.off("text", trigger)
            setTimeout(() => {
                bot.API.message.update(event.targetMsgId, pixiv.cards.GUI.command.list(), undefined, event.authorId);
            }, 3000);
            clearTimeout(timeout)
            return;
        }
        bot.API.message.update(event.targetMsgId, new Card().addText(`请在 ${count} 秒内发送直接发送关键字以进行搜索`), undefined, event.authorId);
        count--;
        timeout = setTimeout(counter, 1000);
    }
    counter();
}