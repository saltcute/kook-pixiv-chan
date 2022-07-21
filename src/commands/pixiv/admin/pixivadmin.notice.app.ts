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
            return session.replyTemp("Please specified an action");
        }
        pixiv.common.log(`From ${session.user.nickname} (ID ${session.user.id}), invoke ".pixiv ${this.trigger}"`);
        switch (session.args[0]) {
            case "add":
                pixiv.common.log("Added notification:")
                const content = session.args.slice(1).join(" ");
                pixiv.common.log(content);
                session.replyCardTemp([pixiv.cards.notification(content)]);
                pixiv.common.addNotifications(content);
                break;
            case "delete":
                pixiv.common.log("Deleted current notification");
                session.replyTemp("Deleted");
                pixiv.common.deleteNotifications();
                break;
            default:
                pixiv.common.log("Action invalid");
                return session.replyTemp("Action invalid");
        }
    }
}

export const notice = new Notice();


