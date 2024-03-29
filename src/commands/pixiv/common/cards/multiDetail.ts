import config from "configs/config";
import { Card, CardObject } from "kbotify"
import error from "./error";

type apexEvent = {
    isVIP?: boolean,
    isSendButtonClicked?: boolean,
    sendButtonPreviewImageLink?: string,
    isSent?: boolean,
    isSuccess?: boolean,
}

class MultiDetailCard extends Card {
    addApex(pid: string, apex?: apexEvent, data?: any) {
        // console.log(data);
        if (config.connectApex) {
            if (!apex?.isVIP) {
                if (apex?.isSendButtonClicked || apex?.isSent || apex?.isSuccess) {
                    this.addDivider().addText(`您需要购买 Apex助手 高级会员 才能将 (font)${pid}_p0.png(font)[pink] 设置为您的 Apex助手 背景图像。`)
                        .addModule({
                            "type": "action-group",
                            "elements": [
                                {
                                    "type": "button",
                                    "theme": "primary",
                                    "value": "https://afdian.net/@night386",
                                    "click": "link",
                                    "text": {
                                        "type": "plain-text",
                                        "content": "前往购买"
                                    }
                                },
                                {
                                    "type": "button",
                                    "theme": "danger",
                                    "value": JSON.stringify({
                                        action: `portal.view.detail`,
                                         data: data
                                    }),
                                    "click": "return-val",
                                    "text": {
                                        "type": "plain-text",
                                        "content": "返回"
                                    }
                                }
                            ]
                        }).addDivider();
                }
            } else {
                if (apex.isSendButtonClicked) {
                    this.addDivider().addText(`您真的要将 (font)${pid}_p0.png(font)[pink] 设置为您的 Apex助手背景图像 吗？`);
                    if (apex.sendButtonPreviewImageLink) {
                        this.addModule({
                            "type": "context",
                            "elements": [
                                {
                                    "type": "kmarkdown",
                                    "content": `低分辨率预览图像，与最后成品可能不同`
                                }
                            ]
                        })
                            .addModule(<any>{
                                type: "container",
                                elements: [
                                    {
                                        "type": "image",
                                        "src": apex.sendButtonPreviewImageLink
                                    }
                                ]
                            })
                    }
                    this.addModule({
                        "type": "action-group",
                        "elements": [
                            {
                                "type": "button",
                                "theme": "primary",
                                "value": JSON.stringify({
                                    action: `portal.run.apex.send`,
                                    data: {
                                        trigger: 'mutil',
                                        ...data
                                    }
                                }),
                                "click": "return-val",
                                "text": {
                                    "type": "plain-text",
                                    "content": "确定"
                                }
                            },
                            {
                                "type": "button",
                                "theme": "danger",
                                "value": JSON.stringify({
                                    action: `portal.view.detail`,
                                    data: data
                                }),
                                "click": "return-val",
                                "text": {
                                    "type": "plain-text",
                                    "content": "再想想"
                                }
                            }
                        ]
                    }).addDivider();
                } else if (apex.isSent) {
                    this.addDivider().addText(`正在转存 (font)${pid}_p0.png(font)[pink]…请稍候`).addDivider();
                } else if (apex.isSuccess) {
                    this.addDivider().addText(`(font)设置成功！(font)[primary]`).addDivider();
                }
            }
        }
        return this;
    }
    addControl(idx: number, pid: string[], link: string[], type: "tag" | "top" | "random" | "author", apex?: apexEvent, data?: any) {
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
                if (config.connectApex) {
                    arr.push({
                        "type": "button",
                        "theme": apex?.isVIP ? "primary" : "secondary",
                        "value": JSON.stringify({
                            action: `portal.view.apex.${apex?.isVIP ? 'VIP' : 'normal'}`,
                            data: {
                                trigger: 'multi',
                                ...data,
                                type: type,
                                index: idx,
                                link: link,
                                pid: pid
                            }
                        }),
                        "click": "return-val",
                        "text": {
                            "type": "plain-text",
                            "content": "添加至 Apex助手"
                        }
                    })
                }
                return arr;
            })()
        });
        return this;
    }
}

export default (data: any, curLink: string, idx: number, pid: string[], link: string[], type: "tag" | "top" | "random" | "author", apex?: apexEvent, inheritData?: any) => {
    // console.log(pid, idx, pid[idx - 1], pid[idx], pid[idx + 1]);
    try {
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
            })
            .addDivider()
            .addControl(idx, pid, link, type, apex, inheritData)
            .addApex(pid[idx], apex, {
                ...inheritData,
                index: idx,
                type: type,
                link: link,
                pid: pid
            })
            .addImage(curLink)
            .addModule({
                "type": "context",
                "elements": [
                    {
                        "type": "kmarkdown",
                        "content": "有定制 KOOK 机器人需求的朋友们可以联系 Hexona#6969\n可以[进服](https://kook.top/iOOsLu)@我或者私信（请详细描述需求） \n您也可以在[爱发电](https://afdian.net/@hexona)帮助Pixiv酱的开发！\n[问题反馈&建议](https://kook.top/iOOsLu)"
                        // "content": "喜欢 Pixiv酱吗？来 [Bot Market](https://www.botmarket.cn/bots?id=8) 留下一个五星好评吧！\n您也可以在[爱发电](https://afdian.net/@hexona)帮助Pixiv酱的开发！\n[问题反馈&建议](https://kook.top/iOOsLu)"
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
    } catch (e: any) {
        return error(e.stack);
    }
}