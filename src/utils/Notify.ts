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

    private sendAll () {
        for (const webhook of this.webhooks) {
            if (webhook.uri.includes('discordapp') && !webhook.uri.toLowerCase().endsWith('slack')) {
                if (webhook.uri.endsWith('/')) {
                    webhook.uri += 'slack';
                } else {
                    webhook.uri += '/slack';
                }
            }
            this.sendOne(webhook);
        };
    }

    sendOne (webhook: WebHook, message?: any) {
        console.log()
        if (this.check(webhook)) {
            if (!message) message = this.makeMessage(webhook);
            console.log(message);
            request({
                method: 'POST',
                uri: webhook.uri,
                json: true,
                body: message
            }).catch((e: any) => {
                let retry;
                logger.error(e.message);
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
        let color: string = webhook.color || this.randomColor();
        color = '#' + color;
        const usnername: string = webhook.branding || 'HalfBakedAIO';
        const author_name: string = `${this.data.message}${webhook.showParserAuthor?' - Parser by ' + (this.data.parserAuthor?this.data.parserAuthor:'xHalfBakedGuy'):''}`;
        const icon_url: string = webhook.userIcon || 'https://ghostaio.com/img/icon.png';
        const footer_icon: string = webhook.footerIcon || webhook.userIcon || 'https://ghostaio.com/img/icon.png';
        const footer: string = webhook.footerText || usnername + ' Monitor';
        const message: any = {	
            usnername, icon_url,
            attachments: [
                {
                    color, author_name, footer, footer_icon,
                    title: this.data.name,
                    title_link: this.data.url,
                    ts: new Date().getTime()/1000,
                    fields: []
                }
            ], 
        };
        if (this.data.send_unique) {
            message.attachments[0].fields.push({
                title: 'PID',
                value: this.data.opt_sku || this.data.unique_id,
                short: true
            })
        };
        message.attachments[0].fields.push({
            title: 'Price',
            value: this.data.price,
            short: true
        });
        if (this.data.additional) {
            message.attachments[0].fields.push({
                title: 'Additional Info',
                value: this.data.additional,
                short: true
            })
        }
        if (this.data.release_time) {
            message.attachments[0].fields.push({
                title: 'Release Time',
                value: this.data.release_time,
                short: false
            })
        }
        if (this.data.sizes) {
            message.attachments[0].fields.push({
                title: 'Sizes',
                value: this.data.sizes.join(', '),
                short: false
            })
        }
        if (this.data.locations) {
            message.attachments[0].fields.push({
                title: 'Locations',
                value: this.data.locations.join('\n'),
                short: false
            })
        }
        if (this.data.image) {
            message.attachments[0].thumb_url = this.data.image;
        }
        return message;
    }

    randomColor () {
        let arr: string[] = [
            (Math.floor(Math.random()*255)).toString(16),
            (Math.floor(Math.random()*255)).toString(16),
            (Math.floor(Math.random()*255)).toString(16)
        ];
        for (let i = 0; i < arr.length; i++) if (arr[i].length < 2) arr[i] = '0' + arr[1];
        return arr.join('').toUpperCase();
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
    showParserAuthor?: boolean;
    footerText?: string;
}
