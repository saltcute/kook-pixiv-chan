import { BaseSession } from 'kbotify';
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
        .addNSFW(nsfw, id);
}