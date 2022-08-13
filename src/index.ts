import { bot } from 'init/client';
import { pixivMenu } from 'commands/pixiv/pixiv.menu';
import { pixivAdminMenu } from 'commands/pixiv/admin/pixivadmin.menu';
import * as pixiv from 'commands/pixiv/common'
import * as pixivadmin from 'commands/pixiv/admin/common'
import axios from 'axios';
import auth from 'configs/auth';
import config from './configs/config';
import schedule from 'node-schedule';
import { random } from 'commands/pixiv/pixiv.random.app';
import { top } from 'commands/pixiv/pixiv.top.app';
import { detail } from 'commands/pixiv/pixiv.detail.app';
import { author } from 'commands/pixiv/pixiv.author.app';

bot.logger.fields.name = "kook-pixiv-chan";
bot.logger.addStream({ level: bot.logger.INFO, stream: process.stdout });
// bot.logger.addStream({ level: bot.logger.DEBUG, stream: process.stdout }); // DEBUG
bot.logger.info("kook-pixiv-chan initialization start");

/**
 * Linkmap initialization
 */
pixiv.linkmap.init();
pixivadmin.common.load();
schedule.scheduleJob('15 * * * *', async () => {
    pixiv.linkmap.save();
    pixivadmin.common.save();
    await pixiv.linkmap.upload();
})

/**
 * NSFW.js initialization
 */
if (config.useAliyunGreen === false) {
    pixiv.nsfwjs.init();
}

/**
 * Aliyun green initilization
 */
if (config.useAliyunGreen) {
    pixiv.aligreen.setServerRegion("Singapore");
}

/**
 * Bot Market Initializatiojn
 */
if (config.enableBotMarket) {
    botMarketStayOnline();
}

bot.messageSource.on('message', (e) => {
    bot.logger.debug(`received:`, e);
});
bot.addCommands(pixivMenu);
bot.addCommands(pixivAdminMenu);

/**
 * Add Chinese alias
 */
bot.addAlias(pixivMenu, "p站", "P站");
pixivMenu.addAlias(top, "热门");
pixivMenu.addAlias(random, "随机");
pixivMenu.addAlias(detail, "插画");
pixivMenu.addAlias(author, "作者");
bot.addAlias(top, "p站热门", "P站热门", "pixiv热门");
bot.addAlias(random, "p站随机", "P站随机", "pixiv随机");
bot.addAlias(detail, "p站插画", "P站插画", "pixiv插画");
bot.addAlias(author, "p站作者", "P站作者", "pixiv作者", "pixiv画师");

/**
 * Add quick hand alias for .pixiv random and .pixiv top
 */
bot.addAlias(random, "色图", "涩图", "setu", "瑟图", "蛇图")
bot.addAlias(top, "不色图", "不涩图", "busetu", "不瑟图", "不蛇图")

bot.connect();
bot.logger.debug('system init success');

function botMarketStayOnline() {
    axios({
        url: 'http://bot.gekj.net/api/v1/online.bot',
        method: "POST",
        headers: {
            uuid: auth.botMarketUUID
        }
    }).then((res) => {
        if (res.data.code == 0) {
            bot.logger.info(`Bot Market online status updating success, remote returning: `);
            bot.logger.info(res.data);
            setTimeout(botMarketStayOnline, (res.data.data.onTime + 5) * 1000);
        } else if (res.data.code == -1) {
            bot.logger.warn(`Bot Market online status updating failed. Retring in 30 minutes. Error message: `);
            bot.logger.warn(res.data);
            setTimeout(botMarketStayOnline, 30 * 60 * 1000);
        }
    }).catch((e) => {
        bot.logger.warn(`Bot Market heartbeat request failed. Retring in 30 minutes. Error message: `);
        bot.logger.warn(e);
        setTimeout(botMarketStayOnline, 30 * 60 * 1000);
    })
}
