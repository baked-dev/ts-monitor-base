//yme, naked, wellgosh, TGWO, footdistrict, asphaltgold, porter, solebox, device one, consortium, Afew-store, 43einhalb, Overkill
const logger = require('./utils/logger');
const fs = require('fs');
const request = require('request-promise-native');
const cloudscraper = require('./utils/cf-bypass');
const message = require('./utils/message');
const ProxyManager = require('./utils/proxy-manager');
const headers = {
    "User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36"
};
const proxies = [
    "95.211.175.167:13401",
    "95.211.175.225:13401",
    "163.172.48.109:15014",
    "163.172.48.117:15014",
    "163.172.48.119:15014",
    "163.172.48.121:15014",
    "163.172.48.109:15015",
    "163.172.48.117:15015",
    "163.172.48.119:15015",
    "163.172.48.121:15015",
    "163.172.48.109:15016",
    "163.172.48.117:15016",
    "163.172.48.119:15016",
    "163.172.48.121:15016",
    "163.172.48.109:15017",
    "163.172.48.117:15017",
    "163.172.48.119:15017",
    "163.172.48.121:15017",
    "163.172.48.109:15018",
    "163.172.48.117:15018",
    "163.172.48.119:15018",
    "163.172.48.121:15018",
    "163.172.48.109:15019",
    "163.172.48.117:15019",
    "163.172.48.119:15019",
    "163.172.48.121:15019",
    "163.172.48.109:15020",
    "163.172.48.117:15020",
    "163.172.48.119:15020",
    "163.172.48.121:15020",
    "163.172.48.109:15021",
    "163.172.48.117:15021",
    "163.172.48.119:15021",
    "163.172.48.121:15021",
    "163.172.48.109:15022",
    "163.172.48.117:15022",
    "163.172.48.119:15022",
    "163.172.48.121:15022",
    "163.172.48.109:15023",
    "163.172.48.117:15023",
    "163.172.48.119:15023",
    "163.172.48.121:15023",
    "163.172.36.181:15014",
    "163.172.36.191:15014",
    "163.172.36.197:15014",
    "163.172.36.207:15014",
    "163.172.36.181:15015",
    "163.172.36.191:15015",
    "163.172.36.197:15015",
    "163.172.36.207:15015",
    "163.172.36.181:15016",
    "163.172.36.191:15016",
    "163.172.36.197:15016",
    "163.172.36.207:15016",
    "163.172.36.181:15017",
    "163.172.36.191:15017",
    "163.172.36.197:15017",
    "163.172.36.207:15017",
    "163.172.36.181:15018",
    "163.172.36.191:15018",
    "163.172.36.197:15018",
    "163.172.36.207:15018",
    "163.172.36.181:15019",
    "163.172.36.191:15019",
    "163.172.36.197:15019",
    "163.172.36.207:15019",
    "163.172.36.181:15020",
    "163.172.36.191:15020",
    "163.172.36.197:15020",
    "163.172.36.207:15020",
    "163.172.36.181:15021",
    "163.172.36.191:15021",
    "163.172.36.197:15021",
    "163.172.36.207:15021",
    "163.172.36.181:15022",
    "163.172.36.191:15022",
    "163.172.36.197:15022",
    "163.172.36.207:15022",
    "163.172.36.181:15023",
    "163.172.36.191:15023",
    "163.172.36.197:15023",
    "163.172.36.207:15023",
]

