export default class ProxyManager {

    public proxies: string[];
    private index: number = 0;

    constructor (proxies: string[]) {
        this.proxies = proxies;
    }

    current () {
        return this.proxies[this.index];
    }

    next () {
        this.index ++;
        if (this.index === this.proxies.length) this.index = 0;
        return this.proxies[this.index];
    }

    random () {
        return this.proxies[(Math.floor(Math.random() * this.proxies.length))];
    }

}

export interface Manager {
    proxies: string[],
    index: number,
    current: () => string;
    next: () => string;
    random: () => string;
}