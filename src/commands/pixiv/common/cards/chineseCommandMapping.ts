import { Card } from "kbotify";

export default () => {
    return new Card({
        "theme": "info",
        "color": "",
        "size": "lg",
        "modules": [
            {
                "type": "header",
                "text": {
                    "type": "plain-text",
                    "content": "命令对应列表"
                }
            },
            {
                "type": "divider",
                "elements": []
            },
            {
                "type": "section",
                "mode": "left",
                "accessory": null,
                "text": {
                    "type": "kmarkdown",
                    "content": "```plain\n.pixiv top\n```",
                    "elements": []
                },
                "elements": []
            },
            {
                "type": "section",
                "mode": "left",
                "accessory": null,
                "text": {
                    "type": "kmarkdown",
                    "content": "`。p站热门`、`。p站 热门`、`。P站热门`、`。P站 热门`、`。pixiv热门`、`。pixiv 热门`n`。busetu`、`。不色图`、`。不涩图`、`。不瑟图`、`。不蛇图`",
                    "elements": []
                },
                "elements": []
            },
            {
                "type": "divider",
                "elements": []
            },
            {
                "type": "section",
                "mode": "left",
                "accessory": null,
                "text": {
                    "type": "kmarkdown",
                    "content": "```plain\n.pixiv random\n```",
                    "elements": []
                },
                "elements": []
            },
            {
                "type": "section",
                "mode": "left",
                "accessory": null,
                "text": {
                    "type": "kmarkdown",
                    "content": "`。p站随机`、`。p站 随机`、`。P站随机`、`。P站 随机`、`。pixiv随机`、`。pixiv 随机`n`。setu`、`。色图`、`。涩图`、`。瑟图`、`。蛇图`",
                    "elements": []
                },
                "elements": []
            },
            {
                "type": "divider",
                "elements": []
            },
            {
                "type": "section",
                "mode": "left",
                "accessory": null,
                "text": {
                    "type": "kmarkdown",
                    "content": "```plain\n.pixiv detail\n```",
                    "elements": []
                },
                "elements": []
            },
            {
                "type": "section",
                "mode": "left",
                "accessory": null,
                "text": {
                    "type": "kmarkdown",
                    "content": "`。p站插画`、`。p站 插画`、`。P站插画`、`。P站 插画`、`。pixiv插画`、`。pixiv 插画`",
                    "elements": []
                },
                "elements": []
            },
            {
                "type": "divider",
                "elements": []
            },
            {
                "type": "section",
                "mode": "left",
                "accessory": null,
                "text": {
                    "type": "kmarkdown",
                    "content": "```plain\n.pixiv author\n```",
                    "elements": []
                },
                "elements": []
            },
            {
                "type": "section",
                "mode": "left",
                "accessory": null,
                "text": {
                    "type": "kmarkdown",
                    "content": "`。p站作者`、`。p站 作者`、`。P站作者`、`。P站 作者`、`。p站画师`、`。p站 画师`、`。P站画师`、`。P站 画师`、`。pixiv作者`、`。pixiv画师`、`。pixiv 作者`、`。pixiv 画师`",
                    "elements": []
                },
                "elements": []
            }
        ],
        "type": "card"
    })
}