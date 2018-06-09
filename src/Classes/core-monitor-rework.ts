import * as fs from 'fs';
import * as request from 'request-promise-native';
import { CookieJar } from 'request';
import logger from '../utils/Logger';
import { Task } from './cluster';
import ProxyManager, { Manager } from '../utils/Proxy-Manager';
import cfBypass from '../utils/CF-Bypass';
import Notify, { WebHook } from '../utils/Notify';

logger._debug = true;

const headers = {
    "User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36"
};

let cfCookies: any = {};

export default class Monitor {

    public delay: number = 1000;
    public keywords: {
        positive: string[],
        negative: string[]
    }
    private runs: any = {};
    private persistentData: any = {};
    private id: number;
    private proxyManagers: any = {};
    private webHooks: WebHook[];

    constructor ({ sites }, id: number, keywords: {positive: string[], negative: string[]}, proxies: string[], webHooks: WebHook[]) {
        this.keywords = keywords;
        this.id = id;

        this.webHooks = webHooks;
        this.proxyManagers.default = new ProxyManager(proxies);

        for (const site of sites) {
            //load data
            this.loadData(site);
            this.runs[site.name] = 1;
            this.monitor(site);
        }
    }

    private monitor (site: Task) {
        if (site.cloudflare && !Object.keys(cfCookies).includes(site.name)) {
            cfBypass.bypass(site.urls[0], site.headers).then((jar) => {
                logger.success(site.name + ' - cf bypass success', this.id);
                cfCookies[site.name] = jar;
                this.monitor(site)
            }).catch(() => {
                logger.error(site.name + ' - cf bypass error', this.id);
                this.monitor(site);
            })
        } else {
            logger.success(site.name + ' - starting new run: ' + (this.runs[site.name]++).toString(), this.id)
            let proxyManager: Manager;
            const jar: CookieJar = site.cloudflare?cfCookies[site.name]:request.jar();
            if (site.useProxies || site.proxies) proxyManager = this.getProxyManager(site);
            for (const url of site.urls) {
                const options: any = {
                    method:"GET",
                    uri:url,
                    gzip:true,
                    headers: site.headers || headers,
                    jar
                }
                if (site.useProxies || site.proxies) options.proxy = `http://${proxyManager.next()}/`;
                if (site.request) Object.assign(options, site.request);
                request(options).then((res: any) => {
                    let change: boolean = false;
                    for (const item of site.parser.parse(res)) {
                        if (!Object.keys(this.persistentData[site.name].newItem).includes(item.unique_id)) {
                            item.message = `New Item on ${site.name} ${item.region?item.region:''}`;
                            item.site = site.name;
                            new Notify(item, this.webHooks);
                            logger.success(`${site.name} - found new item: ${item.name}`, this.id);
                            change = true;
                            this.persistentData[site.name].newItem[item.unique_id] = item;
                            if (site.restock && this.keywords.positive.some(e => e.split('+').every(f => item.name.toLowerCase().includes(f))) && !this.keywords.negative.some(e => e.split('+').every(f => item.name.toLowerCase().includes(f)))){
                                logger.success(`${site.name} - starting restock monitor for: ${item.name}`, this.id);
                               // this.monitorItem(site, item);
                            }
                        }
                    }
                    if (change) this.saveData(site.name);
                })
            }
            setTimeout(() => {
                this.monitor(site);
            }, site.delay || this.delay);
        }   
    }

    private monitorItem (site: Task,  item: any) {
        if (!this.persistentData[site.name].restock.includes(item.unique_id)) {
            this.persistentData[site.name].restock.push(item.unique_id);
            this.saveData(site.name);
        }
        const jar = site.cloudflare?cf_cookies[site.name]:request.jar();
        request({
            method:'GET',
            uri: item.url,
            headers: site.headers || headers,
            gzip:true,
            jar
        }).then((res) => {
            const { stock, type } = site.parser.parse_item(res, item.url);
            if (type === 'stockitems') {
                let restock = false;
                if (this.persistentData[site.name].newItem[item.unique_id].sizes === false) {
                    this.persistentData[site.name].newItem[item.unique_id].sizes = [];
                }
                for (const product of stock) if (!this.persistentData[site.name].newItem[item.unique_id].sizes.includes(product)) {
                    restock = true;
                }
                this.persistentData[site.name].newItem[item.unique_id].sizes = stock;
                if (restock) {
                    item.message = `Restock on ${site.name} ${item.region?item.region:''}`;
                    this.saveData(site.name);
                }
            } else if (type === 'stocknumbers') {

            }
        })
    }

    private getProxyManager (site: Task) {
        if (site.proxies) {
            if (!this.proxyManagers[site.name]) {
                this.proxyManagers[site.name] = new ProxyManager(site.proxies);
            }
            return this.proxyManagers[site.name];
        } else return this.proxyManagers.default;
    }

    private loadData (site: Task) {
        return new Promise((resolve, reject) => {
            try {
                this.persistentData[site.name] = JSON.parse(fs.readFileSync(`./data/${site.name}_data.json`).toString());
                logger.success(`${site.name} - successfully loaded data`, this.id);
                if (site.restock) for (const item of this.persistentData[site.name].restock) {
                    this.monitorItem(site, this.persistentData[site.name].newItem[item]);
                }
                resolve();
            } catch(e) {
                logger.error(`${site} - Error loading data, creating empty data file`, this.id);
                this.persistentData[site.name] = {
                    restock: [],
                    newItem: {}
                };
                this.saveData(site.name);
                resolve();
            }
        })
    }

    private saveData (site: string) {
        fs.writeFile(`./data/${site}_data.json`, JSON.stringify(this.persistentData[site]), 'utf-8', () => {
            logger.success(site + ' - data saved successfully', this.id);
        }) 
    }
}