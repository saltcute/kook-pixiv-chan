import ErrorCard from './error'
import NSFWCard from './nsfwWarning'
import TopCard from './top'
import AuthorCard from './author'
import DetailCard from './detail'
import ResavingCard from './resaving'
import CreditCard from './credit'
import RandomCard from './random'
import NotificationCard from './notification'
import TagCard from './tag'
import ChineseCommandMapping from './chineseCommandMapping'
import ProfileCard from './profile'
import ReachesLimit from './reachesLimit'
import MultiDetail from './multiDetail'
import SearchForAuthor from './searchForAuthor'

import GUIMain from './GUI/main'
import GUICMDLST from './GUI/command/list'
import GUICMDTOP from './GUI/command/top'
import { Card } from "kasumi.js"
import * as pixiv from ".."
import { users } from '..'
import config from 'configs/config'



export namespace cards {
    export type apexEvent = {
        isVIP?: boolean,
        isSendButtonClicked?: boolean,
        sendButtonPreviewImageLink?: string,
        isSent?: boolean,
        isSuccess?: boolean,
    }
    export class SingleCard extends Card {
        addApex(pid: number, link: string, apex?: apexEvent) {
            if (config.connectApex) {
                if (!apex?.isVIP) {
                    if (apex?.isSendButtonClicked || apex?.isSent || apex?.isSuccess) {
                        this.addText(`您需要购买 Apex助手 高级会员 才能将 (font)${pid}_p0.png(font)[pink] 设置为您的 Apex助手 背景图像。`)
                            .addModule({
                                "type": "action-group",
                                "elements": [
                                    {
                                        "type": "button",
                                        "theme": "primary",
                                        "value": "https://afdian.net/@night386",
                                        "click": "link",
                                        "text": {
                                            "type": "plain-text",
                                            "content": "前往购买"
                                        }
                                    },
                                    {
                                        "type": "button",
                                        "theme": "danger",
                                        "value": JSON.stringify({
                                            action: `portal.error.reset`
                                        }),
                                        "click": "return-val",
                                        "text": {
                                            "type": "plain-text",
                                            "content": "返回"
                                        }
                                    }
                                ]
                            }).addDivider();
                    } else {
                        this.addModule({
                            "type": "action-group",
                            "elements": [
                                {
                                    "type": "button",
                                    "theme": "secondary",
                                    "value": JSON.stringify({
                                        action: "portal.view.apex.normal",
                                        data: {
                                            trigger: 'detail',
                                            pid,
                                            link
                                        }
                                    }),
                                    "click": "return-val",
                                    "text": {
                                        "type": "plain-text",
                                        "content": "添加至 Apex助手"
                                    }
                                }
                            ]
                        })
                    }
                } else {
                    if (apex.isSendButtonClicked) {
                        this.addText(`您真的要将 (font)${pid}_p0.png(font)[pink] 设置为您的 Apex助手背景图像 吗？`);
                        if (apex.sendButtonPreviewImageLink) {
                            this.addModule({
                                "type": "context",
                                "elements": [
                                    {
                                        "type": "kmarkdown",
                                        "content": `低分辨率预览图像，与最后成品可能不同`
                                    }
                                ]
                            }).addModule(<any>{
                                type: "container",
                                elements: [
                                    {
                                        "type": "image",
                                        "src": apex.sendButtonPreviewImageLink
                                    }
                                ]
                            })
                        }
                        this.addModule({
                            "type": "action-group",
                            "elements": [
                                {
                                    "type": "button",
                                    "theme": "primary",
                                    "value": JSON.stringify({
                                        action: `portal.run.apex.send`,
                                        data: {
                                            trigger: 'detail',
                                            pid,
                                            link
                                        }
                                    }),
                                    "click": "return-val",
                                    "text": {
                                        "type": "plain-text",
                                        "content": "确定"
                                    }
                                },
                                {
                                    "type": "button",
                                    "theme": "danger",
                                    "value": JSON.stringify({
                                        action: `portal.view.reset`,
                                    }),
                                    "click": "return-val",
                                    "text": {
                                        "type": "plain-text",
                                        "content": "再想想"
                                    }
                                }
                            ]
                        }).addDivider();
                    } else if (apex.isSent) {
                        this.addText(`正在转存 (font)${pid}_p0.png(font)[pink]…请稍候`).addDivider();
                    } else if (apex.isSuccess) {
                        this.addText(`(font)设置成功！(font)[primary]`).addDivider();
                    } else {
                        this.addModule({
                            "type": "action-group",
                            "elements": [
                                {
                                    "type": "button",
                                    "theme": "primary",
                                    "value": JSON.stringify({
                                        action: `portal.view.apex.${apex?.isVIP ? 'VIP' : 'normal'}`,
                                        data: {
                                            trigger: 'detail',
                                            pid: pid,
                                            link
                                        }
                                    }),
                                    "click": "return-val",
                                    "text": {
                                        "type": "plain-text",
                                        "content": "添加至 Apex 助手"
                                    }
                                }
                            ]
                        })
                    }
                }
            }
            return this;
        }
    }

