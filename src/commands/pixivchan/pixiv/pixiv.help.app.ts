import { BaseCommand, BaseSession, Card, CommandFunction } from "kasumi.js";
import * as pixiv from './common'

class Help extends BaseCommand {
    name = 'help';
    func: CommandFunction<BaseSession, any> = async (session) => {
        pixiv.common.logInvoke(`.pixiv ${this.name}`, session);
        if (session.args.length == 0) {
            return session.sendTemp([new Card()
                .setTheme("warning")
                .setSize("lg")
                .addTitle(".pixiv help")
                .addModule({
                    "type": "context",
                    "elements": [
                        {
                            "type": "kmarkdown",
                            "content": "发送 `.pixiv` 查看所有指令列表"
                        }
                    ]
                })
                .addDivider()
                .addText("查询部分指令的中文别名\n```plain\n.pixiv help 中文命令\n```\n")
            ])
        } else {
            switch (session.args[0]) {
                case "top":
                    return session.sendTemp([new Card()
                        .setTheme("warning")
                        .setSize("lg")
                        .addTitle(".pixiv top")
                        .addDivider()
                        .addText("```\n.pixiv top [option]\n```\n获取本日/周/月等的全站最热插画")
                        .addDivider()
                        .addText("所有可能的指令列表：\n    发送`.pixiv top`，默认获取本周前九的插画/漫画\n    发送`.pixiv top day`，获取今日前九的插画/漫画\n    发送`.pixiv top week`，获取本周前九的插画/漫画\n    发送`.pixiv top month`，获取本月前九的插画/漫画")
                        .addDivider()
                        .addText("    发送`.pixiv top original`，获取本周前九的原创插画\n    发送`.pixiv top rookie`，获取本周前九的新人画师的插画")
                        .addDivider()
                        .addText("    发送`.pixiv top male`，获取今日在男性中全站前九的插画\n    发送`.pixiv top female`，获取今日在女性中全站前九的插画\n    发送`.pixiv top manga`，获取今日全站前九的漫画")
                    ])
                case "tag":
                    return session.sendTemp([new Card()
                        .setTheme("warning")
                        .setSize("lg")
                        .addTitle(".pixiv tag")
                        .addDivider()
                        .addText("```\n.pixiv tag [{day|week|month}] <tag>...\n```\n获取所给标签人气前九的图片")
                        .addModule({
                            "type": "context",
                            "elements": [
                                {
                                    "type": "plain-text",
                                    "content": "当给定标签数量为一个时，默认获取一周内的插画；\n当给定标签数量超过一个时，默认获取一月内的插画"
                                }
                            ]
                        })
                        .addDivider()
                        .addText("**部分标签可以使用中文搜索，但最好使用原文（日文汉字/假名/英文）**\n搜索内容不能包含括号（`()`, `[]`, `{}`）\n每个不同的标签以空格隔开\n**由空格分隔的英文词组将被视作两个标签！**\n  例：\n    发送`.pixiv tag VOCALOID`，获取`VOCALOID`标签**本周**人气前九的插画\n    发送`.pixiv tag ゆるゆり`，获取`ゆるゆり`标签**本周**人气前九的插画\n    发送`.pixiv tag month LycorisRecoil`，获取`LycorisRecoil`标签**本月**人气前九的插画\n    发送`.pixiv tag 初音未来`，获取拥有`初音未来`标签或`初音ミク`标签的**本周**人气前九的插画\n    发送`.pixiv tag オリジナル けもみみ`，获取同时拥有`オリジナル`标签与`けもみみ`标签的**本月**人气前九的插画")
                    ])
                case "author":
                    return session.sendTemp([new Card()
                        .setTheme("warning")
                        .setSize("lg")
                        .addTitle(".pixiv author")
                        .addDivider()
                        .addText("```\n.pixiv author <user ID>\n```\n获取用户的最新九张插画\n  **必须是用户ID！用户名将无法正常得出结果**\n  例：\n    发送`.pixiv author 6657532 `，获取来自 [QuAn_](https://www.pixiv.net/users/6657532) 様 的插画\n    发送`.pixiv author 14112962`，获取来自 [あやみ](https://www.pixiv.net/users/14112962) 様 的插画")
                    ])
                case "detail":
                    return session.sendTemp([new Card()
                        .setTheme("warning")
                        .setSize("lg")
                        .addTitle(".pixiv detail")
                        .addDivider()
                        .addText("```\n.pixiv detail <illustration ID>\n```\n获取对应 ID 插画的详细信息（作品名、作者、标签等）\n  **必须是插画 ID！插画标题、简介将无法正常得出结果**\n  用法与 `.pixiv illust` 基本相同，例：\n    发送`.pixiv detail 86034756`，获取[雪璐](https://www.pixiv.net/users/30634099) 様的插画[「湊あくあ」](https://www.pixiv.net/artworks/86034756) \n    发送`.pixiv detail 84091231`，获取[あやみ](https://www.pixiv.net/users/14112962) 様的插画[「鹿乃」](https://www.pixiv.net/artworks/84091231) ")
                    ])
                case "refresh":
                    return session.sendTemp([new Card()
                        .setTheme("warning")
                        .setSize("lg")
                        .addTitle(".pixiv refresh")
                        .addDivider()
                        .addText("```\n.pixiv refresh <illustration ID>\n```\n刷新对应 ID 插画的缓存。（当图片显示不正常时，可以在几分钟后运行此命令）\n  **必须是插画 ID！插画标题、简介将无法正常得出结果**\n**  当插画显示正常时，此命令没有任何作用，请不要滥用此命令**\n**  如发现有严重滥用行为，您可能会被剥夺使用 `.pixiv refresh` 命令的权力**\n  用法与 `.pixiv illust` 基本相同，例：\n    发送`.pixiv refresh 86034756`，刷新[雪璐](https://www.pixiv.net/users/30634099) 様的插画[「湊あくあ」](https://www.pixiv.net/artworks/86034756)的缓存\n    发送`.pixiv refresh 84091231`，刷新[あやみ](https://www.pixiv.net/users/14112962) 様的插画[「鹿乃」](https://www.pixiv.net/artworks/84091231)的缓存")
                    ])
                case "random":
                    return session.sendTemp([new Card()
                        .setTheme("warning")
                        .setSize("lg")
                        .addTitle(".pixiv random")
                        .addDivider()
                        .addText("```\n.pixiv random\n```\n获得九张随机插画\n例：\n    发送`.pixiv random`，获取⑨张随机推荐的插画")
                    ])
                case "credit":
                    return session.sendTemp([new Card()
                        .setTheme("warning")
                        .setSize("lg")
                        .addTitle(".pixiv credit")
                        .addDivider()
                        .addText("```\n.pixiv credit\n```\n查看致谢列表\n例：\n    发送`.pixiv credit`，查看致谢列表")
                    ])
                case "中文帮助":
                case "中文命令":
                case "中文":
                    return session.send([pixiv.cards.chineseCommandMapping()]);
                case "profile":
                    return session.sendTemp([new Card()
                        .setTheme("warning")
                        .setSize("lg")
                        .addTitle(".pixiv profile")
                        .addDivider()
                        .addText("```\n.pixiv profile\n```\n查看个人资料\n例：\n    发送`.pixiv profile`，查看自己的个人资料")
                    ])
                case "redeem":
                    return session.sendTemp([new Card()
                        .setTheme("warning")
                        .setSize("lg")
                        .addTitle(".pixiv redeem")
                        .addDivider()
                        .addText("```\n.pixiv redeem <code>\n```\n兑换激活码\n例：\n    发送`.pixiv redeem KFCCR-AZYTH-URSDA-YOVME-FIFTY`，兑换激活码`KFCCR-AZYTH-URSDA-YOVME-FIFTY`")
                    ])
                case "help":
                    return session.sendTemp([new Card()
                        .setTheme("warning")
                        .setSize("lg")
                        .addTitle(".pixiv help")
                        .addDivider()
                        .addText("```\n.pixiv help <command>\n```\n你陷入了无尽的循环…")
                    ])
                case "gui":
                    return session.sendTemp([new Card()
                        .setTheme("warning")
                        .setSize("lg")
                        .addTitle(".pixiv gui")
                        .addDivider()
                        .addText("```\n.pixiv gui\n```\n使用交互式图形界面\n例：\n    发送`.pixiv gui`，使用交互式图形界面")
                        .addModule({
                            "type": "context",
                            "elements": [
                                {
                                    "type": "kmarkdown",
                                    "content": "Beta 功能，若发现任何问题，请务必[回报](https://kook.top/eu5CvH)"
                                }
                            ]
                        })
                    ])
                default:
                    return session.replyTemp("没有这个指令！输入 `.pixiv` 查看指令列表。");
            }
        }
    }
}

export const help = new Help();

