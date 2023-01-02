import { bot } from 'init/client';
import { AppCommand, AppFunc, BaseSession } from 'kbotify';
import * as pixiv from './common'

class Profile extends AppCommand {
    code = 'profile'; // 只是用作标记
    trigger = 'profile'; // 用于触发的文字
    intro = 'Check user profile';
    func: AppFunc<BaseSession> = async (session) => {
        if (pixiv.common.isBanned(session, this.trigger)) return;
        if (pixiv.common.isRateLimited(session, 5, this.trigger)) return;
        pixiv.common.logInvoke(`.pixiv ${this.trigger}`, session);
        pixiv.users.detail({
            id: session.user.id,
            identifyNum: session.user.identifyNum,
            username: session.user.username,
            avatar: session.user.avatar
        }).then((res) => {
            return session.sendCard([pixiv.cards.profile(res)]);
        }).catch((e) => {
            bot.logger.warn(e);
            return session.replyCardTemp([pixiv.cards.error(e.stack)]);
        });
    }
}

export const profile = new Profile();