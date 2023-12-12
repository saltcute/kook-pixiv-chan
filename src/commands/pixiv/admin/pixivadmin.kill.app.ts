import { BaseCommand, BaseSession, CommandFunction } from "kasumi.js";
import * as pixivadmin from './common';

class Kill extends BaseCommand {
    name = 'kill';
    func: CommandFunction<BaseSession, any> = async (session) => {
        if (!pixivadmin.common.isAdmin(session.authorId)) {
            return session.reply("You do not have the permission to use this command")
        }
        process.exit(0);
    }
}

export const kill = new Kill();


