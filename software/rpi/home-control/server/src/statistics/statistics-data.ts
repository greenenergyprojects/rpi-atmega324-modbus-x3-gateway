
import * as debugsx from 'debug-sx';
const debug: debugsx.IFullLogger = debugsx.createFullLogger('StatisticsData');

import * as fs from 'fs';

import { sprintf } from 'sprintf-js';

import { Statistics, StatisticAttribute, StatisticsType, StatisticsOptions, ValueType } from '../data/common/home-control/statistics';
import { MonitorRecord } from '../data/common/home-control/monitor-record';
import { StatisticsDataCollection, CollectionType } from './statistics-data-collection';
import { CsvFile } from './csv-file';


export type CsvFieldAttribute = StatisticAttribute | 'count' | 'countMin' | 'countMax' | 'fromDate' | 'toDate' | 'fromTime' | 'toTime';

export interface ICsvFileField {
    id: CsvFieldAttribute;
    title: string;
    typ?: ValueType;
    factor?: number;
    offset?: number;
    format?: string;
}

export interface IStatisticsDataConfig {
    disabled?: boolean;
    file?: {
        name: string;
        typ: 'csv',
        path: string,
        fields: ICsvFileField [];
    };
    ids:   StatisticAttribute [];
    range: StatisticsType;
}

export class StatisticsData {

    private _config: IStatisticsDataConfig;
    private _lastAt: Date;
    private _datas: { [ id in StatisticAttribute ]?: StatisticsDataCollection } = {};
    private _csvFiles: { [ path: string ]: CsvFile } = {};

    public constructor (config: IStatisticsDataConfig) {
        this._config = config;
        if (!config.disabled) {
            for (const id of config.ids) {
                const def = Statistics.defById[id];
                this._datas[id] = new StatisticsDataCollection(id, config.range, def);
            }
        }
    }

    public async refresh (records: MonitorRecord []) {
        for (const mr of records) {
            const finishedCollections: { [id in StatisticAttribute]?: StatisticsDataCollection } = {};
            for (const id of Object.getOwnPropertyNames(this._datas)) {
                if (this._lastAt === mr.createdAt) { continue; }
                const coll = this._datas[<StatisticAttribute>id];
                if (coll.isCollectionFinished(mr.createdAt)) {
                    const o = coll.toObject();
                    debug.finer('refresh: %o', o);
                    finishedCollections[coll.id] = coll.clone();
                    // if (coll.id === 'pBoiler') {
                    //     debug.info('%O', coll);
                    // }
                    const ewaStart = o.ewa === undefined ? undefined : { at: coll.last, value: o.ewa };
                    coll.reset(ewaStart);
                }
                coll.addValue(mr);
                debug.finer('%o', coll.toObject());
            }

            if (Object.keys(finishedCollections).length > 0) {
                try {
                    if (this._config.file && this._config.file.typ === 'csv') {
                        await this.writeToCsvFile(this._config.file.path, this._config.file.fields, finishedCollections);
                    }
                } catch (err) {
                    debug.warn('writing statistics to file %o fails\n%e', this._config.file, err);
                }
            }

            this._lastAt = mr.createdAt;
        }
    }

    // *****************************************************

    // private getValue (id: StatisticAttribute, mr: MonitorRecord): number {
    //     let rv: number;
    //     switch (id) {
    //         case 'pPv':            rv = Math.round(mr.getPvActivePowerAsNumber() * 100) / 100; break;
    //         case 'pPvS':           rv = Math.round(mr.getPvSouthActivePowerAsNumber() * 100) / 100; break;
    //         case 'pPvEW':          rv = Math.round(mr.getPvEastWestActivePowerAsNumber() * 100) / 100; break;
    //         case 'pBat':           rv = Math.round(mr.getBatteryPowerAsNumber() * 100) / 100; break;
    //         case 'pGrid':          rv = Math.round(mr.getGridActivePowerAsNumber() * 100) / 100; break;
    //         case 'pBoiler':        rv = Math.round(mr.getBoilerActivePowerAsNumber() * 100) / 100; break;
    //         case 'pHeatPump':      rv = Math.round(mr.getHeatpumpPowerAsNumber() * 100) / 100; break;
    //         case 'eIn':            rv = Math.round(mr.getEInAsNumber() * 100) / 100; break;
    //         case 'eOut':           rv = Math.round(mr.getEOutAsNumber() * 100) / 100; break;
    //         case 'eInDaily':       rv = Math.round(mr.getEInDailyAsNumber() * 100) / 100; break;
    //         case 'eOutDaily':      rv = Math.round(mr.getEOutDailyAsNumber() * 100) / 100; break;
    //         case 'eBoilerDaily':   rv = Math.round(mr.getBoilerEnergyDailyAsNumber() * 100) / 100; break;
    //         case 'eHeatPumpDaily': rv = Math.round(mr.getHeatpumpEnergyDailyAsNumber() * 100) / 100; break;
    //         case 'ePvDaily':       rv = Math.round(mr.getPvEnergyDailyAsNumber() * 100) / 100; break;
    //         case 'ePvSDaily':      rv = Math.round(mr.getPvSouthEnergyDailyAsNumber() * 100) / 100; break;
    //         case 'ePvEWDaily':     rv = Math.round(mr.getPvEastWestEnergyDailyAsNumber() * 100) / 100; break;
    //         case 'capBatPercent':  rv = Math.round(mr.getBatteryEnergyInPercentAsNumber() * 100) / 100; break;
    //         case 'tOutdoor':       rv = Math.round(mr.getOutdoorTempAsNumber() * 100) / 100; break;
    //         case 'tHeatSupply':    rv = Math.round(mr.getHeatpumpSupplyS1TempAsNumber() * 100) / 100; break;
    //         case 'tHeatBuffer':    rv = Math.round(mr.getHeatpumpSupplyTempAsNumber() * 100) / 100; break;

