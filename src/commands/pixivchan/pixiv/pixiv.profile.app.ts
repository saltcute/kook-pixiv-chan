import { bot } from 'init/client';
import { BaseCommand, BaseSession, CommandFunction } from "kasumi.js";
import * as pixiv from './common'

class Profile extends BaseCommand {
    name = 'profile';
    description = '查看个人信息';
    func: CommandFunction<BaseSession, any> = async (session) => {
        if (pixiv.common.isBanned(session, this.name)) return;
        if (pixiv.common.isRateLimited(session, 5, this.name)) return;
        pixiv.common.logInvoke(`.pixiv ${this.name}`, session);
        pixiv.users.detail({
            id: session.author.id,
            identifyNum: session.author.identify_num,
            username: session.author.username,
            avatar: session.author.avatar
        }).then((res) => {
            return session.send([pixiv.cards.profile(res)]);
        }).catch((e) => {
            this.logger.warn(e);
            return session.replyTemp([pixiv.cards.error(e.stack)]);
        });
    }
}

export const profile = new Profile();