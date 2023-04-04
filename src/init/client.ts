import auth from '../configs/auth';
// import Kasumi from 'kasumi.js';
import Kasumi from "kasumi.js"
import { KasumiConfig } from 'kasumi.js/dist/type'

var config: KasumiConfig;

if (auth.useWebHook) {
    config = {
        type: 'webhook',
        token: auth.khltoken,
        verifyToken: auth.khlverifytoken,
        encryptKey: auth.khlkey,
        port: auth.khlport,
        disableSnOrderCheck: true
    }
} else {
    config = {
        type: 'websocket',
        // vendor: 'botroot',
        // vendor: 'kookts',
        token: auth.khltoken,
        disableSnOrderCheck: true
    }
}

export const bot = new Kasumi(config);
