import { bot } from 'init/client';
import { pixivMenu } from 'commands/pixiv/pixiv.menu';
import { pixivAdminMenu } from 'commands/pixiv/admin/pixivadmin.menu';
import * as pixiv from 'commands/pixiv/common'
import * as pixivadmin from 'commands/pixiv/admin/common'
import axios from 'axios';
import auth from 'configs/auth';
import config from 'configs/config';
import fs from 'fs';
import crypto from 'crypto';
import * as luxon from 'luxon'
import schedule from 'node-schedule';
import { random } from 'commands/pixiv/pixiv.random.app';
import { top } from 'commands/pixiv/pixiv.top.app';
import { detail } from 'commands/pixiv/pixiv.detail.app';
import { author } from 'commands/pixiv/pixiv.author.app';
import { gui } from 'commands/pixiv/pixiv.gui.app';
import upath from 'upath';


bot.logger.info("Initialization: kook-pixiv-chan initialization start");

(async () => {
    /**
     * Linkmap initialization
     */
    await Promise.all([
        bot.connect(),
        pixiv.linkmap.init(),
        pixiv.common.tokenPoolInit(),
        pixivadmin.common.load(),
        botActivityStatus()
    ])
    bot.logger.info("Initialization: Done");
})()
schedule.scheduleJob('0,15,30,45 * * * *', async () => {
    pixiv.linkmap.save();
    pixivadmin.common.save();
    await pixiv.linkmap.upload();
})
schedule.scheduleJob('0,10,20,30,40,50 * * * *', async () => {
    botActivityStatus();
})

/**
 * Aliyun green initilization
 */
if (config.useAliyunChina) {
    pixiv.aligreen.setServerRegion("Shenzhen");
} else {
    pixiv.aligreen.setServerRegion("Singapore");
}

/**
 * Bot Market Initializatiojn
 */
if (config.enableBotMarket) {
    botMarketStayOnline();
}

// bot.addCommands(pixivMenu);
// bot.addCommands(pixivAdminMenu);

bot.plugin.load(pixivMenu, pixivAdminMenu);

/**
 * Add Chinese alias
 */
bot.plugin.addAlias(pixivMenu, "p站", "P站");
pixivMenu.addAlias(top, "热门");
pixivMenu.addAlias(random, "随机");
pixivMenu.addAlias(detail, "插画", 'illust');
pixivMenu.addAlias(author, "作者", "画师");
pixivMenu.addAlias(gui, "GUI", "GUi", "GuI", "Gui", "guI", "gUI", "gUi");
bot.plugin.addAlias(top, "p站热门", "P站热门", "pixiv热门", "热门");
bot.plugin.addAlias(random, "p站随机", "P站随机", "pixiv随机");
bot.plugin.addAlias(detail, "p站插画", "P站插画", "pixiv插画");
bot.plugin.addAlias(author, "p站作者", "P站作者", "pixiv作者", "p站画师", "P站画师", "pixiv画师");

/**
 * Add quick hand alias for .pixiv random and .pixiv top
 */
bot.plugin.addAlias(random, "色图", "涩图", "setu", "瑟图", "蛇图")
bot.plugin.addAlias(top, "不色图", "不涩图", "busetu", "不瑟图", "不蛇图")

function getMatches(string: string, regex: RegExp): string[] {
    let matches = regex.exec(string);
    let res = [];
    if (matches) {
        for (let i = 1; i < matches.length; ++i) {
            res.push(matches[i]);
        }
    }
    return res;
}

bot.message.on('allTextMessages', (event) => {
    switch (true) {
        case new RegExp(String.raw`^(\(met\)${bot.userId}\(met\))? ?[再在]?多?来[一俩二仨三四五六七八九十百千万亿兆京]*[张点][不]?[涩色瑟蛇]?图?$`).test(event.content): {
            // random.exec('random', [], text);
            break;
        };
        case /^查询画师 ?([0-9]+)$/.test(event.content): {
            const matches = getMatches(event.content, /^查询画师 ?([0-9]+)$/);
            // author.exec('author', [matches[0]], text);
            break;
        };
        case /^查询(?:图片|插画|涩涩|(?:[蛇色瑟涩]|se|she)图)? ?([0-9]+)$/.test(event.content): {
            const matches = getMatches(event.content, /^查询(?:图片|插画|涩涩|(?:[蛇色瑟涩]|se|she)图)? ?([0-9]+)$/);
            // detail.exec('detail', [matches[0]], text);
            break;
        }
    }
})

