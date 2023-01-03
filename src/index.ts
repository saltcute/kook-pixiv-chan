import { bot } from 'init/client';
import { pixivMenu } from 'commands/pixiv/pixiv.menu';
import { pixivAdminMenu } from 'commands/pixiv/admin/pixivadmin.menu';
import * as pixiv from 'commands/pixiv/common'
import * as pixivadmin from 'commands/pixiv/admin/common'
import axios from 'axios';
import auth from 'configs/auth';
import config from 'configs/config';
import fs from 'fs';
import crypto from 'crypto';
import * as luxon from 'luxon'
import schedule from 'node-schedule';
import { random } from 'commands/pixiv/pixiv.random.app';
import { top } from 'commands/pixiv/pixiv.top.app';
import { detail } from 'commands/pixiv/pixiv.detail.app';
import { author } from 'commands/pixiv/pixiv.author.app';
import { ButtonEventMessage, Card, TextMessage } from 'kbotify';
import { tag } from 'commands/pixiv/pixiv.tag.app';
import { gui } from 'commands/pixiv/pixiv.gui.app';
import FormData from 'form-data';
import got from 'got/dist/source';
import sharp from 'sharp';
import upath from 'upath';


const logFolderPath = upath.join(__dirname, 'configs', 'logs', new Date().toISOString())
if (!fs.existsSync(logFolderPath)) {
    fs.mkdirSync(logFolderPath, { recursive: true });
}
const traceLogStream = fs.createWriteStream(upath.join(logFolderPath, 'kook-pixiv-chan-trace.log'), { flags: 'a' });
const debugLogStream = fs.createWriteStream(upath.join(logFolderPath, 'kook-pixiv-chan-debug.log'), { flags: 'a' });
const infoLogStream = fs.createWriteStream(upath.join(logFolderPath, 'kook-pixiv-chan-info.log'), { flags: 'a' });
bot.logger.fields.name = "kook-pixiv-chan";

bot.logger.addStream({ level: 'trace', stream: traceLogStream });
bot.logger.addStream({ level: 'debug', stream: debugLogStream });
bot.logger.addStream({ level: 'info', stream: infoLogStream });
bot.logger.addStream({ level: 'info', stream: process.stdout });

bot.logger.info("Initialization: kook-pixiv-chan initialization start");

(async () => {
    /**
     * Linkmap initialization
     */
    await pixiv.linkmap.init();
    await pixiv.common.tokenPoolInit();
    await pixivadmin.common.load();
    await botActivityStatus();
    bot.logger.info("Initialization: Done");
    bot.connect();
})()
schedule.scheduleJob('0,15,30,45 * * * *', async () => {
    pixiv.linkmap.save();
    pixivadmin.common.save();
    await pixiv.linkmap.upload();
})
schedule.scheduleJob('0,10,20,30,40,50 * * * *', async () => {
    botActivityStatus();
})

/**
 * Aliyun green initilization
 */
if (config.useAliyunChina) {
    pixiv.aligreen.setServerRegion("Shenzhen");
} else {
    pixiv.aligreen.setServerRegion("Singapore");
}

/**
 * Bot Market Initializatiojn
 */
if (config.enableBotMarket) {
    botMarketStayOnline();
}

bot.addCommands(pixivMenu);
bot.addCommands(pixivAdminMenu);

/**
 * Add Chinese alias
 */
bot.addAlias(pixivMenu, "p站", "P站");
pixivMenu.addAlias(top, "热门");
pixivMenu.addAlias(random, "随机");
pixivMenu.addAlias(detail, "插画");
pixivMenu.addAlias(author, "作者", "画师");
pixivMenu.addAlias(gui, "GUI", "GUi", "GuI", "Gui", "guI", "gUI", "gUi");
bot.addAlias(top, "p站热门", "P站热门", "pixiv热门");
bot.addAlias(random, "p站随机", "P站随机", "pixiv随机");
bot.addAlias(detail, "p站插画", "P站插画", "pixiv插画");
bot.addAlias(author, "p站作者", "P站作者", "pixiv作者", "p站画师", "P站画师", "pixiv画师");

/**
 * Add quick hand alias for .pixiv random and .pixiv top
 */
