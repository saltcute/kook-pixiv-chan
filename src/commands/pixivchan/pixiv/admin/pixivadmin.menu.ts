import { Card, BaseMenu } from "kasumi.js";
import { notice } from './pixivadmin.notice.app';
import { detection } from './pixivadmin.detection.app';
import { ban } from './pixivadmin.ban.app';
import { kill } from './pixivadmin.kill.app';
import { ping } from './pixivadmin.ping.app';

class PixivAdminMenu extends BaseMenu {
    name = 'pixivadmin';

    prefix = './';
}

export const pixivAdminMenu = new PixivAdminMenu(notice, detection, ban, kill, ping);
