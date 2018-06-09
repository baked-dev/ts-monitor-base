import * as fs from 'fs';
import * as request from 'request-promise-native';
import { CookieJar } from 'request';
import logger from '../utils/Logger';
import { Task } from './cluster';
import ProxyManager, { Manager } from '../utils/Proxy-Manager';
import cfBypass from '../utils/CF-Bypass';

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

    constructor ({ sites }, id: number, keywords: {positive: string[], negative: string[]}, proxies: string[]) {
        this.keywords = keywords;
        this.id = id;

        this.proxyManagers.default = new ProxyManager(proxies);

        for (const site of sites) {
            //load data
            this.loadData(site.name);
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
                        if (!Object.keys(this.persistentData[site.name]).includes(item.unique_id)) {
                            logger.success(`${site.name} - found new item: ${item.name}`, this.id);
                            change = true;
                            this.persistentData[site.name][item.unique_id] = item;
                        }
                    }
                    if (change) this.saveData(site.name);
                })
            }
            
        }
        
    }

    private getProxyManager (site: Task) {
        if (site.proxies) {
            if (!this.proxyManagers[site.name]) {
                this.proxyManagers[site.name] = new ProxyManager(site.proxies);
            }
            return this.proxyManagers[site.name];
        } else return this.proxyManagers.default;
    }

    private loadData (site: string) {
        return new Promise((resolve, reject) => {
            try {
                this.persistentData[site] = JSON.parse(fs.readFileSync(`./data/${site}_data.json`).toString());
                logger.success(`${site} - successfully loaded data`, this.id);
                resolve();
            } catch(e) {
                logger.error(`${site} - Error loading data, creating empty data file`, this.id);
                this.persistentData[site] = {};
                this.saveData(site);
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