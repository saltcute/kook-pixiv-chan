import { BaseSession } from "kasumi.js";
import * as pixiv from '..'
import { cards } from '..';

export default (data: any, r18: number, link: string[], pid: string[], { resave = false, nsfw = false, id = "-1" }: { resave?: boolean, nsfw?: boolean, id?: string }) => {
    return new pixiv.cards.MultiCard()
        .setTheme("info")
        .setSize("lg")
        .addText(`${(() => {
            if (r18 > 9) {
                return `(spl)**${data.user.name}**(spl) 不可以涩涩`;
            } else {
                return `**${data.user.name}**`
            }
        })()}`)
        .addModule({
            "type": "context",
            "elements": [
                {
                    "type": "kmarkdown",
                    "content": `[uid ${data.user.uid}](https://www.pixiv.net/users/${data.user.uid})`
                }
            ]
        })
        .addDivider()
        .addModule(pixiv.cards.GUI.portalEntry(link, pid, "author", { r18: r18 }))
        .addImageGroup(...pixiv.common.fillUntil(link, 9, pixiv.common.akarin))
        .addModule(cards.getCommercials())
        .addDivider()
        .addPID(pixiv.common.fillUntil(pid, 9, "没有了"))
        .addResave(link, resave, id)
        .addNSFW(nsfw, id);
}