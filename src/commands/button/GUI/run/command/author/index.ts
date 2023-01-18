import { bot } from 'init/client';
import { ButtonClickEvent } from 'kaiheila-bot-root';
import { countDownTextTrigger } from '..';
import { author } from 'commands/pixiv/pixiv.author.app';
import { ButtonEventMessage } from 'kbotify';
export default async function (event: ButtonClickEvent, action: string[], data: any) {
    countDownTextTrigger(event, (msg) => {
        author.exec("author", msg.split(" ").concat([`GUI.${event.targetMsgId}`]), new ButtonEventMessage(event, bot));
    });
}