export default new class Logger {

    private startTS: number = new Date().getTime();
    public _debug: boolean = false;
    public _log: boolean = true;

    public success (message: any, task: number = 0) {
        if (this._log) {
            let padding: string = '';
            for (let i: number = 0; i < (4 - task.toString().length); i++) padding += ' ';
            let debugTime: string= '[' + (new Date().getTime() -  this.startTS).toString() + 'ms]';
            const padding2 = 15 - debugTime.length;
            if (this._debug) for (let i:number = 0; i < padding2; i++) debugTime += ' ';
            else if (!this._debug) debugTime = '';
            if (typeof message === 'object'){
                if (message.name) message = message.name; 
                else message = JSON.stringify(message);
            };
            console.log("\x1b[35m", `[${new Date().toISOString().split('T')[1]}]${debugTime}[TASK ${task}]${padding}`, "\x1b[32m", '[SUCCESS]' , "\x1b[37m", `- ${message}`)
        }
        return this;
    }

    public error (message: any, task: number = 0) {
        if (this._log) {
            let padding: string = '';
            for (let i: number = 0; i < (4 - task.toString().length); i++) padding += ' ';
            let debugTime: string= '[' + (new Date().getTime() -  this.startTS).toString() + 'ms]';
            const padding2 = 15 - debugTime.length;
            if (this._debug) for (let i:number = 0; i < padding2; i++) debugTime += ' ';
            else if (!this._debug) debugTime = '';
            if (typeof message === 'object'){
                if (message.name) message = message.name; 
                else message = JSON.stringify(message);
            };
            console.log("\x1b[35m", `[${new Date().toISOString().split('T')[1]}]${debugTime}[TASK ${task}]${padding}`, "\x1b[31m", ' [ERROR] ' , "\x1b[37m", `- ${message}`)
        }
        return this;
    }

    public log (message: any, task: number = 0) {
        if (this._log) {
            let padding: string = '';
            for (let i: number = 0; i < (4 - task.toString().length); i++) padding += ' ';
            let debugTime: string= '[' + (new Date().getTime() -  this.startTS).toString() + 'ms]';
            const padding2 = 15 - debugTime.length;
            if (this._debug) for (let i:number = 0; i < padding2; i++) debugTime += ' ';
            else if (!this._debug) debugTime = '';
            if (typeof message === 'object'){
                if (message.name) message = message.name; 
                else message = JSON.stringify(message);
            };
            console.log("\x1b[35m", `[${new Date().toISOString().split('T')[1]}]${debugTime}[TASK ${task}]${padding}`, "\x1b[34m", '[WAITING]' , "\x1b[37m", `- ${message}`)
        }
        return this;
    }

    public debug (message: any, task: number = 0) {
        if (this._log && this._debug) {
            let padding: string = '';
            for (let i: number = 0; i < (4 - task.toString().length); i++) padding += ' ';
            let debugTime: string= '[' + (new Date().getTime() -  this.startTS).toString() + 'ms]';
            const padding2 = 15 - debugTime.length;
            if (this._debug) for (let i:number = 0; i < padding2; i++) debugTime += ' ';
            else if (!this._debug) debugTime = '';
            if (typeof message === 'object'){
                if (message.name) message = message.name; 
                else message = JSON.stringify(message);
            };
            console.log("\x1b[35m", `[${new Date().toISOString().split('T')[1]}]${debugTime}[TASK ${task}]${padding}`, "\x1b[33m", ' [DEBUG] ' , "\x1b[37m", `- ${message}`)
        }
        return this;
    }
}