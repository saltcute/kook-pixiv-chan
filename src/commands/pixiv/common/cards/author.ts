import { BaseSession } from 'kbotify';
import * as pixiv from '..'

export default (data: any, r18: number, link: string[], pid: string[], session: BaseSession, { resave = false, nsfw = false, id = "-1" }: { resave?: boolean, nsfw?: boolean, id?: string }) => {
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
        .addModule(pixiv.cards.GUI.portalEntry(pid))
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
        .addModule({
            "type": "context",
            "elements": [
                {
                    "type": "kmarkdown",
                    "content": "喜欢 Pixiv酱吗？来 [Bot Market](https://www.botmarket.cn/bots?id=8) 留下一个五星好评吧！\n您也可以在[爱发电](https://afdian.net/@hexona)帮助Pixiv酱的开发！\n[问题反馈&建议](https://kook.top/iOOsLu)"
                }
            ]
        })
        .addDivider()
        .addPID(pid)
        .addResave(link, resave, id)
        .addNSFW(nsfw, id);
}