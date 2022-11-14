import { Card } from "kbotify";
import { cards } from "../..";

export default () => {
    return new Card()
        .setTheme("info")
        .setSize("lg")
        .addTitle("热门插画")
        .addDivider()
        .addModule({
            "type": "action-group",
            "elements": [
                {
                    "type": "button",
                    "theme": "info",
                    "value": "{\"action\": \"GUI.run.command.top.day\",\"data\": {}}",
                    "click": "return-val",
                    "text": {
                        "type": "plain-text",
                        "content": "今日热门　"
                    }
                },
                {
                    "type": "button",
                    "theme": "primary",
                    "value": "{\"action\": \"GUI.run.command.top.week\",\"data\": {}}",
                    "click": "return-val",
                    "text": {
                        "type": "plain-text",
                        "content": "本周热门　"
                    }
                },
                {
                    "type": "button",
                    "theme": "info",
                    "value": "{\"action\": \"GUI.run.command.top.month\",\"data\": {}}",
                    "click": "return-val",
                    "text": {
                        "type": "plain-text",
                        "content": "本月热门　"
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
                    "value": "{\"action\": \"GUI.run.command.top.original\",\"data\": {}}",
                    "click": "return-val",
                    "text": {
                        "type": "plain-text",
                        "content": "本周原创　"
                    }
                },
                {
                    "type": "button",
                    "theme": "primary",
                    "value": "{\"action\": \"GUI.run.command.top.rookie\",\"data\": {}}",
                    "click": "return-val",
                    "text": {
                        "type": "plain-text",
                        "content": "本周新人　"
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
                    "value": "{\"action\": \"GUI.run.command.top.male\",\"data\": {}}",
                    "click": "return-val",
                    "text": {
                        "type": "plain-text",
                        "content": "本周男性向"
                    }
                },
                {
                    "type": "button",
                    "theme": "primary",
                    "value": "{\"action\": \"GUI.run.command.top.female\",\"data\": {}}",
                    "click": "return-val",
                    "text": {
                        "type": "plain-text",
                        "content": "本周女性向"
                    }
                },
                {
                    "type": "button",
                    "theme": "info",
                    "value": "{\"action\": \"GUI.run.command.top.manga\",\"data\": {}}",
                    "click": "return-val",
                    "text": {
                        "type": "plain-text",
                        "content": "本周漫画　"
                    }
                }
            ]
        })
        .addModule(cards.GUI.returnButton([{ action: "GUI.command.list" }]));
}