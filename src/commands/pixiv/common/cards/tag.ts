import { fstat } from "fs";
import { Card, BaseSession } from "kbotify"
import * as pixiv from '..'

function pids(pid: string[]) {
    if (pid.length >= 9) {
        return [
            {
                "type": "section",
                "text": {
                    "type": "paragraph",
                    "cols": 3,
                    "fields": [
                        {
                            "type": "kmarkdown",
                            "content": `pid ${pixiv.common.pid2Markdown(pid[0])}\npid ${pixiv.common.pid2Markdown(pid[3])}\npid ${pixiv.common.pid2Markdown(pid[6])}`
                        },
                        {
                            "type": "kmarkdown",
                            "content": `pid ${pixiv.common.pid2Markdown(pid[1])}\npid ${pixiv.common.pid2Markdown(pid[4])}\npid ${pixiv.common.pid2Markdown(pid[7])}`
                        },
                        {
                            "type": "kmarkdown",
                            "content": `pid ${pixiv.common.pid2Markdown(pid[2])}\npid ${pixiv.common.pid2Markdown(pid[5])}\npid ${pixiv.common.pid2Markdown(pid[8])}`
                        }
                    ]
                }
            }]
    } else return [];
}

function resaves(link: string[], resave: boolean, id: string) {
    if (resave) {
        return [
            {
                "type": "section",
                "text": {
                    "type": "kmarkdown",
                    "content": `正在转存 \`${id}_p0.jpg\`，可能需要较长时间……(${link.length + 1}/9) ${(link.length + 1) % 2 == 1 ? ":hourglass_flowing_sand:" : ":hourglass:"}……`
                }
            }
        ]
    } else return [];
}


function nsfws(nsfw: boolean, id: string) {
    if (nsfw) {
        return [
            {
                "type": "section",
                "text": {
                    "type": "kmarkdown",
                    "content": `\`${id}_p0.jpg\` 含有不宜内容，已自动添加模糊。`
                }
            },
            {
                "type": "context",
                "elements": [
                    {
                        "type": "plain-text",
                        "content": "请避免主动查询 擦边球/R-18/R-18G 插画"
                    }
                ]
            }
        ]
    } else return [];
}

export default (link: string[], pid: string[], tags: string[], durationName: string, { resave = false, nsfw = false, id = "-1" }: { resave?: boolean, nsfw?: boolean, id?: string }) => {
    return new Card({
        "type": "card",
        "theme": "info",
        "size": "lg",
        "modules": [
            {
                "type": "header",
                "text": {
                    "type": "plain-text",
                    "content": `${durationName}${tags.length > 1 ? "同时拥有" : "关于"}${tags.slice(0, 2).map(str => `「${str}」`).join("、")}${tags.length > 2 ? "等" : ""}标签的热门插画`
                }
            },
            {
                "type": "context",
                "elements": [
                    {
                        "type": "kmarkdown",
                        "content": "没有找到想要的插画？发送 `.pixiv help tag` 查询帮助"
                    }
                ]
            },
            {
                "type": "divider"
            },
            {
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
            },
            {
                "type": "context",
                "elements": [
                    {
                        "type": "kmarkdown",
                        "content": "喜欢 Pixiv酱吗？来 [Bot Market](https://www.botmarket.cn/bots?id=8) 留下一个五星好评吧！\n您也可以在[爱发电](https://afdian.net/@potatopotat0)帮助Pixiv酱的开发！\n[问题反馈&建议](https://kook.top/iOOsLu)"
                    }
                ]
            },
            {
                "type": "divider"
            },
            ...pids(pid),
            ...resaves(link, resave, id),
            ...nsfws(nsfw, id)
        ]
    })
}