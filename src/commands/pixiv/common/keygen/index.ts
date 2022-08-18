import * as crypto from 'crypto';
import * as fs from 'fs';
import * as upath from 'upath';
import { linkmap } from '../linkmap';

export namespace keygen {
    export type keyType = "day" | "month" | "season" | "year" | "invalid";
    export type keyLiteral = `${string}-${string}-${string}-${string}-${string}`;
    export interface keyMap {
        [key: string]: keyObj
    };
    export interface keyObj {
        key: keyLiteral,
        type: keyType,
        used: boolean,
        redeem?: {
            time: number,
            uid: number,
            recieved: keyType
        }
    }
}