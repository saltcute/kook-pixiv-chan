import { bot } from 'init/client';
import { ButtonClickedEvent } from "kasumi.js";
export default async function (event: ButtonClickedEvent, action: string[], data: any) {
    bot.API.message.view(event.targetMsgId).then((res) => {
        // console.log(res.data);
        bot.API.message.update(event.targetMsgId, res.content, undefined, event.authorId)
            ;
    });
}