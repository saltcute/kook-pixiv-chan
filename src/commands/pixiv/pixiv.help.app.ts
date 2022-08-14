import { AppCommand, AppFunc, BaseSession } from 'kbotify';
import * as pixiv from './common'

class Help extends AppCommand {
    code = 'help'; // 只是用作标记
    trigger = 'help'; // 用于触发的文字
    intro = 'Help';
    func: AppFunc<BaseSession> = async (session) => {
        pixiv.common.logInvoke(`.pixiv ${this.trigger}`, session);
        if (session.args.length == 0) {
            return session.sendCardTemp([{
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
                            "content": "```plain\n.pixiv help <command>\n```\n查询指令的详细用法\n  指令列表：\n```plain\n.pixiv help top\n```\n```plain\n.pixiv help tag\n```\n```plain\n.pixiv help author\n```\n```plain\n.pixiv help detail\n```\n```plain\n.pixiv help illust\n```\n```plain\n.pixiv help refresh\n```\n```plain\n.pixiv help random\n```\n```plain\n.pixiv help credit\n```\n"
                        }
                    },
                    {
                        "type": "divider"
                    },
                    {
                        "type": "section",
                        "text": {
                            "type": "kmarkdown",
                            "content": "查询部分指令的中文别名\n```plain\n.pixiv help 中文命令\n```\n"
                        }
                    }
                ]
            }]);
        } else {
            switch (session.args[0]) {
                case "top":
                    return session.sendCardTemp([{
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
                                    "content": "```\n.pixiv top [option]\n```\n获取本日/周/月等的全站最热插画"
                                }
                            },
                            {
                                "type": "divider"
                            },
                            {
                                "type": "section",
                                "text": {
                                    "type": "kmarkdown",
                                    "content": "所有可能的指令列表：\n    发送`.pixiv top`，默认获取本周前九的插画/漫画\n    发送`.pixiv top day`，获取今日前九的插画/漫画\n    发送`.pixiv top week`，获取本周前九的插画/漫画\n    发送`.pixiv top month`，获取本月前九的插画/漫画"
                                }
                            },
                            {
                                "type": "divider"
                            },
                            {
                                "type": "section",
                                "text": {
                                    "type": "kmarkdown",
                                    "content": "    发送`.pixiv top week original`，获取本周前九的原创插画\n    发送`.pixiv top week rookie`，获取本周前九的新人画师的插画"
                                }
                            },
                            {
                                "type": "divider"
                            },
                            {
                                "type": "section",
                                "text": {
                                    "type": "kmarkdown",
                                    "content": "    发送`.pixiv top day male`，获取今日在男性中全站前九的插画\n    发送`.pixiv top day female`，获取今日在女性中全站前九的插画\n    发送`.pixiv top day manga`，获取今日全站前九的漫画"
                                }
                            }
                        ]
                    }]);
                case "tag":
                    return session.sendCardTemp([{
                        "type": "card",
                        "theme": "warning",
                        "size": "lg",
                        "modules": [
                            {
                                "type": "header",
                                "text": {
                                    "type": "plain-text",
                                    "content": ".pixiv tag"
                                }
                            },
                            {
                                "type": "divider"
                            },
                            {
                                "type": "section",
                                "text": {
                                    "type": "kmarkdown",
                                    "content": "```\n.pixiv tag [{day|week|month}] <tag>...\n```\n获取所给标签人气前九的图片"
                                }
                            },
                            {
                                "type": "context",
                                "elements": [
                                    {
                                        "type": "plain-text",
                                        "content": "当给定标签数量为一个时，默认获取一周内的插画；\n当给定标签数量超过一个时，默认获取一月内的插画"
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
                                    "content": "**部分标签可以使用中文搜索，但最好使用原文（日文汉字/假名/英文）**\n搜索内容不能包含括号（`()`, `[]`, `{}`）\n每个不同的标签以空格隔开\n**由空格分隔的英文词组将被视作两个标签！**\n  例：\n    发送`.pixiv tag VOCALOID`，获取`VOCALOID`标签**本周**人气前九的插画\n    发送`.pixiv tag ゆるゆり`，获取`ゆるゆり`标签**本周**人气前九的插画\n    发送`.pixiv tag month LycorisRecoil`，获取`LycorisRecoil`标签**本月**人气前九的插画\n    发送`.pixiv tag 初音未来`，获取拥有`初音未来`标签或`初音ミク`标签的**本周**人气前九的插画\n    发送`.pixiv tag オリジナル けもみみ`，获取同时拥有`オリジナル`标签与`けもみみ`标签的**本月**人气前九的插画"
                                }
                            }
                        ]
                    }]);
                case "author":
                    return session.sendCardTemp([{
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
                                    "content": "```\n.pixiv author <user ID>\n```\n获取用户的最新九张插画\n  **必须是用户ID！用户名将无法正常得出结果**\n  例：\n    发送`.pixiv author 6657532 `，获取来自 [QuAn_](https://www.pixiv.net/users/6657532)さん 的插画\n    发送`.pixiv author 14112962`，获取来自 [あやみ](https://www.pixiv.net/users/14112962)さん 的插画"
                                }
                            }
                        ]
                    }]);
                case "illust":
                    return session.sendCardTemp([{
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
                                    "content": "```\n.pixiv illust <illustration ID>\n```\n获取 Pixiv 上对应 ID 的插画\n  **必须是插画 ID！插画标题、简介将无法正常得出结果**\n  例：\n    发送`.pixiv illust 86034756`，获取[雪璐](https://www.pixiv.net/users/30634099)さん的插画[「湊あくあ」](https://www.pixiv.net/artworks/86034756) \n    发送`.pixiv illust 84091231`，获取[あやみ](https://www.pixiv.net/users/14112962)さん的插画[「鹿乃」](https://www.pixiv.net/artworks/84091231) "
                                }
                            }
                        ]
                    }]);
                case "detail":
                    return session.sendCardTemp([{
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
                                    "content": "```\n.pixiv detail <illustration ID>\n```\n获取对应 ID 插画的详细信息（作品名、作者、标签等）\n  **必须是插画 ID！插画标题、简介将无法正常得出结果**\n  用法与 `.pixiv illust` 基本相同，例：\n    发送`.pixiv detail 86034756`，获取[雪璐](https://www.pixiv.net/users/30634099)さん的插画[「湊あくあ」](https://www.pixiv.net/artworks/86034756) \n    发送`.pixiv detail 84091231`，获取[あやみ](https://www.pixiv.net/users/14112962)さん的插画[「鹿乃」](https://www.pixiv.net/artworks/84091231) "
                                }
                            }
                        ]
                    }]);
                case "refresh":
                    return session.sendCardTemp([{
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
                                    "content": "```\n.pixiv refresh <illustration ID>\n```\n刷新对应 ID 插画的缓存。（当图片显示不正常时，可以在几分钟后运行此命令）\n  **必须是插画 ID！插画标题、简介将无法正常得出结果**\n**  当插画显示正常时，此命令没有任何作用，请不要滥用此命令**\n**  如发现有严重滥用行为，您可能会被剥夺使用 `.pixiv refresh` 命令的权力**\n  用法与 `.pixiv illust` 基本相同，例：\n    发送`.pixiv refresh 86034756`，刷新[雪璐](https://www.pixiv.net/users/30634099)さん的插画[「湊あくあ」](https://www.pixiv.net/artworks/86034756)的缓存\n    发送`.pixiv refresh 84091231`，刷新[あやみ](https://www.pixiv.net/users/14112962)さん的插画[「鹿乃」](https://www.pixiv.net/artworks/84091231)的缓存"
                                }
                            }
                        ]
                    }]);
                case "random":
                    return session.sendCardTemp([{
                        "type": "card",
                        "theme": "warning",
                        "size": "lg",
                        "modules": [
                            {
                                "type": "header",
                                "text": {
                                    "type": "plain-text",
                                    "content": ".pixiv random"
                                }
                            },
                            {
                                "type": "divider"
                            },
                            {
                                "type": "section",
                                "text": {
                                    "type": "kmarkdown",
                                    "content": "```\n.pixiv random\n```\n获得九张随机插画\n例：\n    发送`.pixiv random`，获取⑨张随机推荐的插画"
                                }
                            }
                        ]
                    }]);
                case "credit":
                    return session.sendCardTemp([{
                        "type": "card",
                        "theme": "warning",
                        "size": "lg",
                        "modules": [
                            {
                                "type": "header",
                                "text": {
                                    "type": "plain-text",
                                    "content": ".pixiv credit"
                                }
                            },
                            {
                                "type": "divider"
                            },
                            {
                                "type": "section",
                                "text": {
                                    "type": "kmarkdown",
                                    "content": "```\n.pixiv credit\n```\n查看致谢列表\n例：\n    发送`.pixiv credit`，获取⑨张随机推荐的插画"
                                }
                            },
                            {
                                "type": "divider"
                            },
                            {
                                "type": "context",
                                "elements": [
                                    {
                                        "type": "kmarkdown",
                                        "content": "还是说你想要知道怎么打钱吗(\\*/ω＼\\*)当然是[爱发电](https://afdian.net/@potatopotat0)"
                                    }
                                ]
                            }
                        ]
                    }]);
                case "中文帮助":
                case "中文命令":
                case "中文":
                    return session.sendCard(pixiv.cards.chineseCommandMapping());
                default:
                    return session.replyTemp("没有这个指令！输入 `.pixiv` 查看指令列表。");
            }
        }
    }
}

export const help = new Help();

