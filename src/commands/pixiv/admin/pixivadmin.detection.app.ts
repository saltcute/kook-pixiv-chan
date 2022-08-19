import { AppCommand, AppFunc, BaseSession } from 'kbotify';
import * as pixiv from '../common';
import * as pixivadmin from './common';

class Detection extends AppCommand {
    code = 'detection'; // 只是用作标记
    trigger = 'detection'; // 用于触发的文字
    intro = 'Detection';
    func: AppFunc<BaseSession> = async (session) => {
        if (!pixivadmin.common.isAdmin(session.userId)) {
            return session.reply("You do not have the permission to use this command")
        }
        if (session.args.length == 0) {
            return session.replyTemp("Please specifiy an action");
        }
        pixiv.common.logInvoke(`.pixivadmin ${this.trigger}`, session);
        switch (session.args[0]) {
            case "setscene":
                switch (session.args[1]) {
                    case "porn":
                    case "terrorism":
                    case "ad":
                    case "live":
                        pixiv.aligreen.addDetectScene(session.args[1]);
                        session.reply(`Pixiv Chan will detect "${session.args[1]}" now`);
                        break;
                    default:
                        session.reply("Scene invalid");
                        break;
                }
                break;
            case "removescene":
                switch (session.args[1]) {
                    case "porn":
                    case "terrorism":
                    case "ad":
                    case "live":
                        pixiv.aligreen.removeDetectScene(session.args[1]);
                        session.reply(`Pixiv Chan will **NOT** detect "${session.args[1]}" now`);
                        break;
                    default:
                        session.reply("Scene invalid");
                        break;
                }
                break;
            case "useserver":
                switch (session.args[1]) {
                    case "Shanghai":
                    case "Beijing":
                    case "Shenzhen":
                    case "Singapore":
                        pixiv.aligreen.setServerRegion(session.args[1]);
                        session.reply(`Pixiv Chan will use Aliyun ${session.args[1]} now`);
                        break;
                    default:
                        session.reply("Region invalid");
                        break;
                }
                break;
            case "status":
                session.reply(`Currently detecting: [${pixiv.aligreen.currentDetectScenes().join(', ')}] on Aliyun ${pixiv.aligreen.getServerRegion()}, hostname \`${pixiv.aligreen.getServerHostname()}\``);
                break;
            case "list":
                session.replyCard([{
                    "type": "card",
                    "theme": "warning",
                    "size": "lg",
                    "modules": [
                        {
                            "type": "header",
                            "text": {
                                "type": "plain-text",
                                "content": "Detection List"
                            }
                        },
                        {
                            "type": "divider"
                        },
                        {
                            "type": "section",
                            "text": {
                                "type": "kmarkdown",
                                "content": "`porn`"
                            }
                        },
                        {
                            "type": "section",
                            "text": {
                                "type": "kmarkdown",
                                "content": "`terrorism`"
                            }
                        },
                        {
                            "type": "section",
                            "text": {
                                "type": "kmarkdown",
                                "content": "`ad`"
                            }
                        },
                        {
                            "type": "section",
                            "text": {
                                "type": "kmarkdown",
                                "content": "`live`"
                            }
                        },
                        {
                            "type": "divider"
                        },
                        {
                            "type": "header",
                            "text": {
                                "type": "plain-text",
                                "content": "Server List"
                            }
                        },
                        {
                            "type": "divider"
                        },
                        {
                            "type": "section",
                            "text": {
                                "type": "kmarkdown",
                                "content": "Shanghai"
                            }
                        },
                        {
                            "type": "section",
                            "text": {
                                "type": "kmarkdown",
                                "content": "Beijing"
                            }
                        },
                        {
                            "type": "section",
                            "text": {
                                "type": "kmarkdown",
                                "content": "Shenzhen"
                            }
                        },
                        {
                            "type": "section",
                            "text": {
                                "type": "kmarkdown",
                                "content": "Singapore"
                            }
                        }
                    ]
                }
                ])
                break;
            default:
                return session.replyTemp("Action invalid");
        }
    }
}

export const detection = new Detection();


