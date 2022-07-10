import { greenNodejs } from './aligreen';
import { type } from '../'

export namespace aligreen {
    export async function imageDetectionSync(imageURL: string): Promise<type.detectionResult> {
        var blurAmount = 0;
        var porn = false, terrorism = false, ad = false, live = false;
        function blur(v: any, block: number, blur: number, dodge: number) {
            switch (v.suggestion) {
                case "block":
                    blurAmount += block;
                    break;
                case "review":
                    if (v.rate > 95) {
                        blurAmount += block;
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
                        switch (v.label) {
                            case "porn":
                                switch (v.label) {
                                    case "porn": blur(v, 42, 35, 28); porn = true; break;
                                    case "sexy": blur(v, 28, 7, 0); porn = true; break;
                                }
                                break;
                            case "terrorism":
                                switch (v.label) {
                                    case "flag":
                                    case "logo":
                                    case "location":
                                    case "politics": blur(v, 42, 42, 35); terrorism = true; break;
                                    case "drug":
                                    case "bloody":
                                    case "others": blur(v, 42, 28, 14); terrorism = true; break;
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
                                    case "programCode": blur(v, 42, 42, 35); ad = true; break;
                                }
                                break;
                            case "live":
                                switch (v.label) {
                                    case "drug": blur(v, 42, 28, 14); live = true; break;
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