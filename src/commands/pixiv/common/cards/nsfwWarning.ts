import { Card } from "kbotify"

export default (id: string) => {
    return new Card({
        "type": "card",
        "theme": "warning",
        "size": "lg",
        "modules": [
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
        ]
    })
}