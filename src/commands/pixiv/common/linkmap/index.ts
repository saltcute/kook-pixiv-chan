import fs from 'fs';
import upath from 'upath';

var map: any;
export namespace linkmap {
    export function load(): void {
        if (fs.existsSync(upath.join(__dirname, "map.json"))) {
            map = JSON.parse(fs.readFileSync(upath.join(__dirname, "map.json"), { encoding: "utf-8", flag: "r" }));
            console.log(`[${new Date().toLocaleTimeString()}] Loaded "linkmap.json"`);
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

    export function getLink(illustID: string): string {
        if (isInDatabase(illustID)) {
            return map[illustID];
        } else {
            return "";
        }
    }

    export function addLink(illustID: string, illustLink: string): void {
        map[illustID] = illustLink;
    }

    export function saveLink() {
        fs.writeFile(upath.join(__dirname, "map.json"), JSON.stringify(map), (err) => {
            if (err) {
                console.log(`[${new Date().toLocaleTimeString()}] Saving "linkmap.json" failed, error message: `);
                console.log(err);
            }
            else {
                console.log(`[${new Date().toLocaleTimeString()}] Saved "linkmap.json"`);
            }
        });
    }
}