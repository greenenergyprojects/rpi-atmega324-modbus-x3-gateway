
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
import { thisExpression } from 'babel-types';

export type StatisticsCacheSavePeriodType =  'never' | 'always' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';
export interface IStatisticsCacheSaveOptions {
    pretty?: boolean;
}


export interface StatisticsCacheConfig {
    disabled?: boolean;
    init?: boolean | { path: string };
    backup?: { path: string, periodSeconds: number, rotate: number };
    save?: { [ key in StatisticsCacheSavePeriodType ]?: { path: string, options?: IStatisticsCacheSaveOptions } };
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
    private _lastSaveAt: Date;
    private _lastSaveCheckedAt: { [ type in StatisticsType ]?: Date } = {};

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
        if (!Array.isArray(records)) {
            debug.warn('missing records array...??');
        } else {
            for (const r of records) {
                for (const id of this._ids) {
                    const d = Statistics.defById[id];
                    if (!d) { continue; }
                    const types = <StatisticsType []>Object.getOwnPropertyNames(d.type);
                    for (const t of types) {
                        this.save(t, r.createdAt);
                        const coll = this._data[id][t];
                        if (coll.isCollectionFinished(r.createdAt)) {
                            coll.reset();
                        }
                        coll.addValue(r);
                    }
                }
            }
        }

        if (this._config.backup && this._config.backup.path && this._config.backup.periodSeconds > 0) {
            if (!this._lastBackupAt || (((Date.now() - this._lastBackupAt.getTime()) / 1000) >= this._config.backup.periodSeconds)) {
                this.backup();
            }
        }

        // if (this._config.save) {
        //     for (const period of Object.getOwnPropertyNames(this._config.save)) {
        //         const p = <StatisticsCacheSavePeriodType> period;
        //         const cfg = this._config.save[p];
        //         if (!cfg.path || typeof cfg.path !== 'string') {
        //             debug.warn('invalid config.save, missing path (%o)', cfg);
        //             continue;
        //         }
        //         const now = Array.isArray(records) ? records[records.length - 1].createdAt : new Date();
        //         let ts: Date;
        //         let diff: { year: boolean, month: boolean, week: boolean, day: boolean, hour: boolean, min: boolean };
        //         if (!this._lastSaveAt) {
        //             diff = { year: false, month: false, week: false, day: false, hour: false, min: false };
        //         } else {
        //             if (this._lastSaveAt.getFullYear() !== now.getFullYear()) {
        //                 diff = { year: true, month: true, week: true, day: true, hour: true, min: true };
        //                 ts = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
        //             } else if (this._lastSaveAt.getMonth() !== now.getMonth()) {
        //                 diff = { year: false, month: true, week: true, day: true, hour: true, min: true };
        //                 ts = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
        //             } else if (this.getWeekNumber(this._lastSaveAt).week !== this.getWeekNumber(now).week) {
        //                 diff = { year: false, month: false, week: true, day: true, hour: true, min: true };
        //                 ts = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        //             } else if (this._lastSaveAt.getDay() !== now.getDay()) {
        //                 diff = { year: false, month: false, week: false, day: true, hour: true, min: true };
        //                 ts = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0);
        //             } else if (this._lastSaveAt.getHours() !== now.getHours()) {
        //                 diff = { year: false, month: false, week: false, day: false, hour: true, min: true };
        //                 ts = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0);
        //             } else if (this._lastSaveAt.getMinutes() !== now.getMinutes()) {
        //                 diff = { year: false, month: false, week: false, day: false, hour: false, min: true };
        //                 ts = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes());
        //             } else {
        //                 diff = { year: false, month: false, week: false, day: false, hour: false, min: false };
        //             }
        //         }
        //         this._lastSaveAt = now;

        //         const options = cfg.options || {};
        //         const path = this.replaceControls(cfg.path, ts);
        //         switch (p) {
        //             case 'never': break;
        //             case 'year':   if (diff.year)  { this.saveOld(ts, path, p, options); } break;
        //             case 'month':  if (diff.month) { this.saveOld(ts, path, p, options); } break;
        //             case 'week':   if (diff.week)  { this.saveOld(ts, path, p, options); } break;
        //             case 'day':    if (diff.day)   { this.saveOld(ts, path, p, options); } break;
        //             case 'hour':   if (diff.hour)  { this.saveOld(ts, path, p, options); } break;
        //             case 'minute': if (diff.min)   { this.saveOld(ts, path, p, options); } break;
        //             case 'always': this.saveOld(ts, path, p, options); break;
        //             default: debug.warn('invalid config save period %s -> skipping save', p);
        //         }
        //     }
        // }
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

