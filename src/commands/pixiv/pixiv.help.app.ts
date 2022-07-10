import { AppCommand, AppFunc, BaseSession } from 'kbotify';

class Help extends AppCommand {
    code = 'help'; // 只是用作标记
    trigger = 'help'; // 用于触发的文字
    intro = 'Help';
    func: AppFunc<BaseSession> = async (session) => {
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
                            "type": "divider"
                        },
                        {
                            "type": "section",
                            "text": {
                                "type": "kmarkdown",
                                "content": "`.pixiv help [指令]` 查询指令的详细用法\n  例：`.pixiv help top`\n        `.pixiv help detail`\n        `.pixiv help refresh`"
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
                                    "content": ".pixiv top 的本月排名或自定义时间排名在做了:dove::dove::dove:"
                                }
                            ]
                        }
                    ]
                }
            ]);
        }
        switch (session.args[0]) {
            case "top":
                return session.sendCard([{
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
                                "content": "`.pixiv top [标签]?` 获取本周 [标签] 标签的人气前九的图片，若 [标签] 缺省则为全站排名\n  **标签需要使用原文（日文汉字/假名/英文/中文等）输入！**\n  例：\n    全站前 9 `.pixiv top`\n    `VOCALOID` 标签前 9 `.pixiv top VOCALOID`\n    `アークナイツ`（明日方舟）标签前 9 `.pixiv top アークナイツ`"
                            }
                        }
                    ]
                }])
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
                                "content": "`.pixiv author [用户 ID]` 获取用户的最新九张插画\n  **必须是用户ID！用户名将无法正常得出结果**\n  例：\n    来自 [QuAn_](https://www.pixiv.net/users/6657532)さん 的插画 `.pixiv author 6657532`\n    来自 [あやみ](https://www.pixiv.net/users/14112962)さん 的插画 `.pixiv author 14112962`"
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
                                "content": "`.pixiv illust [插画 ID]` 获取 Pixiv 上对应 ID 的插画\n  **必须是插画 ID！插画标题、简介将无法正常得出结果**\n  例：\n    来自 [雪璐](https://www.pixiv.net/users/30634099)さん 的插画[「湊あくあ」](https://www.pixiv.net/artworks/86034756) `.pixiv illust 86034756`\n    来自 [あやみ](https://www.pixiv.net/users/14112962)さん 的插画[「鹿乃」](https://www.pixiv.net/artworks/84091231) `.pixiv illust 84091231`"
                            }
                        }
                    ]
                }])
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
                                "content": "`.pixiv detail [插画 ID]` 获取对应 ID 插画的详细信息（作品名、作者、标签等）\n  **必须是插画 ID！插画标题、简介将无法正常得出结果**\n  用法与 `.pixiv illust` 基本相同，例：\n    来自 [雪璐](https://www.pixiv.net/users/30634099)さん 的插画[「湊あくあ」](https://www.pixiv.net/artworks/86034756) `.pixiv detail 86034756`\n    来自 [あやみ](https://www.pixiv.net/users/14112962)さん 的插画[「鹿乃」](https://www.pixiv.net/artworks/84091231) `.pixiv detail 84091231`"
                            }
                        }
                    ]
                }])
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
                                "content": "`.pixiv refresh [插画 ID]` 刷新对应 ID 插画的缓存。（当图片显示不正常时，可以在几分钟后运行此命令）\n  **必须是插画 ID！插画标题、简介将无法正常得出结果**\n**  当插画显示正常时，此命令没有任何作用**\n  用法与 `.pixiv illust` 基本相同，例：\n    来自 [雪璐](https://www.pixiv.net/users/30634099)さん 的插画[「湊あくあ」](https://www.pixiv.net/artworks/86034756) `.pixiv refresh 86034756`\n    来自 [あやみ](https://www.pixiv.net/users/14112962)さん 的插画[「鹿乃」](https://www.pixiv.net/artworks/84091231) `.pixiv refresh 84091231`"
                            }
                        }
                    ]
                }])
            default:
                return session.reply("没有这个指令！");
        }
    }
}

export const help = new Help();

