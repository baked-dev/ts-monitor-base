import * as request from 'request-promise-native';
import logger from './Logger';

export default class Notify {

    private data: any;
    private webhooks: WebHook[];

    constructor (data: any, webhooks: WebHook[]) {
        this.data = data;
        this.webhooks = webhooks;
        this.sendAll();
    }

    sendAll () {
        for (const webhook of this.webhooks) this.sendOne(webhook);
    }

    sendOne (webhook: WebHook, message?: any) {
        if (this.check(webhook)) {
            message = message || this.makeMessage(webhook);
            request({
                method: 'POST',
                uri: webhook.uri,
                gzip: true,
                json: true,
                body: message
            }).catch((e: any) => {
                let retry;
                try {
                    retry = JSON.parse(e.message.split(' - ')[1]).retry_after;
                } catch(e) {
                    retry = undefined;
                } finally {
                    logger.error(`${retry?'Ratelimited, retrying after ' + retry + 'ms':'Error sending message'}`)
                    setTimeout(() => {
                        this.sendOne(webhook, message);
                    }, retry?retry:5000);
                }
            })
        }
    }

    //true if the message should send false if not
    check (webhook: WebHook) {
        if (webhook.sendAll) return true;
        else if (webhook.whitelist && webhook.whitelist.includes(this.data.site)) return true;
        else return false;
    }

    makeMessage (webhook: WebHook) {
        
    }

}

export interface WebHook {
    uri: string;
    sendAll?: string[];
    whitelist?: string[];
    color?: string;
    userIcon?: string;
    footerIcon?: string;
    branding?: string;
}