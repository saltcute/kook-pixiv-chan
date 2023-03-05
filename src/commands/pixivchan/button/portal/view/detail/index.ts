import * as pixiv from 'commands/pixivchan/pixiv/common'
import { bot } from 'init/client';
import { ButtonClickedEvent } from "kasumi.js";
export default async function (event: ButtonClickedEvent, action: string[], data: any) {
    let idx = data.index,
        pid = data.pid,
        link = data.link,
        type = data.type,
        curIndex = pid[idx],
        curLink = link[idx];
    const apex = await pixiv.common.getApexVIPStatus(event.authorId);
    pixiv.common.getIllustDetail(curIndex).then((res) => {
        bot.API.message.update(event.targetMsgId, pixiv.cards.multiDetail(res, curLink, idx, pid, link, type, {
            isVIP: apex.data.is_vip
        }, data), undefined, event.authorId);
    })
}