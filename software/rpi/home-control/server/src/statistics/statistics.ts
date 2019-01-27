
import * as debugsx from 'debug-sx';
const debug: debugsx.IFullLogger = debugsx.createFullLogger('statistics');

import * as fs from 'fs';

import { sprintf } from 'sprintf-js';

import { MonitorRecord, IMonitorRecord } from '../data/common/home-control/monitor-record';
import { StatisticsType, StatisticAttributes } from '../data/common/home-control/statistics';

interface IStatisticsConfig {
    disabled?: boolean;
    db: {
        disabled?: boolean;
        typ: 'csv';
        file: { path: string }
        ids:   StatisticAttributes [];
        range: StatisticsType;
    } [];
}


export class Statistics {

    public static getInstance (): Statistics {
        if (!this._instance) { throw new Error('instance not created'); }
        return this._instance;
    }

    public static async createInstance (config: IStatisticsConfig): Promise<Statistics> {
        if (this._instance) { throw new Error('instance already created'); }
        const rv = new Statistics(config);
        await rv.init();
        this._instance = rv;
        return rv;
    }

    private static _instance: Statistics;

    // *****************************************************************************

    private _config: IStatisticsConfig;
    private _timer: NodeJS.Timer;
    private _received: MonitorRecord [] = [];
    private _cnt = 0;

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

        // process.on(Signals, listener: SignalsListener): this;

    }

    public async start () {
        if (this._timer) { throw new Error('already running'); }
        if (!this._config.disabled) {
            this._timer = setInterval( () => this.handleTimer(), 1000);
        }
    }

    public async stop () {
        if (this._timer) {
            clearInterval(this._timer);
            this._timer = null;
            process.exit(0);
        }
    }


    private async init () {
    }

    private handleMessage (message: any) {
        try {
            if (message && message.monitorRecord) {
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
        this._received = [];
        if (this._config.disabled) {
            return;
        }
        debug.finer('timer, handling %d monitor records', r.length);
    }

}
