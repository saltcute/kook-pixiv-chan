import { bot } from 'init/client';
import { pixivMenu } from 'commands/pixiv/pixiv.menu';
import { pixivAdminMenu } from 'commands/pixiv/admin/pixivadmin.menu';
import * as pixiv from 'commands/pixiv/common'
import * as pixivadmin from 'commands/pixiv/admin/common'
import axios from 'axios';
import auth from 'configs/auth';
import config from 'configs/config';
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
})()
schedule.scheduleJob('15 * * * *', async () => {
    pixiv.linkmap.save();
    pixivadmin.common.save();
    await pixiv.linkmap.upload();
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
    console.log(event.value);
    try {
        const buttonValue = JSON.parse(event.value);
        bot.logger.info(buttonValue);
        switch (buttonValue.action) {
            // TODO: convert legacy event
            case "portal.view.detail":
                break;
            case "portal.view.return_from_detail":
                break;

            /**
             * Main menu of GUI
             */
            case "GUI.view.command_list":
                bot.API.message.update(event.targetMsgId, pixiv.cards.GUI.command_list().toString(), undefined, event.userId);
                break;
            case "GUI.view.credit":
                break;
            case "GUI.view.profile":
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
