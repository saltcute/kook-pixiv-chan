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
        .addImageGroup(...[...link, ...Array(9).fill(pixiv.common.akarin)].splice(0, 9))
        .addModule(cards.getCommercials())
        .addDivider()
        .addPID(pid)
        .addResave(link, resave, id)
        .addNSFW(nsfw, id)
}