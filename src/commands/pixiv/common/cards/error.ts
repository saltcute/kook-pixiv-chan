import { Card } from "kasumi.js"

class ErrorCard extends Card {
    addTrace(containTrace: boolean) {
        if (containTrace) {
            this.addText(`\`\`\`\n${Error().stack}\n\`\`\``);
        }
        return this;
    }
}

export default (e: any, containTrace: boolean = false) => {
    containTrace = false; // Maybe do not show trace to user
    return new ErrorCard()
        .setTheme("danger")
        .setSize("lg")
        .addTextWithButton("**内部错误 | Internal Error**", {
            content: "重置",
            theme: 'primary',
            position: 'right',
            click: 'return-val',
            value: JSON.stringify({
                action: "portal.error.reset"
            })
        })
        .addDivider()
        .addModule({
            "type": "context",
            "elements": [
                {
                    "type": "plain-text",
                    "content": "错误信息（开发者）"
                }
            ]
        })
        .addModule({
            "type": "context",
            "elements": [
                {
                    "type": "kmarkdown",
                    "content": "遇到问题了？[问题反馈&建议](https://kook.top/iOOsLu)"
                }
            ]
        })
        .addTrace(containTrace)
        .addText(`\`\`\`\n${e}\n\`\`\``);
}