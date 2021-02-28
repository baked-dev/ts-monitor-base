# ts-monitor-base  

Project I made a while ago to monitor webpages for changes and post updates to discord.  
Uses cluster to utilize all CPU cores.  
Proxy support.  
Cloudflare Bypass (probably doesnt work anymore)  
This is just a framework around custom parsers that need to be supplied by the user.  
Allows to be ran with multiple different parsers and webhooks.  
I provided examples for parsers in src/Parsers.  

## Usage  

1. Clone this repo  
2. Configure the framework from the ts-monitor-base.ts (refer to src/monitor-base.ts)  
3. start using npm start or yarn start  

## Configuration  

the cluster module from (Classes/cluster.ts) exports methods to configure how the monitor cluster will behave  

- addTask(task: Task): void
Method to add a Task to the framework

- addWebhook(webhook: WebHook): void  
Method to add a webhook to be used by the framework.  

- startMonitor(): void  
Method to start monitoring pages.  

- addProxy(proxy: string): void  
Method to add a single proxy to be used by the framework.  

- addProxies(proxies: string[]): void  
Method to add multiple proxies to be used by the framework.  

- setProxies(proxies: string[]): void  
Method to set the proxies used by the framework. This method overrides the proxy list.  

- addPositiveKeyword(keyword: string): void  
Method to add a positive keyword to be used by the framework.  

- addNegativeKeyword(keyword: string): void  
Method to add a negative keyword to be used by the framework.  

- setPositiveKeywords(keywords: string[]): void  
Method to set the positive keyword list used by the framework.  

- setNegativeKeywords(keywords: string[]): void  
Method to set the negative keyword list used by the framework.  

## Interfaces

### Task
```typescript
    // list of URLs to monitor
    urls: string[];
    // name of the sute to monitor    
    name: string;
    // use this to pass the parser directly. By default the framework tries to import the parser from ./src/Parsers/TASKNAME.ts
    parser?: any;       
    // requires Cloudflare bypass
    cloudflare?: boolean;
    // http headers to be used when requesting the sites
    headers?: any;
    // custom request options
    request?: any;
    // proxies to be used by the task
    proxies?: string[];
    // indicates if the task should use proxies
    useProxies?: boolean;
    // task specific keywords
    keywords?: {
        positive: string[],
        negative: string[];
    },
    // delay between monitor cycles
    delay?: number;
```

### WebHook
```typescript
    // webhook uri
    uri: string;
    // toggle this to send all events to this webhook
    sendAll?: boolean;
    // set a list of parsers that send events to this webhook
    whitelist?: string[];
    // color of the webhook embed, defaults to use random colors every time
    color?: string;
    // url to the User Icon sent to discord
    userIcon?: string;
    // url to the Footer Icon sent to discord
    footerIcon?: string;
    // User Name to be sent to discord
    branding?: string;
    // toggles if the author name sent to discord contains the parser author or just the name of the found Item
    showParserAuthor?: boolean;
    // Footer Text to be sent to discord
    footerText?: string;
```

### Item
Parsers take the websites response as a string and are parsing that into an Array of these Items
```typescript
    // name of the parsed item
    name: string;
    // image of the parsed item
    image?: string;
    // price of the parsed item
    price?: string;
    // release time of the parsed item
    release_time?: string;
    // unique id of the parsed item
    unique_id?: string;
    // optional Stock Keeping Unit of the item
    opt_sku?: string;
    // addintional information of the parsed item
    additional?: string;
    // region of the parsed item
    region?: string
```

## Notes  

I decided making this public as its one of my first TypeScript projects. Looking back at it i have learned a lot of what TS offers which i could have used in this project.  