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
        var loadingBarMessageID: string = "null";
        async function sendCard(data: any) {
            var r18 = 0;
            var link: string[] = [];
            var pid: string[] = [];
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
                        link.push(pixiv.linkmap.getLink(val.id, "0"));
                        pid.push(val.id);
                        continue;
                    } else {
                        const card = [pixiv.cards.author(data[0], r18, link, pid, session, { resave: true, id: val.id })];
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
                    var detectionResult: pixiv.type.detectionResult;
                    var buffer = await sharp(await pixiv.common.stream2buffer(stream)).resize(512).jpeg().toBuffer(); // Resize stream and convert to buffer

                    if (auth.useAliyunGreen) {                            // Detect NSFW
                        pixiv.common.log(`Aliyun image censoring started for ${val.id}_p0.jpg.`);
                        const lowResDetectLink = val.image_urls.medium.replace("i.pximg.net", "i.pixiv.re");
                        detectionResult = await pixiv.aligreen.imageDetectionSync(lowResDetectLink);
                    } else {
                        pixiv.common.log(`NSFW.js image censoring started for ${val.id}_p0.jpg.`);
                        detectionResult = await pixiv.nsfwjs.getBlurAmount(buffer);
                    }
                    pixiv.common.log(`Detection done with a target of ${detectionResult.blur}px gaussian blur.`);
                    if (detectionResult.blur > 0) {
                        pixiv.common.log(`Image is NSFW, blurred.`);
                        session.updateMessage(loadingBarMessageID, [pixiv.cards.author(data[0], r18, link, pid, session, { nsfw: true, id: val.id })])
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
                            'Authorization': `Bot ${auth.khltoken} `,
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
                pid.push("没有了");
            }
            if (loadingBarMessageID == "null") {
                session.sendCard(pixiv.cards.author(data[0], r18, link, pid, session, {}))
            } else {
                session.updateMessage(loadingBarMessageID, [pixiv.cards.author(data[0], r18, link, pid, session, {})]);
            }
        }
        if (session.args.length === 0) {
            pixiv.common.log(`From ${session.user.nickname} (ID ${session.user.id}), invoke ".pixiv ${this.trigger}"`);
            return session.reply("使用 `.pixiv help author` 查询指令详细用法")
        } else {
            pixiv.common.log(`From ${session.user.nickname} (ID ${session.user.id}), invoke ".pixiv ${this.trigger} ${session.args[0]}"`);
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
                    return session.reply("请输入一个合法的用户ID（使用 `.pixiv help author` 查询指令详细用法）")
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


