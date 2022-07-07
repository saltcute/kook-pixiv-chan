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

                //Fetch illustration and resize to 512px
                const master1200 = val.image_urls.large.replace("i.pximg.net", "i.pixiv.re");
                console.log(`[${new Date().toLocaleTimeString()}] Resaving... ${master1200}`);
                var bodyFormData = new FormData();
                const resizer = sharp().resize(512).jpeg();
                const blurer = sharp().blur(10).jpeg();
                var stream: any;
                var bannedTag = false;
                for (let tags of val.tags) {
                    let tag = tags.name;
                    if (pixiv.common.isForbittedTag(tag)) {
                        session.updateMessage(loadingBarMessageID, [{
                            "type": "card",
                            "theme": "warning",
                            "size": "lg",
                            "modules": [
                                {
                                    "type": "section",
                                    "text": {
                                        "type": "kmarkdown",
                                        "content": `插画 \`${val.id}_p0.jpg\` 包含禁止的标签，正在预先施加高斯模糊……`
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
                        }]);
                        console.log(`[${new Date().toLocaleTimeString()}] ${val.id}_p0.jpg contains banned tags, applying blur in advance`);
                        bannedTag = true;
                        break;
                    }
                }
                if (bannedTag) {
                    stream = got.stream(master1200).pipe(resizer).pipe(blurer); // resize + blur
                } else {
                    stream = got.stream(master1200).pipe(resizer); // resize
                }
                // const stream = got.stream(master1200); // no resize
                bodyFormData.append('file', stream, "1.jpg");
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
                var uncensored = false;
                for (let i = 1; i <= 5; ++i) {
                    await axios({                                       // Check censorship
                        url: rtLink,
                        method: "GET"
                    }).then(() => {                                     // Image is not censored
                        uncensored = true;
                    }).catch(async () => {                              // Image is censored
                        const resizer = sharp().resize(512).jpeg();
                        const blurer = sharp().blur(i * 7).jpeg();      // Add i * 7px (up to 35px) of gaussian blur
                        const master1200 = val.image_urls.large.replace("i.pximg.net", "i.pixiv.re");
                        console.log(`[${new Date().toLocaleTimeString()}] Censorship detected, resaving with ${i * 7}px of gaussian blur`);
                        session.updateMessage(loadingBarMessageID, [{
                            "type": "card",
                            "theme": "warning",
                            "size": "lg",
                            "modules": [
                                {
                                    "type": "section",
                                    "text": {
                                        "type": "kmarkdown",
                                        "content": `\`${val.id}_p0.jpg\` 被和谐，尝试使用 ${i * 7}px 高斯模糊重新上传，可能需要较长时间${i % 2 == 0 ? ":hourglass_flowing_sand:" : ":hourglass:"}……`
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
                        var stream: any;
                        if (bannedTag) {
                            stream = got.stream(master1200).pipe(resizer).pipe(blurer); // resize + blur
                        } else {
                            stream = got.stream(master1200).pipe(resizer); // resize
                        }
                        const blur = stream.pipe(blurer);
                        var bodyFormData = new FormData();
                        bodyFormData.append('file', blur, "1.jpg");
                        await axios({                                   // Upload blured image to KOOK's server
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
                    });
                    if (uncensored) break; // Break as soon as image is not censored
                }
                if (!uncensored) { // If image still being censored after 35px of gaussian blur, fall back to Akarin
                    console.log(`[${new Date().toLocaleTimeString()}] Uncensor failed, falled back with Akarin`);
                    rtLink = "https://img.kaiheila.cn/assets/2022-07/vlOSxPNReJ0dw0dw.jpg";
                }
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
                url: `http://pixiv.lolicon.ac.cn/illustrationDetail?keyword=${session.args[0]}`,
                method: "GET"
            }).then((res: any) => {
                if (res.data.hasOwnProperty("status") && res.data.status === 404) {
                    return session.reply("插画不存在或已被删除！")
                }
                sendCard(res.data);
            }).catch((e: any) => {
                session.sendCard(pixiv.cards.error(e));
            });
        }
    };
}

export const illust = new Illust();


