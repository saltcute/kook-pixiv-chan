import { Card } from "kbotify"

export default () => {
    return new Card()
        .setTheme("info")
        .setSize("lg")
        .addTitle("Pixiv酱 主菜单")
        .addDivider()
        .addModule({
            "type": "action-group",
            "elements": [
                {
                    "type": "button",
                    "theme": "info",
                    "value": "{\"action\": \"GUI.view.command.list\",\"data\": {}}",
                    "click": "return-val",
                    "text": {
                        "type": "plain-text",
                        "content": "命令菜单"
                    }
                },
                {
                    "type": "button",
                    "theme": "primary",
                    "value": "{\"action\": \"GUI.view.credits\",\"data\": {}}",
                    "click": "return-val",
                    "text": {
                        "type": "plain-text",
                        "content": "感谢名单"
                    }
                },
                {
                    "type": "button",
                    "theme": "primary",
                    "value": "{\"action\": \"GUI.view.profile\",\"data\": {}}",
                    "click": "return-val",
                    "text": {
                        "type": "plain-text",
                        "content": "个人资料"
                    }
                },
                {
                    "type": "button",
                    "theme": "warning",
                    "value": "{\"action\": \"GUI.view.settings\",\"data\": {}}",
                    "click": "return-val",
                    "text": {
                        "type": "plain-text",
                        "content": "设置"
                    }
                }
            ]
        });
}