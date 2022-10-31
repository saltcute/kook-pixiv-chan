import { fstat } from "fs";
import { Card, BaseSession } from "kbotify"
import * as pixiv from '../..'

export default () => {
    return new Card({
        "type": "card",
        "theme": "secondary",
        "size": "lg",
        "modules": [
            {
                "type": "header",
                "text": {
                    "type": "plain-text",
                    "content": "Pixiv酱 主菜单"
                }
            },
            {
                "type": "divider"
            },
            {
                "type": "action-group",
                "elements": [
                    {
                        "type": "button",
                        "theme": "info",
                        "value": "{\"action\": \"GUI.view.command_list\",\"data\": {}}",
                        "text": {
                            "type": "plain-text",
                            "content": "命令菜单"
                        }
                    },
                    {
                        "type": "button",
                        "theme": "primary",
                        "value": "{\"action\": \"GUI.view.credits\",\"data\": {}}",
                        "text": {
                            "type": "plain-text",
                            "content": "感谢名单"
                        }
                    },
                    {
                        "type": "button",
                        "theme": "primary",
                        "value": "{\"action\": \"GUI.view.profile\",\"data\": {}}",
                        "text": {
                            "type": "plain-text",
                            "content": "个人资料"
                        }
                    },
                    {
                        "type": "button",
                        "theme": "warning",
                        "value": "{\"action\": \"GUI.view.settings\",\"data\": {}}",
                        "text": {
                            "type": "plain-text",
                            "content": "设置"
                        }
                    }
                ]
            }
        ]
    })
}