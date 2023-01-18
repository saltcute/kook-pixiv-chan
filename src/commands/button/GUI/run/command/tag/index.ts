import { tag } from 'commands/pixiv/pixiv.tag.app';
import { bot } from 'init/client';
import { ButtonClickEvent } from 'kaiheila-bot-root';
import { ButtonEventMessage } from 'kbotify';
import { countDownTextTrigger } from '..';
export default async function (event: ButtonClickEvent, action: string[], data: any) {
    countDownTextTrigger(event, (msg) => {
        tag.exec("tag", [`GUI.${event.targetMsgId}`].concat(msg.split(" ")), new ButtonEventMessage(event, bot));
    });
}