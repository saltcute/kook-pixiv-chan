import axios from 'axios';
import auth from 'configs/auth';
import config from 'configs/config';
import fs, { link } from 'fs';
import { bot } from 'init/client';
import upath from 'upath';
import { common, type } from '..';

export namespace linkmap {
    export var map: {
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
                linkmap.map = res.data;
                bot.logger.info("Initialization: Downloaded linkmap from remote");
            }).catch(async (e) => {
                bot.logger.warn("Initialization: Failed downloading linkmap.");
                bot.logger.warn(e);
                await load();
                bot.logger.warn("Initialization: Loaded local linkmap");
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
                bot.logger.info("Linkmap: Successfuly uploaded linkmap");
                diff = {};
            }).catch((e) => {
                bot.logger.warn("Linkmap: Failed uploading linkmap");
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
            bot.logger.info(`Initialization: Loaded local linkmap`);
        } else {
            save();
            bot.logger.warn(`Initialization: Linkmap not found, creating new`);
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
            return common.akarin;
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
                bot.logger.warn(`Linkmap: Failed saving linkmap`);
                bot.logger.warn(e);
            }
            else {
                bot.logger.info(`Linkmap: Successfully saved linkmap`);
            }
        });
    }
}