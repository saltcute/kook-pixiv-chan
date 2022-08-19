import { AppCommand, AppFunc, BaseSession } from 'kbotify';
import * as pixiv from '../common';
import * as pixivadmin from './common';

class Ban extends AppCommand {
    code = 'ban'; // 只是用作标记
    trigger = 'ban'; // 用于触发的文字
    intro = 'Ban';
    func: AppFunc<BaseSession> = async (session) => {
        if (!pixivadmin.common.isAdmin(session.userId)) {
            return session.reply("You do not have the permission to use this command")
        }
        if (session.args.length == 0) {
            return session.replyTemp("Please specifiy an action: `add`, `remove` ");
        }
        pixiv.common.logInvoke(`.pixivadmin ${this.trigger}`, session);
        const user = session.args[1];
        switch (session.args[0]) {
            case "add":
                const time = parseInt(session.args[2]);
                if (isNaN(time)) return session.reply("Ban time invalid");
                const message = session.args.slice(3).join(" ");
                pixivadmin.common.banGlobal(user, time, message);
                break;
            case "remove":
                pixivadmin.common.unBanGlobal(user);
                break;
            case "save":
                pixivadmin.common.save();
                break;
            default:
                return session.replyTemp("Action invalid");
        }
    }
}

export const ban = new Ban();


