import { BaseCommand, BaseSession, CommandFunction } from "kasumi.js";
import daily from ".";
import * as pixivadmin from '../admin/common';
import * as pixiv from '../common';

class Daily extends BaseCommand {
    name = 'daily';
    description = '每日一图';
    func: CommandFunction<BaseSession, any> = async (session) => {
        if (!session.guildId) return session.reply("只能在服务器中设置每日涩图");
        if (pixiv.common.isRateLimited(session, 60, this.name)) return;
        if (!pixivadmin.common.isAdmin(session.authorId) && !await pixiv.common.isServerAdmin(session.guildId, session.authorId))
            return session.reply("You do not have the permission to use this command")
        switch (session.args[0]) {
            case 'add': {
                let time = daily.register(session.channelId, session.args[1]);
                session.reply(`设置成功！Pixiv酱将会每 ${time} 发送随机涩图`)
                break;
            }
            case 'remove': {
                let time = daily.unregister(session.channelId);
                session.reply(`移除成功！Pixiv酱将不再每 ${time} 发送随机涩图`)
                break;
            }
            default:
        }
    }
}

export default new Daily();