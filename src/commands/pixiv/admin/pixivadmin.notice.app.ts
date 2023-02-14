import { bot } from 'init/client';
import { BaseCommand, BaseSession, CommandFunction } from "kasumi.js";
import * as pixiv from '../common';
import * as pixivadmin from './common';

class Notice extends BaseCommand {
    name = 'notice';
    func: CommandFunction<BaseSession, any> = async (session) => {
        if (!pixivadmin.common.isAdmin(session.authorId)) {
            return session.reply("You do not have the permission to use this command")
        }
        if (session.args.length == 0) {
            return session.replyTemp("Please specifiy an action");
        }
        pixiv.common.logInvoke(`.pixivadmin ${this.name}`, session);
        switch (session.args[0]) {
            case "add":
                bot.logger.debug("AdminNotice: Added notification:")
                const content = session.args.slice(1).join(" ");
                bot.logger.debug(content);
                session.replyTemp([pixiv.cards.notification(content)]);
                pixiv.common.addNotifications(content);
                break;
            case "delete":
                bot.logger.debug("AdminNotice: Deleted current notification");
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


