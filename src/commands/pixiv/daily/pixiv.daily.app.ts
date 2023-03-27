import { BaseCommand, BaseSession, CommandFunction } from "kasumi.js";
import daily from ".";

class Daily extends BaseCommand {
    name = 'daily';
    description = '每日一图';
    func: CommandFunction<BaseSession, any> = async (session) => {
        switch (session.args[0]) {
            case 'add': {
                let time = daily.register(session.channelId, session.args[1]);
                session.reply(`设置成功！Pixiv酱将会每 ${time} 发送随机图片`)
                break;
            }
            case 'remove': {
                let time = daily.unregister(session.channelId);
                session.reply(`移除成功！Pixiv酱将不再每 ${time} 发送随机图片`)
                break;
            }
            default:
        }
    }
}

export default new Daily();