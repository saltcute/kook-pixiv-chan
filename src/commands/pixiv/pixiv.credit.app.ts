import { AppCommand, AppFunc, BaseSession } from 'kbotify';
import * as pixiv from './common'

class Credit extends AppCommand {
    code = 'credit'; // 只是用作标记
    trigger = 'credit'; // 用于触发的文字
    intro = 'Credits';
    func: AppFunc<BaseSession> = async (session) => {
        pixiv.common.log(`From ${session.user.nickname} (ID ${session.user.id}), invoke ".pixiv ${this.trigger}"`);
        return session.sendCard([pixiv.cards.credit()]);
    }
}

export const credit = new Credit();