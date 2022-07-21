import config from '../../../../configs/config';

export namespace common {
    export function isAdmin(id: string): boolean {
        console.log(id);
        console.log(config.adminList);
        console.log(config.adminList.includes(id));
        return config.adminList.includes(id);
    }
}