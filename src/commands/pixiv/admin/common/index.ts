import config from '../../../../configs/config';

export namespace common {
    export function isAdmin(id: string): boolean {
        return config.adminList.includes(id);
    }
}