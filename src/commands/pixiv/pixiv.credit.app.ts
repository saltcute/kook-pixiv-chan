import { CommandFunction, BaseCommand, BaseSession } from "kasumi.js";
import * as pixiv from './common'

class Credit extends BaseCommand {
    name = 'credit';
    description = '查看赞助与感谢列表'
    func: CommandFunction<BaseSession, any> = async (session) => {
        pixiv.common.logInvoke(`.pixiv ${this.name}`, session);
        return session.send([await pixiv.cards.credit(1)]);
    }
}

export const credit = new Credit();