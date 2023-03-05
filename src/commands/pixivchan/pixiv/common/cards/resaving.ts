import { Card } from "kasumi.js"
import { cards } from ".";

export default (str: string | number) => {
    return new Card()
        .setTheme("warning")
        .setSize("lg")
        .addText(`正在转存${str}，可能需要较长时间（~10s） :hourglass_flowing_sand:……`)
        .addModule(cards.getCommercials());
}