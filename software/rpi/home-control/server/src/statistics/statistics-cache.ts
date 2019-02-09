
import * as debugsx from 'debug-sx';
const debug: debugsx.IFullLogger = debugsx.createFullLogger('StatisticsCache');

import * as fs from 'fs';

import { sprintf } from 'sprintf-js';
import * as tmp from 'tmp';

import { StatisticsData } from './statistics-data';
import { StatisticsDataCollection, IStatisticsDataCollection } from './statistics-data-collection';
import { Statistics, StatisticAttribute, StatisticsType } from '../data/common/home-control/statistics';
import { MonitorRecord } from '../data/common/home-control/monitor-record';
import { Backup, IBackup } from './backup';

export interface StatisticsCacheConfig {
    disabled?: boolean;
    init?: boolean | { path: string };
    backup?: { path: string, periodSeconds: number, rotate: number };
}

export class StatisticsCache {

    public static async createInstance (config: StatisticsCacheConfig): Promise<StatisticsCache> {
        if (StatisticsCache._instance !== undefined) { throw new Error('instance already created'); }
        StatisticsCache._instance = new StatisticsCache(config);
        await StatisticsCache._instance.init();
        return StatisticsCache._instance;
    }

    public static getInstance (): StatisticsCache {
        if (StatisticsCache._instance === undefined) { throw new Error('instance not created'); }
        return StatisticsCache._instance;
    }

    private static _instance: StatisticsCache;

    // **************************************************************

    private _config: StatisticsCacheConfig;
    private _data: { [ id in StatisticAttribute ]?: { [ type in StatisticsType ]?: StatisticsDataCollection }} = {};
    private _ids: StatisticAttribute [];
    private _lastBackupAt: Date;

    private constructor (config?: StatisticsCacheConfig) {
        this._config = config || { disabled: true };
        if (this._config.disabled) { return; }
        this._ids = <StatisticAttribute []>Object.getOwnPropertyNames(Statistics.defById);
        for (const id of this._ids) {
            const d = Statistics.defById[id];
            if (!d) { continue; }
            const types = <StatisticsType []>Object.getOwnPropertyNames(d.type);
            this._data[id] = { };
            for (const t of types) {
                this._data[id][t] = new StatisticsDataCollection(id, t, d);
            }
        }
    }

    public async start () {
        if (this._config.disabled) { return; }
    }

    public async stop () {
        if (this._config.disabled) { return; }
    }

    public refresh (records: MonitorRecord[]) {
        if (this._config.disabled) { return; }
        for (const r of records) {
            for (const id of this._ids) {
                const d = Statistics.defById[id];
                if (!d) { continue; }
                const types = <StatisticsType []>Object.getOwnPropertyNames(d.type);
                for (const t of types) {
                    const coll = this._data[id][t];
                    if (coll.isCollectionFinished(r.createdAt)) {
                        coll.reset();
                    }
                    coll.addValue(r);
                }
            }
        }
        if (this._config.backup && this._config.backup.path && this._config.backup.periodSeconds > 0) {
            if (!this._lastBackupAt || (((Date.now() - this._lastBackupAt.getTime()) / 1000) >= this._config.backup.periodSeconds)) {
                this.backup();
            }
        }
    }

    private async init () {
        try {
            let x: Backup;
            if (this._config.init === true) {
                try {
                    const s = fs.readFileSync(this._config.backup.path);
                    x = new Backup(JSON.parse(s.toString()));
                } catch (err1) {
                    debug.warn('init from backup %s fails\n%e', this._config.backup.path, err1);
                    const rotate = this._config.backup.rotate > 0 ? this._config.backup.rotate : 4;
                    for (let i = 1; i <= rotate; i++) {
                        const fn = this._config.backup.path + '.' + i;
                        try {
                            const s = fs.readFileSync(fn);
                            x = new Backup(JSON.parse(s.toString()));
                        } catch (err2) {
                            debug.warn('init from backup %s fails\n%e', fn, err1);
                        }
                    }
                }
            } else if (this._config.init) {
                const s = fs.readFileSync(this._config.init.path);
                x = new Backup(JSON.parse(s.toString()));
            }
            if (!x) { throw new Error('reading backup object fails'); }
            let cnt = 0;
            for (const c of x.data) {
                const old = this._data[c.id][c.type];
                if (old && old.cnt > 0) {
                    debug.warn('multiple collection for id=%s type=%s', c.id, c.type);
                }
                this._data[c.id][c.type] = c;
                cnt++;
            }
            debug.info('init from backup %s successful, %d collections initialized', x.createdAt.toISOString(), cnt);

        } catch (err) {
            debug.warn('init fails\n%e', err);
        }
    }

    private backup () {
        this._lastBackupAt = new Date();
        const collections: IStatisticsDataCollection [] = [];
        for (const id of this._ids) {
            const d = Statistics.defById[id];
            if (!d) { continue; }
            const types = <StatisticsType []>Object.getOwnPropertyNames(d.type);
            for (const t of types) {
                const coll = this._data[id][t];
                collections.push(coll.toObject());
            }
        }
        const backup: IBackup = { createdAt: new Date(), data: collections };
        const s =  JSON.stringify(backup, null, 2);
        tmp.dir({ mode: 0o755, template: '/tmp/home-control-XXXXXX'}, (err1, path, cleanupCallback) => {
            if (err1) {
                debug.warn('backup fails, (1)-> cannot create temporary file\n%e', err1);
            } else {
                const fn = path + '/backup.json';
                fs.writeFile(fn, s, (err2) => {
                    try {
                        if (err2) { throw new StatisticsCacheError('(2)-> writing file fails', err2); }
                        const f = fs.statSync(fn);
                        try {
                            const rotate = this._config.backup.rotate > 0 ? this._config.backup.rotate : 4;
                            for (let i = (rotate - 1); i >= 1; i--) {
                                if (fs.existsSync(this._config.backup.path + '.' + i)) {
                                    fs.renameSync(this._config.backup.path + '.' + i, this._config.backup.path + '.' + (i + 1));
                                }
                            }
                            if (fs.existsSync(this._config.backup.path)) {
                                fs.renameSync(this._config.backup.path, this._config.backup.path + '.1');
                            }
                            fs.renameSync(fn, this._config.backup.path);
                            debug.finer('backup written to %s', this._config.backup.path);
                        } catch (err3) {
                            throw new StatisticsCacheError('(3)-> renaming files fails', err3);
                        } finally {
                            try { fs.unlinkSync(fn); } catch (err4) {}
                        }
                        try {
                            cleanupCallback();
                        } catch (err5) {
                            throw new StatisticsCacheError('(5)-> cleanupCallback() fails', err5);
                        }
                    } catch (err) {
                        debug.warn('backup fails\n%e', err);
                    }
                });
            }
        });

    }
}

export class StatisticsCacheError extends Error {
    constructor (msg: string, public cause: Error) { super(msg); }
}

