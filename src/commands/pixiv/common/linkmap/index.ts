import axios from 'axios';
import auth from 'configs/auth';
import config from 'configs/config';
import fs from 'fs';
import { bot } from 'init/client';
import upath from 'upath';
import { type } from '..';

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
                baseURL: config.remoteLinkmapBaseURL,
                url: "/linkmap",
                method: "GET"
            }).then((res) => {
                for (const key in res.data) {
                    for (const page in res.data[key]) {
                        linkmap.addMap(key, page, res.data[key][page].kookLink, res.data[key][page].NSFWResult)
                    }
                }
                bot.logger.info("Downloaded linkmap from remote");
            }).catch((e) => {
                bot.logger.warn("Linkmap download failed, loading local");
                bot.logger.warn(e);
                load();
            })
        }
    }

    export async function upload() {
        if (config.maintainingRemoteLinkmap) {
            axios({
                baseURL: config.remoteLinkmapBaseURL,
                url: "/linkmap/update",
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${auth.remoteLinkmapToken}`,
                    'uuid': auth.remoteLinkmapUUID
                },
                data: diff,
                maxContentLength: Infinity
            }).then(() => {
                bot.logger.info("Linkmap uploaded");
                diff = {};
            }).catch((e) => {
                bot.logger.warn("Linkmap upload failed");
                if (e) {
                    bot.logger.warn(e.message);
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
            bot.logger.info(`Loaded linkmap from local`);
        } else {
            save();
            bot.logger.warn(`Linkmap not found, creating new`);
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
        fs.writeFile(upath.join(__dirname, "map.json"), JSON.stringify(map), (e) => {
            if (e) {
                bot.logger.warn(`Saving linkmap failed, error message: `);
                bot.logger.warn(e);
            }
            else {
                bot.logger.info(`Saved linkmap`);
            }
        });
    }
}