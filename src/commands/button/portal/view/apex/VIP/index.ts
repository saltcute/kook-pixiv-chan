import * as pixiv from 'commands/pixiv/common'
import { bot } from 'init/client';
import { ButtonClickEvent } from 'kaiheila-bot-root';
export default async function (event: ButtonClickEvent, action: string[], data: any) {
    const trigger = data.trigger;
    switch (trigger) {
        case 'multi': {
            let idx = data.index,
                pid = data.pid,
                link = data.link,
                type = data.type,
                curIndex = pid[idx],
                curLink = link[idx];
            let pdata = await pixiv.common.getIllustDetail(curIndex)
            let apexUserInfo = (await pixiv.common.getApexVIPStatus(event.userId)).data;
            let apexPreviewImageLink = (await pixiv.common.getApexImagePreview(pixiv.linkmap.getLink(curIndex, "0"), apexUserInfo.originData.uid)).url;
            bot.logger.debug("ApexConnect: Fetched data for preview");
            bot.API.message.update(event.targetMsgId, pixiv.cards.multiDetail(pdata, curLink, idx, pid, link, type, {
                isVIP: true,
                isSendButtonClicked: true,
                sendButtonPreviewImageLink: apexPreviewImageLink
            }, data).toString(), undefined, event.userId).then(() => {
                bot.logger.debug("ApexConnect: Sent preview");
            }).catch((e) => {
                bot.logger.error(e);
            });
            break;
        };
        case 'detail': {
            let curIndex = data.pid;
            let curLink = data.link;
            let pdata = await pixiv.common.getIllustDetail(curIndex)
            let apexUserInfo = (await pixiv.common.getApexVIPStatus(event.userId)).data;
            let apexPreviewImageLink = (await pixiv.common.getApexImagePreview(pixiv.linkmap.getLink(curIndex, "0"), apexUserInfo.originData.uid)).url;
            bot.logger.debug("ApexConnect: Fetched data for preview");
            bot.API.message.update(event.targetMsgId, pixiv.cards.detail(pdata, curLink, {
                isVIP: true,
                isSendButtonClicked: true,
                sendButtonPreviewImageLink: apexPreviewImageLink
            }).toString(), undefined, event.userId).then(() => {
                bot.logger.debug("ApexConnect: Sent preview");
            }).catch((e) => {
                bot.logger.error(e);
            });
            break;
        };
    }
}