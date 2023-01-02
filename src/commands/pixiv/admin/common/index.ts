import { bot } from 'init/client';
import { BaseSession, Card } from 'kbotify';
import config from '../../../../configs/config';
import fs from 'fs';
import upath from 'upath';

export namespace common {
    export function isAdmin(id: string): boolean {
        return config.adminList.includes(id);
    }

    // Admin manual ban
    var ban: {
        [userId: string]: {
            [trigger: string]: {
                until: number,
                message: string,
            }
        }
    } = {};
    export async function load() {
        if (fs.existsSync(upath.join(__dirname, "ban.json"))) {
            ban = JSON.parse(fs.readFileSync(upath.join(__dirname, "ban.json"), { encoding: "utf-8", flag: "r" }));
            bot.logger.info(`Initialization: Loaded user blacklist from local`);
        } else {
            save();
            bot.logger.warn(`Initialization: User blacklist not found, creating new`);
        }
    }
    export async function save() {
        fs.writeFileSync(upath.join(__dirname, "ban.json"), JSON.stringify(ban), { encoding: "utf-8", flag: "w" });
        bot.logger.debug(`AdminBan: Saved user blacklist`);
    }
    /**
     * Ban a user from using a command
     * @param id User Id
     * @param trigger Trigger of command
     * @param time Total time of the ban in seconds
     */
    export function banTrigger(id: string, trigger: string, time: number, message: string) {
        bot.logger.trace(`AdminBan: Banned ${id} from ${trigger} until ${time} for ${message}`);
        ban[id] = {
            ...ban[id],
            [trigger]: {
                until: Date.now() + time * 1000,
                message: message
            }
        }
    }
    /**
     * Unban a user from using a command
     * @param id User Id
     * @param trigger Trigger of command
     * @param time Total time of the ban in seconds
     */
    export function unBanTrigger(id: string, trigger: string) {
        ban[id] = {
            ...ban[id],
            [trigger]: {
                until: -1,
                message: "This ban session is removed manually"
            }
        }
    }
    /**
     * Ban a user from using all commands
     * @param id User Id
     * @param time Total time of the ban in seconds
     */
    export function banGlobal(id: string, time: number, message: string) {
        return banTrigger(id, "bannedAll", time, message);
    }
    /**
     * Unban a user from using all commands
     * @param id User Id
     */
    export function unBanGlobal(id: string) {
        return unBanTrigger(id, "bannedAll");
    }
    export function isGlobalBanned(session: BaseSession) {
        return isBanned(session, "bannedAll");
    }
    export function isBanned(session: BaseSession, trigger: string): boolean {
        const banEndTimestamp = getBanEndTimestamp(session.userId, trigger);
        if (!isAdmin(session.userId) && Date.now() < banEndTimestamp) {
            return true;
        } else {
            return false;
        }
    }
    export function notifyBan(session: BaseSession, trigger: string) {
        const banEndTimestamp = getBanEndTimestamp(session.userId, trigger);
        const banMessage = getBanMessage(session.userId, trigger);
        return session.replyCardTemp(new Card()
            .setTheme("danger")
            .setSize("lg")
            .addText(`**${session.user.username}#${session.user.identifyNum}：**`)
            .addText(`您已被管理员禁止使用 ${trigger == "bannedAll" ? "Pixiv酱" : `.pixiv ${trigger} 指令`} 至 ${new Date(banEndTimestamp).toLocaleString("zh-cn")}。`)
            .addText(`如有疑问请至[服务器](https://kook.top/iOOsLu)咨询。`)
            .addDivider()
            .addText("管理员留言：")
            .addText(banMessage)
            .addDivider()
            .addModule({
                "type": "context",
                "elements": [
                    {
                        "type": "plain-text",
                        "content": "请不要利用Pixiv酱进行违法违规操作。"
                    }
                ]
            })
        );
    }
    export function notifyGlobalBan(session: BaseSession) {
        return notifyBan(session, "bannedAll");
    }
    /**
     * Get timestamp of ending of the ban
     * @param id User id
     * @param trigger Command trigger
     * @returns Timestamp of ending of the ban if exist. If not, returns `-1`
     */
    export function getBanEndTimestamp(id: string, trigger: string): number {
        if (ban.hasOwnProperty(id)) {
            if (ban[id].hasOwnProperty(trigger)) return ban[id][trigger].until;
            else return -1
        } else return -1;
    }
    /**
     * Get message from admin about the ban
     * @param id User id
     * @param trigger Command trigger
     * @returns Message from admin about the ban
     */
    export function getBanMessage(id: string, trigger: string): string {
        if (ban.hasOwnProperty(id)) {
            if (ban[id].hasOwnProperty(trigger)) return ban[id][trigger].message;
            else return "No message was found"
        } else return "No message was found";
    }
}