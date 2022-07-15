import { Card, AppCommand, AppFunc, BaseSession } from 'kbotify';
import auth from '../../configs/auth';
import * as pixiv from './common';
import axios from 'axios';
import config from 'configs/config';
const FormData = require('form-data');
const sharp = require('sharp');
const got = require('got');

class Illust extends AppCommand {
    code = 'illust'; // 只是用作标记
    trigger = 'illust'; // 用于触发的文字
    intro = 'Illustration';
    func: AppFunc<BaseSession> = async (session) => {
        var loadingBarMessageID: string = "null";
        async function sendCard(data: any) {
            var link = "";
            async function uploadImage() { // Upload image
                const val = data;
                if (val.x_restrict !== 0) { // Reject explicit R-18 or R-18G illustrations
                    link = pixiv.common.akarin;
                    return;
                }
                if (pixiv.linkmap.isInDatabase(val.id)) {  // Return link if exist in linkmap
                    link = pixiv.linkmap.getLink(val.id, "0");
                    return;
                } else {                                   // Send loading message to user
                    await session.sendCard([
                        {
                            "type": "card",
                            "theme": "warning",
                            "size": "lg",
                            "modules": [
                                {
                                    "type": "section",
                                    "text": {
                                        "type": "kmarkdown",
                                        "content": `正在转存 \`${val.id}_p0.jpg\`，可能需要较长时间:hourglass_flowing_sand:……`
                                    }
                                }
                            ]
                        }
                    ]).then((data) => {
                        if (data.msgSent?.msgId !== undefined) {
                            loadingBarMessageID = data.msgSent.msgId;
                        }
                    });
                }

                const master1200 = val.image_urls.large.replace("i.pximg.net", config.pixivProxyHostname); // Get image link
                pixiv.common.log(`Resaving... ${master1200}`);
                var bodyFormData = new FormData();
                const stream = got.stream(master1200);                               // Get readable stream from origin
                var detectionResult: pixiv.type.detectionResult;
                var buffer = await sharp(await pixiv.common.stream2buffer(stream)).resize(512).jpeg().toBuffer(); // Resize stream and convert to buffer

                if (config.useAliyunGreen) {                            // Detect NSFW
                    pixiv.common.log(`Aliyun image censoring started for ${val.id}_p0.jpg.`);
                    const lowResDetectLink = val.image_urls.medium.replace("i.pximg.net", config.pixivProxyHostname);
                    detectionResult = await pixiv.aligreen.imageDetectionSync(lowResDetectLink);
                } else {
                    pixiv.common.log(`NSFW.js image censoring started for ${val.id}_p0.jpg.`);
                    detectionResult = await pixiv.nsfwjs.getBlurAmount(buffer);
                }
                pixiv.common.log(`Detection done with a target of ${detectionResult.blur}px gaussian blur.`);
                if (detectionResult.blur > 0) {
                    pixiv.common.log(`Image is NSFW, blurred.`);
                    session.updateMessage(loadingBarMessageID, [pixiv.cards.nsfw(val.id)])
                    buffer = await sharp(buffer).blur(detectionResult.blur).jpeg().toBuffer();
                }
                bodyFormData.append('file', buffer, "1.jpg");
                var rtLink = "";
                //Upload image to KOOK's server
                await axios({
                    method: "post",
                    url: "https://www.kookapp.cn/api/v3/asset/create",
                    data: bodyFormData,
                    headers: {
                        'Authorization': `Bot ${auth.assetUploadToken} `,
                        ...bodyFormData.getHeaders()
                    }
                }).then((res: any) => {
                    rtLink = res.data.data.url
                }).catch((e: any) => {
                    if (e) {
                        session.sendCard(pixiv.cards.error(e));
                    }
                });
                pixiv.linkmap.addLink(val.id, "0", rtLink, detectionResult);
                link = rtLink;
            }
            await uploadImage();
            const card = [new Card({
                "type": "card",
                "theme": "info",
                "size": "lg",
                "modules": [
                    {
                        "type": "container",
                        "elements": [
                            {
                                "type": "image",
                                "src": link
                            }
                        ]
                    },
                    {
                        "type": "divider"
                    },
                    {
                        "type": "context",
                        "elements": [
                            {
                                "type": "kmarkdown",
                                "content": `pid ${data.id} | [Pixiv](${`https://www.pixiv.net/artworks/${data.id}`})`
                            }
                        ]
                    }
                ]
            })]
            if (loadingBarMessageID == "null") {
                session.sendCard(card)
            } else {
                session.updateMessage(loadingBarMessageID, card);
            }
        }
        if (session.args.length === 0) {
            pixiv.common.log(`From ${session.user.nickname} (ID ${session.user.id}), invoke ".pixiv ${this.trigger}"`);
            return session.reply("使用 `.pixiv help illust` 查询指令详细用法")
        } else {
            pixiv.common.log(`From ${session.user.nickname} (ID ${session.user.id}), invoke ".pixiv ${this.trigger} ${session.args[0]}"`);
            axios({
                url: `http://pixiv.lolicon.ac.cn/illustrationDetail`,
                method: "GET",
                params: {
                    keyword: session.args[0]
                }
            }).then((res: any) => {
                if (res.data.hasOwnProperty("status") && res.data.status === 404) {
                    return session.reply("插画不存在或已被删除！")
                }
                if (res.data.hasOwnProperty("code") && res.data.code == 400) {
                    return session.reply("请输入一个合法的插画ID（使用 `.pixiv help illust` 查询指令详细用法）")
                }
                sendCard(res.data);
            }).catch((e: any) => {
                session.sendCard(pixiv.cards.error(e));
            });
        }
    };
}

export const illust = new Illust();


