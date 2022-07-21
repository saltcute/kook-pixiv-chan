import axios from 'axios';
import auth from 'configs/auth';
import config from 'configs/config';
import fs from 'fs';
import upath from 'upath';
import { common, type } from '..';

export namespace linkmap {
    var map: {
        [key: string]: {
            [key: string]: linkmap
        }
    } = {};
    var diff: {
        [key: string]: {
            [key: string]: linkmap
        }
    } = {};
    type linkmap = {
        kookLink: string,
        NSFWResult: type.detectionResult,
        suggestion: {
            ban: boolean
            blurAmount: number
        }
    }

    export async function download() {
        if (config.useRemoteLinkmap) {
            await axios({
                url: `https://${config.remoteLinkmapHostname}/linkmap`,
                method: "GET",
                headers: {
                    'uuid': auth.remoteLinkmapUUID
                }
            }).then((res) => {
                for (const key in res.data) {
                    for (const page in res.data[key]) {
                        linkmap.addMap(key, page, res.data[key][page].kookLink, res.data[key][page].NSFWResult)
                    }
                }
                common.log("Downloaded linkmap from remote");
            }).catch((e) => {
                load();
                common.log("Linkmap download failed, loading local");
                common.log(e);
            })
        }
    }

    export async function upload() {
        if (config.maintainingRemoteLinkmap) {
            axios({
                url: `https://${config.remoteLinkmapHostname}/updateLinkmap`,
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${auth.remoteLinkmapToken}`,
                    'uuid': auth.remoteLinkmapUUID
                },
                data: diff
            }).then(() => {
                common.log("Linkmap uploaded");
                diff = {};
            }).catch((e) => {
                common.log("Linkmap upload failed");
                if (e) {
                    console.error(e);
                }
            });
        }
    }


    export async function init() {
        if (config.useRemoteLinkmap) {
            await download();
            save();
        } else {
            await load();
        }
    }
    export async function load() {
        if (fs.existsSync(upath.join(__dirname, "map.json"))) {
            map = JSON.parse(fs.readFileSync(upath.join(__dirname, "map.json"), { encoding: "utf-8", flag: "r" }));
            common.log(`Loaded linkmap from local`);
        } else {
            save();
            common.log(`Linkmap not found, creating new`);
        }
    }

    export function isInDatabase(illustID: string, page: string): boolean {
        if (map.hasOwnProperty(illustID)) {
            if (map[illustID].hasOwnProperty(page)) {
                return true;
            } else return false;
        } else {
            return false;
        }
    }

    export function getLink(illustID: string, page: string): string {
        if (isInDatabase(illustID, page)) {
            return map[illustID][page].kookLink;
        } else {
            return "";
        }
    }

    export function getDetection(illustID: string, page: string): type.detectionResult {
        if (isInDatabase(illustID, page)) {
            return map[illustID][page].NSFWResult;
        } else {
            return {
                success: false,
                status: -1,
                blur: 7
            };
        }
    }

    export function addMap(illustID: string, illustPage: string, illustLink: string, detectionResult: type.detectionResult): void {
        map = {
            ...map,
            [illustID]: {
                [illustPage]: {
                    kookLink: illustLink,
                    NSFWResult: detectionResult,
                    suggestion: {
                        ban: detectionResult.blur > 0,
                        blurAmount: detectionResult.blur
                    }
                }
            }
        };
        diff = {
            ...diff,
            [illustID]: {
                [illustPage]: {
                    kookLink: illustLink,
                    NSFWResult: detectionResult,
                    suggestion: {
                        ban: detectionResult.blur > 0,
                        blurAmount: detectionResult.blur
                    }
                }
            }
        };
    }

    export function save() {
        fs.writeFile(upath.join(__dirname, "map.json"), JSON.stringify(map), (err) => {
            if (err) {
                common.log(`Saving linkmap failed, error message: `);
                console.log(err);
            }
            else {
                common.log(`Saved linkmap`);
            }
        });
    }
}