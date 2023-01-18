import { bot } from 'init/client';
import { ButtonClickEvent } from 'kaiheila-bot-root';
export default async function (event: ButtonClickEvent, action: string[], data: any) {
    bot.axios({
        url: '/v3/message/view',
        params: {
            msg_id: event.targetMsgId,
        }
    }).then((res) => {
        // console.log(res.data);
        bot.API.message.update(event.targetMsgId, res.data.data.content, undefined, event.userId)
            .catch((e) => {
                bot.logger.error(e);
            })
    }).catch((e) => {
        bot.logger.error(e);
    })
}