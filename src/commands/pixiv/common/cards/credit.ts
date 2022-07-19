import { Card } from "kbotify"

export default () => {
    return new Card({
        "type": "card",
        "theme": "info",
        "size": "lg",
        "modules": [
            {
                "type": "section",
                "text": {
                    "type": "kmarkdown",
                    "content": "您可以在[爱发电](https://afdian.net/@potatopotat0)支持 Pixiv酱的开发！"
                }
            },
            {
                "type": "divider"
            },
            {
                "type": "header",
                "text": {
                    "type": "plain-text",
                    "content": "特别感谢"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "kmarkdown",
                    "content": "[potatopotat0](https://lolicon.ac.cn/) - [kook-pixiv-chan](https://github.com/potatopotat0/kook-pixiv-chan) 与 [pix-node](https://github.com/potatopotat0/pix-node)\n[fi6](https://github.com/fi6) - [kBotify](https://github.com/fi6/kBotify) & [shugen002](https://github.com/shugen002) - [BotRoot](https://github.com/shugen002/BotRoot)\n[Microsoft](https://github.com/microsoft) - [Visual Studio Code](https://github.com/microsoft/vscode) 与 [Typescript](https://github.com/microsoft/TypeScript)\n我爸我妈 - 支持我搞这些又耗时间又花钱的东西"
                }
            },
            {
                "type": "divider"
            },
            {
                "type": "header",
                "text": {
                    "type": "plain-text",
                    "content": "赞助者"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "kmarkdown",
                    "content": "目前还没有呢"
                }
            },
            {
                "type": "divider"
            },
            {
                "type": "context",
                "elements": [
                    {
                        "type": "plain-text",
                        "content": "Copyright © 2022 potatopotat0. All rights reserved."
                    }
                ]
            }
        ]
    })
}