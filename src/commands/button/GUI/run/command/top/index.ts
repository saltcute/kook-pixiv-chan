import { bot } from 'init/client';
import { ButtonClickEvent } from 'kaiheila-bot-root';
import * as pixiv from 'commands/pixiv/common'
import { top } from 'commands/pixiv/pixiv.top.app';
import { ButtonEventMessage } from 'kbotify';
const types = ['day', 'week', 'month', 'original', 'rookie', 'male', 'female', 'manga'];
export default async function (event: ButtonClickEvent, action: string[], data: any) {
    const type = data.type;
    if (type && types.includes(type)) {
        top.exec("top", [type, `GUI.${event.targetMsgId}`], new ButtonEventMessage(event, bot));
    } else {
        bot.API.message.update(event.targetMsgId, pixiv.cards.GUI.command.top().toString(), undefined, event.userId);
    }
}