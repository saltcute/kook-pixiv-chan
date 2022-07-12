import { greenNodejs } from './aligreen';
import { type } from '../'

export namespace aligreen {
    export async function imageDetectionSync(imageURL: string): Promise<type.detectionResult> {
        var blurAmount = 0;
        var porn: type.banResult, terrorism: type.banResult, ad: type.banResult, live: type.banResult;
        porn = terrorism = ad = live = {
            ban: false,
            probability: 100
        }
        function blur(v: any, block: number, hide: number, blur: number, dodge: number) {
            switch (v.suggestion) {
                case "block":
                    blurAmount += block;
                    break;
                case "review":
                    if (v.rate > 99) {
                        blurAmount += block;
                    } else if (v.rate > 95) {
                        blurAmount += hide;
                    } else if (v.rate > 90) {
                        blurAmount += blur;
                    } else if (v.rate > 80) {
                        blurAmount += dodge;
                    }
                    break;
            }
        }
        await greenNodejs(imageURL).then((res) => {
            const data = res.data;
            if (data.code == 200) {
                for (const val of data.data) {
                    for (const v of val.results) {
                        switch (v.scene) {
                            case "porn":
                                switch (v.label) {
                                    case "porn": blur(v, 21, 14, 7, 7); porn = { ban: true, label: v.label, probability: v.rate }; break;
                                    case "sexy": blur(v, 14, 7, 0, 0); porn = { ban: true, label: v.label, probability: v.rate }; break;
                                }
                                break;
                            case "terrorism":
                                switch (v.label) {
                                    case "flag":
                                    case "logo":
                                    case "location":
                                    case "politics": blur(v, 35, 35, 35, 21); terrorism = { ban: true, label: v.label, probability: v.rate }; break;
                                    case "drug":
                                    case "bloody":
                                    case "others": blur(v, 42, 28, 21, 14); terrorism = { ban: true, label: v.label, probability: v.rate }; break;
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
                                    case "programCode": blur(v, 35, 35, 35, 21); ad = { ban: true, label: v.label, probability: v.rate }; break;
                                }
                                break;
                            case "live":
                                switch (v.label) {
                                    case "drug": blur(v, 35, 35, 35, 21); live = { ban: true, label: v.label, probability: v.rate }; break;
                                }
                                break;
                        }
                    }
                }
            }
        }).catch((e) => {
            if (e) {
                console.log(e);
            }
        })
        return {
            blur: blurAmount,
            reason: {
                terrorism: terrorism,
                ad: ad,
                live: live,
                porn: porn,
            }
        };
    }
}