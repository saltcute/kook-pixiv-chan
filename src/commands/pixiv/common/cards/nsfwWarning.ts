import { Card } from "kbotify"

export function main(id: string) {
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
            }
        ]
    })
}