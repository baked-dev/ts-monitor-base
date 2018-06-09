import { startMonitor, addTask, Task, setProxies, setNegativeKeywords, setPositiveKeywords, addWebhook } from './Classes/cluster';
import * as fs from 'fs';

//setProxies(JSON.parse(fs.readFileSync('./proxies.json').toString()));

setPositiveKeywords([
    'air+jordan+the+10'
])

addWebhook({
    uri: 'https://discordapp.com/api/webhooks/441805529594068993/cdqSEW0IrkQdi8MjiQBnfOB6CE0VWLM_-6jvIRa50Ulg_nAqZie8eiGQzGTtdsc8UXcH',
    color: 'FB8D8C',
    branding: 'HalfBakedAIO',
    userIcon: 'https://ghostaio.com/img/icon.png',
    footerIcon: 'https://ghostaio.com/img/icon.png',
    whitelist: ['nikeSNKRS'],
    showParserAuthor: true
})

addTask({
    urls:[
        'https://api.nike.com/commerce/productfeed/products/v1.5/snkrs/threads?country=US&locale=en_US&limit=20',
        'https://api.nike.com/commerce/productfeed/products/v1.5/snkrs/threads?country=GB&locale=en_GB&limit=20'
    ],
    name: 'nikeSNKRS',
    tasks: []
});

startMonitor();