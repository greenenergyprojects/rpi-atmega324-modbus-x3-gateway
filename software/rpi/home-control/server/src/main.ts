export const VERSION = '1.3.0';

import * as cluster from 'cluster';
import * as fs from 'fs';
import * as path from 'path';

import * as nconf from 'nconf';

import * as debugsx from 'debug-sx';
import * as git from './utils/git';
import { MainApplication } from './main-application';
import { Statistics } from './statistics/statistics';


process.on('unhandledRejection', (reason, p) => {
    const now = new Date();
    console.log(now.toLocaleDateString() + '/' + now.toLocaleTimeString() + ': unhandled rejection at: Promise', p, 'reason:', reason);
});


// ***********************************************************
// configuration, logging
// ***********************************************************

nconf.argv().env();
const configFilename = path.join(__dirname, '../config.json');
try {
    fs.accessSync(configFilename, fs.constants.R_OK);
    nconf.file(configFilename);
} catch (err) {
    console.log('Error on config file ' + configFilename + '\n' + err);
    process.exit(1);
}

let debugConfig: any = nconf.get('debug');
if (!debugConfig) {
    debugConfig = { enabled: '*::*' };
}
for (const a in debugConfig) {
    if (debugConfig.hasOwnProperty(a)) {
        const name: string = (a === 'enabled') ? 'DEBUG' : 'DEBUG_' + a.toUpperCase();
        if (!process.env[name] && (debugConfig[a] !== undefined || debugConfig[a] !== undefined)) {
            process.env[name] = debugConfig[a] ? debugConfig[a] : debugConfig[a];
        }
    }
}

debugsx.addHandler(debugsx.createRawConsoleHandler());
let debug: debugsx.IDefaultLogger;

if (cluster.isMaster) {
    debug = debugsx.createDefaultLogger('main(master)');
} else {
    debug = debugsx.createDefaultLogger('main(child)');
}

// ***********************************************************
// class Main, start point of program
// ***********************************************************

export type WorkerIds = 'statistics';

export class Main {

    public static getInstance (): Main {
        if (!Main.instance) { throw new Error('instance not created yet'); }
        return Main.instance;
    }

    public static async createInstance (): Promise<Main> {
        if (Main.instance) { throw new Error('instance already created'); }
        Main.instance = new Main();
        await Main.instance.init();
        return Main.instance;
    }

    private static instance: Main;

    // *****************************************************************

    private _workers: { [ key in WorkerIds ]?: IWorker } = {};

    private constructor () {}

    public getRunningWorker(id: WorkerIds): cluster.Worker {
        const x = this._workers[id];
        if (!x || !x.worker || x.state !== 'online') {
            return null;
        }
        return x.worker;
    }

    public async shutdown (src: string) {
        const waiting: Promise<any> [] = [];
        waiting.push(MainApplication.getInstance().shutdown(src));
        const to = nconf.get('shutdownMillis');
        for (const id of Object.getOwnPropertyNames(this._workers)) {
            const x = <IWorker>(<any>this._workers)[id];
            waiting.push(this.shutdownWorker(x.worker, src, to > 0 ? to : 500));
        }
        Promise.all(waiting).then( () => {
            console.log('shutdown successful');
            process.exit(0);
        }).catch ( (err) => {
            console.log('shutdown fails', err);
            process.exit(1);
        });
    }

    private async shutdownWorker (w: cluster.Worker, src: string, timeoutMillis: number) {
        if (w.isConnected()) {
            const timer = setTimeout( () => { w.kill(); }, timeoutMillis);
            w.on('disconnect', () => {
                clearTimeout(timer);
            });
            w.send('shutdown');
        }
    }


    private async init () {
        cluster.on('exit', (worker: cluster.Worker, code: number, signal: string) => {
            for (const id of Object.getOwnPropertyNames(this._workers)) {
                const x = <IWorker>(<any>this._workers)[id];
                if (worker === x.worker) {
                    if (x.restartCount < 0) {
                        x.state = 'exit';
                        debug.info('worker %s exit (%d): %s', id, code, signal);
                    } else {
                        x.restartCount++;
                        debug.warn('worker %s exit (%d): %s\nRestart worker (%d)', id, code, signal, x.restartCount);
                        x.worker = cluster.fork({ worker: id });
                        x.state = 'starting';
                    }
                }
            }
        });
        cluster.on('online', (worker: cluster.Worker) => {
            for (const id of Object.getOwnPropertyNames(this._workers)) {
                const x = <IWorker>(<any>this._workers)[id];
                if (worker === x.worker) {
                    x.state = 'online';
                    debug.info('worker %s is online', id);
                }
            }
        });


        const config = nconf.get('statistics');
        if (!config || config.disabled) {
            this._workers.statistics = { worker: null, state: 'disabled', restartCount: -1 };
        } else {
            this._workers.statistics = { worker: cluster.fork({ worker: 'statistics' }), state: 'starting', restartCount: 0 };
            // this._workers.statistics.worker.on('message', (msg, handle) => debug.info('event message %s (%o)', msg, handle) );
        }
    }

}


if (cluster.isMaster) {
    Main.createInstance().then( () => {

        process.on('beforeExit',         (code)    => debug.info('event beforeExit: code = %d', code) );
        process.on('disconnect',         ()        => debug.info('event disconnect') );
        process.on('exit',               (code)    => debug.info('event exit with code %d', code) );
        process.on('rejectionHandled',   (promise) => debug.info('event rejectionHandled') );
        process.on('uncaughtException',  (error)   => debug.warn('event uncaughtException\n%e', error) );
        // process.on('unhandledRejection', (reason, promise) => debug.warn('event unhandledRejection\n%d', reason) );
        process.on('warning',            (warning) => debug.warn('event warning\n%e', warning) );
        process.on('message',            (message, sendHandle) => debug.info('event message %s (%o)', message, sendHandle) );
        // process.on('newListener',        (type, listener) => debug.info('event newListener type %s', type) );
        process.on('removeListener',     (type, listener) => debug.info('event removeListener type %s', type) );

        MainApplication.createInstance();
        process.on('SIGINT', () => {
            console.log('...caught interrupt signal...');
            Main.getInstance().shutdown('interrupt signal (CTRL + C)').catch( (err) => {
                console.log(err);
                process.exit(1);
            });
        });
        MainApplication.getInstance().start();
    }).catch( (err) => {
        console.log(err);
        process.exit(1);
    });

} else {
    switch (process.env.worker) {
        case 'statistics': {
            debug.info('statistics worker is starting...');
            Statistics.createInstance(nconf.get('statistics')).then( (statistics => {
                statistics.start().then( () => {
                    process.send({ started: true });
                }).catch ( (err) => process.send({ error: err }));
            })).catch( (err) => process.send({ error: err }));
            break;
        }
        default: {
            console.log('Error: unknown worker ist starting');
            break;
        }
    }
}

interface IWorker {
    worker: cluster.Worker;
    state: 'disabled' | 'starting' | 'online' | 'exit';
    restartCount: number;
}
