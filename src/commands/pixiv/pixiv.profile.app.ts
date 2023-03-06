import { bot } from 'init/client';
import { BaseCommand, BaseSession, CommandFunction } from "kasumi.js";
import * as pixiv from './common'
import * as pixivadmin from './admin/common'

class Profile extends BaseCommand {
    name = 'profile';
    description = '查看个人信息';
    func: CommandFunction<BaseSession, any> = async (session) => {
        if (pixiv.common.isBanned(session, this.name)) return;
        if (pixiv.common.isRateLimited(session, 5, this.name)) return;
        pixiv.common.logInvoke(`.pixiv ${this.name}`, session);
        let userId, data: pixiv.users.userMeta;
        if (pixivadmin.common.isAdmin(session.authorId) && (userId = session.args[0])) {
            let user = await bot.API.user.view(userId);
            data = {
                id: user.id,
                identifyNum: user.identify_num,
                username: user.username,
                avatar: user.avatar
            }
        } else {
            data = {
                id: session.author.id,
                identifyNum: session.author.identify_num,
                username: session.author.username,
                avatar: session.author.avatar
            }
        }
        pixiv.users.detail(data).then((res) => {
            return session.send([pixiv.cards.profile(res)]);
        }).catch((e) => {
            this.logger.warn(e);
            return session.replyTemp([pixiv.cards.error(e.stack)]);
        });
    }
}

export const profile = new Profile();