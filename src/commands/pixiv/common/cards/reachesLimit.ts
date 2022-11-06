import { Card } from "kbotify"
import { users } from "../users";

export default (user: users.user, type: "command" | "illust", trigger: users.commands = "top") => {
    return new Card()
        .setTheme("danger")
        .setSize("lg")
        .addTitle("达到限制 | Reaches Limit")
        .addDivider()
        .addText(`您已达到当前级别（${user.pixiv.tier}）的[使用限制](${users.tiersListImageLink})。\n（${type == "command" ? `${users.tiersCommandLimit(user, trigger)} 次 \`.pixiv ${trigger}\` 请求` : `${users.tiersIllustLimit(user)} 张插画`}）`)
        .addText(`如需继续使用，您可以：\n　　北京时间每天04:00自动刷新\n　　购买[更高等级订阅](${users.afdianTierLink[users.getHigherTier(user.pixiv.tier)]})\n　　购买[Quantum组合包](${users.afdianTierLink.Quantum})\n更多信息或问题咨询请至[Pixiv酱官方服务器](https://kook.top/iOOsLu)。`)
        .addText("发送`.pixiv profile`查看详细用量。");
}