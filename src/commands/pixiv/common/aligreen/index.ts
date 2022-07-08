import axios from 'axios';
import * as pixiv from '../'

export namespace aligreen {
    const baseURL = "https://green.cn-shenzhen.aliyuncs.com";
    const greenURI = "/green/image/scan";
    function publicHeader() {
        return {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Date": (() => { return new Date().toUTCString() })(),
            "x-acs-version": "2018-05-09",
            "x-acs-signature-nonce": (() => { return pixiv.common.tokenBase64(32); })(),
            "x-acs-signature-version": "1.0",
            "x-acs-signature-method": ""
        }
    }
}