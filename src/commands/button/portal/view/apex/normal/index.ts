import * as pixiv from 'commands/pixiv/common'
import { bot } from 'init/client';
import { ButtonClickedEvent } from "kasumi.js";
export default async function (event: ButtonClickedEvent, action: string[], data: any) {
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
                }, data), undefined, event.authorId);
            });
            break;
        };
        case 'detail': {
            let curIndex = data.pid,
                curLink = data.link;
            pixiv.common.getIllustDetail(curIndex).then((res) => {
                bot.API.message.update(event.targetMsgId, pixiv.cards.detail(res, curLink, {
                    isSendButtonClicked: true
                },), undefined, event.authorId);
            });
            break;
        }
    };
}