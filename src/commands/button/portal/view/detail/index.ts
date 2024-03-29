import * as pixiv from 'commands/pixiv/common'
import { bot } from 'init/client';
import { ButtonClickEvent } from 'kaiheila-bot-root';
export default async function (event: ButtonClickEvent, action: string[], data: any) {
    let idx = data.index,
        pid = data.pid,
        link = data.link,
        type = data.type,
        curIndex = pid[idx],
        curLink = link[idx];
    const apex = await pixiv.common.getApexVIPStatus(event.userId);
    pixiv.common.getIllustDetail(curIndex).then((res) => {
        bot.API.message.update(event.targetMsgId, pixiv.cards.multiDetail(res, curLink, idx, pid, link, type, {
            isVIP: apex.data.is_vip
        }, data).toString(), undefined, event.userId);
    })
}