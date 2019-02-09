

import * as debugsx from 'debug-sx';
import { IStatisticsDataCollection, StatisticsDataCollection } from './statistics-data-collection';
const debug: debugsx.IFullLogger = debugsx.createFullLogger('Backup');

export interface IBackup {
    createdAt: Date | number | string;
    data: IStatisticsDataCollection [];
}

export class Backup implements IBackup {

    private _createdAt: Date;
    private _data: StatisticsDataCollection [] = [];

    constructor (data: IBackup) {
        try {
            if (!data) { throw new Error('missing data'); }
            this._createdAt = new Date(data.createdAt);
            if (!Array.isArray(data.data) || data.data.length === 0) { throw new Error('missing/invalid array data'); }
            let i;
            let errMsg = '';
            for (i = 0; i < data.data.length; i++) {
                try {
                    this._data.push(StatisticsDataCollection.createInstance(data.data[i]));
                } catch (err) {
                    errMsg += ' ' + i;
                }
            }
            if (errMsg !== '') { throw new Error('errors on collection index ' + errMsg); }
        } catch (err) {
            throw new BackupError('constructor fails', err);
        }
    }

    public get createdAt (): Date {
        return this._createdAt;
    }

    public get data (): StatisticsDataCollection [] {
        return this._data;
    }

}

export class BackupError extends Error {
    constructor (msg: string, public cause: Error) { super(msg); }
}
