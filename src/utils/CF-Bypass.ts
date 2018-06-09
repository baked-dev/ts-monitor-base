import * as request from 'request-promise-native';
import * as cloudscraper from 'cloudscraper';

const _headers = {
    "User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36"
};

export default class CFBypass {
    static bypass(url, headers = undefined){
        return new Promise((resolve,reject) => {
            let jar = request.jar();
            cloudscraper.request({
                method: 'GET',
                headers: headers || _headers,
                gzip:true,
                jar,
                url
            }, (err, res, body) => {
                if(err){
                    reject(err)
                }else{
                    if(!jar.getCookieString(`https://${url.split('//')[1].split('/')[0]}/`).includes('cf_clearance')){
                        reject()
                    }else{
                        resolve(jar)
                    }
                }
            })
        })
    }
}