bot.addAlias(random, "色图", "涩图", "setu", "瑟图", "蛇图")
bot.addAlias(top, "不色图", "不涩图", "busetu", "不瑟图", "不蛇图")

bot.on('kmarkdownMessage', (event) => {
    // if (event.mention.user.includes(bot.userId)) { // Quote bot
    if (new RegExp(String.raw`^(\(met\)${bot.userId}\(met\))? ?[再在]?多?来[一俩二仨三四五六七八九十百千万亿兆京]*[张点][不]?[涩色瑟蛇]?图?$`).test(event.content)) {
        bot.axios({
            url: '/v3/message/view',
            params: {
                msg_id: event.msgId
            }
        }).then((res) => {
            const data = res.data.data;
            try {
                const text = new TextMessage(event, bot);
                random.exec('random', [], text);
                /*
                const quote = JSON.parse(data.quote.content)[0] || JSON.parse(data.quote.content);
                const type = quote.modules.filter((val: any) => { return val.type == 'action-group' }).map((val: any) => val.elements.map((val: any) => JSON.parse(val.value).data.type));
                const pid = quote.modules.filter((val: any) => { return val.type == 'action-group' }).map((val: any) => val.elements.map((val: any) => JSON.parse(val.value).data.pid));
                switch (type[0][0]) {
                    case 'random':
                    case 'top':
                    case 'author':
                        const text = new TextMessage(event, bot);
                        random.exec('random', [], text);
                        break;
                    case 'detail':
                    case 'illust':
                        bot.logger.debug("Fuck KOOK cuz user invoked detail/illust")
                        break;
                    default:
                }
                */
            } catch (e) { bot.logger.error(e) };
        })
    }
    // }
})

