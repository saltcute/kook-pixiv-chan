import { tag } from 'commands/pixivchan/pixiv/pixiv.tag.app';
import { bot } from 'init/client';
import { ButtonClickedEvent } from "kasumi.js";
import { countDownTextTrigger } from '..';
export default async function (event: ButtonClickedEvent, action: string[], data: any) {
    countDownTextTrigger(event, (msg) => {
        tag.exec([`GUI.${event.targetMsgId}`].concat(msg.split(" ")), event, bot);
    });
}