import { bot } from 'init/client';
import { ButtonClickedEvent } from "kasumi.js";
import * as pixiv from 'commands/pixivchan/pixiv/common'
export default async function (event: ButtonClickedEvent, action: string[], data: any) {
    bot.API.message.update(event.targetMsgId, (await pixiv.cards.credit(1))
        .addModule(pixiv.cards.GUI.returnButton([{ action: "GUI.view.main" }]))
        ,
        undefined, event.authorId);
}