    export class MultiCard extends Card {
        addPID(pid: string[]) {
            if (pid.length >= 9) {
                this.addModule({
                    "type": "section",
                    "text": {
                        "type": "paragraph",
                        "cols": 3,
                        "fields": [
                            {
                                "type": "kmarkdown",
                                "content": `pid ${pixiv.common.pid2Markdown(pid[0])}\npid ${pixiv.common.pid2Markdown(pid[3])}\npid ${pixiv.common.pid2Markdown(pid[6])}`
                            },
                            {
                                "type": "kmarkdown",
                                "content": `pid ${pixiv.common.pid2Markdown(pid[1])}\npid ${pixiv.common.pid2Markdown(pid[4])}\npid ${pixiv.common.pid2Markdown(pid[7])}`
                            },
                            {
                                "type": "kmarkdown",
                                "content": `pid ${pixiv.common.pid2Markdown(pid[2])}\npid ${pixiv.common.pid2Markdown(pid[5])}\npid ${pixiv.common.pid2Markdown(pid[8])}`
                            }
                        ]
                    }
                })
            }
            return this;
        }
        addResave(link: string[], resave: boolean, id: string) {
            if (resave) {
                this.addText(`正在转存 \`${id}_p0.jpg\`，可能需要较长时间……(${link.length + 1}/9) ${(link.length + 1) % 2 == 1 ? ":hourglass_flowing_sand:" : ":hourglass:"}……`);
            }
            return this;
        }
        addNSFW(nsfw: boolean, id: string) {
            if (nsfw) {
                this.addText(`\`${id}_p0.jpg\` 含有不宜内容，已自动添加模糊。`)
                    .addModule({
                        "type": "context",
                        "elements": [
                            {
                                "type": "plain-text",
                                "content": "请避免主动查询 擦边球/R-18/R-18G 插画"
                            }
                        ]
                    });
            }
            return this;
        }
    }
    export namespace GUI {
        export function returnButton(destination: { action: string, text?: string }[]): any {
            return {
                "type": "action-group",
                "elements": (() => {
                    var arr: any[] = [];
                    for (var i = 0; i < 4 && i < destination.length; i++) {
                        arr.push({
                            "type": "button",
                            "theme": "warning",
                            "value": `{"action": "${destination[i].action}","data": {}}`,
                            "click": "return-val",
                            "text": {
                                "type": "plain-text",
                                "content": `返回${destination[i].text ? destination[i].text : ""}`
                            }
                        })
                    }
                    return arr;
                })()
            }
        };
        export function portalEntry(link: string[], pid: string[], type: "tag" | "top" | "random" | "author", data?: any): any {
            return {
                "type": "action-group",
                "elements": [
                    {
                        "type": "button",
                        "theme": "info",
                        "value": JSON.stringify({
                            action: "portal.view.detail",
                            data: {
                                ...data,
                                index: 0,
                                type: type,
                                link: link,
                                pid: pid
                            }
                        }),
                        "click": "return-val",
                        "text": {
                            "type": "plain-text",
                            "content": "查看第一张"
                        }
                    },
                    {
                        "type": "button",
                        "theme": "info",
                        "value": JSON.stringify({
                            action: "portal.view.detail",
                            data: {
                                ...data,
                                index: 8,
                                type: type,
                                link: link,
                                pid: pid
                            }
                        }),
                        "click": "return-val",
                        "text": {
                            "type": "plain-text",
                            "content": "查看最后一张"
                        }
                    }
                ]
            }
        }
        export const main = GUIMain;
        export namespace command {
            export const list = GUICMDLST;
            export const top = GUICMDTOP;
        }
    }
    export function getCommercials(): { type: 'context', elements: any[] } {
        return {
            "type": "context",
            "elements": [
                {
                    "type": "kmarkdown",
                    "content": config.commercialText || ''
                }
            ]
        }
    }
    export function getTierColor(tier: users.tiers) {
        switch (tier) {
            case 'Standard':
                return 'primary';
            case 'Backer':
                return 'warning';
            case 'Supporter':
                return 'pink';
            case 'Sponser':
                return 'danger';
        }
    }

    export const error = ErrorCard;
    export const nsfw = NSFWCard;
    export const top = TopCard;
    export const author = AuthorCard;
    export const detail = DetailCard;
    export const resaving = ResavingCard;
    export const credit = CreditCard;
    export const random = RandomCard;
    export const notification = NotificationCard;
    export const tag = TagCard;
    export const chineseCommandMapping = ChineseCommandMapping;
    export const profile = ProfileCard;
    export const reachesLimit = ReachesLimit;
    export const multiDetail = MultiDetail;
    export const searchForAuthor = SearchForAuthor;
}
