import { KBotify } from 'kbotify';
import { BotConfig } from 'kbotify/dist/core/kbotify/types';
import auth from '../configs/auth';

var kbotifyConfig: BotConfig;

if (auth.useWebHook) {
    kbotifyConfig = {
        mode: 'webhook',
        token: auth.khltoken,
        verifyToken: auth.khlverifytoken,
        key: auth.khlkey,
        port: auth.khlport,
        ignoreDecryptError: false
    }
} else {
    kbotifyConfig = {
        mode: 'websocket',
        token: auth.khltoken,
        ignoreDecryptError: false
    }
}

export const bot = new KBotify(kbotifyConfig);
