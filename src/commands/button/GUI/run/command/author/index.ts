import { bot } from 'init/client';
import { ButtonClickedEvent } from "kasumi.js";
import { countDownTextTrigger } from '..';
import { author } from 'commands/pixiv/pixiv.author.app';
export default async function (event: ButtonClickedEvent, action: string[], data: any) {
    countDownTextTrigger(event, (msg) => {
        author.exec(msg.split(" ").concat([`GUI.${event.targetMsgId}`]), event, bot);
    });
}