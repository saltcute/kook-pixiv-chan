import { Card } from "kbotify"

export function main(e: any) {
    return new Card({
        "type": "card",
        "theme": "danger",
        "size": "lg",
        "modules": [
            {
                "type": "section",
                "text": {
                    "type": "kmarkdown",
                    "content": "**内部错误 | Internal Error**"
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
                        "content": "错误信息（开发者）"
                    }
                ]
            },
            {
                "type": "context",
                "elements": [
                    {
                        "type": "kmarkdown",
                        "content": "遇到问题了？[问题反馈&建议](https://kook.top/iOOsLu)"
                    }
                ]
            },
            {
                "type": "section",
                "text": {
                    "type": "kmarkdown",
                    "content": `\`\`\`\n${e}\n\`\`\``
                }
            }
        ]
    })
}