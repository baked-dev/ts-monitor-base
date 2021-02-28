import { startMonitor, addTask, Task, setProxies, setNegativeKeywords, setPositiveKeywords, addWebhook } from './Classes/cluster';

// adding global keywords to the monitor
setPositiveKeywords([
    'air+jordan+the+10'
]);

// this webhook will only send parser events from the nikeSNKRS parser.  
addWebhook({
    uri: 'DISCORD WEBHOOK URI',
    color: 'FB8D8C',
    branding: 'HalfBakedAIO',
    userIcon: 'https://avatars.githubusercontent.com/u/20746494?s=60&u=c557fbc900d505742ca56113e1a2a45a057e5bac&v=4',
    footerIcon: 'https://avatars.githubusercontent.com/u/20746494?s=60&u=c557fbc900d505742ca56113e1a2a45a057e5bac&v=4',
    whitelist: ['nikeSNKRS'],
    showParserAuthor: true
});

// this will configure the framwork to request these 2 URIs and run their contents against the nikeSNKRS parser.  
addTask({
    urls:[
        'https://api.nike.com/commerce/productfeed/products/v1.5/snkrs/threads?country=US&locale=en_US&limit=20',
        'https://api.nike.com/commerce/productfeed/products/v1.5/snkrs/threads?country=GB&locale=en_GB&limit=20'
    ],
    name: 'nikeSNKRS',
    tasks: []
});

// after setting up the monitor WebHooks and Tasks we start the monitor here.  
startMonitor();