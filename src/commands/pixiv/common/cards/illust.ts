import { Card } from "kbotify"

export function main(data: any, link: string) {
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