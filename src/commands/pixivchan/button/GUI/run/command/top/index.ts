import { bot } from 'init/client';
import { ButtonClickedEvent } from "kasumi.js";
import * as pixiv from 'commands/pixivchan/pixiv/common'
import { top } from 'commands/pixivchan/pixiv/pixiv.top.app';
const types = ['day', 'week', 'month', 'original', 'rookie', 'male', 'female', 'manga'];
export default async function (event: ButtonClickedEvent, action: string[], data: any) {
    const type = data.type;
    if (type && types.includes(type)) {
        top.exec([type, `GUI.${event.targetMsgId}`], event, bot);
    } else {
        bot.API.message.update(event.targetMsgId, pixiv.cards.GUI.command.top(), undefined, event.authorId);
    }
}