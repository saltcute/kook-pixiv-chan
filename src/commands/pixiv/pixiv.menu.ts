import { BaseMenu } from "kasumi.js";
import { author } from './pixiv.author.app';
import { detail } from './pixiv.detail.app';
import { credit } from './pixiv.credit.app';
import { help } from './pixiv.help.app';
import { refresh } from './pixiv.refresh.app';
import { top } from './pixiv.top.app';
import { random } from './pixiv.random.app';
import { profile } from './pixiv.profile.app';
import { tag } from './pixiv.tag.app';
import { redeem } from './pixiv.redeem.app';
import { gui } from './pixiv.gui.app';
class PixivMenu extends BaseMenu {
    name = 'pixiv'
    prefix = './'
}

export const pixivMenu = new PixivMenu(top, tag, detail, author, refresh, help, credit, random, profile, redeem, gui);
