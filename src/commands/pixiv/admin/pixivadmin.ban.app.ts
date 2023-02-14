import { BaseCommand, BaseSession, CommandFunction } from "kasumi.js";
import * as pixiv from '../common';
import * as pixivadmin from './common';

class Ban extends BaseCommand {
    name = 'ban';
    ;
    func: CommandFunction<BaseSession, any> = async (session) => {
        if (!pixivadmin.common.isAdmin(session.authorId)) {
            return session.reply("You do not have the permission to use this command")
        }
        if (session.args.length == 0) {
            return session.replyTemp("Please specifiy an action: `add`, `remove` ");
        }
        pixiv.common.logInvoke(`.pixivadmin ${this.name}`, session);
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


