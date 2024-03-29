import axios from 'axios';
import auth from 'configs/auth';
import config from 'configs/config';
import { bot } from 'init/client';
import { BaseSession } from 'kbotify';
import { cards } from '../cards';
import { keygen } from '../keygen';

export namespace users {
    export type tiers = "Standard" | "Backer" | "Supporter" | "Sponser";
    const Commands = ["top", "tag", "author", "random", "refresh", "detail", "illust", "credit", "help"] as const;
    export const afdianTierLink: {
        [tier in tiers | "Quantum"]: string
    } = {
        Standard: "https://afdian.net/@hexona",
        Backer: "https://afdian.net/item?plan_id=780c3b901f3d11edb51352540025c377",
        Supporter: "https://afdian.net/item?plan_id=dc5e4c9c1ff511edaf6052540025c377",
        Sponser: "https://afdian.net/item?plan_id=27e624fa1ff611eda80a52540025c377",
        Quantum: "https://afdian.net/item?plan_id=72069e621ff511ed91f752540025c377"
    }
    export const tiersListImageLink = "https://img.kookapp.cn/attachments/2022-08/20/IXpXVOzUF75xc3c0.png";
    export type commands = typeof Commands[number];
    export interface userMeta {
        id: string,
        identifyNum: string,
        username: string,
        avatar: string
    }
    export interface user {
        kookid: string,
        kook: userMeta,
        pixiv: {
            tier: tiers,
            expire: number,
            register: number,
            quantum_pack_capacity: number,
            status: {
                banned: boolean,
                until?: number
            },
            statistics_today: {
                command_requests_counter: {
                    [trigger in commands]: number
                },
                new_illustration_requested: number,
                total_illustration_requested: number,
            },
            statistics: {
                last_seen_on: number,
                total_requests_counter: number,
                command_requests_counter: {
                    [trigger in commands]: number
                },
                new_illustration_requested: number,
                total_illustration_requested: number,
                keys_activated: number,
                activated_key: keygen.keyObj[]
            }
        }
    }
    export function isUser(obj: any): obj is user {
        return 'kookid' in obj;
    }
    export function isCommand(obj: any): obj is commands {
        return Commands.includes(obj);
    }
    const commandLimit: {
        [tier in tiers]: {
            [command in commands]: number | "unlimited"
        }
    } = {
        Standard: {
            top: "unlimited",
            tag: 6,
            author: 5,
            random: 10,
            refresh: 2,
            detail: 20,
            illust: 20,
            credit: "unlimited",
            help: "unlimited"
        },
        Backer: {
            top: "unlimited",
            tag: 20,
            author: 10,
            random: 25,
            refresh: 5,
            detail: 50,
            illust: 50,
            credit: "unlimited",
            help: "unlimited"
        },
        Supporter: {
            top: "unlimited",
            tag: "unlimited",
            author: 25,
            random: "unlimited",
            refresh: 15,
            detail: 150,
            illust: 150,
            credit: "unlimited",
            help: "unlimited"
        },
        Sponser: {
            top: "unlimited",
            tag: "unlimited",
            author: "unlimited",
            random: "unlimited",
            refresh: 30,
            detail: "unlimited",
            illust: "unlimited",
            credit: "unlimited",
            help: "unlimited"
        }
    }
    const illustLimit: {
        [tier in tiers]: number | "unlimited"
    } = {
        Standard: 20,
        Backer: 80,
        Supporter: 240,
        Sponser: "unlimited",
    }
    export function getHigherTier(tier: tiers): tiers {
        switch (tier) {
            case "Standard": return "Backer";
            case "Backer": return "Supporter";
            case "Supporter": return "Sponser";
            case "Sponser": return "Sponser";
        }
    }
    export function tiersIllustLimit(user: user) {
        if (user.pixiv.quantum_pack_capacity > 0) {
            return user.pixiv.quantum_pack_capacity;
        } else {
            return illustLimit[user.pixiv.tier];
        }
    }
    export function tiersIllustLimitLeft(user: user): number | "unlimited" {
        const limit = tiersIllustLimit(user);
        var left: number | "unlimited";
        if (user.pixiv.quantum_pack_capacity > 0) left = user.pixiv.quantum_pack_capacity;
        else if (limit == "unlimited") left = "unlimited";
        else left = limit - user.pixiv.statistics_today.new_illustration_requested;
        return left < 0 ? 0 : left;
    }
    export function tiersCommandLimit(user: user, trigger: commands) {
        return commandLimit[user.pixiv.tier][trigger];
    }
    export function tiersCommandLimitLeft(user: user, trigger: commands): number | "unlimited" {
        const limit = tiersCommandLimit(user, trigger);
        var left: number | "unlimited";
        if (trigger == "refresh") {
            if (limit == "unlimited") left = "unlimited";
            else left = limit - user.pixiv.statistics_today.command_requests_counter[trigger];
        } else if (user.pixiv.quantum_pack_capacity > 0) left = "unlimited";
        else if (trigger == "detail" || trigger == "illust") {
            if (limit == "unlimited") left = "unlimited";
            else left = limit - user.pixiv.statistics_today.command_requests_counter["detail"] - user.pixiv.statistics_today.command_requests_counter["illust"];
        } else if (limit == "unlimited") left = "unlimited";
        else left = limit - user.pixiv.statistics_today.command_requests_counter[trigger];
        return left < 0 ? 0 : left;
    }
    export function tiersCommandLimitLeftRaw(user: user, trigger: commands): number | "unlimited" {
        const limit = tiersCommandLimit(user, trigger);
        var left: number | "unlimited";
        if (trigger == "refresh") {
            if (limit == "unlimited") left = "unlimited";
            else left = limit - user.pixiv.statistics_today.command_requests_counter[trigger];
        } else if (trigger == "detail" || trigger == "illust") {
            if (limit == "unlimited") left = "unlimited";
            else left = limit - user.pixiv.statistics_today.command_requests_counter["detail"] - user.pixiv.statistics_today.command_requests_counter["illust"];
        } else if (limit == "unlimited") left = "unlimited";
        else left = limit - user.pixiv.statistics_today.command_requests_counter[trigger];
        return left < 0 ? 0 : left;
    }
    export async function reachesCommandLimit(session: BaseSession, trigger: string): Promise<boolean> {
        var reached = false;
        if (isCommand(trigger)) {
            await detail({
                id: session.user.id,
                identifyNum: session.user.identifyNum,
                username: session.user.username,
                avatar: session.user.avatar,
            }).then((res) => {
                if (tiersCommandLimitLeft(res, trigger) == "unlimited") reached = false;
                else if (tiersCommandLimitLeft(res, trigger) <= 0) reached = true;
                else reached = false;
                if (reached) {
                    session.replyCard([cards.reachesLimit(res, "command", trigger)]);
                }
            }).catch((e) => {
                bot.logger.error(e);
            })
        }
        return reached;
    }
    export async function reachesIllustLimit(session: BaseSession): Promise<boolean> {
        var reached = false;
        await detail({
            id: session.user.id,
            identifyNum: session.user.identifyNum,
            username: session.user.username,
            avatar: session.user.avatar,
        }).then((res) => {
            if (tiersIllustLimitLeft(res) == "unlimited") reached = false;
            else if (tiersIllustLimitLeft(res) > 0) reached = false;
            else reached = true;
            if (reached) {
                session.replyCard([cards.reachesLimit(res, "illust")]);
            }
        }).catch((e) => {
            bot.logger.error(e);
        })
        return reached;
    }
    export async function update(user: user) {
        axios({
            url: `${config.remoteLinkmapBaseURL}/user/profile/update`,
            method: "POST",
            data: user,
            headers: {
                'Authorization': `Bearer ${auth.remoteLinkmapToken}`,
                'uuid': auth.remoteLinkmapUUID
            }
        }).then((res) => {
            if (res.data.code != 0) {
                throw res.data;
            }
        }).catch((e) => {
            throw e.data;
        });
    }
    export async function detail(userMeta: userMeta): Promise<users.user> {
        return axios({
            url: `${config.remoteLinkmapBaseURL}/user/profile`,
            method: "GET",
            params: {
                id: userMeta.id,
                user: userMeta
            }
        }).then((res) => {
            if (res.data.code == 0) {
                var user: users.user = res.data.data;
                user.kook = userMeta;
                update(user);
                return user;
            } else {
                throw res;
            }
        }).catch((e) => {
            throw e.data;
        });
    }
    /**
     * Update statistics of usage
     * @param session kbotify session
     * @param trigger command trigger
     * @param totalIllust requested illustrations number
     * @param newIllust requested new illustrations number
     */
    export function logInvoke(session: BaseSession, trigger: string, totalIllust: number, newIllust: number) {
        detail({
            id: session.user.id,
            identifyNum: session.user.identifyNum,
            username: session.user.username,
            avatar: session.user.avatar
        }).then((res) => {
            if (res) {
                res.pixiv.statistics.last_seen_on = Date.now();

                if (isCommand(trigger)) {
                    const commandLeft = tiersCommandLimitLeftRaw(res, trigger)
                    if (commandLeft != 'unlimited') {
                        var reduction = 0;
                        if (commandLeft < newIllust) {
                            reduction = (newIllust - commandLeft);
                        } else {
                            reduction = newIllust;
                        }

                        if (res.pixiv.quantum_pack_capacity > reduction) {
                            res.pixiv.quantum_pack_capacity -= reduction;
                        } else {
                            res.pixiv.quantum_pack_capacity = 0;
                        }
                    }
                }

                res.pixiv.statistics.new_illustration_requested += newIllust;
                res.pixiv.statistics.total_illustration_requested += totalIllust;

                res.pixiv.statistics_today.new_illustration_requested += newIllust;
                res.pixiv.statistics_today.total_illustration_requested += totalIllust;

                res.pixiv.statistics.total_requests_counter++;
                if (isCommand(trigger)) {
                    if (trigger == "refresh") {
                        res.pixiv.statistics_today.command_requests_counter[trigger]++;
                    }
                    if (newIllust > 0) {
                        res.pixiv.statistics_today.command_requests_counter[trigger]++;
                    }
                    res.pixiv.statistics.command_requests_counter[trigger]++;
                }
                update(res).catch((e) => {
                    bot.logger.warn("UserProfile: Bad request when updating profile");
                    bot.logger.warn(e);
                });
            }
        }).catch((e) => {
            bot.logger.warn("UserProfile: Bad request when fetching profile");
            bot.logger.warn(e);
        })
    }
}