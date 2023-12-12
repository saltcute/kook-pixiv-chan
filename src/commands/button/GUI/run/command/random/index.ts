import { bot } from 'init/client';
import { ButtonClickedEvent } from "kasumi.js";
import { random } from 'commands/pixiv/pixiv.random.app';
export default async function (event: ButtonClickedEvent, action: string[], data: any) {
    random.exec([`GUI.${event.targetMsgId}`], event, bot);
}