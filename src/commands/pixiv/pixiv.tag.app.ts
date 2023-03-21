import { BaseCommand, BaseSession, CommandFunction } from "kasumi.js";
import * as pixiv from './common';
import * as pixivadmin from './admin/common'
import axios from 'axios';
import config from 'configs/config';
import { bot } from 'init/client';
import { types } from 'pixnode';
import auth from "configs/auth";

class Tag extends BaseCommand {
    name = 'tag';
    usage = '.pixiv tag [{day|week|month}] <tag>...';
    description = '获取所给标签人气前九的图片'
    func: CommandFunction<BaseSession, any> = async (session) => {
        if (await pixiv.users.reachesCommandLimit(session, this.name)) return;
        if (await pixiv.users.reachesIllustLimit(session)) return;
        if (pixivadmin.common.isGlobalBanned(session)) return pixivadmin.common.notifyGlobalBan(session);
        if (pixiv.common.isBanned(session, this.name)) return;
        if (pixiv.common.isRateLimited(session, 6, this.name)) return;
        pixiv.common.logInvoke(`.pixiv ${this.name}`, session);
        const sendCard = async (data: types.illustration[], tags: string[], durationName: string) => {
            var sendSuccess = false;
            var mainCardMessageID = "";
            if (session.guildId) {
                if (isGUI) {
                    await bot.API.message.update(msgID, pixiv.cards.resaving("多张图片"), undefined, session.authorId);
                } else {
                    await session.send([pixiv.cards.resaving("多张图片")]).then((res) => {
                        if (res) {
                            sendSuccess = true;
                            mainCardMessageID = res.msg_id;
                        }
                    }).catch((e) => {
                        if (e) {
                            if (e.code == 40012) { // Slow-mode limit
                                this.logger.warn("UserInterface: Bot is limited by slow-mode, no operation can be done");
                            } else {
                                this.logger.error(e);
                            }
                        }
                        sendSuccess = false;
                    });
                    if (!sendSuccess) return;
                }
            }
            var detection: number = 0;
            var link: string[] = [];
            var pid: string[] = [];
            var datas: any[] = [];
            var promises: Promise<any>[] = [];
            for (const k in data) {
                if (data[k].x_restrict !== 0) {
                    continue;
                }
                for (const val of data[k].tags) {
                    const tag = val.name;
                    if (pixiv.common.isForbittedTag(tag)) {
                        continue;
                    }
                }
                datas.push(data[k]);
                if (datas.length >= 9) break;
            }
            const detectionResults = await pixiv.aligreen.imageDetectionSync(datas);
            if (!detectionResults) {
                this.logger.error("ImageDetection: No detection result was returned");
                return session.sendTemp("所有图片的阿里云检测均返回失败，这极有可能是因为国际网络线路不稳定，请稍后再试。");
            }
            if (!detectionResults) {
                this.logger.error("ImageDetection: No detection result was returned");
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
                    this.logger.error(e);
                    session.sendTemp([pixiv.cards.error(e.stack)]);
                }
            });
            for (var val of uploadResults) {
                link.push(val.link);
                pid.push(val.pid);
            }
            this.logger.debug(`UserInterface: Presenting card to user`);
            if (isGUI) {
                bot.API.message.update(msgID, pixiv.cards.tag(link, pid, tags, durationName, {}).addModule(pixiv.cards.GUI.returnButton([{ action: "GUI.view.command.list" }])), undefined, session.authorId);
            } else {
                if (session.guildId) {
                    session.update(mainCardMessageID, [pixiv.cards.tag(link, pid, tags, durationName, {})])
                        .then(() => {
                            pixiv.users.logInvoke(session, this.name, datas.length, detection)
                        })
                        .catch((e) => {
                            this.logger.error(`UserInterface: Failed updating message ${mainCardMessageID}`);
                            if (e) this.logger.error(e);
                        });
                } else {
                    session.send([pixiv.cards.tag(link, pid, tags, durationName, {})])
                        .then(() => {
                            pixiv.users.logInvoke(session, this.name, datas.length, detection)
                        })
                        .catch((e) => {
                            this.logger.error(`UserInterface: Failed sending message`);
                            if (e) this.logger.error(e);
                        });
                }
            }
        }
        if (session.args.length === 0) {
            return session.reply("使用 `.pixiv help tag` 查询指令详细用法")
        } else {
            const durationList = {
                month: "LAST_MONTH",
                week: "LAST_WEEK",
                day: "LAST_DAY",
            };
            const durationNameList = {
                month: "本月",
                week: "本周",
                day: "今日",
            }
            var duration: string;
            var durationName: string;
            var tags: string[] = session.args;
            var isGUI: boolean = false;
            var msgID: string = "";
            var selection: string = tags[0];
            if (selection.split(".")[0] == "GUI") {
                const UUID = selection.split(".")[1];
                await bot.API.message.view(UUID).then(() => {
                    isGUI = true;
                    msgID = UUID;
                }).catch((e) => {
                    this.logger.warn("GUI:Unknown GUI msgID");
                    this.logger.warn(e);
                    isGUI = false;
                })
                tags = tags.slice(1);
            }
            selection = tags[0].toLowerCase();
            if (pixiv.common.isObjKey(selection, durationList)) {
                duration = durationList[selection];
                durationName = durationNameList[selection]
                tags = tags.slice(1);
            } else {
                if (session.args.length > 1) {
                    duration = durationList.month;
                    durationName = durationNameList.month;
                } else {
                    duration = durationList.week;
                    durationName = durationNameList.week;
                }
                tags = tags;
            }
            for (const tag of tags) {
                if (pixiv.common.isForbittedTag(tag)) {
                    this.logger.debug(`UserInterface: User violates tag blacklist: ${tag}. Banned the user for 30 seconds`);
                    pixiv.common.registerBan(session.authorId, this.name, 30);
                    return session.reply(`您已触犯标签黑名单并被禁止使用 \`.pixiv ${this.name}\` 指令至 ${new Date(pixiv.common.getBanEndTimestamp(session.authorId, this.name)).toLocaleString("zh-cn")}`);
                }
            }
            await axios({
                baseURL: config.pixivAPIBaseURL,
                headers: {
                    'Authorization': auth.remoteLinkmapToken,
                    'uuid': auth.remoteLinkmapUUID
                },
                url: "/illustration/tag",
                method: "GET",
                params: {
                    keyword: tags.join(" "),
                    duration: duration,
                    user: {
                        id: session.author.id,
                        identifyNum: session.author.identify_num,
                        username: session.author.username,
                        avatar: session.author.avatar
                    }
                }
            }).then(async (res: any) => {
                if (res.data.length == 0) {
                    return session.reply(`没有找到任何${tags.length > 1 ? "同时拥有" : "关于"}${tags.slice(0, 2).map(str => `「${str}」`).join("、")}${tags.length > 2 ? "等" : ""}标签的插画……可能是命令使用方式错误，输入 \`.pixiv help tag\` 查看详细使用帮助\n如确定使用方式无误，则${durationName}没有任何符合所给要求的插画，请更换关键词再试一遍`);
                } else if (res.data.length <= 10) {
                    await session.replyTemp(`${durationName}${tags.length > 1 ? "同时拥有" : "关于"}${tags.slice(0, 2).map(str => `「${str}」`).join("、")}${tags.length > 2 ? "等" : ""}标签的插画数量极少（小于十张；包括无法显示的 R-18 插画）\n请尝试更换关键词`);
                }
                if (res.data.hasOwnProperty("code") && res.data.code == 500) {
                    return session.reply("Pixiv官方服务器不可用，请稍后再试");
                }
                pixiv.common.getNotifications(session);
                sendCard(res.data, tags, durationName).catch((e) => {
                    this.logger.error(e);
                })
            }).catch((e: any) => {
                if (e) {
                    this.logger.error(e);
                    session.sendTemp([pixiv.cards.error(e.stack)]);
                }
            });
        }
    };
}

export const tag = new Tag();


