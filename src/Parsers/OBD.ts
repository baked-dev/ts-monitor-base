class OBDParser {
    parse (res) {
        const data = JSON.parse(res).payload.list;
        const ret = [];
        for (const product of data) {
            let productdata: any = {};
            productdata.unique_id = product.id;
            productdata.url = product.permalink;
            productdata.image = product.coverObject.url;
            productdata.name = product.manufacturer.title + ' ' + product.title;
            productdata.price = product.displayPrice + '€';
            productdata.release_time = product.jsAvailableFrom;
            ret.push(productdata);
        }
        return ret;
    }
    parse_item (body) {
        try {
            let data: any = "";
            const ret = [];
            const datastring =  'data = ' + body.split('var preloadedStock = ')[1].split('}];')[0]+'}]';
            console.log(datastring);
            eval(datastring);
            console.log(data);
            for (let size of data) ret.push(`ID:${size.id}\t Variant: ${size.variant}(EU${size.ordering})`);
            return {type: 'stockitems', stock: ret};
        } catch(e){
            console.log(e);
            return []; 
        }
    }
}

module.exports = new OBDParser;