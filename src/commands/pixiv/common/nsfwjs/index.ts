import { type, common } from "../";
import auth from '../../../../configs/auth'
const nsfw = require('nsfwjs')
const tf = require('@tensorflow/tfjs-node');

var model: any;

export namespace nsfwjs {
    export async function init() {
        if (auth.customNSFWModel) {
            common.log(`Loaded custom nsfwjs model at ${auth.customNSFWLink}`);
            model = await nsfw.load(auth.customNSFWLink, { size: 299 });
        } else {
            common.log(`Loaded default nsfwjs model`);
            model = await nsfw.load();
        }
    }
    export async function detect(buffer: Buffer) {
        const image = await tf.node.decodeImage(buffer, 3);
        const predictions = await model.classify(image);
        image.dispose();
        return predictions;
    }
    export async function getBlurAmount(buffer: Buffer): Promise<type.detectionResult> {
        var blurAmount = 0;
        var NSFW = { ban: false, probability: 100 };
        await detect(buffer).then((res) => {
            for (let val of res) {
                switch (val.className) {
                    case "Hentai":
                    case "Porn":
                        if (val.probability > 0.9) blurAmount += 42;
                        else if (val.probability > 0.7) blurAmount += 35;
                        else if (val.probability > 0.5) blurAmount += 21;
                        else if (val.probability > 0.3) blurAmount += 7;
                        if (val.probability > 0.3) NSFW = { ban: true, probability: val.probability };
                        break;
                    case "Sexy":
                        if (val.probability > 0.8) blurAmount += 21;
                        else if (val.probability > 0.6) blurAmount += 7;
                        if (val.probability > 0.6) NSFW = { ban: true, probability: val.probability };
                        break;
                    case "Drawing":
                    case "Natural":
                    default:
                        break;
                }
            }
        }).catch((e) => {
            console.log(e);
        });
        return {
            blur: blurAmount,
            reason: {
                terrorism: { ban: false, probability: 100 },
                ad: { ban: false, probability: 100 },
                live: { ban: false, probability: 100 },
                porn: NSFW
            }
        };
    }
}