import { Card } from "kbotify";

export default () => {
    return new Card()
        .setTheme("info")
        .setSize("lg")
        .addTitle("Pixiv酱 命令列表")
        .addDivider()
        .addModule({
            "type": "action-group",
            "elements": [
                {
                    "type": "button",
                    "theme": "info",
                    "value": "{\"action\": \"GUI.view.command.top\",\"data\": {}}",
                    "click": "return-val",
                    "text": {
                        "type": "plain-text",
                        "content": "top"
                    }
                },
                {
                    "type": "button",
                    "theme": "primary",
                    "value": "{\"action\": \"GUI.view.command.tag\",\"data\": {}}",
                    "click": "return-val",
                    "text": {
                        "type": "plain-text",
                        "content": "tag"
                    }
                },
                {
                    "type": "button",
                    "theme": "primary",
                    "value": "{\"action\": \"GUI.view.command.randomprofile\",\"data\": {}}",
                    "click": "return-val",
                    "text": {
                        "type": "plain-text",
                        "content": "random"
                    }
                },
                {
                    "type": "button",
                    "theme": "warning",
                    "value": "{\"action\": \"GUI.view.main\",\"data\": {}}",
                    "click": "return-val",
                    "text": {
                        "type": "plain-text",
                        "content": "返回"
                    }
                }
            ]
        });
}