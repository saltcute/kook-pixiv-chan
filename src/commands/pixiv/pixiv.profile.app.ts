import { AppCommand, AppFunc, BaseSession } from 'kbotify';
import * as pixiv from './common'

class Profile extends AppCommand {
    code = 'profile'; // 只是用作标记
    trigger = 'profile'; // 用于触发的文字
    intro = 'Check user profile';
    func: AppFunc<BaseSession> = async (session) => {
        pixiv.common.logInvoke(`.pixiv ${this.trigger}`, session);
        const res = await pixiv.users.detail(session.userId);
        if (res) {
            return session.sendCard([pixiv.cards.profile(res)]);
        } else {
            return session.reply("NOT IMPLEMENTED");
        }
    }
}

export const profile = new Profile();