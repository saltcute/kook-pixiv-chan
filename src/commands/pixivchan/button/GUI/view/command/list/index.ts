
import { bot } from 'init/client';
import { ButtonClickedEvent } from "kasumi.js";
import * as pixiv from 'commands/pixivchan/pixiv/common'
export default async function (event: ButtonClickedEvent, action: string[], data: any) {
    bot.API.message.update(event.targetMsgId, pixiv.cards.GUI.command.list(), undefined, event.authorId);
}