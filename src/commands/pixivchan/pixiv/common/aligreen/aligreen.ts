import axios from 'axios';
import * as crypto from 'crypto'
import { v1 as uuidV1 } from 'uuid';
import auth from 'configs/auth';


const regionID = {
    Beijing: "cn-beijing",
    Shanghai: "cn-shanghai",
    Shenzhen: "cn-shenzhen",
    Singapore: "ap-southeast-1"
}


const accessKeyId = auth.aliyunAccessKeyID;
const accessKeySecret = auth.aliyunAccessKeySecret;
const greenVersion = '2018-05-09';

var serverRegion: keyof typeof regionID = "Shanghai";
var hostname = `green.${regionID[serverRegion]}.aliyuncs.com`;

export function setRegion(region: keyof typeof regionID) {
    serverRegion = region;
    hostname = `green.${regionID[serverRegion]}.aliyuncs.com`;
}
export function getRegion(): keyof typeof regionID {
    return serverRegion;
}
export function getHostname(): string {
    return hostname;
}

const path = '/green/image/scan';

var clientInfo = {
    "ip": "127.0.0.1"
};

var detectionScenes: Set<"porn" | "live" | "ad" | "terrorism"> = new Set(["porn", "terrorism"]);

export function addScene(scene: "porn" | "live" | "ad" | "terrorism") {
    detectionScenes.add(scene);
}
export function removeScene(scene: "porn" | "live" | "ad" | "terrorism") {
    detectionScenes.delete(scene);
}
export function currentScenes(): Array<"porn" | "live" | "ad" | "terrorism"> {
    return Array.from(detectionScenes);
}

export async function detect(imageURL: string[]) {
    const requestBody = JSON.stringify({
        bizType: 'pixiv',
        scenes: Array.from(detectionScenes),
        tasks: (() => {
            var res = [];
            for (var val of imageURL) {
                res.push({
                    'dataId': uuidV1(),
                    'url': val
                })
            }
            return res;
        })()
    });
    const UTCDate = new Date().toUTCString();
    var requestHeaders = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Content-MD5': crypto.createHash('md5').update(requestBody).digest().toString('base64'),
        'Date': UTCDate,
        'x-acs-version': greenVersion,
        'x-acs-signature-nonce': uuidV1(),
        'x-acs-signature-version': '1.0',
        'x-acs-signature-method': 'HMAC-SHA1',
        'Authorization': ""
    };

    // 对请求的签名
    var signature: string[] = [];
    signature.push('POST\n');
    signature.push('application/json\n');
    signature.push(requestHeaders['Content-MD5'] + '\n');
    signature.push('application/json\n');
    signature.push(requestHeaders['Date'] + '\n');
    signature.push('x-acs-signature-method:HMAC-SHA1\n');
    signature.push('x-acs-signature-nonce:' + requestHeaders['x-acs-signature-nonce'] + '\n');
    signature.push('x-acs-signature-version:1.0\n');
    signature.push('x-acs-version:2018-05-09\n');
    signature.push(path + '?clientInfo=' + JSON.stringify(clientInfo));

    const authorization = crypto.createHmac('sha1', accessKeySecret)
        .update(signature.join(''))
        .digest().toString('base64');

    requestHeaders.Authorization = 'acs ' + accessKeyId + ':' + authorization;

    return axios({
        url: `https://${hostname}${encodeURI(path + '?clientInfo=' + JSON.stringify(clientInfo))}`,
        method: "POST",
        headers: requestHeaders,
        data: requestBody
    })
}