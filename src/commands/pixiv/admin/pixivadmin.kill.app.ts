import { AppCommand, AppFunc, BaseSession } from 'kbotify';
import * as pixivadmin from './common';

class Kill extends AppCommand {
    code = 'kill'; // 只是用作标记
    trigger = 'kill'; // 用于触发的文字
    intro = 'Kill';
    func: AppFunc<BaseSession> = async (session) => {
        if (!pixivadmin.common.isAdmin(session.userId)) {
            return session.reply("You do not have the permission to use this command")
        }
        process.exit(0);
    }
}

export const kill = new Kill();


