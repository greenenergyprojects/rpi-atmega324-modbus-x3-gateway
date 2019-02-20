

import * as debugsx from 'debug-sx';
const debug: debugsx.IFullLogger = debugsx.createFullLogger('CompactBackup');

import { IStatisticsDataCollection, StatisticsDataCollection, IMinimalStatisticsDataCollection } from '../data/common/home-control/statistics-data-collection';
import { catchClause } from 'babel-types';
import { StatisticsType, Statistics } from '../data/common/home-control/statistics';
import { IBackup } from './backup';
import { StatisticsCache } from './statistics-cache';


export interface ICompactBackup {
    createdAt: Date | number | string;
    type: StatisticsType;
    cnt:  number;
    start: Date | number | string;
    last: Date | number | string;
    data: IMinimalStatisticsDataCollection [];
}


export class CompactBackup implements IBackup {

    private _createdAt: Date;
    private _data: StatisticsDataCollection [] = [];

    constructor (data: ICompactBackup | IBackup) {
        try {
            if (!data) { throw new Error('missing data'); }
            if (!data.createdAt) { throw new Error('missing data.createdAt'); }

            const d = (<ICompactBackup>data);
            this._createdAt = new Date(d.createdAt);
            const start = d.start !== undefined ? new Date(d.start) : null;
            const last = d.last !== undefined ? new Date(d.last) : null;
            const cnt = d.cnt >= 0 ? d.cnt : -1;
            const type = d.type !== undefined ? Statistics.toStatisticsType(d.type) : null;
            if (start !== null && last !== null && last < start) { throw new Error('illegal values for start/last, last before start'); }

            if (!Array.isArray(data.data) || data.data.length === 0) { throw new Error('missing/invalid array data'); }
            let i;
            let errMsg = '';
            for (i = 0; i < data.data.length; i++) {
                try {
                    const x = <IStatisticsDataCollection>data.data[i];
                    if (x.type === undefined) {
                        if (!type) { throw new Error('missing type'); }
                        x.type = type;
                    }
                    if (x.cnt === undefined) {
                        if (cnt === -1) { throw new Error('missing cnt'); }
                        x.cnt = cnt;
                    }
                    if (x.start === undefined) {
                        if (!start) { throw new Error('missing start'); }
                         x.start = start;
                    }
                    if (x.last === undefined) {
                        if (!last) { throw new Error('missing last'); }
                        x.last = last;
                    }
                    this._data.push(StatisticsDataCollection.createInstance(x));
                } catch (err) {
                    try {
                        errMsg += ' ' + i + '(id=' + data.data[i].id + ',type=' + (data.data[i].type || type) + ')';
                    } catch (err2) {
                        debug.warn('error on data %o', data.data[i]);
                        errMsg += ' ' + i + '(?)';
                    }
                }
            }
            if (errMsg !== '') {
                debug.warn('errors on the collections: ' + errMsg);
            }
        } catch (err) {
            throw new CompactBackupError('constructor fails', err);
        }
    }

    public toObject (preserveDate = true): ICompactBackup {
        const type: { [ key: string ]: number } = {};
        const cnt:  { [ key: string ]: number } = {};
        const start: { [ key: string ]: number } = {};
        const last: { [ key: string ]: number } = {};
        let mostUsedType:  { type: StatisticsType; cnt: number; };
        let mostUsedCnt:  { cntValue: string; cnt: number; };
        let mostUsedStart: { date: Date; cnt: number; };
        let mostUsedLast:  { date: Date; cnt: number; };

        for (const c of this._data) {

            const s = c.start.getTime().toString();
            if (!mostUsedStart) { mostUsedStart = { date: c.start, cnt: 1 }; }
            if (!start[s]) {
                start[s] = 1;
            } else {
                start[s]++;
                if (mostUsedStart.date.getTime().toString() !== s ) {
                    if (mostUsedStart.cnt < start[s]) {
                        mostUsedStart.date = c.start;
                        mostUsedStart.cnt = start[s];
                    }
                } else {
                    mostUsedStart.cnt = start[s];
                }
            }

            const l = c.last.getTime().toString();
            if (!mostUsedLast) { mostUsedLast = { date: c.last, cnt: 1 }; }
            if (!last[l]) {
                last[l] = 1;
            } else {
                last[l]++;
                if (mostUsedLast.date.getTime().toString() !== l ) {
                    if (mostUsedLast.cnt < last[l]) {
                        mostUsedLast.date = c.last;
                        mostUsedLast.cnt = last[l];
                    }
                } else {
                    mostUsedLast.cnt = last[l];
                }
            }

            const cs = c.cnt.toString();
            if (!mostUsedCnt) { mostUsedCnt = { cntValue: cs, cnt: 1 }; }
            if (!cnt[cs]) {
                cnt[cs] = 1;
            } else {
                cnt[cs]++;
                if (mostUsedCnt.cntValue !== cs ) {
                    if (mostUsedCnt.cnt < cnt[cs]) {
                        mostUsedCnt.cntValue = cs;
                        mostUsedCnt.cnt = cnt[cs];
                    }
                } else {
                    mostUsedCnt.cnt = cnt[cs];
                }
            }

            if (!mostUsedType) { mostUsedType = { type: c.type, cnt: 1 }; }
            if (!type[c.type]) {
                type[c.type] = 1;
            } else {
                type[c.type]++;
                if (mostUsedType.type !== c.type ) {
                    if (mostUsedType.cnt < type[c.type]) {
                        mostUsedType.type = c.type;
                        mostUsedType.cnt = type[c.type];
                    }
                } else {
                    mostUsedType.cnt = type[c.type];
                }
            }

        }

        const rv: ICompactBackup = {
            createdAt: preserveDate ? this._createdAt : this._createdAt.getTime(),
            type:      mostUsedType.type,
            cnt:       +mostUsedCnt.cntValue,
            start:     preserveDate ? mostUsedStart.date : mostUsedStart.date.getTime(),
            last:      preserveDate ? mostUsedLast.date : mostUsedLast.date.getTime(),
            data: []
        };

        for (const c of this._data) {
            const o: IMinimalStatisticsDataCollection = c.toObject(preserveDate);
            if (c.type === mostUsedType.type) {
                delete o.type;
            }
            if (c.cnt === rv.cnt) {
                delete o.cnt;
            }
            if (c.start.getTime() === mostUsedStart.date.getTime()) {
                delete o.start;
            }
            if (c.last.getTime() === mostUsedLast.date.getTime()) {
                delete o.last;
            }
            rv.data.push(o);
        }

        return rv;
    }

    public get createdAt (): Date {
        return this._createdAt;
    }

    public get data (): StatisticsDataCollection [] {
        return this._data;
    }

}

export class CompactBackupError extends Error {
    constructor (msg: string, public cause: Error) { super(msg); }
}
