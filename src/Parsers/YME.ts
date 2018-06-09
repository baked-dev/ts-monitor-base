
class YMEParser {
    parse(res, url){
        let string = res.split('listingObj.listing.products.push')[1].split(');')[0] + ')';
        let data = [];
        let parsed = [];
        eval('data.push'+string);
        let index = 1;
        const splitted = res.split('href="/en/product/');
        for(let item of data){
            let obj: any = {};
            obj.name = this.clean(item.name);
            obj.unique_id = item.id;
            obj.price = item.price+"€";
            obj.url = 'https://www.ymeuniverse.com/en/product/' + splitted[index].split('"')[0];
            parsed.push(obj);
            index += 2;
        }
        return parsed;
    }
    parse_item (res) {
        const options = res.split('<option');
        const ret = [];
        let first = true
        for (const option of options) {
            if (first) first = false;
            else {
                const id = option.split('value="')[1].split('"')[0];
                if (id!=='-1') ret.push(`Size: ${this.clean(option.split('>')[1].split('</')[0])}\t SizeID: ${id}`)
            }
        }
        return {type: 'stockitems', stock: ret};
    }

    clean (data) {
        return data.replace(new RegExp('\n', 'g'),'').replace(new RegExp('\r', 'g'),'').replace(new RegExp('\t', 'g'),'').replace(new RegExp('&quot;', 'g'), '"').replace(new RegExp('&amp;','g'),'&').replace(new RegExp('&#039;','g'), "'");
    }
}

module.exports = new YMEParser;