import { bot } from 'init/client';
import { ButtonClickedEvent } from "kasumi.js";
import { countDownTextTrigger } from '..';
import { detail } from 'commands/pixiv/pixiv.detail.app';
export default async function (event: ButtonClickedEvent, action: string[], data: any) {
    countDownTextTrigger(event, (msg) => {
        detail.exec(msg.split(" ").concat([`GUI.${event.targetMsgId}`]), event, bot);
    });
}