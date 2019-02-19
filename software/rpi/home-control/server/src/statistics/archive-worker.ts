import * as debugsx from 'debug-sx';
const debug: debugsx.IFullLogger = debugsx.createFullLogger('ArchiveWorker');

import * as fs from 'fs';
import * as zlib from 'zlib';

import { sprintf } from 'sprintf-js';
import * as tmp from 'tmp';

import { StatisticsData } from './statistics-data';
import { StatisticsDataCollection, IStatisticsDataCollection } from '../data/common/home-control/statistics-data-collection';
import { Statistics, StatisticAttribute, StatisticsType } from '../data/common/home-control/statistics';
import { MonitorRecord } from '../data/common/home-control/monitor-record';
import { Backup, IBackup } from './backup';
import { Archive } from './archive';
import { ArchiveResponse, IArchiveResponse } from '../data/common/home-control/archive-response';
import { ArchiveRequest } from '../data/common/home-control/archive-request';


export interface ArchiveConfig {
    disabled?: boolean;
    path?: { [ key in StatisticsType ]?: { path: string } };
}


export class ArchiveWorker {

    public static async createInstance (config: ArchiveConfig): Promise<ArchiveWorker> {
        if (ArchiveWorker._instance !== undefined) { throw new Error('instance already created'); }
        ArchiveWorker._instance = new ArchiveWorker(config);
        await ArchiveWorker._instance.init();
        return ArchiveWorker._instance;
    }

    public static getInstance (): ArchiveWorker {
        if (ArchiveWorker._instance === undefined) { throw new Error('instance not created'); }
        return ArchiveWorker._instance;
    }

    private static _instance: ArchiveWorker;

    // **************************************************************

    private _config: ArchiveConfig;
    private _archive: Archive;
    private _timer: NodeJS.Timer;

    private constructor (config?: ArchiveConfig) {
        this._config = config || { disabled: true };
        if (this._config.disabled) { return; }
        this._archive = new Archive(config);

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
    }

    public async start () {
        if (this._config.disabled) { return; }
    }


    public async shutdown (cause: string) {
        debug.info('shutdown (%s)', cause);
        // await this.delay(1000);
        if (this._timer) {
            clearInterval(this._timer);
            this._timer = null;
        }
        process.send('shutdown');
        await this.delay(100);
        process.exit(0);
    }

    public async getArchive (req: ArchiveRequest): Promise<ArchiveResponse> {
        const rv: IArchiveResponse = {
            request: req.toObject(),
            result: {}
        };
        return new ArchiveResponse(rv);
    }

    private async init () {
        try {
        } catch (err) {
            debug.warn('init fails\n%e', err);
        }
    }

    private async delay (ms: number) {
        return new Promise<void>( (res, rej) => {
            setTimeout( () => {
                res();
            }, ms);
        });
    }

    private async handleMessage (message: any) {
        try {
            if (!message) { return; }
            if (message.shutdown) {
                this.shutdown(message.shutdown);
                return;
            }
            debug.finer('message received:\%o', message);
            try {
                const r = await this._archive.get(new ArchiveRequest(message.request));
                process.send({ id: message.id, response: r });
            } catch (err) {
                debug.warn('handleMessage() fails\n%e', err);
                process.send({ id: message.id, errorClass: err.constructor.name, error: err });
            }
        } catch (err) {
            debug.warn('handleMessage() fails\n%s\n%e', message, err);
        }
    }

}
