import { Card } from "kbotify"
import fs from 'fs';

const pak = JSON.parse(fs.readFileSync("package.json", { encoding: "utf-8", flag: "r" }));

export default () => {
    return new Card()
        .setSize("lg")
        .setTheme("info")
        .addText("您可以在[爱发电](https://afdian.net/@hexona)支持 Pixiv酱的开发与运营！")
        .addDivider()
        .addTitle("特别感谢")
        .addText("[fi6](https://github.com/fi6) - [kBotify](https://github.com/fi6/kBotify) & [shugen002](https://github.com/shugen002) - [BotRoot](https://github.com/shugen002/BotRoot)\n[Microsoft](https://github.com/microsoft) - [Visual Studio Code](https://github.com/microsoft/vscode) 与 [Typescript](https://github.com/microsoft/TypeScript)")
        .addDivider()
        .addTitle("赞助者")
        .addText("暂时还没有呢")
        .addDivider()
        .addModule({
            "type": "context",
            "elements": [
                {
                    "type": "plain-text",
                    "content": `${pak.name} v${pak.version}\nCopyright © 2022 potatopotat0. All rights reserved.`
                }
            ]
        });
}