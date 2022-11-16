import * as pixiv from '..'


export default (link: string[], pid: string[], tags: string[], durationName: string, { resave = false, nsfw = false, id = "-1" }: { resave?: boolean, nsfw?: boolean, id?: string }) => {
    return new pixiv.cards.MultiCard()
        .setTheme("info")
        .setSize("lg")
        .addTitle(`${durationName}${tags.length > 1 ? "同时拥有" : "关于"}${tags.slice(0, 2).map(str => `「${str}」`).join("、")}${tags.length > 2 ? "等" : ""}标签的热门插画`)
        .addModule({
            "type": "context",
            "elements": [
                {
                    "type": "kmarkdown",
                    "content": "没有找到想要的插画？发送 `.pixiv help tag` 查询帮助"
                }
            ]
        })
        .addDivider()
        .addModule(pixiv.cards.GUI.portalEntry(link, pid, "tag", { tags: tags, durationName: durationName }))
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