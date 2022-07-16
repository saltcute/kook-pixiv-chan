import { Card } from "kbotify"

export function main() {
    return new Card({
        "type": "card",
        "theme": "warning",
        "size": "lg",
        "modules": [
            {
                "type": "section",
                "text": {
                    "type": "kmarkdown",
                    "content": "**正在转存图片…这可能需要最多10秒的时间**"
                }
            }
        ]
    })
}