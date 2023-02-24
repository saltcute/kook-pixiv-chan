// import { BaseCommand, AppFunc, BaseSession, Card } from "kasumi.js";
import * as pixiv from './common';
import * as pixivadmin from './admin/common'
import axios from 'axios';
import config from 'configs/config';
import { bot } from 'init/client';
import { types } from 'pixnode';
import FormData from 'form-data';
import sharp from 'sharp';
import { BaseCommand, CommandFunction, BaseSession, Card } from "kasumi.js";

class Author extends BaseCommand {
    name = 'author';
    usage = '.pixiv author <Illustration ID>';
    description = '获取用户的最新九张插画'
    func: CommandFunction<BaseSession, any> = async (session) => {
        if (await pixiv.users.reachesCommandLimit(session, this.name)) return;
        if (await pixiv.users.reachesIllustLimit(session)) return;
        if (pixivadmin.common.isGlobalBanned(session)) return pixivadmin.common.notifyGlobalBan(session);
        if (pixiv.common.isBanned(session, this.name)) return;
        if (pixiv.common.isRateLimited(session, 6, this.name)) return;
        pixiv.common.logInvoke(`.pixiv ${this.name}`, session);
        const sendCard = async (data: types.illustration[]) => {
            var sendSuccess = false;
            var mainCardMessageID = "";
            if (isGUI) {
            } else {
                if (session.guildId) {
                    await session.send([pixiv.cards.resaving("多张图片")]).then((res) => {
                        if (res) {
                            sendSuccess = true;
                            mainCardMessageID = res.msg_id;
                        }
                    }).catch((e) => {
                        if (e) {
                            if (e.code == 40012) { // Slow-mode limit
                                bot.logger.warn("UserInterface: Bot is limited by slow-mode, no operation can be done");
                            } else {
                                bot.logger.error(e);
                            }
                        }
                        sendSuccess = false;
                    });
                    if (!sendSuccess) return;
                }
            }
            var r18: number = 0;
            var detection: number = 0;
            var link: string[] = [];
            var pid: string[] = [];
            var datas: any[] = [];
            var promises: Promise<any>[] = [];
            for (const k in data) {
                for (const val of data[k].tags) {
                    const tag = val.name;
                    if (pixiv.common.isForbittedTag(tag)) {
                        continue;
                    }
                }
                if (data[k].x_restrict !== 0) {
                    continue;
                }
                datas.push(data[k]);
                if (datas.length >= 9) break;
            }
            const detectionResults = await pixiv.aligreen.imageDetectionSync(datas);
            if (!detectionResults) {
                bot.logger.error("ImageDetection: No detection result was returned");
                return session.sendTemp("所有图片的阿里云检测均返回失败，这极有可能是因为国际网络线路不稳定，请稍后再试。");
            }
            for (const val of datas) {
                if (detectionResults[val.id]) {
                    if (!pixiv.linkmap.isInDatabase(val.id, "0") && detectionResults[val.id].success) detection++;
                    promises.push(pixiv.common.uploadImage(val, detectionResults[val.id], session));
                }
            }
            var uploadResults: {
                link: string;
                pid: string;
            }[] = [];
            await Promise.all(promises).then((res) => {
                uploadResults = res;
            }).catch((e) => {
                if (e) {
                    bot.logger.error(e);
                    session.sendTemp([pixiv.cards.error(e.stack)]);
                }
            });
            for (var val of uploadResults) {
                link.push(val.link);
                pid.push(val.pid);
            }
            bot.logger.debug(`UserInterface: Presenting card to user`);
            if (isGUI) {
                bot.API.message.update(msgID, pixiv.cards.author(data[0], r18, link, pid, {}).addModule(pixiv.cards.GUI.returnButton([{ action: "GUI.view.command.list" }])), undefined, session.authorId);
            } else {
                if (session.guildId) {
                    await session.update(mainCardMessageID, [pixiv.cards.author(data[0], r18, link, pid, {})])
                        .then(() => {
                            pixiv.users.logInvoke(session, this.name, datas.length, detection)
                        })
                        .catch((e) => {
                            bot.logger.error(`UserInterface: Failed updating message ${mainCardMessageID}`);
                            if (e) bot.logger.error(e);
                        });
                } else {
                    session.send([pixiv.cards.author(data[0], r18, link, pid, {})])
                        .then(() => {
                            pixiv.users.logInvoke(session, this.name, datas.length, detection)
                        })
                        .catch((e) => {
                            bot.logger.error(`UserInterface: Failed sending message`);
                            if (e) bot.logger.error(e);
                        });
                }
            }
        }
        if (session.args.length === 0) {
            return session.reply("使用 `.pixiv help author` 查询指令详细用法")
        } else {
            if (pixiv.common.isForbittedUser(session.args[0])) {
                bot.logger.debug(`UserInterface: User violates user blacklist: ${session.args[0]}. Banned the user for 30 seconds`);
                pixiv.common.registerBan(session.authorId, this.name, 30);
                return session.reply(`您已触犯用户黑名单并被禁止使用 \`.pixiv ${this.name}\` 指令至 ${new Date(pixiv.common.getBanEndTimestamp(session.authorId, this.name)).toLocaleString("zh-cn")}`);
            }
            if (isNaN(parseInt(session.args[0]))) {
                axios({
                    baseURL: config.pixivAPIBaseURL,
                    url: "/creator/search",
                    method: "GET",
                    params: {
                        keyword: session.args[0],
                        user: {
                            id: session.author.id,
                            identifyNum: session.author.identify_num,
                            username: session.author.username,
                            avatar: session.author.avatar
                        }
                    }
                }).then(async (res: any) => {
                    if (res.data.length === 0) {
                        return session.reply("用户不存在或此用户没有上传过插画！")
                    }
                    if (res.data.hasOwnProperty("code") && res.data.code == 400) {
                        return session.reply("请输入一个合法的用户ID（使用 `.pixiv help author` 查询指令详细用法）")
                    }
                    if (res.data.hasOwnProperty("code") && res.data.code == 500) {
                        return session.reply("Pixiv官方服务器不可用，请稍后再试");
                    }
                    let messageId = (await session.send([new Card().addText("正在加载……请稍候").addModule(pixiv.cards.getCommercials())]))?.msg_id;
                    if (!messageId) return;
                    let data: {
                        user_previews: {
                            illusts: types.illustration[],
                            [key: string]: any
                        }[],
                        next_url: string
                    } = res.data;
                    let users = [];
                    for (let index = 0; index < data.user_previews.length && index < 3; ++index) {
                        let val = data.user_previews[index];
                        let detections = await pixiv.aligreen.imageDetectionSync(val.illusts);
                        let promises: Promise<any>[] = [];
                        for (const illust of val.illusts) {
                            promises.push(pixiv.common.uploadImage(illust, detections[illust.id], session));
                        }
                        var uploadResults: {
                            link: string;
                            pid: string;
                        }[] = [];
                        await Promise.all(promises).then((res) => {
                            uploadResults = res;
                        }).catch((e) => {
                            if (e) {
                                bot.logger.error(e);
                                session.sendTemp([pixiv.cards.error(e.stack)]);
                            }
                        });
                        const avatarDetection = await pixiv.aligreen.simpleImageDetection(val.user.profile_image_urls.medium, val.user.id);
                        let avatarBuffer: Buffer = (await axios({
                            url: pixiv.common.getProxiedImageLink(val.user.profile_image_urls.medium),
                            responseType: 'arraybuffer'
                        })).data;
                        let avatarSharp = sharp(avatarBuffer);
                        if (avatarDetection.blur) {
                            avatarSharp.blur(avatarDetection.blur);
                        }
                        avatarBuffer = await avatarSharp.jpeg().toBuffer();
                        let avatarLink = await pixiv.common.simpleUploadFile(avatarBuffer);
                        users.push({
                            username: val.user.name,
                            avatar: avatarLink,
                            uid: val.user.id,
                            links: uploadResults.map(val => val.link)
                        });
                    }
                    session.update(messageId, [pixiv.cards.searchForAuthor(users)]);
                }).catch((e: any) => {
                    if (e) {
                        bot.logger.error(e);
                        session.sendTemp([pixiv.cards.error(e.stack)]);
                    }
                });
                // return session.reply("请输入一个合法的用户ID（使用 `.pixiv help author` 查询指令详细用法）");
            } else {
                const selection = session.args[1];
                var isGUI: boolean = false;
                var msgID: string = "";
                if (selection && selection.split(".")[0] == "GUI") {
                    const UUID = selection.split(".")[1];

                    bot.API.message.view(UUID).then(() => {
                        isGUI = true;
                        msgID = UUID;
                    }).catch((e) => {
                        bot.logger.warn("GUI:Unknown GUI msgID");
                        bot.logger.warn(e);
                        isGUI = false;
                    })
                }
                axios({
                    baseURL: config.pixivAPIBaseURL,
                    url: "/creator/illustration",
                    method: "GET",
                    params: {
                        keyword: session.args[0],
                        user: {
                            id: session.author.id,
                            identifyNum: session.author.identify_num,
                            username: session.author.username,
                            avatar: session.author.avatar
                        }
                    }
                }).then((res: any) => {
                    if (res.data.length === 0) {
                        return session.reply("用户不存在或此用户没有上传过插画！")
                    }
                    if (res.data.hasOwnProperty("code") && res.data.code == 400) {
                        return session.reply("请输入一个合法的用户ID（使用 `.pixiv help author` 查询指令详细用法）")
                    }
                    if (res.data.hasOwnProperty("code") && res.data.code == 500) {
                        return session.reply("Pixiv官方服务器不可用，请稍后再试");
                    }
                    pixiv.common.getNotifications(session);
                    sendCard(res.data);
                }).catch((e: any) => {
                    if (e) {
                        bot.logger.error(e);
                        session.sendTemp([pixiv.cards.error(e.stack)]);
                    }
                });
            }
        }
    };
}

export const author = new Author();


