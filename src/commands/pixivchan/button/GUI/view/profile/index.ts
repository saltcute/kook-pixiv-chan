import { bot } from 'init/client';
import { ButtonClickedEvent } from "kasumi.js";
import * as pixiv from 'commands/pixivchan/pixiv/common'
export default async function (event: ButtonClickedEvent, action: string[], data: any) {
    pixiv.users.detail({
        id: event.author.id,
        identifyNum: event.author.identify_num,
        username: event.author.username,
        avatar: event.author.avatar
    }).then((res) => {
        console.log(event.authorId);
        bot.API.message.update(event.targetMsgId, pixiv.cards.profile(res)
            .addModule(pixiv.cards.GUI.returnButton([{ action: "GUI.view.main" }])),
            undefined, event.authorId);
    });;
}