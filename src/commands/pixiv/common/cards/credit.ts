import { Card } from "kbotify"
import fs from 'fs';
import { common, type } from "..";

const pak = JSON.parse(fs.readFileSync("package.json", { encoding: "utf-8", flag: "r" }));

function afdianToCommonNameCoverter(string: string) {
    let map: Map<string, String> = new Map();
    map.set('两瓶快乐水', 'Backer (两瓶快乐水)')
        .set('很多快乐水', 'Supporter (很多快乐水)')
        .set('Quantum Pack', 'Quantum Pack')
        .set('一月订阅 Backer', 'Backer (一月订阅)')
        .set('一月订阅 Supporter', 'Supporter (一月订阅)')
        .set('一月订阅 Sponser', 'Sponser (一月订阅)');
    return map.get(string) || string;
}

class CreditCard extends Card {
    addCredits(page: number, supporters: type.afdian.sponserData) {
        let plans: {
            [key: string]: string[]
        } = {};
        let str = '';
        for (let supporter of supporters.list) {
            if (!plans[supporter.current_plan.name]) plans[supporter.current_plan.name] = [];
            plans[supporter.current_plan.name].push(supporter.user.name);
        }
        for (let idx in plans) {
            let plan = plans[idx];
            let queue: [string[], string[], string[]] = [[], [], []];
            let counter = 0;
            for (let entry of plan) {
                queue[counter].push(`(font)${entry}(font)[pink]`);
                if (++counter == 3) counter = 0;
            }
            this.addText(`**(font)${afdianToCommonNameCoverter(idx)}(font)[success]** `).addModule({
                type: "section",
                text: {
                    type: "paragraph",
                    cols: 3,
                    fields: [{
                        "type": "kmarkdown",
                        "content": queue[0].join('\n')
                    }, {
                        "type": "kmarkdown",
                        "content": queue[1].join('\n')
                    }, {
                        "type": "kmarkdown",
                        "content": queue[2].join('\n')
                    }]
                }
            });
        }
        return this;
    }
}

export default async (page: number) => {
    let supporters = (await common.getAfdianSupporter(page));
    return new CreditCard()
        .setSize("lg")
        .setTheme("info")
        .addText("您可以在[爱发电](https://afdian.net/@hexona)支持 Pixiv酱的开发与运营！")
        .addDivider()
        .addTitle("特别感谢")
        .addText("[fi6](https://github.com/fi6) - [kBotify](https://github.com/fi6/kBotify) & [shugen002](https://github.com/shugen002) - [BotRoot](https://github.com/shugen002/BotRoot)\n[Microsoft](https://github.com/microsoft) - [Visual Studio Code](https://github.com/microsoft/vscode) 与 [Typescript](https://github.com/microsoft/TypeScript)")
        .addDivider()
        .addTitle("赞助者")
        .addCredits(page, supporters)
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