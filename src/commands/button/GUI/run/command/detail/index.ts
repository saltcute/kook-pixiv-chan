import { bot } from 'init/client';
import { ButtonClickEvent } from 'kaiheila-bot-root';
import { countDownTextTrigger } from '..';
import { detail } from 'commands/pixiv/pixiv.detail.app';
import { ButtonEventMessage } from 'kbotify';
export default async function (event: ButtonClickEvent, action: string[], data: any) {
    countDownTextTrigger(event, (msg) => {
        detail.exec("detail", msg.split(" ").concat([`GUI.${event.targetMsgId}`]), new ButtonEventMessage(event, bot));
    });
}