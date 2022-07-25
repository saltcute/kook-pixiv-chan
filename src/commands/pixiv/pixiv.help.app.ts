import { AppCommand, AppFunc, BaseSession } from 'kbotify';
import * as pixiv from './common'

class Help extends AppCommand {
    code = 'help'; // 只是用作标记
    trigger = 'help'; // 用于触发的文字
    intro = 'Help';
    func: AppFunc<BaseSession> = async (session) => {
        pixiv.common.logInvoke(`.pixiv ${this.trigger}`, session);
        if (session.args.length == 0) {
            return session.sendCard([
                {
                    "type": "card",
                    "theme": "warning",
                    "size": "lg",
                    "modules": [
                        {
                            "type": "header",
                            "text": {
                                "type": "plain-text",
                                "content": ".pixiv help"
                            }
                        },
                        {
                            "type": "context",
                            "elements": [
                                {
                                    "type": "kmarkdown",
                                    "content": "发送 `.pixiv` 查看所有指令列表"
                                }
                            ]
                        },
                        {
                            "type": "divider"
                        },
                        {
                            "type": "section",
                            "text": {
                                "type": "kmarkdown",
                                "content": "`.pixiv help [指令]` 查询指令的详细用法\n  例：\n        `.pixiv help top`\n        `.pixiv help detail`\n        `.pixiv help refresh`"
                            }
                        }
                    ]
                }
            ]);
        } else {
            switch (session.args[0]) {
                case "top":
                    return session.sendCard([
                        {
                            "type": "card",
                            "theme": "warning",
                            "size": "lg",
                            "modules": [
                                {
                                    "type": "header",
                                    "text": {
                                        "type": "plain-text",
                                        "content": ".pixiv top"
                                    }
                                },
                                {
                                    "type": "divider"
                                },
                                {
                                    "type": "section",
                                    "text": {
                                        "type": "kmarkdown",
                                        "content": "`.pixiv top [标签]...` 获取本周 [标签] 标签的人气前九的图片，若 [标签] 缺省则为全站排名"
                                    }
                                },
                                {
                                    "type": "context",
                                    "elements": [
                                        {
                                            "type": "kmarkdown",
                                            "content": "我正在考虑将 .pixiv top [标签] 拆分至其他命令（如 .pixiv tag），愿意的话，请来[服务器](https://kook.top/iOOsLu)投上一票或是表达自己的想法"
                                        }
                                    ]
                                },
                                {
                                    "type": "divider"
                                },
                                {
                                    "type": "section",
                                    "text": {
                                        "type": "kmarkdown",
                                        "content": "**部分标签可以使用中文搜索，但最好使用原文（日文汉字/假名/英文）**\n搜索内容不能包含方括号（`[]`）\n每个不同的标签将以空格隔开\n**由空格分隔的英文词组将被视作两个标签！**\n  例：\n    发送`.pixiv top`，获取全站前九的插画/漫画\n    发送`.pixiv top VOCALOID`，获取`VOCALOID`标签前九的插画\n    发送`.pixiv top ゆるゆり`，获取`ゆるゆり`标签前九的插画\n    发送`.pixiv top 初音未来`，获取拥有`初音未来`标签或`初音ミク`标签的前九的插画\n    发送`.pixiv top オリジナル けもみみ`，获取同时拥有`オリジナル`标签与`けもみみ `标签的前九的插画"
                                    }
                                },
                                {
                                    "type": "divider"
                                },
                                {
                                    "type": "context",
                                    "elements": [
                                        {
                                            "type": "plain-text",
                                            "content": "为避免内容过少，在使用多个标签作为关键词时，.pixiv top 的返回内容将不具有“本周”的时间限制"
                                        }
                                    ]
                                }
                            ]
                        }
                    ]);
                case "author":
                    return session.sendCard([{
                        "type": "card",
                        "theme": "warning",
                        "size": "lg",
                        "modules": [
                            {
                                "type": "header",
                                "text": {
                                    "type": "plain-text",
                                    "content": ".pixiv author"
                                }
                            },
                            {
                                "type": "divider"
                            },
                            {
                                "type": "section",
                                "text": {
                                    "type": "kmarkdown",
                                    "content": "`.pixiv author [用户 ID]` 获取用户的最新九张插画\n  **必须是用户ID！用户名将无法正常得出结果**\n  例：\n    发送`.pixiv author 6657532 `，获取来自 [QuAn_](https://www.pixiv.net/users/6657532)さん 的插画\n    发送`.pixiv author 14112962`，获取来自 [あやみ](https://www.pixiv.net/users/14112962)さん 的插画"
                                }
                            }
                        ]
                    }])
                case "illust":
                    return session.sendCard([{
                        "type": "card",
                        "theme": "warning",
                        "size": "lg",
                        "modules": [
                            {
                                "type": "header",
                                "text": {
                                    "type": "plain-text",
                                    "content": ".pixiv illust"
                                }
                            },
                            {
                                "type": "divider"
                            },
                            {
                                "type": "section",
                                "text": {
                                    "type": "kmarkdown",
                                    "content": "`.pixiv illust [插画 ID]` 获取 Pixiv 上对应 ID 的插画\n  **必须是插画 ID！插画标题、简介将无法正常得出结果**\n  例：\n    发送`.pixiv illust 86034756`，获取[雪璐](https://www.pixiv.net/users/30634099)さん的插画[「湊あくあ」](https://www.pixiv.net/artworks/86034756) \n    发送`.pixiv illust 84091231`，获取[あやみ](https://www.pixiv.net/users/14112962)さん的插画[「鹿乃」](https://www.pixiv.net/artworks/84091231) "
                                }
                            }
                        ]
                    }]);
                case "detail":
                    return session.sendCard([{
                        "type": "card",
                        "theme": "warning",
                        "size": "lg",
                        "modules": [
                            {
                                "type": "header",
                                "text": {
                                    "type": "plain-text",
                                    "content": ".pixiv detail"
                                }
                            },
                            {
                                "type": "divider"
                            },
                            {
                                "type": "section",
                                "text": {
                                    "type": "kmarkdown",
                                    "content": "`.pixiv detail [插画 ID]` 获取对应 ID 插画的详细信息（作品名、作者、标签等）\n  **必须是插画 ID！插画标题、简介将无法正常得出结果**\n  用法与 `.pixiv illust` 基本相同，例：\n    发送`.pixiv detail 86034756`，获取[雪璐](https://www.pixiv.net/users/30634099)さん的插画[「湊あくあ」](https://www.pixiv.net/artworks/86034756) \n    发送`.pixiv detail 84091231`，获取[あやみ](https://www.pixiv.net/users/14112962)さん的插画[「鹿乃」](https://www.pixiv.net/artworks/84091231) "
                                }
                            }
                        ]
                    }]);
                case "refresh":
                    return session.sendCard([{
                        "type": "card",
                        "theme": "warning",
                        "size": "lg",
                        "modules": [
                            {
                                "type": "header",
                                "text": {
                                    "type": "plain-text",
                                    "content": ".pixiv refresh"
                                }
                            },
                            {
                                "type": "divider"
                            },
                            {
                                "type": "section",
                                "text": {
                                    "type": "kmarkdown",
                                    "content": "`.pixiv refresh [插画 ID]` 刷新对应 ID 插画的缓存。（当图片显示不正常时，可以在几分钟后运行此命令）\n  **必须是插画 ID！插画标题、简介将无法正常得出结果**\n**  当插画显示正常时，此命令没有任何作用，请不要滥用此命令**\n**  如发现有严重滥用行为，您可能会被剥夺使用 `.pixiv refresh` 命令的权力**\n  用法与 `.pixiv illust` 基本相同，例：\n    发送`.pixiv refresh 86034756`，刷新[雪璐](https://www.pixiv.net/users/30634099)さん的插画[「湊あくあ」](https://www.pixiv.net/artworks/86034756)的缓存\n    发送`.pixiv refresh 84091231`，刷新[あやみ](https://www.pixiv.net/users/14112962)さん的插画[「鹿乃」](https://www.pixiv.net/artworks/84091231)的缓存"
                                }
                            }
                        ]
                    }]);
                case "random":
                    return session.reply("发送 `.pixiv random` 即可");
                case "credit":
                    return session.reply("呃…你是想要知道怎么打钱吗？");
                default:
                    return session.reply("没有这个指令！输入 `.pixiv` 查看指令列表。");
            }
        }
    }
}

export const help = new Help();

