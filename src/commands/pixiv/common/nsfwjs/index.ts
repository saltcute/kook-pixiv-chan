import { common } from "..";
import auth from '../../../../configs/auth'
const nsfw = require('nsfwjs')
const tf = require('@tensorflow/tfjs-node');

var model: any;

export namespace nsfwjs {
    export async function init() {
        if (auth.customNSFWModel) {
            console.log(`[${new Date().toLocaleTimeString()}] Loaded custom nsfwjs model at ${auth.customNSFWLink}`);
            model = await nsfw.load(auth.customNSFWLink, { size: 299 });
        } else {
            console.log(`[${new Date().toLocaleTimeString()}] Loaded default nsfwjs model`);
            model = await nsfw.load();
        }
    }
    export async function detect(buffer: Buffer) {
        const image = await tf.node.decodeImage(buffer, 3);
        const predictions = await model.classify(image);
        image.dispose();
        return predictions;
    }
}