    //         default: {
    //             debug.warn('getValue(%s) - unsupported id -> return 0', id);
    //             return 0;
    //         }
    //     }
    //     return rv;
    // }

    // private isCollectionFinished (coll: StatisticsDataCollection, at: Date): boolean {
    //     if (coll.type === 'minute' && coll.cnt > 0 && this.hasMinuteChanged(at, this._lastAt) ||
    //         coll.type === 'hour'   && coll.cnt > 0 && this.hasHourChanged(at, this._lastAt) ||
    //         coll.type === 'day'    && coll.cnt > 0 && this.hasDayChanged(at, this._lastAt) ||
    //         coll.type === 'month'  && coll.cnt > 0 && this.hasMonthChanged(at, this._lastAt) ||
    //         coll.type === 'year'   && coll.cnt > 0 && this.hasYearChanged(at, this._lastAt)) {
    //         return true;
    //     } else {
    //         return false;
    //     }

    // }

    // private hasSecondsChanged (t1: Date, t2: Date): boolean {
    //     if (t1.getFullYear() !== t2.getFullYear()) { return true; }
    //     if (t1.getMonth() !== t2.getMonth()) { return true; }
    //     if (t1.getDate() !== t2.getDate()) { return true; }
    //     if (t1.getHours() !== t2.getHours()) { return true; }
    //     if (t1.getMinutes() !== t2.getMinutes()) { return true; }
    //     if (t1.getSeconds() !== t2.getSeconds()) { return true; }
    //     return false;
    // }

    // private hasMinuteChanged (t1: Date, t2: Date): boolean {
    //     if (t1.getFullYear() !== t2.getFullYear()) { return true; }
    //     if (t1.getMonth() !== t2.getMonth()) { return true; }
    //     if (t1.getDate() !== t2.getDate()) { return true; }
    //     if (t1.getHours() !== t2.getHours()) { return true; }
    //     if (t1.getMinutes() !== t2.getMinutes()) { return true; }
    //     return false;
    // }

    // private hasHourChanged (t1: Date, t2: Date): boolean {
    //     if (t1.getFullYear() !== t2.getFullYear()) { return true; }
    //     if (t1.getMonth() !== t2.getMonth()) { return true; }
    //     if (t1.getDate() !== t2.getDate()) { return true; }
    //     if (t1.getHours() !== t2.getHours()) { return true; }
    //     return false;
    // }

    // private hasDayChanged (t1: Date, t2: Date): boolean {
    //     if (t1.getFullYear() !== t2.getFullYear()) { return true; }
    //     if (t1.getMonth() !== t2.getMonth()) { return true; }
    //     if (t1.getDate() !== t2.getDate()) { return true; }
    //     return false;
    // }

    // private hasMonthChanged (t1: Date, t2: Date): boolean {
    //     if (t1.getFullYear() !== t2.getFullYear()) { return true; }
    //     if (t1.getMonth() !== t2.getMonth()) { return true; }
    //     return false;
    // }

    // private hasYearChanged (t1: Date, t2: Date): boolean {
    //     if (t1.getFullYear() !== t2.getFullYear()) { return true; }
    //     return false;
    // }

    // private checkNumber (x: number, invalidReturnValue: any): number {
    //     if (typeof (x) === 'number') {
    //         return x;
    //     } else {
    //         return invalidReturnValue;
    //     }
    // }

