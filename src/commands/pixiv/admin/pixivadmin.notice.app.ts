import { bot } from 'init/client';
import { AppCommand, AppFunc, BaseSession } from 'kbotify';
import * as pixiv from '../common';
import * as pixivadmin from './common';

class Notice extends AppCommand {
    code = 'notice'; // 只是用作标记
    trigger = 'notice'; // 用于触发的文字
    intro = 'Notice';
    func: AppFunc<BaseSession> = async (session) => {
        if (!pixivadmin.common.isAdmin(session.userId)) {
            return session.reply("You do not have the permission to use this command")
        }
        if (session.args.length == 0) {
            return session.replyTemp("Please specifiy an action");
        }
        pixiv.common.logInvoke(`.pixivadmin ${this.trigger}`, session);
        switch (session.args[0]) {
            case "add":
                bot.logger.info("AdminNotice: Added notification:")
                const content = session.args.slice(1).join(" ");
                bot.logger.info(content);
                session.replyCardTemp([pixiv.cards.notification(content)]);
                pixiv.common.addNotifications(content);
                break;
            case "delete":
                bot.logger.info("AdminNotice: Deleted current notification");
                session.replyTemp("Deleted");
                pixiv.common.deleteNotifications();
                break;
            default:
                bot.logger.warn("AdminNotice: Action invalid");
                return session.replyTemp("Action invalid");
        }
    }
}

export const notice = new Notice();


