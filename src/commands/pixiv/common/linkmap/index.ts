import fs from 'fs';
import { NSFWJS } from 'nsfwjs';
import upath from 'upath';
import { common, type } from '..';

export namespace linkmap {
    var map: {
        [key: string]: {
            [key: string]: linkmap
        }
    };
    type linkmap = {
        kookLink: string,
        NSFWResult: type.detectionResult,
        suggestion: {
            ban: boolean
            blurAmount: number
        }
    }

    export function load(): void {
        if (fs.existsSync(upath.join(__dirname, "map.json"))) {
            map = JSON.parse(fs.readFileSync(upath.join(__dirname, "map.json"), { encoding: "utf-8", flag: "r" }));
            common.log(`Loaded linkmap`);
        } else {
            map = {};
        }
    }

    export function isInDatabase(illustID: string): boolean {
        if (map.hasOwnProperty(illustID)) {
            return true;
        } else {
            return false;
        }
    }

    export function getLink(illustID: string, page: string): string {
        if (isInDatabase(illustID)) {
            return map[illustID][page].kookLink;
        } else {
            return "";
        }
    }

    export function addLink(illustID: string, illustPage: string, illustLink: string, detectionResult: type.detectionResult): void {
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
    }

    export function saveLink() {
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