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
        .addModule({
            "type": "image-group",
            "elements": (() => {
                var images: object[] = [];
                var cnt = 0;
                for (const val of link) {
                    if (cnt >= 9) break;
                    images.push({
                        "type": "image",
                        "src": val
                    })
                    cnt++;
                }
                while (images.length < 9) {
                    images.push({
                        "type": "image",
                        "src": pixiv.common.akarin
                    })
                }
                return images;
            })()
        })
        .addModule(cards.getCommercials())
        .addDivider()
        .addPID(pid)
        .addResave(link, resave, id)
        .addNSFW(nsfw, id)
}