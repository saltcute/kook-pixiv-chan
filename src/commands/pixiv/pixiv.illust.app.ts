import { Card, AppCommand, AppFunc, BaseSession } from 'kbotify';
import auth from '../../configs/auth';
import * as pixiv from './common';
import axios from 'axios';
const FormData = require('form-data');
const sharp = require('sharp');
const got = require('got');

class Illust extends AppCommand {
    code = 'illust'; // 只是用作标记
    trigger = 'illust'; // 用于触发的文字
    intro = 'Illustration';
    func: AppFunc<BaseSession> = async (session) => {
        console.log(`[${new Date().toLocaleTimeString()}] From ${session.user.nickname} (ID ${session.user.id}), invoke ".pixiv ${this.trigger} ${session.args[0]}"`);
        var loadingBarMessageID: string = "null";
        async function sendCard(data: any) {
            var link = "";
            async function uploadImage() { // Upload image
                const val = data;
                if (val.x_restrict !== 0) { // Reject explicit R-18 or R-18G illustrations
                    link = "https://img.kaiheila.cn/assets/2022-07/vlOSxPNReJ0dw0dw.jpg";
                    pixiv.linkmap.addLink(val.id, link);
                    return;
                }
                if (pixiv.linkmap.isInDatabase(val.id)) {  // Return link if exist in linkmap
                    link = pixiv.linkmap.getLink(val.id);
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

                const master1200 = val.image_urls.large.replace("i.pximg.net", "i.pixiv.re"); // Get image link
                console.log(`[${new Date().toLocaleTimeString()}] Resaving... ${master1200}`);
                var bodyFormData = new FormData();
                const stream = got.stream(master1200);                                        // Get readable stream from origin
                var buffer = await sharp(await pixiv.common.stream2buffer(stream)).resize(512).jpeg().toBuffer(); // Resize stream and convert to buffer
                const detection = await pixiv.nsfwjs.detect(buffer);                          // Detect NSFW
                var NSFW = false;
                for (let val of detection) {
                    switch (val.className) {
                        case "Hentai":
                        case "Porn":
                            if (val.probability > 0.9) buffer = await sharp(buffer).blur(42).jpeg().toBuffer();
                            else if (val.probability > 0.7) buffer = await sharp(buffer).blur(35).jpeg().toBuffer();
                            else if (val.probability > 0.35) buffer = await sharp(buffer).blur(7).jpeg().toBuffer();
                            if (val.probability > 0.35) NSFW = true;
                            break;
                        case "Sexy":
                            if (val.probability > 0.8) buffer = await sharp(buffer).blur(21).jpeg().toBuffer();
                            else if (val.probability > 0.6) buffer = await sharp(buffer).blur(7).jpeg().toBuffer();
                            if (val.probability > 0.6) NSFW = true;
                            break;
                        case "Drawing":
                        case "Natural":
                        default:
                            break;
                    }
                }
                if (NSFW) {
                    console.log(`[${new Date().toLocaleTimeString()}] Image is NSFW, blurred.`);
                    session.updateMessage(loadingBarMessageID, [{
                        "type": "card",
                        "theme": "warning",
                        "size": "lg",
                        "modules": [
                            {
                                "type": "section",
                                "text": {
                                    "type": "kmarkdown",
                                    "content": `\`${val.id}_p0.jpg\` 含有不宜内容，已自动添加模糊。`
                                }
                            },
                            {
                                "type": "context",
                                "elements": [
                                    {
                                        "type": "plain-text",
                                        "content": "请避免主动查询 擦边球/R-18/R-18G 插画"
                                    }
                                ]
                            }
                        ]
                    }])
                }
                bodyFormData.append('file', buffer, "1.jpg");
                var rtLink = "";
                //Upload image to KOOK's server
                await axios({
                    method: "post",
                    url: "https://www.kookapp.cn/api/v3/asset/create",
                    data: bodyFormData,
                    headers: {
                        'Authorization': `Bot ${auth.khltoken}`,
                        ...bodyFormData.getHeaders()
                    }
                }).then((res: any) => {
                    rtLink = res.data.data.url
                }).catch((e: any) => {
                    if (e) {
                        session.sendCard(pixiv.cards.error(e));
                    }
                });
                link = rtLink;
                pixiv.linkmap.addLink(val.id, rtLink);
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
            return session.reply("`.pixiv illust [插画 ID]` 获取 Pixiv 上对应 ID 的插画")
        } else {
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
                    return session.reply("请输入一个合法的插画ID（不需要括号[]）")
                }
                sendCard(res.data);
            }).catch((e: any) => {
                session.sendCard(pixiv.cards.error(e));
            });
        }
    };
}

export const illust = new Illust();


