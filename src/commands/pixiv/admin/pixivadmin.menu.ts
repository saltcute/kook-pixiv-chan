import { Card, MenuCommand } from 'kbotify';
import { notice } from './pixivadmin.notice.app';
import { detection } from './pixivadmin.detection.app';
import { ban } from './pixivadmin.ban.app';
import { kill } from './pixivadmin.kill.app';
import { ping } from './pixivadmin.ping.app';

class PixivAdminMenu extends MenuCommand {
    code = 'pixivadmin';
    trigger = 'pixivadmin';

    intro = 'Pixiv';
    menu = new Card({
        "type": "card",
        "theme": "warning",
        "size": "lg",
        "modules": [
            {
                "type": "header",
                "text": {
                    "type": "plain-text",
                    "content": "Pixivadmin Commands"
                }
            },
            {
                "type": "divider"
            },
            {
                "type": "section",
                "text": {
                    "type": "kmarkdown",
                    "content": "`.pixivadmin notice`"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "kmarkdown",
                    "content": "`.pixivadmin detection`"
                }
            }
        ]
    }).toString();
    useCardMenu = true; // 使用卡片菜单
}

export const pixivAdminMenu = new PixivAdminMenu(notice, detection, ban, kill, ping);
