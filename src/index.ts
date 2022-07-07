import { bot } from 'init/client';
import { pixivMenu } from 'commands/pixiv/pixiv.menu';
import * as pixiv from 'commands/pixiv/common'
import axios from 'axios';
import auth from 'configs/auth';

pixiv.linkmap.load();

setInterval(saveLinkmap, 15 * 60 * 1000); // 15 minutes

if (auth.enableBotMarket) {
    botMarketStayOnline();
}

bot.messageSource.on('message', (e) => {
    bot.logger.debug(`received:`, e);
    // 如果想要在console里查看收到信息也可以用
    // console.log(e);
});

bot.addCommands(pixivMenu);

bot.connect();

bot.logger.debug('system init success');

function saveLinkmap() {
    pixiv.linkmap.saveLink();
}
function botMarketStayOnline() {
    axios({
        url: 'http://bot.gekj.net/api/v1/online.bot',
        method: "POST",
        headers: {
            uuid: auth.botMarketUUID
        }
    }).then((res) => {
        console.log(`[${new Date().toLocaleTimeString()}] Bot Market online status updating success, remote returning: `);
        console.log(res.data);
        setTimeout(botMarketStayOnline, (res.data.data.onTime + 5) * 1000);
    }).catch((e) => {
        console.log(`[${new Date().toLocaleTimeString()}] Bot Market online status updating failed. Retring in 60 seconds. Error message: `);
        console.log(e);
        setTimeout(botMarketStayOnline, 60 * 1000);
    })
}