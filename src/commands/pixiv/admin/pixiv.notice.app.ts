import { AppCommand, AppFunc, BaseSession } from 'kbotify';
import * as pixiv from '../common';

class Notice extends AppCommand {
    code = 'notice'; // 只是用作标记
    trigger = 'notice'; // 用于触发的文字
    intro = 'Notice';
    func: AppFunc<BaseSession> = async (session) => {
        if (session.user.id !== "1854484583") {
            return session.reply("You do not have the permission to use this command")
        }
        if (session.args.length == 0) {
            return session.reply("Please specified an action");
        }
        switch (session.args[0]) {
            case "add":
                const content = session.args.slice(1).join(" ");
                console.log(content);
                pixiv.common.addNotifications(content);
                break;
            case "delete":
                pixiv.common.deleteNotifications();
                break;
            default:
                return session.reply("Action invalid");
        }
    }
}

export const notice = new Notice();


