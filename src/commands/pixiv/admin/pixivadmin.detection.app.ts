import { AppCommand, AppFunc, BaseSession } from 'kbotify';
import * as pixiv from '../common';

class Detection extends AppCommand {
    code = 'detection'; // 只是用作标记
    trigger = 'detection'; // 用于触发的文字
    intro = 'Detection';
    func: AppFunc<BaseSession> = async (session) => {
        if (session.user.id !== "1854484583") {
            return session.reply("You do not have the permission to use this command")
        }
        if (session.args.length == 0) {
            return session.replyTemp("Please specified an action");
        }
        pixiv.common.log(`From ${session.user.nickname} (ID ${session.user.id}), invoke ".pixiv ${this.trigger}"`);
        switch (session.args[0]) {
            case "use":
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
            case "remove":
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
            case "status":
                session.reply(`Currently detecting: [${pixiv.aligreen.currentDetectScenes().join(', ')}]`);
                break;
            case "list":
                session.replyCard([
                    {
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
                            }
                        ]
                    }
                ])
                break;
            default:
                pixiv.common.log("Action invalid");
                return session.replyTemp("Action invalid");
        }
    }
}

export const detection = new Detection();


