
import * as debugsx from 'debug-sx';
const debug: debugsx.IFullLogger = debugsx.createFullLogger('StatisticsCache');

import * as fs from 'fs';
import * as zlib from 'zlib';

import { sprintf } from 'sprintf-js';
import * as tmp from 'tmp';

import { StatisticsData } from './statistics-data';
import { StatisticsDataCollection, IStatisticsDataCollection } from '../data/common/home-control/statistics-data-collection';
import { Statistics, StatisticAttribute, StatisticsType } from '../data/common/home-control/statistics';
import { MonitorRecord } from '../data/common/home-control/monitor-record';
import { Backup, IBackup } from './backup';
import { CompactBackup } from './compact-backup';


export type StatisticsCacheSavePeriodType =  StatisticsType | 'never' | 'always';
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

    public static getWeekNumber (d: Date): { year: number, week: number } {
        // https://stackoverflow.com/questions/6117814
        // every week starts on monday, week=1 is first week
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil(( ( (d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
        return { year: d.getUTCFullYear(), week: weekNo };
    }

    public static replaceControls (s: string, at?: Date): string {
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

    private static _instance: StatisticsCache;

    // **************************************************************

    private _config: StatisticsCacheConfig;
    private _data: { [ id in StatisticAttribute ]?: { [ type in StatisticsType ]?: StatisticsDataCollection }} = {};
    private _ids: StatisticAttribute [];
    private _lastBackupAt: Date;
    private _lastSaveAt: Date;
    private _lastSaveCheckedAt: Date;
    private _collectionsToSave: { [ type in StatisticsType ]?: StatisticsDataCollection [] } = {};

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
                        const coll = this._data[id][t];
                        if (coll.isCollectionFinished(r.createdAt)) {
                            if (this._config.save[coll.type]) {
                                if (!Array.isArray(this._collectionsToSave[coll.type])) {
                                    this._collectionsToSave[coll.type] = [];
                                }
                                this._collectionsToSave[coll.type].push(coll.clone());
                            }
                            coll.reset();
                        }
                        coll.addValue(r);
                    }
                }
                this.save(r.createdAt);
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

    private save (now: Date) {
        const lastCheckedAt = this._lastSaveCheckedAt;
        for (const t of Object.getOwnPropertyNames(Statistics.defaultEnergyType)) {
            const type = <StatisticsType>t;

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
                } else if (StatisticsCache.getWeekNumber(lastCheckedAt).week !== StatisticsCache.getWeekNumber(now).week) {
                    if (type !== 'total' && type !== 'year' && type !== 'month') {
                        tPeriod = { min: null, max: null};
                    }
                } else if (lastCheckedAt.getDate() !== now.getDate()) {
                    if (type === 'day' || type === 'hour' || type === 'minute' || type === 'min10') {
                        tPeriod = { min: null, max: null};
                    }
                } else if (lastCheckedAt.getHours() !== now.getHours()) {
                    if (type === 'hour' || type === 'minute' || type === 'min10') {
                        tPeriod = { min: null, max: null};
                    }
                } else if (Math.floor(lastCheckedAt.getMinutes() / 10) !== Math.floor(now.getMinutes() / 10) ) {
                    if (type === 'minute' || type === 'min10') {
                        tPeriod = { min: null, max: null};
                    }
                } else if (lastCheckedAt.getMinutes() !== now.getMinutes()) {
                    if (type === 'minute') {
                        tPeriod = { min: null, max: null};
                    }
                } else if (lastCheckedAt.getSeconds() !== now.getSeconds()) {
                    if (type === 'second') {
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
                        case 'min10': {
                            let t2 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), Math.floor(now.getMinutes() / 10) * 10);
                            t2 = new Date(t2.getTime() - 1);
                            tPeriod.min = new Date(t2.getTime() - 10 * 60 * 1000 + 1);
                            tPeriod.max = t2;
                            debug.fine('---> min10 %o', tPeriod);
                            break;
                        }
                        case 'minute': {
                            let t2 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes());
                            t2 = new Date(t2.getTime() - 1);
                            tPeriod.min = new Date(t2.getFullYear(), t2.getMonth(), t2.getDate(), t2.getHours(), t2.getMinutes());
                            tPeriod.max = t2;
                            break;
                        }
                        case 'second': {
                            let t2 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds());
                            t2 = new Date(t2.getTime() - 1);
                            tPeriod.min = new Date(t2.getFullYear(), t2.getMonth(), t2.getDate(), t2.getHours(), t2.getMinutes(), t2.getSeconds());
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

                if (tPeriod && this._config.save[type]) {
                    const collections: IStatisticsDataCollection [] = [];
                    let path: string;
                    try {
                        const options = this._config.save[type].options || {};
                        path = StatisticsCache.replaceControls(this._config.save[type].path, tPeriod.min);

                        if (Array.isArray(this._collectionsToSave[type])) {
                            for (const c of this._collectionsToSave[type]) {
                                if (c.start >= tPeriod.min && c.last <= tPeriod.max) {
                                    collections.push(c.toObject(options.pretty === true));
                                }
                            }
                        }
                        debug.finer('save %s: %d / %d collections -> %o', type, collections.length, this._collectionsToSave[type].length, tPeriod);
                        this._collectionsToSave[type] = [];
                        const backup: IBackup = { createdAt: new Date(), data: collections };
                        const compactBackup = new CompactBackup(backup);
                        const s =  JSON.stringify(compactBackup.toObject(), null, options.pretty === true ? 2 : 0);
                        this.saveFile(path, s).then( () => {
                            debug.fine('---> file %s successful saved (%d collections)', path, collections.length);
                        }).catch( (err) => {
                            debug.warn('cannot save %s (1)\n%e', path, err);
                        });
                    } catch (err) {
                        debug.warn('cannot save %d %s collections to %s', collections.length, type, path);
                    }
                }

            }
        }

        this._lastSaveCheckedAt = now;
    }

    private async saveFile (path: string, content: string): Promise<void> {
        if (path.substr(0, 1) !== '/') {
            throw new Error(path + ' not an absolut path');
        }
        try {
            const dirs: string [] = [];
            let index = 1;
            while (true) {
                const next = path.indexOf('/', index);
                if (next < 0 || next === index) { break; }
                dirs.push(path.substr(index, next - index));
                index = next + 1;
            }
            let dn = '';
            for (const d of dirs) {
                dn = dn + '/' + d;
                if (!fs.existsSync(dn)) {
                    fs.mkdirSync(dn);
                }
                const dStat = fs.lstatSync(dn);
                if (!dStat.isDirectory()) {
                    debug.warn('%s is not a a directory', dn);
                    break;
                }
            }
        } catch (err) {
            debug.warn('saveFile(%s) fails (1)\n%e', path, err);
            return;
        }

        try {
            const gzIndex = path.lastIndexOf('.gz');
            if (gzIndex > 0 && (gzIndex + 3) === path.length ) {
                const compressedContent = await this.gzip(content);
                await this.writeFile(path, compressedContent);
            } else {
                await this.writeFile(path, content);
            }
            debug.fine('---> saveFile(%s) successful', path);
        } catch (err) {
            debug.warn('saveFile(%s) fails (2)\n%e', path, err);
        }
    }


    private async gzip (content: string): Promise<Buffer> {
        return new Promise<Buffer>( (resolve, reject) => {
            zlib.gzip(content, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

    private async writeFile (path: string, content: string | Buffer): Promise<void> {
        return new Promise<void>( (resolve, reject) => {
            fs.writeFile(path, content, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

}

export class StatisticsCacheError extends Error {
    constructor (msg: string, public cause: Error) { super(msg); }
}

