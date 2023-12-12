import { Card } from "kasumi.js";

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
                    "value": "{\"action\": \"GUI.run.command.top\",\"data\": {}}",
                    "click": "return-val",
                    "text": {
                        "type": "plain-text",
                        "content": "热门插画"
                    }
                },
                {
                    "type": "button",
                    "theme": "primary",
                    "value": "{\"action\": \"GUI.run.command.random\",\"data\": {}}",
                    "click": "return-val",
                    "text": {
                        "type": "plain-text",
                        "content": "随机推荐"
                    }
                },
                {
                    "type": "button",
                    "theme": "info",
                    "value": "{\"action\": \"GUI.run.command.tag\",\"data\": {}}",
                    "click": "return-val",
                    "text": {
                        "type": "plain-text",
                        "content": "搜索标签"
                    }
                },
                {
                    "type": "button",
                    "theme": "primary",
                    "value": "{\"action\": \"GUI.run.command.author\",\"data\": {}}",
                    "click": "return-val",
                    "text": {
                        "type": "plain-text",
                        "content": "查询画师"
                    }
                }
            ]
        })
        .addModule({
            "type": "action-group",
            "elements": [
                {
                    "type": "button",
                    "theme": "info",
                    "value": "{\"action\": \"GUI.run.command.detail\",\"data\": {}}",
                    "click": "return-val",
                    "text": {
                        "type": "plain-text",
                        "content": "查询插画"
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