let cf_cookies = {};
class MultiSiteMonitor{
    constructor ({ sites }, id, keywords) {
        this.id = id;
        logger.success('Multi Site Monitor Worker initialized..', this.id);
        logger.pending('loading persistent data..', this.id);
        this.delay = 1000;
        this.keywords = keywords;
        this.runs = {};
        this.proxy_manager = new ProxyManager(proxies);
        this.persistent_data = {};
        
        for (let site of sites) {
            console.log(site.tasks);
            this.load_data(site.name).then(() => {
                for (const task of site.tasks) this.monitor_item(site, this.persistent_data[site.name][task]);
            });
            this.runs[site.name] = 1;
            this.monitor(site);
        }
    }
    monitor (site) {
        if (site.cloudflare && !Object.keys(cf_cookies).some(e => e===site.name)) {
            logger.pending(site.name+" - bypassing cloudflare..", this.id);
            cloudscraper.bypass(site.urls[0], site.headers).then((jar) => {
                logger.success(site.name+" - cloudflare bypass success", this.id)
                cf_cookies[site.name] = jar;
                this.monitor(site);
            }).catch((e) => {
                logger.fail(site.name+' - error bypassing cloudflare', this.id)
                this.monitor(site)
            })
        } else {
            let jar = site.cloudflare?cf_cookies[site.name]:request.jar();
            logger.pending(site.name+" - starting new run: "+this.runs[site.name]++, this.id);
            for (let url of site.urls){
                let options = {
                    method:"GET",
                    uri:url,
                    gzip:true,
                    headers: site.headers || headers,
                    jar
                };
                options.proxy = `http://${this.proxy_manager.next()}/`;
                options = site.request?Object.assign(options, site.request):options;
                request(options).then((res) => {
                    let change = false;
                    const started = new Date().getTime();
                    let logged = false;
                    for (let item of site.parser.parse(res, url)){
                        if (!logged) {
                            logged = true;
                            logger.success(site.name + ' - parsing complete, took: ' + (new Date().getTime() - started).toString());
                        }
                        if (!Object.keys(this.persistent_data[site.name]).some(e => this.persistent_data[site.name][e].unique_id === item.unique_id)) {
                            message.new_item(item, url);
                            change = true;
                            logger.success(`${site.name} - found new item: ${item.name}`, this.id)
                            this.persistent_data[site.name][item.unique_id] = item;
                            if (site.restock && this.keywords.positive.some(e => e.split('+').every(f => item.name.toLowerCase().includes(f))) && !this.keywords.negative.some(e => e.split('+').every(f => item.name.toLowerCase().includes(f)))){
                                logger.success(`${site.name} - starting restock monitor for: ${item.name}`, this.id);
                                this.monitor_item(site, item);
                            }
                        }
                    };
                    if (change) this.save_data(site.name);
                }).catch((e) => {
                    logger.fail(site.name+' - error loading data'), this.id;
                    if (site.cloudflare) {
                        logger.fail(site.name+' - deleting cloudflare cookies and retriyng', this.id);
                        try {
                            delete cf_cookies[site.name];
                        } catch(e) {}
                    }
                })
            } 
            setTimeout(this.monitor.bind(this), this.delay, site);
        }
    }
    monitor_url (site, url) {

    }
    monitor_item (site, item) {
        if (!site.tasks.includes(item.unique_id)) this.update_tasks(site.name, item.unique_id);
        let jar = site.cloudflare?cf_cookies[site.name]:request.jar();
        request({
            method:'GET',
            uri: item.url,
            headers: site.headers || headers,
            gzip:true,
            jar
        }).then((res) => {
            const started = new Date().getTime();
            const { stock, type } = site.parser.parse_item(res, item.url);
            logger.success(`${site.name} - item parsing complete, took ${new Date().getTime() - started}ms`);
            if (type === 'stockitems') {
                let restock = false;
                if (this.persistent_data[site.name][item.unique_id].sizes === false) {
                    this.persistent_data[site.name][item.unique_id].sizes = [];
                }
                for (const product of stock) if (!this.persistent_data[site.name][item.unique_id].sizes.includes(product)) {
                    restock = true;
                }
                this.persistent_data[site.name][item.unique_id].sizes = stock;
                if (restock) {
                    message.restock(item, stock);
                    this.save_data(site.name);
                }
            } else if (type === 'stocknumbers') {

            }
        })
    }
    save_data (site) {
        fs.writeFile(`./data/${site}_data.json`, JSON.stringify(this.persistent_data[site]), 'utf-8', () => {
            logger.success(site + ' - data saved successfully', this.id);
        }) 
    }
    update_tasks (site, id) {
        let tasks = require('./data/tasks.json');
        if (!tasks[site]) tasks[site] = [];
        tasks[site].push(id);
        console.log(tasks[site].length);
        fs.writeFile('./data/tasks.json', JSON.stringify(tasks), () => {
            logger.success(site + ' - updated tasks file');
        })
    }
    load_data (site) {
        return new Promise((resolve, reject) => {
            try {
                this.persistent_data[site] = JSON.parse(fs.readFileSync(`./data/${site}_data.json`));
                logger.success(`${site} - successfully loaded data`, this.id);
                resolve();
            } catch(e) {
                logger.fail(`${site} - Error loading data, creating empty data file`, this.id);
                this.persistent_data[site] = {};
                this.save_data(site);
                resolve();
            }
        })
        
    }
}

module.exports = MultiSiteMonitor;