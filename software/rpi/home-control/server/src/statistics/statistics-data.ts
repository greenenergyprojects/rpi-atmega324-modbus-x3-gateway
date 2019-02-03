
import * as debugsx from 'debug-sx';
const debug: debugsx.IFullLogger = debugsx.createFullLogger('StatisticsData');

import { Statistics, StatisticAttribute, StatisticsType, StatisticsOptions } from '../data/common/home-control/statistics';
import { MonitorRecord } from '../data/common/home-control/monitor-record';
import { StatisticsDataCollection } from './statistics-data-collection';

export interface IStatisticsDataConfig {
    disabled?: boolean;
    file?: { typ: 'csv', path: string };
    ids:   StatisticAttribute [];
    range: StatisticsType;
}

export class StatisticsData {

    private _config: IStatisticsDataConfig;
    private _lastAt: Date;
    private _datas: { [ id in StatisticAttribute ]?: StatisticsDataCollection } = {};

    public constructor (config: IStatisticsDataConfig) {
        this._config = config;
        if (!config.disabled) {
            for (const id of config.ids) {
                const def = Statistics.defById[id];
                this._datas[id] = new StatisticsDataCollection(id, config.range, def);
            }
        }
    }

    public refresh (records: MonitorRecord []) {
        for (const mr of records) {
            for (const id of Object.getOwnPropertyNames(this._datas)) {
                if (this._lastAt === mr.createdAt) { continue; }
                const coll = this._datas[<StatisticAttribute>id];
                if (coll.type === 'minute' && coll.cnt > 0 && this.hasMinuteChanged(mr.createdAt, this._lastAt) ||
                    coll.type === 'hour'   && coll.cnt > 0 && this.hasHourChanged(mr.createdAt, this._lastAt) ||
                    coll.type === 'day'    && coll.cnt > 0 && this.hasDayChanged(mr.createdAt, this._lastAt) ||
                    coll.type === 'month'  && coll.cnt > 0 && this.hasMonthChanged(mr.createdAt, this._lastAt) ||
                    coll.type === 'year'   && coll.cnt > 0 && this.hasYearChanged(mr.createdAt, this._lastAt)) {
                    const o = coll.toObject();
                    debug.info('-----> %o', o);
                    const ewaStart = o.ewa === undefined ? undefined : { at: coll.last, value: o.ewa };
                    coll.reset(ewaStart);
                }
                coll.addValue(this.getValue(coll.id, mr), mr.createdAt);
                debug.fine('%o', coll.toObject());
            }
            this._lastAt = mr.createdAt;
        }
    }

    // *****************************************************

    private getValue (id: StatisticAttribute, mr: MonitorRecord) {
        switch (id) {
            case 'eIn': return Math.round(mr.getEInAsNumber() * 100) / 100;
            case 'eOut': return Math.round(mr.getEOutAsNumber() * 100) / 100;
            case 'pGrid': return Math.round(mr.getGridActivePowerAsNumber() * 100) / 100;
            default: throw new Error('unsupported id ' + id);
        }
    }

    private hasSecondsChanged (t1: Date, t2: Date): boolean {
        if (t1.getFullYear() !== t2.getFullYear()) { return true; }
        if (t1.getMonth() !== t2.getMonth()) { return true; }
        if (t1.getDate() !== t2.getDate()) { return true; }
        if (t1.getHours() !== t2.getHours()) { return true; }
        if (t1.getMinutes() !== t2.getMinutes()) { return true; }
        if (t1.getSeconds() !== t2.getSeconds()) { return true; }
        return false;
    }

    private hasMinuteChanged (t1: Date, t2: Date): boolean {
        if (t1.getFullYear() !== t2.getFullYear()) { return true; }
        if (t1.getMonth() !== t2.getMonth()) { return true; }
        if (t1.getDate() !== t2.getDate()) { return true; }
        if (t1.getHours() !== t2.getHours()) { return true; }
        if (t1.getMinutes() !== t2.getMinutes()) { return true; }
        return false;
    }

    private hasHourChanged (t1: Date, t2: Date): boolean {
        if (t1.getFullYear() !== t2.getFullYear()) { return true; }
        if (t1.getMonth() !== t2.getMonth()) { return true; }
        if (t1.getDate() !== t2.getDate()) { return true; }
        if (t1.getHours() !== t2.getHours()) { return true; }
        return false;
    }

    private hasDayChanged (t1: Date, t2: Date): boolean {
        if (t1.getFullYear() !== t2.getFullYear()) { return true; }
        if (t1.getMonth() !== t2.getMonth()) { return true; }
        if (t1.getDate() !== t2.getDate()) { return true; }
        return false;
    }

    private hasMonthChanged (t1: Date, t2: Date): boolean {
        if (t1.getFullYear() !== t2.getFullYear()) { return true; }
        if (t1.getMonth() !== t2.getMonth()) { return true; }
        return false;
    }

    private hasYearChanged (t1: Date, t2: Date): boolean {
        if (t1.getFullYear() !== t2.getFullYear()) { return true; }
        return false;
    }

}
