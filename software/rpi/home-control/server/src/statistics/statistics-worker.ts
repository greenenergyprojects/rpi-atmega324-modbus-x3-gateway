
import * as debugsx from 'debug-sx';
const debug: debugsx.IFullLogger = debugsx.createFullLogger('statistics');

import * as fs from 'fs';

import { sprintf } from 'sprintf-js';

import { MonitorRecord, IMonitorRecord } from '../data/common/home-control/monitor-record';
import { StatisticsType, StatisticAttribute } from '../data/common/home-control/statistics';
import { IStatisticsDataConfig, StatisticsData } from './statistics-data';
import { StatisticsCache, StatisticsCacheConfig } from './statistics-cache';

interface IStatisticsConfig {
    disabled?: boolean;
    cache?: StatisticsCacheConfig;
    data: IStatisticsDataConfig [];
}


export class StatisticsWorker {

    // static SigNames = [ 'SIGABRT', 'SIGALRM', 'SIGBUS', 'SIGCHLD', 'SIGCONT', 'SIGFPE', 'SIGHUP', 'SIGILL', 'SIGINT', 'SIGIO',
    // 'SIGIOT', 'SIGPIPE', 'SIGPOLL', 'SIGPWR', 'SIGQUIT', 'SIGSEGV', 'SIGSTKFLT',
    // 'SIGSYS', 'SIGTERM', 'SIGTRAP', 'SIGTSTP', 'SIGTTIN', 'SIGTTOU', 'SIGUNUSED', 'SIGURG',
    // 'SIGUSR1', 'SIGUSR2', 'SIGVTALRM', 'SIGWINCH', 'SIGXCPU', 'SIGXFSZ', 'SIGBREAK', 'SIGLOST', 'SIGINFO' ];
    // 'SIGKILL', 'SIGSTOP', 'SIGPROF',

    public static getInstance (): StatisticsWorker {
        if (!this._instance) { throw new Error('instance not created'); }
        return this._instance;
    }

    public static async createInstance (config: IStatisticsConfig): Promise<StatisticsWorker> {
        if (this._instance) { throw new Error('instance already created'); }
        const rv = new StatisticsWorker(config);
        await rv.init();
        await StatisticsCache.createInstance(config.cache);
        this._instance = rv;
        return rv;
    }

    private static _instance: StatisticsWorker;

    // *****************************************************************************

    private _config: IStatisticsConfig;
    private _timer: NodeJS.Timer;
    private _received: MonitorRecord [] = [];
    private _data: StatisticsData [] = [];

    private constructor (config: IStatisticsConfig) {
        this._config = config;
        process.on('beforeExit',         (code)    => debug.info('event beforeExit: code = %d', code) );
        process.on('disconnect',         ()        => debug.info('event disconnect') );
        process.on('exit',               (code)    => debug.info('event exit with code %d', code) );
        process.on('rejectionHandled',   (promise) => debug.info('event rejectionHandled') );
        process.on('uncaughtException',  (error)   => debug.warn('event uncaughtException\n%e', error) );
        process.on('unhandledRejection', (reason, promise) => debug.warn('event unhandledRejection\n%d', reason) );
        process.on('warning',            (warning) => debug.warn('event warning\n%e', warning) );
        process.on('message',            (message, sendHandle) => this.handleMessage(message) );
        // process.on('newListener',        (type, listener) => debug.info('event newListener type %s', type) );
        process.on('removeListener',     (type, listener) => debug.info('event removeListener type %s', type) );
        process.on('SIGINT',             () => debug.info('signal SIGINT') );

        // Statistics.SigNames.forEach( (s) => {
        //     debug.info('add signal handler for %s', s);
        //     try {
        //         process.on(<NodeJS.Signals>s, () => { debug.info('signal %s', s); });
        //     } catch (err) {
        //         debug.warn('%e', err);
        //     }
        // });

        if (!config.disabled) {
            let cfg: IStatisticsDataConfig;
            try {
                for (cfg of config.data) {
                    this._data.push(new StatisticsData(cfg));
                }
            } catch (err) {
                debug.warn('config error in statistics data for file %s\n%e', cfg.file, err);
            }
        }
    }

    public async start () {
        if (this._timer) { throw new Error('already running'); }
        if (!this._config.disabled) {
            await StatisticsCache.getInstance().start();
            this._timer = setInterval( () => this.handleTimer(), 1000);
        }
    }

    public async shutdown (cause: string) {
        debug.info('shutdown (%s)', cause);
        // await this.delay(1000);
        if (this._timer) {
            clearInterval(this._timer);
            this._timer = null;
            await StatisticsCache.getInstance().stop();
            process.send('shutdown');
            await this.delay(100);
            process.exit(0);
        }
    }


    private async init () {
    }

    private async delay (ms: number) {
        return new Promise<void>( (res, rej) => {
            setTimeout( () => {
                res();
            }, ms);
        });
    }

    private handleMessage (message: any) {
        try {
            if (!message) { return; }
            if (message.shutdown) {
                this.shutdown(message.shutdown);
                return;
            }
            if (message.monitorRecord) {
                const mr = new MonitorRecord((<{ monitorRecord: IMonitorRecord }>message).monitorRecord);
                this._received.push(mr);
            } else {
                debug.warn('unknown message %o', message);
            }
        } catch (err) {
            debug.warn('handleMessage() fails\n%s\n%e', message, err);
        }
    }

    private handleTimer () {
        const r = this._received;
        const now = new Date();
        this._received = [];
        if (this._config.disabled) {
            return;
        }
        debug.finer('timer, handling %d monitor records', r.length);
        for (const d of this._data) {
            d.refresh(r);
        }
        StatisticsCache.getInstance().refresh(r);
    }

}
