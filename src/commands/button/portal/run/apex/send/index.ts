
import axios from 'axios';
import * as pixiv from 'commands/pixiv/common'
import FormData from 'form-data';
import got from 'got/dist/source';
import { bot } from 'init/client';
import { ButtonClickEvent } from 'kaiheila-bot-root';
import sharp from 'sharp';
export default async function (event: ButtonClickEvent, action: string[], data: any) {
    const trigger = data.trigger;
    switch (trigger) {
        case 'multi': {
            let idx = data.index,
                pid = data.pid,
                link = data.link,
                type = data.type,
                curIndex = pid[idx],
                curLink = link[idx];
            await pixiv.common.getIllustDetail(curIndex).then((res) => {
                bot.API.message.update(event.targetMsgId, pixiv.cards.multiDetail(res, curLink, idx, pid, link, type, {
                    isVIP: true,
                    isSent: true
                }, data).toString(), undefined, event.userId);
            })
            pixiv.common.getIllustDetail(curIndex).then(async (res) => {
                const pdata = res;
                const originalImageURL = (pdata.page_count > 1 ? pdata.meta_pages[0].image_urls.original : pdata.meta_single_page.original_image_url) || pixiv.common.akarin;
                const master1200 = pixiv.common.getProxiedImageLink(originalImageURL.replace(/\/c\/[a-zA-z0-9]+/gm, "")); // Get image link
                bot.logger.debug(`ApexConnect: Downloading ${master1200}`);
                var bodyFormData = new FormData();
                const stream = got.stream(master1200);                               // Get readable stream from origin
                const censor = pixiv.linkmap.getDetection(curIndex, "0");
                var sp = sharp(await pixiv.common.stream2buffer(stream))
                if (censor.blur) sp = sp.blur(censor.blur);
                var buffer = await (sp.jpeg({ quality: 90 }).toBuffer()); // Encode to jpeg and convert to buffer
                bodyFormData.append('file', buffer, "image.png");
                await axios({
                    method: "post",
                    url: "https://www.kookapp.cn/api/v3/asset/create",
                    data: bodyFormData,
                    headers: {
                        'Authorization': `Bot ${await pixiv.common.getNextToken()}`,
                        ...bodyFormData.getHeaders()
                    }
                }).then((res: any) => {
                    bot.logger.debug(`ApexConnect: Upload ${curIndex} success`);
                    const link = res.data.data.url;
                    const body = {
                        kook: {
                            user_id: event.userId,
                            username: event.user.username,
                            identify_num: event.user.identifyNum
                        },
                        pixiv: {
                            illust_id: curIndex,
                            illust_page: "0",
                            image_original: master1200,
                            image_censored: link,
                            aliyun_result: {
                                "raw": pixiv.linkmap.getDetection(curIndex, "0"),
                                "suggestion": pixiv.linkmap.getSuggestion(curIndex, "0")
                            }
                        }
                    }
                    // console.dir(body, { depth: null });
                    pixiv.common.sendApexImage(body).then(() => {
                        pixiv.common.getIllustDetail(curIndex).then((res) => {
                            bot.API.message.update(event.targetMsgId, pixiv.cards.multiDetail(res, curLink, idx, pid, link, type, {
                                isVIP: true,
                                isSuccess: true
                            }, data).toString(), undefined, event.userId).then(() => {
                                setTimeout(() => {
                                    pixiv.common.getApexVIPStatus(event.userId).then((rep) => {
                                        bot.API.message.update(event.targetMsgId, pixiv.cards.multiDetail(res, curLink, idx, pid, link, type, { isVIP: rep.data.is_vip }, data).toString(), undefined, event.userId);
                                    })
                                }, 1500);
                            })
                        })
                    }).catch((e) => {
                        bot.logger.warn("ApexConnect: Update user setting failed");
                        bot.logger.warn(e.message);
                        bot.API.message.update(event.targetMsgId, pixiv.cards.error(e).toString(), undefined, event.userId);
                    })
                }).catch(async (e) => {
                    bot.logger.warn(`ApexConnect: Upload ${curIndex} failed`);
                    bot.logger.warn(e);
                    bot.API.message.update(event.channelId, pixiv.cards.error(e.stack).toString(), undefined, event.userId);
                });
            }).catch((e) => {
                bot.logger.warn(e);
                bot.API.message.update(event.targetMsgId, pixiv.cards.error(e.stack).toString(), undefined, event.userId);
            });
        };
        case 'detail': {
            let curIndex = data.pid,
                curLink = data.link;
            await pixiv.common.getIllustDetail(curIndex).then((res) => {
                bot.API.message.update(event.targetMsgId, pixiv.cards.detail(res, curLink, {
                    isVIP: true,
                    isSent: true
                }).toString(), undefined, event.userId);
            })
            pixiv.common.getIllustDetail(curIndex).then(async (res) => {
                const pdata = res;
                const originalImageURL = (pdata.page_count > 1 ? pdata.meta_pages[0].image_urls.original : pdata.meta_single_page.original_image_url) || pixiv.common.akarin;
                const master1200 = pixiv.common.getProxiedImageLink(originalImageURL.replace(/\/c\/[a-zA-z0-9]+/gm, "")); // Get image link
                bot.logger.debug(`ApexConnect: Downloading ${master1200}`);
                var bodyFormData = new FormData();
                const stream = got.stream(master1200);                               // Get readable stream from origin
                const censor = pixiv.linkmap.getDetection(curIndex, "0");
                var sp = sharp(await pixiv.common.stream2buffer(stream))
                if (censor.blur) sp = sp.blur(censor.blur);
                var buffer = await (sp.jpeg({ quality: 90 }).toBuffer()); // Encode to jpeg and convert to buffer
                bodyFormData.append('file', buffer, "image.png");
                await axios({
                    method: "post",
                    url: "https://www.kookapp.cn/api/v3/asset/create",
                    data: bodyFormData,
                    headers: {
                        'Authorization': `Bot ${await pixiv.common.getNextToken()}`,
                        ...bodyFormData.getHeaders()
                    }
                }).then((res: any) => {
                    bot.logger.debug(`ApexConnect: Upload ${curIndex} success`);
                    const link = res.data.data.url;
                    const body = {
                        kook: {
                            user_id: event.userId,
                            username: event.user.username,
                            identify_num: event.user.identifyNum
                        },
                        pixiv: {
                            illust_id: curIndex,
                            illust_page: "0",
                            image_original: master1200,
                            image_censored: link,
                            aliyun_result: {
                                "raw": pixiv.linkmap.getDetection(curIndex, "0"),
                                "suggestion": pixiv.linkmap.getSuggestion(curIndex, "0")
                            }
                        }
                    }
                    // console.dir(body, { depth: null });
                    pixiv.common.sendApexImage(body).then(() => {
                        pixiv.common.getIllustDetail(curIndex).then((res) => {
                            bot.API.message.update(event.targetMsgId, pixiv.cards.detail(res, curLink, {
                                isVIP: true,
                                isSuccess: true
                            }).toString(), undefined, event.userId).then(() => {
                                setTimeout(() => {
                                    pixiv.common.getApexVIPStatus(event.userId).then((rep) => {
                                        bot.API.message.update(event.targetMsgId, pixiv.cards.detail(res, curLink, { isVIP: rep.data.is_vip }).toString(), undefined, event.userId);
                                    })
                                }, 1500);
                            })
                        })
                    }).catch((e) => {
                        bot.logger.warn("ApexConnect: Update user setting failed");
                        bot.logger.warn(e.message);
                        bot.API.message.update(event.targetMsgId, pixiv.cards.error(e).toString(), undefined, event.userId);
                    })
                }).catch(async (e) => {
                    bot.logger.warn(`ApexConnect: Upload ${curIndex} failed`);
                    bot.logger.warn(e);
                    bot.API.message.update(event.channelId, pixiv.cards.error(e.stack).toString(), undefined, event.userId);
                });
            }).catch((e) => {
                bot.logger.warn(e);
                bot.API.message.update(event.targetMsgId, pixiv.cards.error(e.stack).toString(), undefined, event.userId);
            });
        };
    }
}