    private replaceControls (s: string, at?: Date): string {
        at = at || new Date();
        s = s.replace(/%YYYY/g, sprintf('%04d', at.getFullYear()));
        s = s.replace(/%YY/g, sprintf('%02d', at.getFullYear() - Math.round((at.getFullYear() / 100)) * 100));
        s = s.replace(/%WWW/g, sprintf('%04d-%02d', this.getWeekNumber(at).year, this.getWeekNumber(at).week));
        s = s.replace(/%WW/g, sprintf('%02d', this.getWeekNumber(at).week));
        s = s.replace(/%W/g, sprintf('%1d', this.getWeekNumber(at).week));
        s = s.replace(/%MM/g, sprintf('%02d', at.getMonth() + 1));
        s = s.replace(/%M/g, sprintf('%d', at.getMonth() + 1));
        s = s.replace(/%DD/g, sprintf('%02d', at.getDate()));
        s = s.replace(/%D/g, sprintf('%d', at.getDate()));
        s = s.replace(/%hh/g, sprintf('%02d', at.getHours()));
        s = s.replace(/%ms/g, sprintf('%02d', at.getMilliseconds()));
        s = s.replace(/%m/g, sprintf('%02d', at.getMinutes()));
        s = s.replace(/%s/g, sprintf('%02d', at.getSeconds()));
        return s;
    }

