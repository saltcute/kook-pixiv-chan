import { bot } from 'init/client';
import { ButtonClickEvent } from 'kaiheila-bot-root';
import { random } from 'commands/pixiv/pixiv.random.app';
import { ButtonEventMessage } from 'kbotify';
export default async function (event: ButtonClickEvent, action: string[], data: any) {
    random.exec("random", [`GUI.${event.targetMsgId}`], new ButtonEventMessage(event, bot));
}