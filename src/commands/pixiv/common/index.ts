export * from './cards';
export * from './linkmap';
export * from './nsfwjs'
export * from './aligreen'
import { tagBanList } from './tagBanList';
import FormData, { Stream } from 'form-data';
import { BaseSession } from 'kbotify';
import { linkmap } from './linkmap';
import config from 'configs/config';
import got from 'got/dist/source';
import { aligreen } from './aligreen';
import axios from 'axios';
import auth from 'configs/auth';
import { cards } from './cards';
import { nsfwjs } from './nsfwjs';
const sharp = require('sharp');

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
        console.log(`[${new Date().toLocaleTimeString()}] ${output.toString().replaceAll("\n", `\n[${new Date().toLocaleTimeString()}] `)}`);
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

    export async function uploadImage(data: any, detectionResult: type.detectionResult, session: BaseSession): Promise<{ link: string, pid: string }> {
        var val = data;
        if (linkmap.isInDatabase(val.id)) {
            return { link: linkmap.getLink(val.id, "0"), pid: val.id };
        }

        const master1200 = val.image_urls.large.replace("i.pximg.net", config.pixivProxyHostname); // Get image link
        log(`Resaving... ${master1200}`);
        var bodyFormData = new FormData();
        const stream = got.stream(master1200);                               // Get readable stream from origin
        var detectionResult: type.detectionResult;
        var buffer = await sharp(await stream2buffer(stream)).resize(512).jpeg().toBuffer(); // Resize stream and convert to buffer
        if (detectionResult.blur > 0) {
            buffer = await sharp(buffer).blur(detectionResult.blur).jpeg().toBuffer();
        }
        bodyFormData.append('file', buffer, "1.jpg");
        var rtLink = "";
        //Upload image to KOOK's server
        await axios({
            method: "post",
            url: "https://www.kookapp.cn/api/v3/asset/create",
            data: bodyFormData,
            headers: {
                'Authorization': `Bot ${auth.assetUploadToken} `,
                ...bodyFormData.getHeaders()
            }
        }).then((res: any) => {
            rtLink = res.data.data.url
        }).catch((e: any) => {
            if (e) {
                session.sendCard(cards.error(e));
            }
        });
        linkmap.addMap(val.id, "0", rtLink, detectionResult);
        return { link: rtLink, pid: val.id };
    }
}