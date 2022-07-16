import { Card } from "kbotify"

export function main(str: string) {
    return new Card({
        "type": "card",
        "theme": "warning",
        "size": "lg",
        "modules": [
            {
                "type": "section",
                "text": {
                    "type": "kmarkdown",
                    "content": `正在转存${str}，可能需要较长时间（~10s） :hourglass_flowing_sand:……`
                }
            }
        ]
    });
}