bot.message.on("buttonClicked", async (event) => {
    try {
        const buttonValue = JSON.parse(event.value);
        try {
            const action = buttonValue.action.split(".");
            const data = buttonValue.data;
            bot.logger.debug(`ButtonClicked: From ${event.author.username}#${event.author.identify_num} (ID ${event.authorId} in (${event.guildId}/${event.channelId}), invoke ${buttonValue.action}`);
            const func: (e: typeof event, action: string[], data: any) => Promise<any> = require(upath.join(__dirname, 'commands', 'button', ...action, 'index')).default;
            await func(event, action, data).catch((e) => {
                bot.logger.error(e);
            });
        } catch (e) {
            bot.logger.warn(`ButtonClicked: Unrecognized action ${buttonValue.action}`);
        }
    } catch (e: any) { // Compatibility
        const identifier = event.value.split("|")[0];
        if (identifier == "view_detail" || identifier == "view_return") {
            bot.API.message.update(event.targetMsgId, pixiv.cards.error("此卡片专为旧版 Pixiv酱 设计，现已无法使用"), undefined, event.authorId);
        } else {
            bot.logger.error(e.stack);
            bot.API.message.update(event.targetMsgId, pixiv.cards.error(`唤起按钮事件时出错：\n${event.value}\n\n错误信息：\n${e.stack}`), undefined, event.authorId);
        }
    }
})

async function getRandomStatus(): Promise<[string, string]> {
    try {
        switch (crypto.randomInt(6)) {
            case 0:
                const serverCount = ((await (bot.API.guild.list().next())).value)?.meta.total;
                return ["ヘキソナ", `${serverCount} 个服务器的涩图要求`];
            case 1:
                const songs: [string, string][] = [ // OMEGALUL WEEBOO AF
                    ["John Denver", "Take Me Home, Country Roads"],
                    ["hololive IDOL PROJECT", "BLUE CLAPPER"],
                    ["hololive IDOL PROJECT", "Suspect"],
                    ["邪神ちゃん, 初音ミク", "サンキュードロップキック"],
                    ["キズナアイ, 花譜", "ラブしい"],
                    ["halca, 鈴木愛奈", "あれこれドラスティック"],
                    ["MORE MORE JUMP!", "モア!ジャンプ!モア!"],
                    ["チト, ユーリ", "More One Night"],
                    ["Nanahira, Camellia", "You Make My Life 1UP"],
                    ["邪神★ガールズ", "あの娘にドロップキック"],
                    ["キノシタ", "どぅーまいべすと"],
                    ["キノシタ", "夢色フェスティバル"],
                    ["鹿乃", "なだめスかし Negotiation"],
                    ["キノシタ", "人間のくせになまいきだ"],
                    ["ナユタン星人, ナナヲアカリ, 000", "コスモポップファンクラブ"]
                ];
                return songs[crypto.randomInt(songs.length)];
            case 2:
                const diff = luxon.DateTime.fromISO("2022-07-07T04:00").diffNow(['days', "hours", "minutes"]).toObject();
                const day = diff.days ? Math.abs(diff.days) : -1;
                const hour = diff.hours ? Math.abs(diff.hours) : -1;
                return ["Pixiv酱", `不稳定运行 ${day} 天 ${hour} 小时`];
            case 3:
                const pak = JSON.parse(fs.readFileSync("package.json", { encoding: "utf-8", flag: "r" }));
                return ["正在运行", `Pixiv酱 v${pak.version}`];
            case 4:
                return ["官方服务器", "https://kook.top/iOOsLu"];
            case 5:
                return ["行行好吧", "https://afdian.net/@hexona"];
            default:
                return ["ヘキソナ", "获取状态错误"];
        }
    } catch (e) {
        bot.logger.warn(e);
        return ["ヘキソナ", "获取状态错误"];
    }
}

async function botActivityStatus() {
    try {
        const [singer, musicName] = await getRandomStatus();
        bot.API.game.activity(singer, musicName);
    } catch (e) {
        bot.logger.warn(e);
    }
}

function botMarketStayOnline() {
    axios({
        url: 'http://bot.gekj.net/api/v1/online.bot',
        method: "POST",
        headers: {
            uuid: auth.botMarketUUID
        }
    }).then((res) => {
        if (res.data.code == 0) {
            bot.logger.debug(`BotMarket: Successfully updated online status with remote returning: `);
            bot.logger.debug(res.data);
            setTimeout(botMarketStayOnline, (res.data.data.onTime + 5) * 1000);
        } else if (res.data.code == -1) {
            bot.logger.warn(`BotMarket: Failed updating online status with remote returning: `);
            bot.logger.warn(res.data);
            bot.logger.warn(`BotMarket: Retries in 30 minutes`);
            setTimeout(botMarketStayOnline, 30 * 60 * 1000);
        }
    }).catch((e) => {
        bot.logger.warn(`BotMarket: Failed updating online status with remote returning: `);
        bot.logger.warn(e.message);
        bot.logger.warn(`BotMarket: Retries in 30 minutes`);
        setTimeout(botMarketStayOnline, 30 * 60 * 1000);
    })
}
