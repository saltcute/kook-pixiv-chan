import { Card } from "kbotify"
import { users } from "../users";

export default (user: users.user, type: "command" | "illust", trigger: users.commands = "top") => {
    return new Card()
        .setTheme("danger")
        .setSize("lg")
        .addTitle("达到限制 | Reaches Limit")
        .addDivider()
        .addText(`您已达到当前级别 (font)${user.pixiv.tier}(font)[primary] 的[使用限制](${users.tiersListImageLink})。\n(font)${type == "command" ? `${users.tiersCommandLimit(user, trigger)} 次 \`.pixiv ${trigger}\` 请求` : `${users.tiersIllustLimit(user)} 张插画`}(font)[danger]`)
        .addText(`如需继续使用，您可以：\n　　北京时间每天 (font)12:00(font)[pink] 自动刷新 (font)04:00 UTC(font)[tips]\n　　购买[更高等级订阅](${users.afdianTierLink[users.getHigherTier(user.pixiv.tier)]})\n　　购买[Quantum组合包](${users.afdianTierLink.Quantum})\n更多信息或问题咨询请至[Pixiv酱官方服务器](https://kook.top/iOOsLu)。`)
        .addModule({
            "type": "context",
            "elements": [
                {
                    "type": "kmarkdown",
                    "content": "发送`.pixiv profile`查看详细用量。"
                }
            ]
        })
}