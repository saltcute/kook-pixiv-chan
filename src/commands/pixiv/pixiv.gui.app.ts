import { AppCommand, AppFunc, BaseSession } from 'kbotify';
import * as pixiv from './common'
import { cards } from './common';

class GUI extends AppCommand {
    code = 'gui'; // 只是用作标记
    trigger = 'gui'; // 用于触发的文字
    intro = 'Pixiv Chan GUI interface';
    func: AppFunc<BaseSession> = async (session) => {
        pixiv.common.logInvoke(`.pixiv ${this.trigger}`, session);
        session.sendCard(pixiv.cards.GUI.main());
    }
}

export const gui = new GUI();