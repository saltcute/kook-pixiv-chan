import axios from 'axios';
import auth from 'configs/auth';
import config from 'configs/config';
import { bot } from 'init/client';
import { BaseCommand, BaseSession, CommandFunction } from "kasumi.js";
import * as pixiv from './common'

class Redeem extends BaseCommand {
    name = 'redeem';
    usage = '.pixiv redeem <Key>';
    description = '兑换激活码';
    func: CommandFunction<BaseSession, any> = async (session) => {
        // if (await pixiv.users.reachesCommandLimit(session, this.name)) return;
        // if (await pixiv.users.reachesIllustLimit(session)) return;
        if (pixiv.common.isBanned(session, this.name)) return;
        if (pixiv.common.isRateLimited(session, 3, this.name)) return;
        pixiv.common.logInvoke(`.pixiv ${this.name}`, session);
        if (session.args.length == 0) {
            return session.reply("请输入激活码");
        } else {
            const key = session.args[0];
            if (key == "KFCCR-AZYTH-URSDA-YOVME-FIFTY") {// EASTER EGG
                return session.reply("~~兑换成功：在下个星期四V我50~~\n开玩笑的，用这个怎么可能换的出东西呢！");
            }
            if (pixiv.keygen.validate(key)) {
                axios({
                    baseURL: config.remoteLinkmapBaseURL,
                    url: "/user/key/activate",
                    method: "POST",
                    headers: {
                        'Authorization': `Bearer ${auth.remoteLinkmapToken}`,
                        'uuid': auth.remoteLinkmapUUID
                    },
                    data: {
                        key: key,
                        user: {
                            id: session.author.id,
                            identifyNum: session.author.identify_num,
                            username: session.author.username,
                            avatar: session.author.avatar
                        }
                    }
                }).then((res) => {
                    const data = res.data;
                    switch (data.code) {
                        case '0':
                            session.reply("兑换成功")
                            // this.exec("profile", ["arg"], "msg");
                            pixiv.users.detail({
                                id: session.author.id,
                                identifyNum: session.author.identify_num,
                                username: session.author.username,
                                avatar: session.author.avatar
                            }).then((res) => {
                                return session.send([pixiv.cards.profile(res)]);
                            }).catch((e) => {
                                bot.logger.warn(e);
                                return session.replyTemp([pixiv.cards.error(e.stack)]);
                            });
                            break;
                        case '40001': // Used or non-existence key
                            session.reply("激活码不存在或已被使用！");
                            break;
                        case '40002': // Non-existence user
                            session.reply("用户不存在！");
                            break;
                    }
                }).catch((e) => {
                    bot.logger.error(`Subscription: Failed activating key ${key}`);
                    bot.logger.error(e);
                    session.send([pixiv.cards.error(e, false)]);
                })
            } else {
                session.reply("不是有效的激活码！");
            }
        }
    }
}

export const redeem = new Redeem();