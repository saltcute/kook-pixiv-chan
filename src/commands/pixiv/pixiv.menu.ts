import { Card, MenuCommand } from 'kbotify';
import { author } from './pixiv.author.app';
import { detail } from './pixiv.detail.app';
import { credit } from './pixiv.credit.app';
import { help } from './pixiv.help.app';
import { illust } from './pixiv.illust.app';
import { refresh } from './pixiv.refresh.app';
import { top } from './pixiv.top.app';
import { random } from './pixiv.random.app';
import { profile } from './pixiv.profile.app';
import { tag } from './pixiv.tag.app';
import { redeem } from './pixiv.redeem.app';
import { gui } from './pixiv.gui.app';
class PixivMenu extends MenuCommand {
    code = 'pixiv';
    trigger = 'pixiv';

    intro = 'Pixiv';
    menu = new Card()
        .setTheme("warning")
        .setSize("lg")
        .addTitle("Pixiv酱命令列表")
        .addModule({
            "type": "context",
            "elements": [
                {
                    "type": "kmarkdown",
                    "content": "所有命令皆不需要括号（<>, (), [], {}）"
                }
            ]
        })
        .addText("**请输入 `.pixiv help` 查询详细指令用法与使用示例**")
        .addDivider()
        .addText("```plain\n.pixiv tag [{day|week|month}] <tag>...```\n 获取所给标签人气前九的图片")
        .addText("```plain\n.pixiv random```\n 获取⑨张随机插画")
        .addText("```plain\n.pixiv top [option]```\n 获取本日/周/月等的全站最热插画")
        .addText("```plain\n.pixiv author <Illustration ID>```\n 获取用户的最新九张插画")
        .addText("```plain\n.pixiv illust <Illustration ID>```\n 获取 Pixiv 上对应 ID 的插画")
        .addText("```plain\n.pixiv detail <Illustration ID>```\n 获取对应 ID 插画的详细信息（作品名、作者、标签等）")
        .addText("```plain\n.pixiv refresh <Illustration ID>```\n 刷新对应 ID 插画的缓存。")
        .addText("```plain\n.pixiv credit```\n 查看赞助与感谢列表")
        .addModule({
            "type": "context",
            "elements": [
                {
                    "type": "kmarkdown",
                    "content": "喜欢 Pixiv酱吗？来 [Bot Market](https://www.botmarket.cn/bots?id=8) 留下一个五星好评吧！\n您也可以在[爱发电](https://afdian.net/@hexona)帮助Pixiv酱的开发！\n[问题反馈&建议](https://kook.top/iOOsLu)"
                }
            ]
        }).toString();
    useCardMenu = true; // 使用卡片菜单
}

export const pixivMenu = new PixivMenu(top, tag, illust, detail, author, refresh, help, credit, random, profile, redeem, gui);
