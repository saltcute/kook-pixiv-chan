import { Card } from "kbotify"
import { users } from "../users";

export default (user: users.user) => {
    return new Card()
        .setTheme("info")
        .setSize("lg")
        .addText(`**${user.kook.username}#${user.kook.identifyNum}**\n级别: [${user.pixiv.tier}](${users.afdianTierLink[user.pixiv.tier]})`,
            undefined,
            "left",
            {
                "type": "image",
                "circle": true,
                "src": user.kook.avatar,
                "size": "sm"
            })
        .addDivider()
        .addModule({
            "type": "section",
            "text": {
                "type": "paragraph",
                "cols": 2,
                "fields": [
                    {
                        "type": "kmarkdown",
                        "content": `> **活跃订阅**\n${user.pixiv.tier}`
                    },
                    {
                        "type": "kmarkdown",
                        "content": `> **订阅到期**\n${user.pixiv.tier == "Standard" ? "永不" : new Date(user.pixiv.expire).toLocaleDateString("zh-cn")}`
                    },
                    {
                        "type": "kmarkdown",
                        "content": `> **开始使用Pixiv酱**\n${new Date(user.pixiv.register).toLocaleDateString("zh-cn")}`
                    },
                    {
                        "type": "kmarkdown",
                        "content": "> **节操值**\n69"
                    }
                ]
            }
        })
        .addDivider()
        .addModule({
            "type": "section",
            "text": {
                "type": "paragraph",
                "cols": 3,
                "fields": [
                    {
                        "type": "kmarkdown",
                        "content": `> **top**\n${users.tiersCommandLimitLeft(user, "top") == "unlimited" ? "无限" : `剩余 ${users.tiersCommandLimitLeft(user, "top")} 次`}`
                    },
                    {
                        "type": "kmarkdown",
                        "content": `> **tag**\n${users.tiersCommandLimitLeft(user, "tag") == "unlimited" ? "无限" : `剩余 ${users.tiersCommandLimitLeft(user, "tag")} 次`}`
                    },
                    {
                        "type": "kmarkdown",
                        "content": `> **author**\n${users.tiersCommandLimitLeft(user, "author") == "unlimited" ? "无限" : `剩余 ${users.tiersCommandLimitLeft(user, "author")} 次`}`
                    },
                    {
                        "type": "kmarkdown",
                        "content": `> **detail**\n${users.tiersCommandLimitLeft(user, "detail") == "unlimited" ? "无限" : `剩余 ${users.tiersCommandLimitLeft(user, "detail")} 次`}`
                    },
                    {
                        "type": "kmarkdown",
                        "content": `> **illust**\n${users.tiersCommandLimitLeft(user, "illust") == "unlimited" ? "无限" : `剩余 ${users.tiersCommandLimitLeft(user, "illust")} 次`}`
                    },
                    {
                        "type": "kmarkdown",
                        "content": `> **random**\n${users.tiersCommandLimitLeft(user, "random") == "unlimited" ? "无限" : `剩余 ${users.tiersCommandLimitLeft(user, "random")} 次`}`
                    },
                    {
                        "type": "kmarkdown",
                        "content": `> **refresh**\n${users.tiersCommandLimitLeft(user, "refresh") == "unlimited" ? "无限" : `剩余 ${users.tiersCommandLimitLeft(user, "refresh")} 张`}`
                    },
                    {
                        "type": "kmarkdown",
                        "content": `> **可用插画**\n${users.tiersIllustLimitLeft(user) == "unlimited" ? "无限" : `剩余 ${users.tiersIllustLimitLeft(user)} 张`}`
                    },
                    {
                        "type": "kmarkdown",
                        "content": `> **Quantum Pack**\n${user.pixiv.quantum_pack_capacity > 0 ? `剩余 ${user.pixiv.quantum_pack_capacity} 张` : "无"}`
                    }
                ]
            }
        })
        .addTitle("统计信息")
        .addModule({
            "type": "section",
            "text": {
                "type": "paragraph",
                "cols": 2,
                "fields": [
                    {
                        "type": "kmarkdown",
                        "content": `> **总请求次数**\n${user.pixiv.statistics.total_requests_counter}`
                    },
                    {
                        "type": "kmarkdown",
                        "content": `> **最常使用的命令**\n \`.pixiv ${(() => {
                            const cnt = user.pixiv.statistics.command_requests_counter;
                            var maxKey = "", maxVal = -1;
                            for (const key in cnt) {
                                const val = cnt[<keyof typeof cnt>key];
                                if (val > maxVal) {
                                    maxKey = key;
                                    maxVal = val;
                                }
                            }
                            return maxKey;
                        })()}\``
                    },
                    {
                        "type": "kmarkdown",
                        "content": `> **看过的插画数量**\n${user.pixiv.statistics.total_illustration_requested}`
                    },
                    {
                        "type": "kmarkdown",
                        "content": `> **探索的插画数量**\n${user.pixiv.statistics.new_illustration_requested}`
                    }
                ]
            }
        })
        .addModule({
            "type": "context",
            "elements": [
                {
                    "type": "plain-text",
                    "content": "统计信息从 2022/08/20 开始"
                }
            ]
        });
}