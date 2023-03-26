import { BaseCommand, BaseSession, Card, CommandFunction } from "kasumi.js";
import * as pixiv from './common';
import * as pixivadmin from './admin/common'
import axios from 'axios';
import config from 'configs/config';
import { bot } from 'init/client';
import { types } from 'pixnode';
import auth from "configs/auth";

class Random extends BaseCommand {
    name = 'random';
    description = '获取⑨张随机插画';
    func: CommandFunction<BaseSession, any> = async (session) => {
        if (await pixiv.users.reachesCommandLimit(session, this.name)) return;
        if (await pixiv.users.reachesIllustLimit(session)) return;
        if (pixivadmin.common.isGlobalBanned(session)) return pixivadmin.common.notifyGlobalBan(session);
        if (pixiv.common.isBanned(session, this.name)) return;
        if (pixiv.common.isRateLimited(session, 10, this.name)) return;
        pixiv.common.logInvoke(`.pixiv ${this.name}`, session);
        const sendCard = async (data: types.illustration[]) => {
            var sendSuccess = false;
            var mainCardMessageID = "";
            if (isGUI) {
                await bot.API.message.update(msgID, pixiv.cards.resaving("多张图片"), undefined, session.authorId);
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
            var datas: types.illustration[] = [];
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
            const detectionResults = await pixiv.aligreen.imageDetectionSync(datas)
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
            }[] = await Promise.all(promises).catch((e) => {
                if (e) {
                    this.logger.error(e);
                    session.sendTemp([pixiv.cards.error(e.stack)]);
                }
            }) || [];
            for (let val of uploadResults) {
                link.push(val.link);
                pid.push(val.pid);
            }
            this.logger.debug(`UserInterface: Presenting card to user`);
            if (isGUI) {
                await bot.API.message.update(msgID, pixiv.cards.random(link, pid, {}).addModule(pixiv.cards.GUI.returnButton([{ action: "GUI.view.command.list" }])), undefined, session.authorId);
            } else {
                if (session.guildId) {
                    await session.update(mainCardMessageID, pixiv.cards.random(link, pid, {}))
                        .then(() => {
                            pixiv.users.logInvoke(session, this.name, datas.length, detection)
                        })
                        .catch((e) => {
                            this.logger.error(`UserInterface: Failed updating message ${mainCardMessageID}`);
                            if (e) this.logger.error(e);
                        });
                } else {
                    await session.send([pixiv.cards.random(link, pid, {})])
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
        const GUIString: string = session.args[0];
        var isGUI: boolean = false;
        var msgID: string = "";
        if (GUIString && GUIString.split(".")[0] == "GUI") {
            const UUID = GUIString.split(".")[1];
            await bot.API.message.view(UUID).then(() => {
                isGUI = true;
                msgID = UUID;
            }).catch((e) => {
                this.logger.warn("GUI:Unknown GUI msgID");
                this.logger.warn(e);
                isGUI = false;
            })
        }
        await axios({
            baseURL: config.pixivAPIBaseURL,
            headers: {
                'Authorization': auth.remoteLinkmapToken,
                'uuid': auth.remoteLinkmapUUID
            },
            url: "/illustration/recommend",
            method: "GET",
            params: {
                user: {
                    id: session.author.id,
                    identifyNum: session.author.identify_num,
                    username: session.author.username,
                    avatar: session.author.avatar
                }
            }
        }).then(async (res: any) => {
            if (res.data.hasOwnProperty("code") && res.data.code == 500) {
                return await session.reply("Pixiv官方服务器不可用，请稍后再试");
            }
            await pixiv.common.getNotifications(session);
            await sendCard(res.data);
        }).catch(async (e: any) => {
            if (e) {
                this.logger.error(e);
                await session.sendTemp([pixiv.cards.error(e.stack)]);
            }
        });
    };
}

export const random = new Random();


