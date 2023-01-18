import { bot } from 'init/client';
import { ButtonClickEvent } from 'kaiheila-bot-root';
import * as pixiv from 'commands/pixiv/common'
export default async function (event: ButtonClickEvent, action: string[], data: any) {
    pixiv.users.detail({
        id: event.user.id,
        identifyNum: event.user.identifyNum,
        username: event.user.username,
        avatar: event.user.avatar
    }).then((res) => {
        bot.API.message.update(event.targetMsgId, pixiv.cards.profile(res)
            .addModule(pixiv.cards.GUI.returnButton([{ action: "GUI.view.main" }]))
            .toString(),
            undefined, event.userId);
    }).catch((e) => {
        bot.logger.warn(e);
        bot.API.message.update(event.targetMsgId, pixiv.cards.error(e.stack).toString(), undefined, event.userId);
    });
}