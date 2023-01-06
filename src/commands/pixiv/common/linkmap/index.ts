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
                bot.logger.debug("Linkmap: Successfuly uploaded linkmap");
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

    export function isInDatabase(illustID: string | number, page: string): boolean {
        illustID = illustID.toString();
        if (map.hasOwnProperty(illustID)) {
            if (map[illustID].hasOwnProperty(page)) {
                return true;
            } else return false;
        } else {
            return false;
        }
    }

    export function getLink(illustID: string | number, page: string): string {
        illustID = illustID.toString();
        if (isInDatabase(illustID, page)) {
            return map[illustID][page].kookLink;
        } else {
            return common.akarin;
        }
    }

    export function getDetection(illustID: string | number, page: string): type.detectionResult {
        illustID = illustID.toString();
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

    export function getSuggestion(illustID: string | number, page: string): {
        ban: boolean
        blurAmount: number
    } {
        illustID = illustID.toString();
        if (isInDatabase(illustID, page)) {
            return map[illustID][page].suggestion;
        } else {
            return {
                ban: false,
                blurAmount: 7
            };
        }
    }

    export function addMap(illustID: string | number, illustPage: string, illustLink: string, detectionResult: type.detectionResult): void {
        illustID = illustID.toString();
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
                bot.logger.debug(`Linkmap: Successfully saved linkmap`);
            }
        });
    }
}