import { Card, AppCommand, AppFunc, BaseSession } from 'kbotify';
import auth from '../../configs/auth';
import * as pixiv from './common';
import axios from 'axios';
const FormData = require('form-data');
const sharp = require('sharp');
const got = require('got');

class Refresh extends AppCommand {
    code = 'refresh'; // 只是用作标记
    trigger = 'refresh'; // 用于触发的文字
    intro = 'Refresh';
    func: AppFunc<BaseSession> = async (session) => {
        console.log(`[${new Date().toLocaleTimeString()}] From ${session.user.nickname} (ID ${session.user.id}), invoke ".pixiv ${this.trigger} ${session.args[0]}"`);
        var loadingBarMessageID: string = "null";
        if (session.args.length === 0) {
            return session.reply("`.pixiv refresh [插画 ID]` 刷新对应 ID 插画的缓存。（当图片显示不正常时，可以在几分钟后运行此命令）")
        } else {
            const illust_id = session.args[0].toString();
            if (pixiv.linkmap.isInDatabase(illust_id)) {
                var rtLink = pixiv.linkmap.getLink(illust_id);
                if (rtLink == "https://img.kaiheila.cn/assets/2022-07/vlOSxPNReJ0dw0dw.jpg") {
                    return session.reply("插画因为 和谐/R-18/R-18G 无法刷新缓存");
                }
                var loadingBarMessageID: string;
                console.log(`[${new Date().toLocaleTimeString()}] Refreshing ${illust_id}_0.jpg`);
                axios.get(`http://pixiv.lolicon.ac.cn/illustrationDetail?keyword=${illust_id}`, {
                }).then(async (res: any) => {
                    if (res.data.hasOwnProperty("status") && res.data.status === 404) {
                        return session.reply("插画不存在或已被删除！")
                    }
                    const val = res.data;
                    if (val.x_restrict > 0) {
                        return session.reply("插画因为 R-18/R-18G 无法刷新缓存");
                    }
                    await session.sendCard([{
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
                    }]).then((data) => {
                        if (data.msgSent?.msgId !== undefined) {
                            loadingBarMessageID = data.msgSent.msgId;
                        }
                    });
                    var uncensored = false;
                    var blurr = 0;
                    let i: number;
                    for (i = 1; i <= 5; ++i) {
                        await axios({                                       // Check censorship
                            url: rtLink,
                            method: "GET"
                        }).then(() => {                                     // Image is not censored
                            uncensored = true;
                        }).catch(async () => {                              // Image is censored
                            await session.updateMessage(loadingBarMessageID, [{
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
                            const resizer = sharp().resize(512).jpeg();
                            const blurer = sharp().blur(i * 7).jpeg();      // Add i * 7px (up to 35px) of gaussian blur
                            const master1200 = val.image_urls.large.replace("i.pximg.net", "i.pixiv.re");
                            console.log(`[${new Date().toLocaleTimeString()}] Censorship detected, resaving with ${i * 7}px of gaussian blur`);
                            var stream = got.stream(master1200).pipe(resizer);
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
                        if (uncensored) { // Break as soon as image is not censored
                            blurr = (i - 1) * 7;
                            break;
                        }
                    }
                    if (!uncensored) { // If image still being censored after 35px of gaussian blur, fall back to Akarin
                        console.log(`[${new Date().toLocaleTimeString()}] Uncensor failed, falled back with Akarin`);
                        await session.updateMessage(loadingBarMessageID, [{
                            "type": "card",
                            "theme": "warning",
                            "size": "lg",
                            "modules": [
                                {
                                    "type": "section",
                                    "text": {
                                        "type": "kmarkdown",
                                        "content": `\`${val.id}_p0.jpg\` 反和谐失败……尽力了，35px 高斯模糊都救不了的涩图，一定是不一般的涩图`
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
                        rtLink = "https://img.kaiheila.cn/assets/2022-07/vlOSxPNReJ0dw0dw.jpg";
                    } else {
                        await session.updateMessage(loadingBarMessageID, [{
                            "type": "card",
                            "theme": "info",
                            "size": "lg",
                            "modules": [
                                {
                                    "type": "section",
                                    "text": {
                                        "type": "kmarkdown",
                                        "content": `\`${val.id}_p0.jpg\` ${(() => {
                                            if (blurr > 0) {
                                                return `反和谐成功……${blurr} px 高斯模糊下的涩图……这还能叫涩图吗…？`
                                            } else {
                                                return `反和谐结束……好像并不是一张涩图……`
                                            }
                                        })()}`
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
                    session.sendCard(new Card({
                        "type": "card",
                        "theme": "info",
                        "size": "lg",
                        "modules": [
                            {
                                "type": "section",
                                "text": {
                                    "type": "kmarkdown",
                                    "content": `**${val.title}**`
                                }
                            },
                            {
                                "type": "context",
                                "elements": [
                                    {
                                        "type": "kmarkdown",
                                        "content": `**[${val.user.name}](https://www.pixiv.net/users/${val.user.uid})**(${val.user.uid}) | [pid ${val.id}](https://www.pixiv.net/artworks/${val.id})`
                                    }
                                ]
                            },
                            {
                                "type": "divider"
                            },
                            {
                                "type": "container",
                                "elements": [
                                    {
                                        "type": "image",
                                        "src": rtLink
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
                                        "content": `${((): string => {
                                            var str = ""
                                            for (const vall of val.tags) {
                                                str += `[#${vall.name}](https://www.pixiv.net/tags/${vall.name}/illustrations) `
                                            }
                                            return str;
                                        })()}`
                                    }
                                ]
                            }
                        ]
                    }));
                    pixiv.linkmap.addLink(illust_id, rtLink);
                }).catch((e: any) => {
                    session.sendCard(pixiv.cards.error(e));
                });
            } else {
                return session.reply(`此插画（${illust_id}）当前没有缓存！`);
            }
        };
    }
}

export const refresh = new Refresh();

