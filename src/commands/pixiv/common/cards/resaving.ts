import { Card } from "kbotify"

export default (str: string) => {
    return new Card()
        .setTheme("warning")
        .setSize("lg")
        .addText(`正在转存${str}，可能需要较长时间（~10s） :hourglass_flowing_sand:……`)
        .addModule({
            "type": "context",
            "elements": [
                {
                    "type": "kmarkdown",
                    "content": "喜欢 Pixiv酱吗？来 [Bot Market](https://www.botmarket.cn/bots?id=8) 留下一个五星好评吧！\n您也可以在[爱发电](https://afdian.net/@hexona)帮助Pixiv酱的开发！\n[问题反馈&建议](https://kook.top/iOOsLu)"
                }
            ]
        });
}