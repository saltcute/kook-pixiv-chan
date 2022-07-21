import { bot } from 'init/client';
import { pixivMenu } from 'commands/pixiv/pixiv.menu';
import { pixivAdminMenu } from 'commands/pixiv/admin/pixivadmin.menu';
import * as pixiv from 'commands/pixiv/common'
import axios from 'axios';
import auth from 'configs/auth';
import config from './configs/config';
import schedule from 'node-schedule';

pixiv.common.log("kook-pixiv-chan initialization start");

/**
 * Linkmap initialization
 */
pixiv.linkmap.init();
if (config.useRemoteLinkmap) {
    schedule.scheduleJob('30 * * * *', async () => {
        await pixiv.linkmap.download();
    });
}
schedule.scheduleJob('15 * * * *', async () => {
    pixiv.linkmap.save();
    await pixiv.linkmap.upload();
})

/**
 * NSFW.js initialization
 */
if (config.useAliyunGreen === false) {
    pixiv.nsfwjs.init();
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
            pixiv.common.log(`Bot Market online status updating success, remote returning: `);
            console.log(res.data);
            setTimeout(botMarketStayOnline, (res.data.data.onTime + 5) * 1000);
        } else if (res.data.code == -1) {
            pixiv.common.log(`Bot Market online status updating failed. Retring in 30 minutes. Error message: `);
            console.log(res.data);
            setTimeout(botMarketStayOnline, 30 * 60 * 1000);
        }
    }).catch((e) => {
        pixiv.common.log(`Bot Market heartbeat request failed. Retring in 30 minutes. Error message: `);
        console.error(e);
        setTimeout(botMarketStayOnline, 30 * 60 * 1000);
    })
}
