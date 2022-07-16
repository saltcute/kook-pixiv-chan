import { greenNodejs } from './aligreen';
import { common, linkmap, type } from '../'
import config from 'configs/config';

export namespace aligreen {
    export async function imageDetectionSync(datas: any[]): Promise<{ [key: string]: type.detectionResult }> {
        var imageURL: { [key: string]: string } = {};
        var empty: boolean = true;
        for (const key in datas) {
            const val = datas[key];
            if (linkmap.isInDatabase(val.id) == false) {
                empty = false;
                imageURL = {
                    ...imageURL,
                    [val.id]: val.image_urls.large.replace("i.pximg.net", config.pixivProxyHostname)
                }
            }
        }
        if (empty) {
            return {};
        }
        common.log(`Aliyun image censoring started for:\n${Object.keys(imageURL).map(str => `${str}_p0.jpg`).join(", ")}`);
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
        await greenNodejs(Object.values(imageURL)).then((res) => {
            const data = res.data;
            if (data.code == 200) {
                for (const key in data.data) {
                    const val = data.data[key];
                    var blurAmount = 0;
                    var porn: type.banResult, terrorism: type.banResult, ad: type.banResult, live: type.banResult;
                    porn = terrorism = ad = live = {
                        ban: false,
                        probability: 100
                    }
                    for (const v of val.results) {
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
                    result = {
                        ...result,
                        [Object.keys(imageURL)[parseInt(key)]]: {
                            blur: blurAmount,
                            reason: {
                                terrorism: terrorism,
                                ad: ad,
                                live: live,
                                porn: porn,
                            }
                        }
                    }
                }
            }
        }).catch((e) => {
            if (e) {
                console.log(e);
            }
        });
        return result;
    }
}