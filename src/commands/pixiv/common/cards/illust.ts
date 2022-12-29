import { Card } from "kbotify"

export default (data: any, link: string) => {
    return new Card({
        "type": "card",
        "theme": "info",
        "size": "lg",
        "modules": [
            {
                "type": "container",
                "elements": [
                    {
                        "type": "image",
                        "src": link
                    }
                ]
            },
            {
                "type": "context",
                "elements": [
                    {
                        "type": "kmarkdown",
                        "content": "有定制 KOOK 机器人需求的朋友们可以联系 Hexona#6969\n可以[进服](https://kook.top/iOOsLu)@我或者私信（请详细描述需求） \n您也可以在[爱发电](https://afdian.net/@hexona)帮助Pixiv酱的开发！\n[问题反馈&建议](https://kook.top/iOOsLu)"
                        // "content": "喜欢 Pixiv酱吗？来 [Bot Market](https://www.botmarket.cn/bots?id=8) 留下一个五星好评吧！\n您也可以在[爱发电](https://afdian.net/@hexona)帮助Pixiv酱的开发！\n[问题反馈&建议](https://kook.top/iOOsLu)"
                    }
                ]
            },
            {
                "type": "divider"
            },
            {
                "type": "context",
                "elements": [
                    {
                        "type": "kmarkdown",
                        "content": `pid ${data.id} | [Pixiv](${`https://www.pixiv.net/artworks/${data.id}`})`
                    }
                ]
            }
        ]
    });
}