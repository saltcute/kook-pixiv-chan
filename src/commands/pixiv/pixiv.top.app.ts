import { Card, AppCommand, AppFunc, BaseSession } from 'kbotify';
import auth from '../../configs/auth';
import * as pixiv from './common';
import axios from 'axios';
import config from '../../configs/config';
const FormData = require('form-data');
const sharp = require('sharp');
const got = require('got');

class Top extends AppCommand {
    code = 'top'; // 只是用作标记
    trigger = 'top'; // 用于触发的文字
    intro = 'Top illustrations';
    func: AppFunc<BaseSession> = async (session) => {

        var loadingBarMessageID: string = "null";
        async function sendCard(data: any) {
            var link: string[] = [];
            var pid: string[] = [];
            async function uploadImage() {
                for (const k in data) {
                    var val = data[k];
                    var key = link.length;
                    if (link.length >= 9) break;
                    if (val.x_restrict !== 0) {
                        continue;
                    }
                    if (pixiv.linkmap.isInDatabase(val.id)) {
                        link.push(pixiv.linkmap.getLink(val.id, "0"));
                        pid.push(val.id);
                        continue;
                    } else {
                        const card = [pixiv.cards.top(link, pid, session, { resave: true, id: val.id })];
                        if (loadingBarMessageID !== "null") {
                            await session.updateMessage(loadingBarMessageID, card)
                        } else {
                            await session.sendCard(card).then((data) => {
                                if (data.msgSent?.msgId !== undefined) {
                                    loadingBarMessageID = data.msgSent.msgId;
                                }
                            })
                        }
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
                        session.updateMessage(loadingBarMessageID, [pixiv.cards.top(link, pid, session, { nsfw: true, id: val.id })])
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
                    link.push(rtLink);
                    pid.push(val.id);
                }
            }
            await uploadImage();
            while (link.length <= 9) {
                link.push(pixiv.common.akarin);
                pid.push("没有了");
            }
            if (loadingBarMessageID == "null") {
                session.sendCard(pixiv.cards.top(link, pid, session, {}))
            } else {
                session.updateMessage(loadingBarMessageID, [pixiv.cards.top(link, pid, session, {})]);
            }
        }
        if (session.args.length === 0) {
            pixiv.common.log(`From ${session.user.nickname} (ID ${session.user.id}), invoke ".pixiv ${this.trigger}"`);
            axios({
                url: `http://pixiv.lolicon.ac.cn/ranklist`,
                method: "GET"
            }).then((res: any) => {
                sendCard(res.data);
            }).catch((e: any) => {
                session.sendCard(pixiv.cards.error(e));
            });
        } else {
            pixiv.common.log(`From ${session.user.nickname} (ID ${session.user.id}), invoke ".pixiv ${this.trigger} ${session.args[0]}"`);
            axios({
                url: `http://pixiv.lolicon.ac.cn/topInTag`,
                method: "GET",
                params: {
                    keyword: session.args[0]
                }
            }).then((res: any) => {
                if (res.data.length == 0) {
                    return session.reply(`没有找到任何插画……可能是命令使用方式错误，输入 \`.pixiv help top\` 查看详细使用帮助\n如确定使用方式无误，则没有关于此标签**「${session.args[0]}」**的任何插画，请更换关键词再试一遍`);
                } else if (res.data.length <= 10) {
                    session.reply(`关于标签**「${session.args[0]}」**的插画数量极少……Pixiv酱仍会为你获取可用的插画\n但也可能是命令使用方式错误，输入 \`.pixiv help top\` 查看详细使用帮助`);
                }
                sendCard(res.data);
            }).catch((e: any) => {
                session.sendCard(pixiv.cards.error(e));
            });
        }
    };
}

export const top = new Top();


