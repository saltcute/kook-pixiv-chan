import * as greenNodejs from './aligreen';
import { common, linkmap, type } from '../'
import { bot } from 'init/client';

export namespace aligreen {
    export const addDetectScene = greenNodejs.addScene;
    export const removeDetectScene = greenNodejs.removeScene;
    export const currentDetectScenes = greenNodejs.currentScenes;
    export const setServerRegion = greenNodejs.setRegion;
    export const getServerRegion = greenNodejs.getRegion;
    export const getServerHostname = greenNodejs.getHostname;
    export async function imageDetectionSync(datas: any[], ignoreLinkmap: boolean = false): Promise<{ [key: string]: type.detectionResult }> {
        var imageURL: { [key: string]: string } = {};
        var empty: boolean = true;
        for (const key in datas) {
            const val = datas[key];
            if (ignoreLinkmap || !linkmap.isInDatabase(val.id, "0")) {
                empty = false;
                imageURL = {
                    ...imageURL,
                    [val.id]: common.getProxiedImageLink(val.image_urls.medium)
                }
            }
        }
        if (empty) {
            return {};
        }
        bot.logger.info(`Aliyun image censoring started for:\n${Object.keys(imageURL).map(str => `${str}_p0.jpg`).join(", ")}`);
        function blur(v: any, block: number, censor: number, hide: number, blur: number, dodge: number) {
            switch (v.suggestion) {
                case "block":
                    return block;
                case "review":
                    if (v.rate == 100) {
                        return block;
                    } else if (v.rate > 99) {
                        return censor;
                    } else if (v.rate > 95) {
                        return hide;
                    } else if (v.rate > 90) {
                        return blur;
                    } else if (v.rate > 80) {
                        return dodge;
                    }
            }
            return 0;
        }
        var result: { [key: string]: type.detectionResult } = {};
        await greenNodejs.detect(Object.values(imageURL)).then((res) => {
            const data = res.data;
            if (data.code == 200) {
                for (const key in data.data) {
                    const val = data.data[key];
                    if (val.code == 200) {
                        var blurAmount = 0;
                        var porn: type.banResult | undefined, terrorism: type.banResult | undefined, ad: type.banResult | undefined, live: type.banResult | undefined;
                        porn = terrorism = ad = live = undefined;
                        for (const k in val.results) {
                            const v = val.results[k];
                            switch (v.scene) {
                                case "porn":
                                    switch (v.label) {
                                        case "porn": blurAmount += blur(v, 35, 28, 18, 14, 10); porn = { ban: true, label: v.label, probability: v.rate }; break;
                                        case "sexy": blurAmount += blur(v, 7, 7, 4, 0, 0); porn = { ban: true, label: v.label, probability: v.rate }; break;
                                    }
                                    break;
                                case "terrorism":
                                    switch (v.label) {
                                        case "flag":
                                        case "logo":
                                        case "location":
                                        case "politics": blurAmount += blur(v, 42, 35, 35, 35, 21); terrorism = { ban: true, label: v.label, probability: v.rate }; break;
                                        case "drug":
                                        case "bloody":
                                        case "others": blurAmount += blur(v, 42, 35, 28, 21, 14); terrorism = { ban: true, label: v.label, probability: v.rate }; break;
                                    }
                                    break;
                                case "ad":
                                    switch (v.label) {
                                        case "ad":
                                        case "npx":
                                        case "spam":
                                        case "porn":
                                        case "abuse":
                                        case "qrcode":
                                        case "politics":
                                        case "terrorism":
                                        case "contraband":
                                        case "programCode": blurAmount += blur(v, 42, 35, 35, 35, 21); ad = { ban: true, label: v.label, probability: v.rate }; break;
                                    }
                                    break;
                                case "live":
                                    switch (v.label) {
                                        case "drug": blurAmount += blur(v, 42, 35, 35, 35, 21); live = { ban: true, label: v.label, probability: v.rate }; break;
                                    }
                                    break;
                            }
                        }
                        result[Object.keys(imageURL)[parseInt(key)]] = {
                            status: val.code,
                            success: true,
                            blur: blurAmount,
                            reason: {
                                terrorism: terrorism,
                                ad: ad,
                                live: live,
                                porn: porn,
                            }
                        }
                    } else {
                        bot.logger.error("Aliyun returned error:");
                        bot.logger.error(val);
                        result[Object.keys(imageURL)[parseInt(key)]] = {
                            status: val.code,
                            success: false,
                            blur: 0
                        }
                    }
                }
            }
        }).catch((e) => {
            if (e) {
                console.error(e);
            }
        });
        return result;
    }
}