import { Card } from "kasumi.js"

export default (content: string) => {
    return new Card()
        .setTheme("info")
        .setSize("lg")
        .addTitle("通知")
        .addDivider()
        .addText(content);
}