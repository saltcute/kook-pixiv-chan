import * as pixiv from '..'
import { cards } from '..';

export default (link: string[], pid: string[], { resave = false, nsfw = false, id = "-1" }: { resave?: boolean, nsfw?: boolean, id?: string }) => {
    return new pixiv.cards.MultiCard()
        .setTheme("info")
        .setSize("lg")
        .addTitle("随机推荐")
        .addModule({
            "type": "context",
            "elements": [
                {
                    "type": "kmarkdown",
                    "content": "为满足审核要求，图片若出现模糊属于正常现象"
                }
            ]
        })
        .addDivider()
        .addModule(pixiv.cards.GUI.portalEntry(link, pid, "random"))
        .addImageGroup(...pixiv.common.fillUntil(link, 9, pixiv.common.akarin))
        .addModule(cards.getCommercials())
        .addDivider()
        .addPID(pixiv.common.fillUntil(pid, 9, "没有了"))
        .addResave(link, resave, id)
        .addNSFW(nsfw, id)
}