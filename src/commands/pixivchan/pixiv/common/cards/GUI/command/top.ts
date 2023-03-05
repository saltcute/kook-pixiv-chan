import { Card } from "kasumi.js";
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
                    "value": JSON.stringify({
                        action: "GUI.run.command.top",
                        data: {
                            type: 'day'
                        }
                    }),
                    "click": "return-val",
                    "text": {
                        "type": "plain-text",
                        "content": "今日热门　"
                    }
                },
                {
                    "type": "button",
                    "theme": "primary",
                    "value": JSON.stringify({
                        action: "GUI.run.command.top",
                        data: {
                            type: 'week'
                        }
                    }),
                    "click": "return-val",
                    "text": {
                        "type": "plain-text",
                        "content": "本周热门　"
                    }
                },
                {
                    "type": "button",
                    "theme": "info",
                    "value": JSON.stringify({
                        action: "GUI.run.command.top",
                        data: {
                            type: 'month'
                        }
                    }),
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
                    "value": JSON.stringify({
                        action: "GUI.run.command.top",
                        data: {
                            type: 'original'
                        }
                    }),
                    "click": "return-val",
                    "text": {
                        "type": "plain-text",
                        "content": "本周原创　"
                    }
                },
                {
                    "type": "button",
                    "theme": "primary",
                    "value": JSON.stringify({
                        action: "GUI.run.command.top",
                        data: {
                            type: 'rookie'
                        }
                    }),
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
                    "value": JSON.stringify({
                        action: "GUI.run.command.top",
                        data: {
                            type: 'male'
                        }
                    }),
                    "click": "return-val",
                    "text": {
                        "type": "plain-text",
                        "content": "本周男性向"
                    }
                },
                {
                    "type": "button",
                    "theme": "primary",
                    "value": JSON.stringify({
                        action: "GUI.run.command.top",
                        data: {
                            type: 'female'
                        }
                    }),
                    "click": "return-val",
                    "text": {
                        "type": "plain-text",
                        "content": "本周女性向"
                    }
                },
                {
                    "type": "button",
                    "theme": "info",
                    "value": JSON.stringify({
                        action: "GUI.run.command.top",
                        data: {
                            type: 'manga'
                        }
                    }),
                    "click": "return-val",
                    "text": {
                        "type": "plain-text",
                        "content": "本周漫画　"
                    }
                }
            ]
        })
        .addModule(cards.GUI.returnButton([{ action: "GUI.view.command.list" }]));
}