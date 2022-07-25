import { Card, MenuCommand } from 'kbotify';
import { author } from './pixiv.author.app';
import { detail } from './pixiv.detail.app';
import { credit } from './pixiv.credit.app';
import { help } from './pixiv.help.app';
import { illust } from './pixiv.illust.app';
import { refresh } from './pixiv.refresh.app';
import { top } from './pixiv.top.app';
import { random } from './pixiv.random.app';
class PixivMenu extends MenuCommand {
    code = 'pixiv';
    trigger = 'pixiv';

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
                    "content": "Pixiv 命令"
                }
            },
            {
                "type": "divider"
            },
            {
                "type": "context",
                "elements": [
                    {
                        "type": "kmarkdown",
                        "content": "所有命令皆不需要方括号（[]）"
                    }
                ]
            },
            {
                "type": "section",
                "text": {
                    "type": "kmarkdown",
                    "content": "请输入 `.pixiv help` 查询详细指令用法"
                }
            },
            {
                "type": "divider"
            },
            {
                "type": "section",
                "text": {
                    "type": "kmarkdown",
                    "content": "`.pixiv random` 获取⑨张随机插画"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "kmarkdown",
                    "content": "`.pixiv top [标签]...` 获取本周 [标签] 标签的人气前九的图片，若不提供 [标签] 则为全站排名"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "kmarkdown",
                    "content": "`.pixiv author [用户 ID]` 获取用户的最新九张插画"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "kmarkdown",
                    "content": "`.pixiv illust [插画 ID]` 获取 Pixiv 上对应 ID 的插画"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "kmarkdown",
                    "content": "`.pixiv detail [插画 ID]` 获取对应 ID 插画的详细信息（作品名、作者、标签等）"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "kmarkdown",
                    "content": "`.pixiv refresh [插画 ID]` 刷新对应 ID 插画的缓存。（当图片显示不正常时，可以在几分钟后运行此命令）"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "kmarkdown",
                    "content": "`.pixiv credit` 查看赞助与感谢列表"
                }
            },
            {
                "type": "context",
                "elements": [
                    {
                        "type": "kmarkdown",
                        "content": "喜欢 Pixiv酱吗？来 [Bot Market](https://www.botmarket.cn/bots?id=8) 留下一个五星好评吧！\n您也可以在[爱发电](https://afdian.net/@potatopotat0)帮助Pixiv酱的开发！\n[问题反馈&建议](https://kook.top/iOOsLu)"
                    }
                ]
            },
        ]
    }).toString();
    useCardMenu = true; // 使用卡片菜单
}

export const pixivMenu = new PixivMenu(top, illust, detail, author, refresh, help, credit, random);
