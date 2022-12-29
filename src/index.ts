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
import { ButtonEventMessage, Card, GuildSession, TextMessage } from 'kbotify';
import { tag } from 'commands/pixiv/pixiv.tag.app';
import { gui } from 'commands/pixiv/pixiv.gui.app';

bot.logger.fields.name = "kook-pixiv-chan";
bot.logger.addStream({ level: bot.logger.INFO, stream: process.stdout });
// bot.logger.addStream({ level: bot.logger.DEBUG, stream: process.stdout }); // DEBUG
bot.logger.info("Initialization: kook-pixiv-chan initialization start");

(async () => {
    /**
     * Linkmap initialization
     */
    await pixiv.linkmap.init();
    await pixiv.common.tokenPoolInit();
    await pixivadmin.common.load();
    await botActivityStatus();
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
    if (/^(\(met\)[0-9]+\(met\))? ?[再在]?多?来?[一俩二仨三四五六七八九十百千万亿兆京]*[张点]?[不]?[涩色瑟蛇]?图?$/.test(event.content)) {
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
                        bot.logger.info("Fuck KOOK cuz user invoked detail/illust")
                        break;
                    default:
                }
                */
            } catch (e) { console.log(e) };
        })
    }
    // }
})

bot.on("buttonClick", async (event) => {
    try {
        const buttonValue = JSON.parse(event.value);
        const action = buttonValue.action.split(".");
        const data = buttonValue.data;
        bot.logger.info(`From ${event.user.username}#${event.user.identifyNum} invoke ${buttonValue.action}`);
        // return;
        switch (action[0]) {
            // TODO: convert legacy event
            case "portal":
                switch (action[1]) {
                    case "view":
                        const idx = data.index;
                        const pid = data.pid;
                        const link = data.link;
                        const type = data.type;
                        const curIndex = pid[idx];
                        const curLink = link[idx];
                        switch (action[2]) {
                            case "detail":
                                pixiv.common.getIllustDetail(curIndex).then((res) => {
                                    bot.API.message.update(event.targetMsgId, pixiv.cards.multiDetail(res.data, curLink, idx, pid, link, type, data).toString(), undefined, event.userId);
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
                                    bot.API.message.update(event.targetMsgId, pixiv.cards.error(e).toString(), undefined, event.userId);
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
    } catch { // Compatibility
        const identifier = event.value.split("|")[0];
        if (identifier == "view_detail" || identifier == "view_return") {
            bot.API.message.update(event.targetMsgId, pixiv.cards.error("此卡片来自旧版 Pixiv酱，现已无法使用").toString(), undefined, event.userId);
        } else {
            bot.API.message.update(event.targetMsgId, pixiv.cards.error(`唤起了无效的按钮事件： \`${event.value}\``).toString(), undefined, event.userId);
        }
    }
})


bot.connect();

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
            bot.logger.info(`BotMarket: Successfully updated online status with remote returning: `);
            bot.logger.info(res.data);
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
