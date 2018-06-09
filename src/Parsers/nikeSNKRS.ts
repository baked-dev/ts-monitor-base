
class NikeSNKRSParser {
    parse (res) {
        const data = JSON.parse(res);
        let ret = [];
        for (let release of data.threads) {
            let parsed: any = {};
            parsed.name = release.name;
            parsed.image = release.imageUrl;
            if (release.product.price) parsed.price = release.product.price.currentRetailPrice.toString();
            let newTime = new Date(`${release.product.startSellDate}Z`);
            parsed.release_time = newTime.toLocaleString(`en-${data.country}`, {timeZone:`UTC`});
            parsed.unique_id = release.id;
            parsed.opt_sku = `${release.product.style}-${release.product.colorCode}`
            parsed.url = `https://nike.com/${data.country === 'US'?'en':'gb'}/launch/t/` + release.seoSlug;
            parsed.additional = `Restricted: ${release.restricted?'YES':'NO'}   Launch-Type: ${release.product.publishType !== 'FLOW'?release.product.publishType + ' - ' + release.product.selectionEngine:release.product.publishType}`;
            parsed.region = data.country;
            if (release.product.skus) parsed.sizes = release.product.skus.map(e => `${e.nikeSize}`);
            ret.push(parsed);
        }
        return ret;
    }
}

module.exports = new NikeSNKRSParser;