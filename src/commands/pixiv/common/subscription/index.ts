import { BaseSession } from "kbotify";

export namespace subscription {
    var codeList = {// test only
        
    }
    export function getCodeDetail(code: string) {
        return 
    }
    export async function redeem(session: BaseSession, code: string) {
        const codeDetail = getCodeDetail(code);
    }
}