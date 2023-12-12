import { Card } from "kasumi.js";
import * as pixiv from '..'

export default (creators: {
    username: string,
    avatar: string,
    uid: number,
    links: string[]
}[]) => {
    let card = new Card();
    for (var index = 0; index < creators.length && index < 5; ++index) {
        let creator = creators[index];
        if (index != 0) {
            card.addDivider();
        }
        card.addTextWithImage(`(font)${creator.username}(font)[pink]`, {
            url: creator.avatar,
            size: 'sm'
        }).addImageGroup(...(() => {
            var images: any[] = [];
            for (var i = 0; i < 3; ++i) {
                if (creator.links[i]) {
                    images.push(creator.links[i])
                } else {
                    images.push(pixiv.common.akarin);
                }
            }
            return images;
        })()).addModule({
            "type": "action-group",
            "elements": [
                {
                    "type": "button",
                    "theme": "primary",
                    "value": JSON.stringify({
                        action: `portal.run.author.search`,
                        data: creator
                    }),
                    "click": "return-val",
                    "text": {
                        "type": "plain-text",
                        "content": "确定"
                    }
                }
            ]
        })
    }
    return card;
}