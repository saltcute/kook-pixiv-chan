import { Card } from "kbotify"

function trace(containTrace: boolean) {
    if (containTrace) {
        return [{
            "type": "section",
            "text": {
                "type": "kmarkdown",
                "content": `\`\`\`\n${Error().stack}\n\`\`\``
            }
        }]
    } else return [];
}

export default (e: any, containTrace: boolean = false) => {
    containTrace = false; // Maybe do not show trace to user
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
            ...trace(containTrace),
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