    private replaceControls (s: string, at?: Date): string {
        at = at || new Date();
        s = s.replace(/%YYYY/g, sprintf('%04d', at.getFullYear()));
        s = s.replace(/%YY/g, sprintf('%02d', at.getFullYear() - Math.round((at.getFullYear() / 100)) * 100));
        s = s.replace(/%MM/g, sprintf('%02d', at.getMonth() + 1));
        s = s.replace(/%M/g, sprintf('%d', at.getMonth() + 1));
        s = s.replace(/%DD/g, sprintf('%02d', at.getDate()));
        s = s.replace(/%D/g, sprintf('%d', at.getDate()));
        s = s.replace(/%hh/g, sprintf('%02d', at.getHours()));
        s = s.replace(/%mm/g, sprintf('%02d', at.getMinutes()));
        s = s.replace(/%ss/g, sprintf('%02d', at.getSeconds()));
        return s;
    }

    // private createFileName (path: string, at: Date): string {
    //     return this.replaceControls(path, at);
    // }

    private createCsvLine (fields: ICsvFileField [], collections: { [id in StatisticAttribute]?: StatisticsDataCollection }): string {
        let rv = '';
        let countMin: number = null;
        let countMax: number = null;
        let from: Date = null;
        let to: Date = null;
        for (const f of fields) {
            switch (f.id) {
                case 'count': case 'countMin': case 'countMax': case 'fromDate': case 'toDate': case 'fromTime': case 'toTime':
                    break;
                default: {
                    const coll = collections[<StatisticAttribute>f.id];
                    if (coll) {
                        if (countMin === null || coll.cnt < countMin ) { countMin = coll.cnt; }
                        if (countMax === null || coll.cnt > countMax ) { countMax = coll.cnt; }
                        if (from === null || from.getTime() > coll.start.getTime()) { from = coll.start; }
                        if (to === null || to.getTime() < coll.last.getTime()) { to = coll.last; }
                    }
                    break;
                }
            }
        }
        if (countMin === null) { countMin = 0; }
        if (countMax === null) { countMax = 0; }
        const count = countMin !== countMax ? (countMin + '..' + countMax) : sprintf('%d', countMax);

        let s = '?';
        for (const f of fields) {
            switch (f.id) {
                case 'count':    s = count; break;
                case 'countMin': s = sprintf('%d', countMin); break;
                case 'countMax': s = sprintf('%d', countMax); break;
                case 'fromDate': s = s = this.replaceControls(f.format || '%YYYY-%MM-%DD', from); break;
                case 'toDate':   s = s = this.replaceControls(f.format || '%YYYY-%MM-%DD', to); break;
                case 'fromTime': s = s = this.replaceControls(f.format || '%hh:%mm:%ss', from); break;
                case 'toTime':   s = s = this.replaceControls(f.format || '%hh:%mm:%ss', to); break;
                default: {
                    const coll = collections[<StatisticAttribute>f.id];
                    if (!coll) {
                        debug.warn('collection %s missing', f.id);
                        s = '?';
                    } else {
                        const v = coll.getValueByType(f.typ, f.factor, f.offset);
                        if (typeof(v) !== 'number') {
                            debug.warn('collection %s, no valid value on field %s', coll.id, f.id);
                            s = '?';
                        } else {
                            s = sprintf(f.format || '%.3f', v);
                        }
                    }
                }
            }
            rv = rv + (rv.length > 0 ? ',' : '') + '"' + s + '"';
        }
        return rv;
    }

    private async readFirstLine (path: string): Promise<string> {
        return new Promise<string>( (resolve, reject) => {
            const rs = fs.createReadStream(path, { encoding: 'utf8' });
            let line = '';
            let pos = 0;
            rs.on('data', (chunk) => {
                const index = chunk.indexOf('\n');
                line += chunk;
                if (index !== -1) {
                    line = line.slice(0, pos + index);
                    rs.close();
                } else {
                    pos += chunk.length;
                }
            });
            rs.on('close', () => {
                resolve(line);
            });
            rs.on('error', (err) => {
                reject(err);
            });
        });
    }

    private async writeToCsvFile (path: string, fields: ICsvFileField [], collections: { [id in StatisticAttribute]?: StatisticsDataCollection }) {

        let from: Date = null;
        for (const f of fields) {
            switch (f.id) {
                case 'count': case 'countMin': case 'countMax': case 'fromDate': case 'toDate': case 'fromTime': case 'toTime':
                    break;
                default: {
                    const coll = collections[<StatisticAttribute>f.id];
                    if (coll) {
                        if (from === null || from.getTime() > coll.start.getTime()) { from = coll.start; }
                    }
                }
            }
        }
        if (!from) {
            debug.warn('cannot write csv file, missing from from collections');
            return;
        }
        path = this.replaceControls(path, from);
        let file = this._csvFiles[path];
        if (!file) {
            file = new CsvFile(path);
            this._csvFiles[path] = file;
        }
        let header = '"' + this._config.file.name + '"';
        for (const f of fields) {
            header += ',"' + this.replaceControls(f.title, from) + '"';
        }
        const line = this.createCsvLine(fields, collections);
        await file.addLine(this._config.file.name, header, line.replace(/\./g, ','));
    }
}
