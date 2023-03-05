import { BaseCommand, BaseSession, CommandFunction } from "kasumi.js";
import * as pixiv from './common'
import { cards } from './common';

class GUI extends BaseCommand {
    name = 'gui';
    description = '使用交互式图形界面';
    func: CommandFunction<BaseSession, any> = async (session) => {
        pixiv.common.logInvoke(`.pixiv ${this.name}`, session);
        session.send([pixiv.cards.GUI.main()]);
    }
}

export const gui = new GUI();