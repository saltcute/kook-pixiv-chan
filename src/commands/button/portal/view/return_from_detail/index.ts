import * as pixiv from 'commands/pixiv/common'
import { bot } from 'init/client';
import { ButtonClickEvent } from 'kaiheila-bot-root';
import { Card } from 'kbotify';
export default async function (event: ButtonClickEvent, action: string[], data: any) {
    let pid = data.pid,
        link = data.link,
        type = data.type;
    const durationName = data.durationName
    var card: Card;
    switch (type) {
        case "top":
            card = pixiv.cards.top(link, pid, durationName, {}).addModule(pixiv.cards.GUI.returnButton([{ action: "GUI.run.command.top", text: "上级" }, { action: "GUI.view.command.list", text: "命令列表" }]));
            break;
        case "tag":
            const tags = data.tags;
            card = pixiv.cards.tag(link, pid, tags, durationName, {}).addModule(pixiv.cards.GUI.returnButton([{ action: "GUI.view.command.list" }]));
            break;
        case "random":
            card = pixiv.cards.random(link, pid, {}).addModule(pixiv.cards.GUI.returnButton([{ action: "GUI.view.command.list" }]));;
            break;
        case "author":
            const data_ = data.data,
                r18 = data.r18;
            card = pixiv.cards.author(data_, r18, link, pid, {}).addModule(pixiv.cards.GUI.returnButton([{ action: "GUI.view.command.list" }]));;
            break;
        default:
            card = pixiv.cards.error("无法加载卡片")
            break;
    }
    bot.API.message.update(event.targetMsgId, card.toString(), undefined, event.userId);
}