bot.on("buttonClick", async (event) => {
    try {
        const buttonValue = JSON.parse(event.value);
        const action = buttonValue.action.split(".");
        const data = buttonValue.data;
        bot.logger.debug(`ButtonClicked: From ${event.user.username}#${event.user.identifyNum} (ID ${event.userId} in (${event.guildId}/${event.channelId}), invoke ${buttonValue.action}`);
        // return;
        switch (action[0]) {
            // TODO: convert legacy event
            case "portal":
                switch (action[1]) {
                    case "view": {
                        let idx = data.index,
                            pid = data.pid,
                            link = data.link,
                            type = data.type,
                            curIndex = pid[idx],
                            curLink = link[idx];
                        // console.log([idx, pid, link, type, curIndex, curLink].join('\n'))
                        switch (action[2]) {
                            case "detail":
                                const apex = await pixiv.common.getApexVIPStatus(event.userId);
                                pixiv.common.getIllustDetail(curIndex).then((res) => {
                                    bot.API.message.update(event.targetMsgId, pixiv.cards.multiDetail(res.data, curLink, idx, pid, link, type, {
                                        isVIP: apex.data.is_vip
                                    }, data).toString(), undefined, event.userId);
                                })
                                break;
                            case "return_from_detail":
                                const durationName = data.durationName
                                var card: Card;
                                switch (type) {
                                    case "top":
                                        card = pixiv.cards.top(link, pid, durationName, {}).addModule(pixiv.cards.GUI.returnButton([{ action: "GUI.run.command.top", text: "上级" }, { action: "GUI.view.command.list", text: "命令列表" }]));
                                        break;
                                    case "tag":
                                        const tags = data.tags;
                                        card = pixiv.cards.tag(link, pid, tags, durationName, {}).addModule(pixiv.cards.GUI.returnButton([{ action: "GUI.view.command.list" }]));
                                        break;
                                    case "random":
                                        card = pixiv.cards.random(link, pid, {}).addModule(pixiv.cards.GUI.returnButton([{ action: "GUI.view.command.list" }]));;
                                        break;
                                    case "author":
                                        const data_ = data.data,
                                            r18 = data.r18;
                                        card = pixiv.cards.author(data_, r18, link, pid, {}).addModule(pixiv.cards.GUI.returnButton([{ action: "GUI.view.command.list" }]));;
                                        break;
                                    default:
                                        card = pixiv.cards.error("无法加载卡片")
                                        break;
                                }
                                bot.API.message.update(event.targetMsgId, card.toString(), undefined, event.userId);
                                break;
                            case 'apex':
                                switch (action[3]) {
                                    case 'VIP':
                                        let pdata = (await pixiv.common.getIllustDetail(curIndex)).data
                                        let apexUserInfo = (await pixiv.common.getApexVIPStatus(event.userId)).data;
                                        // console.log(curIndex);
                                        // console.log(pixiv.linkmap.getLink(curIndex, "0"));
                                        let apexPreviewImageLink = (await pixiv.common.getApexImagePreview(pixiv.linkmap.getLink(curIndex, "0"), apexUserInfo.originData.uid)).url;
                                        bot.logger.debug("ApexConnect: Fetched data for preview");
                                        // bot.logger.debug("ApexConnect: Get preview done");
                                        bot.API.message.update(event.targetMsgId, pixiv.cards.multiDetail(pdata, curLink, idx, pid, link, type, {
                                            isVIP: true,
                                            isSendButtonClicked: true,
                                            sendButtonPreviewImageLink: apexPreviewImageLink
                                        }, data).toString(), undefined, event.userId).then(() => {
                                            bot.logger.debug("ApexConnect: Sent preview");
                                        }).catch((e) => {
                                            bot.logger.error(e);
                                        })
                                        break;
                                    case 'normal':
                                        pixiv.common.getIllustDetail(curIndex).then((res) => {
                                            bot.API.message.update(event.targetMsgId, pixiv.cards.multiDetail(res.data, curLink, idx, pid, link, type, {
                                                isSendButtonClicked: true
                                            }, data).toString(), undefined, event.userId);
                                        }).catch((e) => {
                                            bot.logger.error(e);
                                        })
                                        break;
                                }
                                break;
                        }
                        break;
                    }
                    case 'run': {
                        let idx = data.index,
                            pid = data.pid,
                            link = data.link,
                            type = data.type,
                            curIndex = pid[idx],
                            curLink = link[idx];
                        switch (action[2]) {
                            case 'apex':
                                switch (action[3]) {
                                    case 'send':
                                        await pixiv.common.getIllustDetail(curIndex).then((res) => {
                                            bot.API.message.update(event.targetMsgId, pixiv.cards.multiDetail(res.data, curLink, idx, pid, link, type, {
                                                isVIP: true,
                                                isSent: true
                                            }, data).toString(), undefined, event.userId);
                                        })
                                        pixiv.common.getIllustDetail(curIndex).then(async (res) => {
                                            const pdata = res.data;
                                            const originalImageURL = pdata.page_count > 1 ? pdata.meta_pages[0].image_urls.original : pdata.meta_single_page.original_image_url
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
                                                        bot.API.message.update(event.targetMsgId, pixiv.cards.multiDetail(res.data, curLink, idx, pid, link, type, {
                                                            isVIP: true,
                                                            isSuccess: true
                                                        }, data).toString(), undefined, event.userId).then(() => {
                                                            setTimeout(() => {
                                                                pixiv.common.getApexVIPStatus(event.userId).then((rep) => {
                                                                    bot.API.message.update(event.targetMsgId, pixiv.cards.multiDetail(res.data, curLink, idx, pid, link, type, { isVIP: rep.data.is_vip }, data).toString(), undefined, event.userId);
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
                                        break;
                                }
                                break;
                        }
                        break;
                    }
                    case 'error':
                        switch (action[2]) {
                            case 'reset':
                                // console.log(event);
                                bot.axios({
                                    url: '/v3/message/view',
                                    params: {
                                        msg_id: event.targetMsgId,
                                    }
                                }).then((res) => {
                                    // console.log(res.data);
                                    bot.API.message.update(event.targetMsgId, res.data.data.content, undefined, event.userId)
                                        .catch((e) => {
                                            bot.logger.error(e);
                                        })
                                }).catch((e) => {
                                    bot.logger.error(e);
                                })
                                break;
                        }
                        break;
                }
                break;
            case "GUI":
                switch (action[1]) {
                    case "view":
                        switch (action[2]) {
                            case "main":
                                bot.API.message.update(event.targetMsgId, pixiv.cards.GUI.main().toString(), undefined, event.userId);
                                break;
                            case "command":
                                switch (action[3]) {
                                    case "list":
                                        bot.API.message.update(event.targetMsgId, pixiv.cards.GUI.command.list().toString(), undefined, event.userId);
                                        break;
                                }
                                break;
                            case "credits":
                                bot.API.message.update(event.targetMsgId, pixiv.cards.credit()
                                    .addModule(pixiv.cards.GUI.returnButton([{ action: "GUI.view.main" }]))
                                    .toString(),
                                    undefined, event.userId);
                                break;
                            case "profile":
                                pixiv.users.detail({
                                    id: event.user.id,
                                    identifyNum: event.user.identifyNum,
                                    username: event.user.username,
                                    avatar: event.user.avatar
                                }).then((res) => {
                                    bot.API.message.update(event.targetMsgId, pixiv.cards.profile(res)
                                        .addModule(pixiv.cards.GUI.returnButton([{ action: "GUI.view.main" }]))
                                        .toString(),
                                        undefined, event.userId);
                                }).catch((e) => {
                                    bot.logger.warn(e);
                                    bot.API.message.update(event.targetMsgId, pixiv.cards.error(e.stack).toString(), undefined, event.userId);
                                });
                                break;
                            case "settings":
                                break;
                        }
                        break;
                    case "run":
                        switch (action[2]) {
                            case "command":
                                function textTrigger(callback: (msg: string) => any) {
                                    const trigger = (eve: TextMessage) => {
                                        if (eve.authorId != event.userId) return;
                                        if (eve.channelId != event.channelId) return;
                                        if (eve.content.split(" ").length == 0) return;
                                        bot.API.message.update(event.targetMsgId, new Card().addText(`已接收关键字，正在处理请求…`).toString(), undefined, event.userId);
                                        bot.message.off("text", trigger)
                                        clearTimeout(timeout)
                                        callback(eve.content);
                                        bot.message.off("text", trigger);
                                    }
                                    bot.message.on("text", trigger);
                                    var count: number = 60;
                                    var timeout: NodeJS.Timeout;
                                    const counter = () => {
                                        if (count == 0) {
                                            bot.API.message.update(event.targetMsgId, new Card().addText(`超时未收到关键字…将在3秒后返回上级菜单`).toString(), undefined, event.userId);
                                            bot.message.off("text", trigger)
                                            setTimeout(() => {
                                                bot.API.message.update(event.targetMsgId, pixiv.cards.GUI.command.list().toString(), undefined, event.userId);
                                            }, 3000);
                                            clearTimeout(timeout)
                                            return;
                                        }
                                        bot.API.message.update(event.targetMsgId, new Card().addText(`请在 ${count} 秒内发送直接发送关键字以进行搜索`).toString(), undefined, event.userId);
                                        count--;
                                        timeout = setTimeout(counter, 1000);
                                    }
                                    counter();
                                }
                                switch (action[3]) {
                                    case "top":
                                        if (action[4]) {
                                            top.exec("top", [action[4], `GUI.${event.targetMsgId}`], new ButtonEventMessage(event, bot));
                                        } else {
                                            bot.API.message.update(event.targetMsgId, pixiv.cards.GUI.command.top().toString(), undefined, event.userId);
                                        }
                                        break;
                                    case "random":
                                        random.exec("random", [`GUI.${event.targetMsgId}`], new ButtonEventMessage(event, bot));
                                        break;
                                    case "author":
                                        textTrigger((msg) => {
                                            author.exec("author", msg.split(" ").concat([`GUI.${event.targetMsgId}`]), new ButtonEventMessage(event, bot));
                                        });
                                        break;
                                    case "tag":
                                        textTrigger((msg) => {
                                            tag.exec("tag", [`GUI.${event.targetMsgId}`].concat(msg.split(" ")), new ButtonEventMessage(event, bot));
                                        });
                                        break;
                                    case "detail":
                                        textTrigger((msg) => {
                                            detail.exec("detail", msg.split(" ").concat([`GUI.${event.targetMsgId}`]), new ButtonEventMessage(event, bot));
                                        });
                                        break;
                                    default:
                                        bot.logger.warn(`ButtonEvent: Unrecognized command ${buttonValue.action}`);
                                        break;
                                }
                                break;
                        }
                        break;
                }
        }
    } catch (e: any) { // Compatibility
        const identifier = event.value.split("|")[0];
        if (identifier == "view_detail" || identifier == "view_return") {
            bot.API.message.update(event.targetMsgId, pixiv.cards.error("此卡片来自旧版 Pixiv酱，现已无法使用").toString(), undefined, event.userId);
        } else {
            bot.logger.error(e.stack);
            bot.API.message.update(event.targetMsgId, pixiv.cards.error(`唤起按钮事件时出错：\n${event.value}\n\n错误信息：\n${e.stack}`).toString(), undefined, event.userId);
        }
    }
})

async function getRandomStatus(): Promise<[string, string]> {
    try {
        switch (crypto.randomInt(6)) {
            case 0:
                const serverCount = (await bot.API.guild.list()).meta.total;
                return ["ヘキソナ", `${serverCount} 个服务器的涩图要求`];
            case 1:
                const songs: [string, string][] = [ // OMEGALUL WEEBOO AF
                    ["John Denver", "Take Me Home, Country Roads"],
                    ["hololive IDOL PROJECT", "BLUE CLAPPER"],
                    ["hololive IDOL PROJECT", "Suspect"],
                    ["邪神ちゃん, 初音ミク", "サンキュードロップキック"],
                    ["キズナアイ, 花譜", "ラブしい"],
                    ["halca, 鈴木愛奈", "あれこれドラスティック"],
                    ["MORE MORE JUMP!", "モア!ジャンプ!モア!"],
                    ["チト, ユーリ", "More One Night"],
                    ["Nanahira, Camellia", "You Make My Life 1UP"],
                    ["邪神★ガールズ", "あの娘にドロップキック"],
                    ["キノシタ", "どぅーまいべすと"],
                    ["キノシタ", "夢色フェスティバル"],
                    ["鹿乃", "なだめスかし Negotiation"],
                    ["キノシタ", "人間のくせになまいきだ"],
                    ["ナユタン星人, ナナヲアカリ, 000", "コスモポップファンクラブ"]
                ];
                return songs[crypto.randomInt(songs.length)];
            case 2:
                const diff = luxon.DateTime.fromISO("2022-07-07T04:00").diffNow(['days', "hours", "minutes"]).toObject();
                const day = diff.days ? Math.abs(diff.days) : -1;
                const hour = diff.hours ? Math.abs(diff.hours) : -1;
                return ["Pixiv酱", `不稳定运行 ${day} 天 ${hour} 小时`];
            case 3:
                const pak = JSON.parse(fs.readFileSync("package.json", { encoding: "utf-8", flag: "r" }));
                return ["正在运行", `Pixiv酱 v${pak.version}`];
            case 4:
                return ["官方服务器", "https://kook.top/iOOsLu"];
            case 5:
                return ["行行好吧", "https://afdian.net/@hexona"];
            default:
                return ["ヘキソナ", "获取状态错误"];
        }
    } catch (e) {
        bot.logger.warn(e);
        return ["ヘキソナ", "获取状态错误"];
    }
}

async function botActivityStatus() {
    try {
        const [singer, music_name] = await getRandomStatus();
        bot.axios({
            url: "https://www.kookapp.cn/api/v3/game/activity",
            method: "POST",
            data: {
                singer: singer,
                music_name: music_name,
                data_type: 2
            }
        }).catch((e) => {
            bot.logger.warn(e);
        })
    } catch (e) {
        bot.logger.warn(e);
    }
}

function botMarketStayOnline() {
    axios({
        url: 'http://bot.gekj.net/api/v1/online.bot',
        method: "POST",
        headers: {
            uuid: auth.botMarketUUID
        }
    }).then((res) => {
        if (res.data.code == 0) {
            bot.logger.debug(`BotMarket: Successfully updated online status with remote returning: `);
            bot.logger.debug(res.data);
            setTimeout(botMarketStayOnline, (res.data.data.onTime + 5) * 1000);
        } else if (res.data.code == -1) {
            bot.logger.warn(`BotMarket: Failed updating online status with remote returning: `);
            bot.logger.warn(res.data);
            bot.logger.warn(`BotMarket: Retries in 30 minutes`);
            setTimeout(botMarketStayOnline, 30 * 60 * 1000);
        }
    }).catch((e) => {
        bot.logger.warn(`BotMarket: Failed updating online status with remote returning: `);
        bot.logger.warn(e.message);
        bot.logger.warn(`BotMarket: Retries in 30 minutes`);
        setTimeout(botMarketStayOnline, 30 * 60 * 1000);
    })
}
