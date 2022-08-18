import axios from 'axios';
import config from 'configs/config';
import * as fs from 'fs';
import { bot } from 'init/client';
import * as upath from 'upath';
import { keygen } from '../keygen';

export namespace users {
    export type tiers = "Standard" | "Backer" | "Supporter" | "Sponser";
    export type commands = "top" | "tag" | "author" | "random" | "refresh" | "detail" | "illust" | "credit" | "help";
    export interface user {
        kookid: number,
        kook: {
            id: number,
            username: string,
            identityNum: number,
            avatarLink: string,
        },
        pixiv: {
            tier: tiers,
            expire: number,
            register: number,
            status: {
                banned: boolean,
                until?: number
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
    export function update(update: user) {
    }
    export async function detail(uid: string): Promise<users.user | false> {
        const promise = axios({
            url: `${config.remoteLinkmapBaseURL}/user/profile`,
            method: "GET",
            params: {
                id: uid
            }
        });
        promise.catch(() => {
            bot.logger.error("Get user profile failed");
        });
        const res = (await promise).data;
        if (res.code == 0) {
            var user: users.user = res.data;
            return user;
        } else {
            return false;
        }
    }
}