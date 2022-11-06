import { Card } from "kbotify"

export default (content: string) => {
    return new Card()
        .setTheme("info")
        .setSize("lg")
        .addTitle("通知")
        .addDivider()
        .addText(content);
}