import { Card, AppCommand, AppFunc, BaseSession } from 'kbotify';
import auth from '../../configs/auth';
import * as pixiv from './common';
import axios from 'axios';
import config from '../../configs/config';
const FormData = require('form-data');
const sharp = require('sharp');
const got = require('got');

class Refresh extends AppCommand {
    code = 'refresh'; // 只是用作标记
    trigger = 'refresh'; // 用于触发的文字
    intro = 'Refresh';
    func: AppFunc<BaseSession> = async (session) => {
        var loadingBarMessageID: string = "null";
        if (session.args.length === 0) {
            pixiv.common.log(`From ${session.user.nickname} (ID ${session.user.id}), invoke ".pixiv ${this.trigger}"`);
            return session.reply("使用 `.pixiv help refresh` 查询指令详细用法")
        } else {
            pixiv.common.log(`From ${session.user.nickname} (ID ${session.user.id}), invoke ".pixiv ${this.trigger} ${session.args[0]}"`);
            const illust_id = session.args[0].toString();
            if (pixiv.linkmap.isInDatabase(illust_id)) {
                var rtLink = pixiv.linkmap.getLink(illust_id, "0")
                if (rtLink == pixiv.common.akarin) {
                    return session.reply("插画因为 R-18/R-18G 无法刷新缓存");
                }
                var loadingBarMessageID: string;
                pixiv.common.log(`Refreshing ${illust_id}_0.jpg`);
                axios({
                    url: `http://pixiv.lolicon.ac.cn/illustrationDetail`,
                    params: {
                        keyword: illust_id
                    }
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
                            'Authorization': `Bot ${auth.assetUploadToken}`,
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
                        await axios({
                            url: rtLink,
                            method: "GET"
                        }).then(() => {
                            pixiv.common.log("Uncensoring done");
                            uncensored = true;
                        }).catch(async () => {
                            pixiv.common.log(`Uncensoring failed, try ${7 * i}px of gaussian blur`);
                            bodyFormData = new FormData();
                            bodyFormData.append('file', await sharp(buffer).blur(7 * i).jpeg().toBuffer(), "1.jpg");
                            await axios({
                                method: "post",
                                url: "https://www.kookapp.cn/api/v3/asset/create",
                                data: bodyFormData,
                                headers: {
                                    'Authorization': `Bot ${auth.assetUploadToken}`,
                                    ...bodyFormData.getHeaders()
                                }
                            }).then((res: any) => {
                                rtLink = res.data.data.url
                            }).catch((e: any) => {
                                if (e) {
                                    session.sendCard(pixiv.cards.error(e));
                                }
                            });
                        })
                        if (uncensored) break;
                    }
                    if (!uncensored) {
                        session.updateMessage(loadingBarMessageID, [{
                            "type": "card",
                            "theme": "danger",
                            "size": "lg",
                            "modules": [
                                {
                                    "type": "section",
                                    "text": {
                                        "type": "kmarkdown",
                                        "content": `给 \`${val.id}_p0.jpg\` 施加了超过 100px 高斯模糊都救不回来…？属于是世间奇图了，请务必反馈到 Pixiv 酱的[交流服务器](https://kook.top/iOOsLu)中`
                                    }
                                }
                            ]
                        }])
                        pixiv.linkmap.addLink(val.id, "0", pixiv.common.akarin, detectionResult);
                    } else {
                        session.updateMessage(loadingBarMessageID, [{ // Send detail
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
                                                for (const v of val.tags) {
                                                    str += `[#${v.name}](https://www.pixiv.net/tags/${v.name.replace(")", "\\)")}/illustrations)${v.translated_name == null ? "" : ` ${v.translated_name}`} `
                                                }
                                                return str;
                                            })()}`
                                        }
                                    ]
                                }
                            ]
                        }]);
                        pixiv.linkmap.addLink(val.id, "0", rtLink, detectionResult);
                    }
                }).catch((e: any) => {
                    session.sendCard(pixiv.cards.error(e));
                });
            } else {
                return session.reply(`此插画（${illust_id}）当前没有缓存！（使用 \`.pixiv help refresh\` 查询指令详细用法）`);
            }
        };
    }
}

export const refresh = new Refresh();

