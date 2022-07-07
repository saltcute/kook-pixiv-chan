import fs from 'fs';
import upath from 'upath';

var map: any;
export namespace linkmap {
    export function load(): void {
        map = JSON.parse(fs.readFileSync(upath.join(__dirname, "map.json"), { encoding: "utf-8", flag: "r" }));
        console.log(`[${new Date().toLocaleTimeString()}] loaded "linkmap.json"`);
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
                console.log(`[${new Date().toLocaleTimeString()}] saving "linkmap.json" failed, error message: `);
                console.log(err);
            }
            else {
                console.log(`[${new Date().toLocaleTimeString()}] saved "linkmap.json"`);
            }
        });
    }
}