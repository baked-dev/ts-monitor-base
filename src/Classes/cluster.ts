import * as cluster from 'cluster';
import { cpus, freemem } from 'os';
import logger from '../utils/Logger';
import Monitor from './core-monitor-rework';
import { WebHook } from '../utils/Notify';

logger._debug = true;

let tasks: Task[] = [];
let split_tasks: {
    sites: Task[],
    amount: number
}[] = [];
let proxies: string[] = [];
let keywords = {
    positive: [],
    negative: []
}
let webHooks: WebHook[];

export const startMonitor = () => {
    for (let core = 0; core < cpus().length; core++) {
        split_tasks[core] = {
            sites: [],
            amount: 0,
        };
    }

    const best_worker  = () => {
        let lowest_val: any = false;
        let lowest_key: any = false;
        for (let key in split_tasks) {
            if (lowest_val === false || split_tasks[key].amount < lowest_val) {
                lowest_val = split_tasks[key].amount;
                lowest_key = key;
            }
        }
        return lowest_key;
    }

    for (let task of tasks) {
        const worker = best_worker();
        split_tasks[worker].sites.push(task);
        split_tasks[worker].amount += (task.urls.length + task.tasks.length);
    }

    if (cluster.isMaster) {
        const formatBytes = (bytes) => {
            if(bytes < 1024) return bytes + " Bytes";
            else if(bytes < 1048576) return(bytes / 1024).toFixed(3) + " KB";
            else if(bytes < 1073741824) return(bytes / 1048576).toFixed(3) + " MB";
            else return(bytes / 1073741824).toFixed(3) + " GB";
        };
        logger.success('MultiSiteMonitor Framework by xHalfBakedGuy started');
        logger.success(`Loaded Sites: ${tasks.length}\tCPU Cores: ${cpus().length}\tRAM available: ${formatBytes(freemem())}`)
        logger.debug('Master started... splitting up tasks and starting workers');
        for (let core = 0; core < cpus().length; core++) {
            cluster.fork();
        }
    } else {
        const workerTasks = split_tasks[cluster.worker.id - 1];
        logger.success(`Worker ready... monitoring ${workerTasks.sites.length} Site(s) with ${workerTasks.amount} URL(s)`, cluster.worker.id);
        if (workerTasks.amount) logger.debug('Site(s): ' + workerTasks.sites.map(x => x.name).join(), cluster.worker.id);
        new Monitor(workerTasks, cluster.worker.id, keywords, proxies);
    }
}

export const addTask = (task: Task) => {
    if (!task.parser) task.parser = require('../Parsers/' + task.name);
    tasks.push(task);
}

export const addProxy = (proxy: string) => {
    proxies.push(proxy);
}

export const addProxies = (prxies: string[]) => {
    for (const prxy of prxies) proxies.push(prxy);
}

export const setProxies = (prxies: string[]) => {
    proxies = prxies;
}

export const addWebhook = (webhook: WebHook) => {
    webHooks.push(webhook);
}

export const addPositiveKeyword = (kw: string) => {
    keywords.positive.push(kw);
}

export const addNegativeKeyword = (kw: string) => {
    keywords.positive.push(kw);
}

export const setPositiveKeywords = (kw: string[]) => {
    keywords.positive = kw;
}

export const setNegativeKeywords = (kw: string[]) => {
    keywords.positive = kw;
}

export interface Task {
    urls: string[];
    parser?: any;
    name: string;
    cloudflare?: boolean;
    tasks: any;
    restock?: boolean;
    headers?: any;
    request?: any;
    proxies?: string[];
    useProxies?: boolean;
    keywords?: {
        positive: string[],
        negative: string[];
    }
}

