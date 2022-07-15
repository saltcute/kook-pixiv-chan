import { AppCommand, AppFunc, BaseSession } from 'kbotify';
import * as pixiv from './common'

class Donate extends AppCommand {
    code = 'donate'; // 只是用作标记
    trigger = 'donate'; // 用于触发的文字
    intro = 'Donate';
    func: AppFunc<BaseSession> = async (session) => {
        pixiv.common.log(`From ${session.user.nickname} (ID ${session.user.id}), invoke ".pixiv ${this.trigger}"`);
        return session.sendCard([{
            "type": "card",
            "theme": "info",
            "size": "lg",
            "modules": [
                {
                    "type": "section",
                    "text": {
                        "type": "kmarkdown",
                        "content": "您可以在[爱发电](https://afdian.net/@potatopotat0)支持 Pixiv酱的开发！"
                    }
                },
                {
                    "type": "divider"
                },
                {
                    "type": "header",
                    "text": {
                        "type": "plain-text",
                        "content": "赞助者列表"
                    }
                },
                {
                    "type": "section",
                    "text": {
                        "type": "kmarkdown",
                        "content": "目前还没有呢"
                    }
                }
            ]
        }])
    }
}

export const donate = new Donate();