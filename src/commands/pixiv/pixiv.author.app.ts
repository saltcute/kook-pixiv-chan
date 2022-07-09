import { Card, AppCommand, AppFunc, BaseSession } from 'kbotify';
import auth from '../../configs/auth';
import * as pixiv from './common';
import axios from 'axios';
const FormData = require('form-data');
const sharp = require('sharp');
const got = require('got');

class Author extends AppCommand {
    code = 'author'; // 只是用作标记
    trigger = 'author'; // 用于触发的文字
    intro = 'Author';
    func: AppFunc<BaseSession> = async (session) => {
        console.log(`[${new Date().toLocaleTimeString()}] From ${session.user.nickname} (ID ${session.user.id}), invoke ".pixiv ${this.trigger} ${session.args[0]}"`);
        var loadingBarMessageID: string = "null";
        async function sendCard(data: any) {
            var r18 = 0;
            var link: string[] = [];
            async function uploadImage() {
                for (const k in data) {
                    var val = data[k];
                    var key = link.length;
                    if (link.length >= 9) break;
                    if (val.x_restrict !== 0) {
                        r18++;
                        continue;
                    }
                    if (pixiv.linkmap.isInDatabase(val.id)) {
                        link.push(pixiv.linkmap.getLink(val.id));
                        continue;
                    } else {
                        const card = [new Card({
                            "type": "card",
                            "theme": "warning",
                            "size": "lg",
                            "modules": [
                                {
                                    "type": "section",
                                    "text": {
                                        "type": "kmarkdown",
                                        "content": `正在转存 \`${val.id}_p0.jpg\`，可能需要较长时间……(${key + 1}/9) ${key % 2 == 1 ? ":hourglass_flowing_sand:" : ":hourglass:"}……`
                                    }
                                }
                            ]
                        })]
                        if (loadingBarMessageID !== "null") {
                            await session.updateMessage(loadingBarMessageID, card)
                        } else {
                            await session.sendCard(card).then((data) => {
                                if (data.msgSent?.msgId !== undefined) {
                                    loadingBarMessageID = data.msgSent.msgId;
                                }
                            });
                        }
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
                                else if (val.probability > 0.45) buffer = await sharp(buffer).blur(7).jpeg().toBuffer();
                                if (val.probability > 0.45) NSFW = true;
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
                    link.push(rtLink);
                    pixiv.linkmap.addLink(val.id, rtLink);
                }
            }
            await uploadImage();
            for (let key = 0; key < 9; key++) {
                await axios({
                    url: link[key],
                    method: "GET"
                }).catch(() => {
                    link[key] = "https://img.kaiheila.cn/assets/2022-07/vlOSxPNReJ0dw0dw.jpg";
                });
            }
            while (link.length <= 9) {
                link.push(pixiv.common.akarin);
            }
            const card = [new Card({
                "type": "card",
                "theme": "info",
                "size": "lg",
                "modules": [
                    {
                        "type": "section",
                        "text": {
                            "type": "kmarkdown",
                            "content": `${(() => {
                                if (r18 > 9) {
                                    return `(spl)**${data[0].user.name}**(spl) 不可以涩涩`;
                                } else {
                                    return `**${data[0].user.name}**`
                                }
                            })()}`
                        }
                    },
                    {
                        "type": "context",
                        "elements": [
                            {
                                "type": "kmarkdown",
                                "content": `[uid ${data[0].user.uid}](https://www.pixiv.net/users/${data[0].user.uid})`
                            }
                        ]
                    },
                    {
                        "type": "divider"
                    },
                    {
                        "type": "image-group",
                        "elements": [
                            {
                                "type": "image",
                                "src": link[0]
                            },
                            {
                                "type": "image",
                                "src": link[1]
                            },
                            {
                                "type": "image",
                                "src": link[2]
                            },
                            {
                                "type": "image",
                                "src": link[3]
                            },
                            {
                                "type": "image",
                                "src": link[4]
                            },
                            {
                                "type": "image",
                                "src": link[5]
                            },
                            {
                                "type": "image",
                                "src": link[6]
                            },
                            {
                                "type": "image",
                                "src": link[7]
                            },
                            {
                                "type": "image",
                                "src": link[8]
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
            return session.reply(`.pixiv author [用户 ID] 获取用户的最新九张插画`)
        } else {
            axios({
                url: `http://pixiv.lolicon.ac.cn/creatorIllustrations`,
                method: "GET",
                params: {
                    keyword: session.args[0]
                }
            }).then((res: any) => {
                if (res.data.length === 0) {
                    return session.reply("用户不存在或此用户没有上传过插画！")
                }
                if (res.data.hasOwnProperty("code") && res.data.code == 400) {
                    return session.reply("请输入一个合法的用户ID（不需要括号[]）")
                }
                sendCard(res.data);
            }).catch((e: any) => {
                if (e) {
                    session.sendCard(pixiv.cards.error(e));
                }
            });
        }
    };
}

export const author = new Author();


