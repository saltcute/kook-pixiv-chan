import { bot } from 'init/client';
import * as fs from 'fs';
import upath from 'upath';

(async () => {

    bot.logger.info("Initialization: kook-pixiv-chan initialization start");
    const commands = fs.readdirSync(upath.join(__dirname, 'commands'));
    await Promise.all(commands.map(v => require(upath.join(__dirname, 'commands', v)).init()))
        .then(async () => {
            bot.logger.info("Loaded commands");
            await bot.connect();
            bot.logger.info("Initialization: Done");
        })
        .catch(e => {
            bot.logger.error(e);
        })
})()
