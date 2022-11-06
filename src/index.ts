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

bot.logger.fields.name = "kook-pixiv-chan";
bot.logger.addStream({ level: bot.logger.INFO, stream: process.stdout });
// bot.logger.addStream({ level: bot.logger.DEBUG, stream: process.stdout }); // DEBUG
bot.logger.info("Initialization: kook-pixiv-chan initialization start");

(async () => {
    /**
     * Linkmap initialization
     */
    await pixiv.linkmap.init();
    await pixiv.common.tokenPoolInit();
    await pixivadmin.common.load();
    await botActivityStatus();
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

bot.addCommands(pixivMenu);
bot.addCommands(pixivAdminMenu);

/**
 * Add Chinese alias
 */
bot.addAlias(pixivMenu, "p站", "P站");
pixivMenu.addAlias(top, "热门");
pixivMenu.addAlias(random, "随机");
pixivMenu.addAlias(detail, "插画");
pixivMenu.addAlias(author, "作者", "画师");
bot.addAlias(top, "p站热门", "P站热门", "pixiv热门");
bot.addAlias(random, "p站随机", "P站随机", "pixiv随机");
bot.addAlias(detail, "p站插画", "P站插画", "pixiv插画");
bot.addAlias(author, "p站作者", "P站作者", "pixiv作者", "p站画师", "P站画师", "pixiv画师");

/**
 * Add quick hand alias for .pixiv random and .pixiv top
 */
bot.addAlias(random, "色图", "涩图", "setu", "瑟图", "蛇图")
bot.addAlias(top, "不色图", "不涩图", "busetu", "不瑟图", "不蛇图")


bot.on("buttonClick", (event) => {
    try {
        const buttonValue = JSON.parse(event.value);
        switch (buttonValue.action) {
            // TODO: convert legacy event
            case "portal.view.detail":
                break;
            case "portal.view.return_from_detail":
                break;

            /**
             * Main menu of GUI
             */
            case "GUI.view.main":
                bot.API.message.update(event.targetMsgId, pixiv.cards.GUI.main().toString(), undefined, event.userId);
                break;
            case "GUI.view.command_list":
                bot.API.message.update(event.targetMsgId, pixiv.cards.GUI.command.list().toString(), undefined, event.userId);
                break;
            case "GUI.view.credits":
                bot.API.message.update(event.targetMsgId, pixiv.cards.credit()
                    .addModule(pixiv.cards.GUI.returnButton("GUI.view.main"))
                    .toString(),
                    undefined, event.userId);
                // bot.API.message.update(event.targetMsgId, pixiv.cards.GUI.credit().toString(), undefined, event.userId);
                break;
            case "GUI.view.profile":
                pixiv.users.detail({
                    id: event.user.id,
                    identifyNum: event.user.identifyNum,
                    username: event.user.username,
                    avatar: event.user.avatar
                }).then((res) => {
                    bot.API.message.update(event.targetMsgId, pixiv.cards.profile(res)
                        .addModule(pixiv.cards.GUI.returnButton("GUI.view.main"))
                        .toString(),
                        undefined, event.userId);
                }).catch((e) => {
                    bot.logger.warn(e);
                    bot.API.message.update(event.targetMsgId, pixiv.cards.error(e).toString(), undefined, event.userId);
                });
                break;
            case "GUI.view.settings":
                break;
            default:
                bot.logger.warn(`ButtonEvent: Unrecognized action: ${buttonValue.action}`);
        }
    } catch { // Compatibility
        const identifier = event.value.split("|")[0];
        if (identifier == "view_detail") {
            const idx = parseInt(event.value.split("|")[1]);
            const illust = JSON.parse(event.value.split("|")[2]);
            const crt_illust = illust[idx];
            pixiv.common.getIllustDetail(crt_illust).then((res) => {
                bot.API.message.update(event.targetMsgId, pixiv.cards.multiDetail(res.data, pixiv.linkmap.getLink(crt_illust, "0"), idx, illust).toString(), undefined, event.userId);
            })
        } else if (identifier == "view_return") {
            axios({
                baseURL: "https://www.kookapp.cn/api/v3/",
                url: "message/view",
                method: "get",
                params: {
                    msg_id: event.targetMsgId
                },
                headers: {
                    'Authorization': `Bot ${auth.khltoken}`
                }
            }).then((res) => {
                const val = res.data;
                bot.API.message.update(event.targetMsgId, val.data.content, undefined, event.userId);
            })
        }
    }
})


bot.connect();

async function getRandomStatus(): Promise<[string, string]> {
    try {
        switch (crypto.randomInt(6)) {
            case 0:
                const serverCount = (await bot.API.guild.list()).meta.total;
                return ["ヘキソナ", `来自 ${serverCount} 个服务器的涩图要求`];
            case 1:
                return ["John Denver", "Take Me Home, Country Roads"];
            case 2:
                const diff = luxon.DateTime.fromISO("2022-07-07T04:00").diffNow(['days', "hours", "minutes"]).toObject();
                const day = diff.days ? Math.abs(diff.days) : -1;
                const hour = diff.hours ? Math.abs(diff.hours) : -1;
                const minute = diff.minutes ? Math.abs(diff.minutes) : -1;
                return ["Pixiv酱", `已不稳定运行 ${day} 天 ${hour} 小时 ${minute} 分钟`];
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
        const [singer, music_name] = await getRandomStatus();
        bot.axios({
            url: "https://www.kookapp.cn/api/v3/game/activity",
            method: "POST",
            data: {
                singer: singer,
                music_name: music_name,
                data_type: 2
            }
        }).catch((e) => {
            bot.logger.warn(e);
        })
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
            bot.logger.info(`BotMarket: Successfully updated online status with remote returning: `);
            bot.logger.info(res.data);
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
