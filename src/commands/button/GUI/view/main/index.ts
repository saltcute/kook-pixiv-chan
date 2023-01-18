
import { bot } from 'init/client';
import { ButtonClickEvent } from 'kaiheila-bot-root';
import * as pixiv from 'commands/pixiv/common'
export default async function (event: ButtonClickEvent, action: string[], data: any) {
    bot.API.message.update(event.targetMsgId, pixiv.cards.GUI.main().toString(), undefined, event.userId);
}