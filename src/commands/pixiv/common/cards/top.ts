import * as pixiv from '..'
import { cards } from '..';

export default (link: string[], pid: string[], durationName: string, { resave = false, nsfw = false, id = "-1" }: { resave?: boolean, nsfw?: boolean, id?: string }) => {
    return new pixiv.cards.MultiCard()
        .setTheme("info")
        .setSize("lg")
        .addTitle(`${durationName}热门`)
        .addModule({
            "type": "context",
            "elements": [
                {
                    "type": "kmarkdown",
                    "content": "没有找到想要的插画？发送 `.pixiv help top` 查询帮助"
                }
            ]
        })
        .addDivider()
        .addModule(pixiv.cards.GUI.portalEntry(link, pid, "top", { durationName: durationName }))
        .addImageGroup(...[...link, ...Array(9).fill(pixiv.common.akarin)].splice(0, 9))
        .addModule(cards.getCommercials())
        .addDivider()
        .addPID(pid)
        .addResave(link, resave, id)
        .addNSFW(nsfw, id)
}