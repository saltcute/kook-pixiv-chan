import { Card, CardObject } from "kbotify"

class MultiDetailCard extends Card {
    constructor(content?: string | CardObject) {
        super(content);
    }
    addControl(idx: number, pid: string[], link: string[], type: "tag" | "top" | "random" | "author", data?: any) {
        this.addModule({
            "type": "action-group",
            "elements": (() => {
                var arr = [];
                if (!isNaN(parseInt(pid[idx - 1]))) {
                    arr.push({
                        "type": "button",
                        "theme": "info",
                        "value": JSON.stringify({
                            action: "portal.view.detail",
                            data: {
                                ...data,
                                index: idx - 1,
                                type: type,
                                link: link,
                                pid: pid
                            }
                        }),
                        "click": "return-val",
                        "text": {
                            "type": "plain-text",
                            "content": "上一张"
                        }
                    })
                }
                arr.push({
                    "type": "button",
                    "theme": "warning",
                    "value": JSON.stringify({
                        action: "portal.view.return_from_detail",
                        data: {
                            ...data,
                            link: link,
                            type: type,
                            pid: pid
                        }
                    }),
                    "click": "return-val",
                    "text": {
                        "type": "plain-text",
                        "content": "返回"
                    }
                })
                if (!isNaN(parseInt(pid[idx + 1]))) {
                    arr.push({
                        "type": "button",
                        "theme": "info",
                        "value": JSON.stringify({
                            action: "portal.view.detail",
                            data: {
                                ...data,
                                type: type,
                                index: idx + 1,
                                link: link,
                                pid: pid
                            }
                        }),
                        "click": "return-val",
                        "text": {
                            "type": "plain-text",
                            "content": "下一张"
                        }
                    })
                }
                return arr;
            })()
        });
        return this;
    }
}

export default (data: any, curLink: string, idx: number, pid: string[], link: string[], type: "tag" | "top" | "random" | "author", inheritData?: any) => {
    // console.log(pid, idx, pid[idx - 1], pid[idx], pid[idx + 1]);
    return new MultiDetailCard()
        .setTheme("info")
        .setSize("lg")
        .addText(`** ${(() => {
            if (data.x_restrict == 0) return data.title;
            else return `不可以涩涩`;
        })()}** `)
        .addModule({
            "type": "context",
            "elements": [
                {
                    "type": "kmarkdown",
                    "content": `** [${data.user.name}](https://www.pixiv.net/users/${data.user.uid})**(${data.user.uid}) | [pid ${data.id}](https://www.pixiv.net/artworks/${data.id})`
                }
            ]
        },)
        .addDivider()
        .addControl(idx, pid, link, type, inheritData)
        .addImage(curLink)
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
        .addModule({
            "type": "context",
            "elements": [
                {
                    "type": "kmarkdown",
                    "content": `${((): string => {
                        if (data.x_restrict == 0) {
                            var str = ""
                            for (const val of data.tags) {
                                str += `[#${val.name}](https://www.pixiv.net/tags/${val.name.replace(")", "\\)")}/illustrations)${val.translated_name == null ? "" : ` ${val.translated_name}`} `
                            }
                            return str;
                        } else {
                            return "#不可以涩涩";
                        }
                    })()}`
                }
            ]
        });
}