import { bot } from 'init/client';
import { AppCommand, AppFunc, BaseSession, Card } from 'kbotify';
import * as pixivadmin from './common';

class Ping extends AppCommand {
    code = 'ping'; // 只是用作标记
    trigger = 'ping'; // 用于触发的文字
    intro = 'Ping';
    func: AppFunc<BaseSession> = async (session) => {
        if (!pixivadmin.common.isAdmin(session.userId)) {
            return session.reply("You do not have the permission to use this command")
        }
        const remoteOrigin = session.msg.msgTimestamp;
        const localOrigin = Date.now();
        session.sendCard(new Card()
            .addModule({
                "type": "section",
                "text": {
                    "type": "paragraph",
                    "cols": 2,
                    "fields": [
                        {
                            "type": "kmarkdown",
                            "content": `**LocalOrigin**\n(font)${localOrigin}(font)[success]`
                        },
                        {
                            "type": "kmarkdown",
                            "content": `**RemoteOrigin**\n(font)${remoteOrigin}(font)[primary]`
                        },
                        {
                            "type": "kmarkdown",
                            "content": `**LocalResponse**\n(font)N/A(font)[secondary]`
                        },
                        {
                            "type": "kmarkdown",
                            "content": `**RemoteResponse**\n(font)N/A(font)[secondary]`
                        }
                    ]
                }
            })).then((res) => {
                const localResponse = Date.now()
                const remoteReponse = res.msgSent?.msgTimestamp || -1;
                const messageId = res.msgSent?.msgId;
                if (messageId && remoteReponse) {
                    const localLatency = localResponse - localOrigin;
                    const remoteLatency = remoteReponse - remoteOrigin;
                    const originDiff = Math.abs(localOrigin - remoteOrigin);
                    const responseDiff = Math.abs(localResponse - remoteReponse);
                    const colorizeLatencyString = (time: number): string => {
                        return `(font)${time}ms(font)[${time > 1000 ? "danger" : time > 500 ? "warning" : "primary"}]`;
                    }
                    bot.API.message.update(messageId, new Card()
                        .addModule({
                            "type": "section",
                            "text": {
                                "type": "paragraph",
                                "cols": 2,
                                "fields": [
                                    {
                                        "type": "kmarkdown",
                                        "content": `**LocalOrigin**\n(font)${localOrigin}(font)[success]`
                                    },
                                    {
                                        "type": "kmarkdown",
                                        "content": `**RemoteOrigin**\n(font)${remoteOrigin}(font)[primary]`
                                    },
                                    {
                                        "type": "kmarkdown",
                                        "content": `**LocalResponse**\n(font)${localResponse}(font)[pink]`
                                    },
                                    {
                                        "type": "kmarkdown",
                                        "content": `**RemoteResponse**\n(font)${remoteReponse}(font)[purple]`
                                    }
                                ]
                            }
                        })
                        .addDivider()
                        .addText(`localLatency: ${colorizeLatencyString(localLatency)}`)
                        .addText(`remoteLatency: ${colorizeLatencyString(remoteLatency)}`)
                        .addText(`originDiff: ${colorizeLatencyString(originDiff)}`)
                        .addText(`repsonseDiff: ${colorizeLatencyString(responseDiff)}`)
                        .toString()
                    )
                }
            })
    }
}

export const ping = new Ping();


