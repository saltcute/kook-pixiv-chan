import { Card, AppCommand, AppFunc, BaseSession } from 'kbotify';
import auth from '../../configs/auth';
import * as pixiv from './common';
import axios from 'axios';
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
                        link.push(pixiv.linkmap.getLink(val.id));
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

                    const master1200 = val.image_urls.large.replace("i.pximg.net", "i.pixiv.re"); // Get image link
                    pixiv.common.log(`Resaving... ${master1200}`);
                    var bodyFormData = new FormData();
                    const stream = got.stream(master1200);                               // Get readable stream from origin
                    var NSFW = false;
                    var blurAmount: number = 0;
                    var blurReason: pixiv.type.blurReason;
                    var buffer = await sharp(await pixiv.common.stream2buffer(stream)).resize(512).jpeg().toBuffer(); // Resize stream and convert to buffer

                    if (auth.useAliyunGreen) {                            // Detect NSFW
                        pixiv.common.log(`Aliyun image censoring started for ${val.id}_p0.jpg.`);
                        const lowResDetectLink = val.image_urls.medium.replace("i.pximg.net", "i.pixiv.re");
                        const result = await pixiv.aligreen.imageDetectionSync(lowResDetectLink);
                        NSFW = result.blur > 0;
                        blurAmount = result.blur;
                        blurReason = result.reason;
                        pixiv.common.log(`Detection done with a target of ${blurAmount}px gaussian blur.`);
                    } else {
                        pixiv.common.log(`NSFW.js image censoring started for ${val.id}_p0.jpg.`);
                        const result = await pixiv.nsfwjs.getBlurAmount(buffer);
                        NSFW = result.blur > 0;
                        blurAmount = result.blur;
                        blurReason = result.reason;
                        pixiv.common.log(`Detection done with a target of ${blurAmount}px gaussian blur.`);
                    }
                    if (NSFW) {
                        pixiv.common.log(`Image is NSFW, blurred.`);
                        session.updateMessage(loadingBarMessageID, [pixiv.cards.top(link, pid, session, { nsfw: true, id: val.id })])
                        buffer = await sharp(buffer).blur(blurAmount).jpeg().toBuffer();
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
                    pid.push(val.id);
                    pixiv.linkmap.addLink(val.id, rtLink);
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
                sendCard(res.data);
            }).catch((e: any) => {
                session.sendCard(pixiv.cards.error(e));
            });
        }
    };
}

export const top = new Top();


