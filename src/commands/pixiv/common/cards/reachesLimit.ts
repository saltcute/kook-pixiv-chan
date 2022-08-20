import { Card } from "kbotify"
import { users } from "../users";

export default (user: users.user, type: "command" | "illust", trigger: users.commands = "top") => {
    return new Card({
        "type": "card",
        "theme": "danger",
        "size": "lg",
        "modules": [
            {
                "type": "header",
                "text": {
                    "type": "plain-text",
                    "content": "达到限制 | Reaches Limit"
                }
            },
            {
                "type": "divider"
            },
            {
                "type": "section",
                "text": {
                    "type": "kmarkdown",
                    "content": `您已达到当前级别（${user.pixiv.tier}）的[使用限制](${users.tiersListImageLink})\n（${type == "command" ? `${users.tiersCommandLimit(user, trigger)} 次 \`.pixiv ${trigger}\` 请求` : `${users.tiersIllustLimit(user)} 张插画`}）。`
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "kmarkdown",
                    "content": `如需继续使用，您可以：\n　　北京时间每天04:00自动刷新\n　　购买[更高等级订阅](${users.afdianTierLink[users.getHigherTier(user.pixiv.tier)]})\n　　购买[Quantum组合包](${users.afdianTierLink.Quantum})\n更多信息或问题咨询请至[Pixiv酱官方服务器](https://kook.top/iOOsLu)`
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "kmarkdown",
                    "content": "发送`.pixiv profile`查看详细信息"
                }
            },
            {
                "type": "divider"
            },
            {
                "type": "container",
                "elements": [
                    {
                        "type": "image",
                        "src": users.tiersListImageLink
                    }
                ]
            }
        ]
    });
}