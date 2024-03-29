import { types } from 'pixnode';
import { cards } from ".";

export default (data: types.illustration, link: string, apex: cards.apexEvent) => {
    return new cards.SingleCard()
        .setTheme("info")
        .setSize("lg")
        .addText(`** ${(() => {
            if (data.x_restrict == 0) return data.title;
            else return `不可以涩涩`;
        })()}** `)
        .addModule({
            "type": "context",
            "elements": [
                {
                    "type": "kmarkdown",
                    "content": `** [${data.user.name}](https://www.pixiv.net/users/${data.user.uid})**(${data.user.uid}) | [pid ${data.id}](https://www.pixiv.net/artworks/${data.id})`
                }
            ]
        },)
        .addDivider()
        .addApex(data.id, link, apex)
        .addImage(link)
        .addModule(cards.getCommercials())
        .addDivider()
        .addModule({
            "type": "context",
            "elements": [
                {
                    "type": "kmarkdown",
                    "content": `${((): string => {
                        if (data.x_restrict == 0) {
                            var str = ""
                            for (const val of data.tags) {
                                str += `[#${val.name}](https://www.pixiv.net/tags/${val.name.replace(")", "\\)")}/illustrations)${val.translated_name == null ? "" : ` ${val.translated_name}`} `
                            }
                            return str;
                        } else {
                            return "#不可以涩涩";
                        }
                    })()}`
                }
            ]
        });
}