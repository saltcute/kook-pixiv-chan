import { Card } from "kasumi.js"
import { cards } from ".";

export default (id: string) => {
    return new Card()
        .setTheme("warning")
        .setSize("lg")
        .addText(`\`${id}_p0.jpg\` 含有不宜内容，已自动添加模糊。`)
        .addModule({
            "type": "context",
            "elements": [
                {
                    "type": "plain-text",
                    "content": "请避免主动查询 擦边球/R-18/R-18G 插画"
                }
            ]
        })
        .addModule(cards.getCommercials());
}