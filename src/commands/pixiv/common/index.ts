export * from './cards';
export * from './linkmap';
export * from './nsfwjs'
export * from './aligreen'
import base64url from 'base64url';
import crypto from 'crypto';
import { tagBanList } from './tagBanList';
import { Stream } from 'form-data';

export namespace type {
    export type detectionResult = {
        blur: number,
        reason: blurReason
    }
    export type blurReason = {
        terrorism: banResult,
        ad: banResult,
        live: banResult,
        porn: banResult,
    };
    export type banResult = {
        ban: boolean,
        label?: string,
        probability: number
    }
}

export namespace common {
    export const akarin = "https://img.kookapp.cn/assets/2022-07/vlOSxPNReJ0dw0dw.jpg";

    export function pid2Markdown(pid: string) {
        if (isNaN(parseInt(pid))) {
            return pid;
        } else {
            return `[${pid}](https://www.pixiv.net/artworks/${pid})`;
        }
    }

    export function log(output: string) {
        console.log(`[${new Date().toLocaleTimeString()}] ${output}`);
    }

    export function isForbittedTag(tag: string) {
        if (tagBanList.includes(tag)) {
            return true;
        } else {
            return false;
        }
    }

    export async function stream2buffer(stream: Stream): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
            const _buf = Array<any>();
            stream.on("data", chunk => _buf.push(chunk));
            stream.on("end", () => resolve(Buffer.concat(_buf)));
            stream.on("error", err => reject(`error converting stream - ${err}`));
        });
    }
}