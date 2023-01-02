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
        const userTimestamp = session.msg.msgTimestamp;
        const localTimeStamp = Date.now();
        session.sendCard(new Card()
            .addModule({
                "type": "section",
                "text": {
                    "type": "paragraph",
                    "cols": 3,
                    "fields": [
                        {
                            "type": "kmarkdown",
                            "content": `**Remote Origin**\n(font)${userTimestamp}(font)[primary]`
                        },
                        {
                            "type": "kmarkdown",
                            "content": `**Local Response**\n(font)${localTimeStamp}(font)[pink]`
                        },
                        {
                            "type": "kmarkdown",
                            "content": `**Remote Response**\n(font)N/A(font)[secondary]`
                        }
                    ]
                }
            })).then((res) => {
                const remoteTimeStamp = res.msgSent?.msgTimestamp || -1;
                const messageId = res.msgSent?.msgId;
                if (messageId && remoteTimeStamp) {
                    const latency = remoteTimeStamp - userTimestamp;
                    const timeDiff = Math.abs(remoteTimeStamp - localTimeStamp);
                    bot.API.message.update(messageId, new Card()
                        .addModule({
                            "type": "section",
                            "text": {
                                "type": "paragraph",
                                "cols": 3,
                                "fields": [
                                    {
                                        "type": "kmarkdown",
                                        "content": `**Remote Origin**\n(font)${userTimestamp}(font)[primary]`
                                    },
                                    {
                                        "type": "kmarkdown",
                                        "content": `**Local Response**\n(font)${localTimeStamp}(font)[pink]`
                                    },
                                    {
                                        "type": "kmarkdown",
                                        "content": `**Remote Response**\n(font)${remoteTimeStamp}(font)[purple]`
                                    }
                                ]
                            }
                        }).addText(`ResponseLatency: (font)${latency}ms(font)[${latency > 1000 ? "danger" : latency > 500 ? "warning" : "primary"}]`)
                        .addText(`TimeDiff: (font)${timeDiff}ms(font)[${timeDiff > 1000 ? "danger" : timeDiff > 500 ? "warning" : "primary"}]`)
                        .toString()
                    )
                }
            })
    }
}

export const ping = new Ping();


