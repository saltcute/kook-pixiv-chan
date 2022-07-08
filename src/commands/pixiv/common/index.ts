export * from './cards';
export * from './linkmap';
export * from './nsfwjs'
import base64url from 'base64url';
import crypto from 'crypto';
import { tagBanList } from './tagBanList';
import { Stream } from 'form-data';

export namespace common {
    export const akarin = "https://img.kookapp.cn/assets/2022-07/vlOSxPNReJ0dw0dw.jpg";

    export function isForbittedTag(tag: string) {
        if (tagBanList.includes(tag)) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Generate a safe base64 string token that is URL-safe
     * @param size Determines how many bytes of data is to be generated
     * @returns URL-safe base64 string
     */
    export function tokenBase64(size: number): string {
        return base64url(crypto.randomBytes(size));
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