    private getWeekNumber (d: Date): { year: number, week: number } {
        // https://stackoverflow.com/questions/6117814
        // every week starts on monday, week=1 is first week
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil(( ( (d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
        return { year: d.getUTCFullYear(), week: weekNo };
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

    private save (type: StatisticsType, now: Date) {
        const lastCheckedAt = this._lastSaveCheckedAt[type];
        let tPeriod: { min: Date, max: Date };
        if (lastCheckedAt) {
            if (lastCheckedAt.getFullYear() !== now.getFullYear()) {
                if (type !== 'total') {
                    tPeriod = { min: null, max: null};
                }
            } else if (lastCheckedAt.getMonth() !== now.getMonth()) {
                if (type !== 'total' && type !== 'year') {
                    tPeriod = { min: null, max: null};
                }
            } else if (this.getWeekNumber(lastCheckedAt).week !== this.getWeekNumber(now).week) {
                if (type !== 'total' && type !== 'year' && type !== 'month') {
                    tPeriod = { min: null, max: null};
                }
            } else if (lastCheckedAt.getDate() !== now.getDate()) {
                if (type === 'day' || type === 'hour' || type === 'minute') {
                    tPeriod = { min: null, max: null};
                }
            } else if (lastCheckedAt.getHours() !== now.getHours()) {
                if (type === 'hour' || type === 'minute') {
                    tPeriod = { min: null, max: null};
                }
            } else if (lastCheckedAt.getMinutes() !== now.getMinutes()) {
                if (type === 'minute') {
                    tPeriod = { min: null, max: null};
                }
            }

            if (tPeriod) {
                switch (type) {
                    case 'year': {
                        let t2 = new Date(now.getFullYear());
                        t2 = new Date(t2.getTime() - 1);
                        tPeriod.min = new Date(t2.getFullYear());
                        tPeriod.max = t2;
                        break;
                    }
                    case 'month': {
                        let t2 = new Date(now.getFullYear(), now.getMonth());
                        t2 = new Date(t2.getTime() - 1);
                        tPeriod.min = new Date(t2.getFullYear(), t2.getMonth());
                        tPeriod.max = t2;
                        break;
                    }
                    case 'week': {
                        let t2 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                        t2 = new Date(t2.getTime() - 1);
                        tPeriod.min = new Date(t2.getTime() - 7 * 24 * 60 * 60 * 1000 + 1);
                        tPeriod.max = t2;
                        break;
                    }
                    case 'day': {
                        let t2 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                        t2 = new Date(t2.getTime() - 1);
                        tPeriod.min = new Date(t2.getFullYear(), t2.getMonth(), t2.getDate());
                        tPeriod.max = t2;
                        break;
                    }
                    case 'hour': {
                        let t2 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());
                        t2 = new Date(t2.getTime() - 1);
                        tPeriod.min = new Date(t2.getFullYear(), t2.getMonth(), t2.getDate(), t2.getHours());
                        tPeriod.max = t2;
                        break;
                    }
                    case 'minute': {
                        let t2 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes());
                        t2 = new Date(t2.getTime() - 1);
                        tPeriod.min = new Date(t2.getFullYear(), t2.getMonth(), t2.getDate(), t2.getHours(), t2.getMinutes());
                        tPeriod.max = t2;
                        break;
                    }
                    default: {
                        debug.warn('save() -> unsupported type %s', type);
                        tPeriod = null;
                        break;
                    }
                }
            }
        }

        this._lastSaveCheckedAt[type] = now;

        if (tPeriod) {
            debug.info('---> save %s %o', type, tPeriod);
        }

        //     if (lastCheckedAt.getFullYear() !== now.getFullYear()) {
        //         doSave = true;
        //         ts = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
        //     } else if (this._lastSaveAt.getMonth() !== now.getMonth()) {
        //         diff = { year: false, month: true, week: true, day: true, hour: true, min: true };
        //         ts = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
        //     } else if (this.getWeekNumber(this._lastSaveAt).week !== this.getWeekNumber(now).week) {
        //         diff = { year: false, month: false, week: true, day: true, hour: true, min: true };
        //         ts = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        //     } else if (this._lastSaveAt.getDay() !== now.getDay()) {
        //         diff = { year: false, month: false, week: false, day: true, hour: true, min: true };
        //         ts = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0);
        //     } else if (this._lastSaveAt.getHours() !== now.getHours()) {
        //         diff = { year: false, month: false, week: false, day: false, hour: true, min: true };
        //         ts = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0);
        //     } else if (this._lastSaveAt.getMinutes() !== now.getMinutes()) {
        //         diff = { year: false, month: false, week: false, day: false, hour: false, min: true };
        //         ts = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes());
        //     } else {
        //         diff = { year: false, month: false, week: false, day: false, hour: false, min: false };
        //     }
        // }
    }

    private saveOld (refDate: Date, path: string, type: StatisticsCacheSavePeriodType, options: IStatisticsCacheSaveOptions) {
        try {
            let ts: { min: Date, max: Date };
            switch (type) {
                case 'minute': {
                    refDate = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate(), refDate.getHours(), refDate.getMinutes());
                    ts = { min: new Date(refDate.getTime() - 60000), max: new Date(refDate.getTime() - 1 )};
                    debug.fine('--> save %s, %o', type, ts);
                    break;
                }
                case 'hour': {
                    refDate = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate(), refDate.getHours(), 0);
                    ts = { min: new Date(refDate.getTime() - 60 * 60000), max: new Date(refDate.getTime() - 1 )};
                    debug.fine('--> save %s, %o', type, ts);
                    break;
                }
                case 'day': {
                    refDate = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate(), 0, 0);
                    ts = { min: new Date(refDate.getTime() - 24 * 60 * 60000), max: new Date(refDate.getTime() - 1 )};
                    debug.fine('--> save %s, %o', type, ts);
                    break;
                }
            }

            const collections: IStatisticsDataCollection [] = [];
            for (const id of this._ids) {
                const d = Statistics.defById[id];
                if (!d) { continue; }
                const types = <StatisticsType []>Object.getOwnPropertyNames(d.type);
                for (const t of types) {
                    const coll = this._data[id][t];
                    if (coll.start >= ts.min && coll.last <= ts.max) {
                        collections.push(coll.toObject(options.pretty === true ? true : false));
                    }
                }
            }
            debug.fine('---> %s save %s -> %s collections', type, path, collections.length);
        } catch (err) {
            debug.warn('cannot save %s (2)\n%e', path, err);
        }
        //     const collections: IStatisticsDataCollection [] = [];
        //     for (const id of this._ids) {
        //         const d = Statistics.defById[id];
        //         if (!d) { continue; }
        //         const types = <StatisticsType []>Object.getOwnPropertyNames(d.type);
        //         for (const t of types) {
        //             const coll = this._data[id][t];
        //             collections.push(coll.toObject(pretty === true ? true : false));
        //         }
        //     }
        //     const backup: IBackup = { createdAt: new Date(), data: collections };
        //     const s =  JSON.stringify(backup, null, pretty === true ? 2 : 0);
        //     fs.writeFile(path, s, (err) => {
        //         if (err) {
        //             debug.warn('cannot save %s (1)\n%e', path, err);
        //         } else {
        //             debug.fine('---> file %s successful saved (%d collections)', path, collections.length);
        //         }
        //     });
        // } catch (err) {
        //     debug.warn('cannot save %s (2)\n%e', path, err);
        // }
    }
}

export class StatisticsCacheError extends Error {
    constructor (msg: string, public cause: Error) { super(msg); }
}

