import { Card } from "kbotify"

export default (content: string) => {
    return new Card({
        "type": "card",
        "theme": "info",
        "size": "lg",
        "modules": [
            {
                "type": "header",
                "text": {
                    "type": "plain-text",
                    "content": "通知"
                }
            },
            {
                "type": "divider"
            },
            {
                "type": "section",
                "text": {
                    "type": "kmarkdown",
                    "content": content
                }
            }
        ]
    })
}