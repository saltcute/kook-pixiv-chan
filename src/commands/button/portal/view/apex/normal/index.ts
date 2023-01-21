import * as pixiv from 'commands/pixiv/common'
import { bot } from 'init/client';
import { ButtonClickEvent } from 'kaiheila-bot-root';
export default async function (event: ButtonClickEvent, action: string[], data: any) {
    const trigger = data.trigger;
    switch (trigger) {
        case 'mutil': {
            let idx = data.index,
                pid = data.pid,
                link = data.link,
                type = data.type,
                curIndex = pid[idx],
                curLink = link[idx];
            pixiv.common.getIllustDetail(curIndex).then((res) => {
                bot.API.message.update(event.targetMsgId, pixiv.cards.multiDetail(res, curLink, idx, pid, link, type, {
                    isSendButtonClicked: true
                }, data).toString(), undefined, event.userId);
            }).catch((e) => {
                bot.logger.error(e);
            })
            break;
        };
        case 'detail': {
            let curIndex = data.pid,
                curLink = data.link;
            pixiv.common.getIllustDetail(curIndex).then((res) => {
                bot.API.message.update(event.targetMsgId, pixiv.cards.detail(res, curLink, {
                    isSendButtonClicked: true
                },).toString(), undefined, event.userId);
            }).catch((e) => {
                bot.logger.error(e);
            })
            break;
        }
    };
}