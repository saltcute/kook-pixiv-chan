import * as crypto from 'crypto';
import { users } from '../users';

export namespace keygen {
    export type keyType = "sub" | "quantum" | "invalid"
    export type keyTime = "day" | "month" | "season" | "year";
    export type keyLiteral = `${string}-${string}-${string}-${string}-${string}`;
    export interface keyMap {
        [key: string]: keyObj
    };
    export interface keyObj {
        key: keyLiteral,
        type: keyType,
        tier: users.tiers
        period: keyTime,
        used: boolean,
        redeem?: {
            time: number,
            uid: string,
            recieved: {
                tier: users.tiers,
                type: keyType
            }
        }
    }
    const characters = "ABCDEFGHJKMNOPQRSTUWXYZ";
    export function validate(key: string) {
        if (key.length != 29) return false;
        const test = key.slice(24);
        var str = key.slice(0, 24);
        for (var j = 1; j <= 5; j++) {
            const hash = crypto.createHash('sha1').update(str).digest("base64");
            str += characters.charAt(hash.charCodeAt(j) % characters.length);
        }
        return str == key;
    }
}