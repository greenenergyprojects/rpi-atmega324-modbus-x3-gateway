
import * as debugsx from 'debug-sx';
const debug: debugsx.IFullLogger = debugsx.createFullLogger('StatisticsDataCollection');

import { sprintf } from 'sprintf-js';

import { StatisticsType, StatisticsOptions, IStatisticItemDefinition, StatisticAttribute, ValueType, Statistics } from '../data/common/home-control/statistics';
import { MonitorRecord } from '../data/common/home-control/monitor-record';

export type CollectionType = 'fromTime' | 'toTime' | 'count' | 'value' | 'min' | 'max' | 'avg' | 'twa' | 'ewa';

export interface IStatisticsDataCollection {
    id: StatisticAttribute;
    type: StatisticsType;
    start: Date | number | string;
    last: Date | number | string;
    cnt: number;
    value?: number;
    min?: number;
    max?: number;
    avg?: number;
    twa?: number;
    ewa?: number;
    ewaStart?: { at: Date, value: number };
    ewaTau?: number;
}

export class StatisticsDataCollection {

    public static createInstance (d: IStatisticsDataCollection) {
        const def = Statistics.defById[d.id];
        const rv = new StatisticsDataCollection(d.id, d.type, def);
        if (d.start) { rv._start = new Date(d.start); }
        if (d.last) { rv._last = new Date(d.last); }
        if (d.cnt >= 0) { rv._cnt = d.cnt; }
        if (d.value !== undefined) { rv._value = d.value; }
        if (d.min !== undefined) { rv._min = d.min; }
        if (d.max !== undefined) { rv._max = d.max; }
        if (d.avg !== undefined) { rv._avg = d.avg; }
        if (d.twa !== undefined) { rv._twa = d.twa; }
        if (d.ewa !== undefined) { rv._ewa = d.ewa; }
        if (d.ewaStart !== undefined && d.ewaStart.at && typeof d.ewaStart.at === 'number') {
            rv._ewaStart = { at: new Date(d.ewaStart.at), value: d.ewaStart.value };
        }
        if (d.ewaTau !== undefined) { rv._ewaTau = d.ewaTau; }
        if (rv.cnt > 0 && (!(rv.start instanceof Date) || !(rv.last instanceof Date) || rv.start > rv.last)) {
            throw new Error('invalid arguments');
        }
        return rv;
    }

    private _start: Date;
    private _last: Date;
    private _cnt = 0;
    private _value: number;
    private _min: number;
    private _max: number;
    private _avg: number; // arithmetic average
    private _twa: number; // time weighted average
    private _ewa: number; // exponentially weighted average

    private _id: StatisticAttribute;
    private _type: StatisticsType;
    private _def: IStatisticItemDefinition;
    private _ewaStart: { at: Date, value: number };
    private _ewaTau: number;

    public constructor (id: StatisticAttribute, type: StatisticsType, def: IStatisticItemDefinition, ewaStart?: { at: Date, value: number }) {
        if (!id || !type  || !def || def.id !== id) {
            throw new Error('invalid arguments');
        }

        this._id = id;
        this._type = type;
        this._def = def;
        this._ewaStart = ewaStart;

        const options = def.type[type];
        if (options.value !== undefined) { this._value = null; }
        if (options.min !== undefined) { this._min = null; }
        if (options.max !== undefined) { this._max = null; }
        if (options.avg !== undefined) { this._avg = null; }
        if (options.twa !== undefined) { this._twa = null; }
        if (options.ewa && options.ewa !== true) {
            this._ewa = null;
            if (!(options.ewa.ewaTau > 0)) { throw new Error('invalid/missing ewa tau'); }
            this._ewaTau = options.ewa.ewaTau;
        }
    }

    public toObject (preserveDate = true): IStatisticsDataCollection {
        const rv: IStatisticsDataCollection = {
            id:    this._id,
            type:  this._type,
            start: preserveDate ? this._start : this._start.getTime(),
            last:  preserveDate ? this._last : this._last.getTime(),
            cnt:   this._cnt
        };
        if (this._value !== undefined)    { rv.value = this._value; }
        if (this._min !== undefined)      { rv.min = this._min; }
        if (this._max !== undefined)      { rv.max = this._max; }
        if (this._avg !== undefined)      { rv.avg = Math.round(this._avg * 1000) / 1000; }
        if (this._twa !== undefined)      { rv.twa = Math.round(this._twa * 1000) / 1000; }
        if (this._ewa !== undefined)      { rv.ewa = Math.round(this._ewa * 1000) / 1000; }
        if (this._ewaTau !== undefined)   { rv.ewaTau = this._ewaTau; }
        if (this._ewaStart !== undefined) { rv.ewaStart = this._ewaStart; }
        return rv;
    }

    public clone (): StatisticsDataCollection {
        const rv = new StatisticsDataCollection(this._id, this._type, this._def, this._ewaStart);
        rv._start = new Date(this._start);
        rv._last  = new Date(this._last);
        rv._cnt = this._cnt;
        if (this._value !== undefined) { rv._value = this._value; }
        if (this._min !== undefined) { rv._min = this._min; }
        if (this._max !== undefined) { rv._max = this._max; }
        if (this._avg !== undefined) { rv._avg = this._avg; }
        if (this._twa !== undefined) { rv._twa = this._twa; }
        if (this._ewa !== undefined) { rv._ewa = this._ewa; }
        return rv;
    }

    public reset (ewaStart?: { at: Date, value: number }) {
        this._start = this._last;
        this._last = undefined;
        this._cnt = 0;
        if (ewaStart) {
            this._ewaStart = ewaStart;
        } else if (this._ewa !== undefined) {
            this._ewaStart = { at: this._last, value: this._ewa };
        }
        if (this._value !== undefined)  { this._value = null; }
        if (this._min !== undefined)    { this._min = null; }
        if (this._max !== undefined)    { this._max = null; }
        if (this._avg !== undefined)    { this._avg = null; }
        if (this._twa !== undefined)    { this._twa = null; }
        if (this._ewa !== undefined)    { this._ewa = null; }
    }

    public get id (): StatisticAttribute {
        return this._id;
    }

    public get cnt (): number {
        return this._cnt;
    }

    public get start (): Date {
        return this._start;
    }

    public get last (): Date {
        return this._last;
    }

    public get type (): StatisticsType {
        return this._type;
    }

    public get ewa (): number {
        return this._ewa;
    }

    public getValueByType (typ: ValueType, factor?: number, offset?: number): number | null {
        let rv: number;
        switch (typ) {
            case 'value': rv = this._value; break;
            case 'avg':   rv = this._avg; break;
            case 'min':   rv = this._min; break;
            case 'max':   rv = this._max; break;
            case 'twa':   rv = this._twa; break;
            case 'ewa':   rv = this._ewa; break;
            default: return null;
        }
        if (typeof(factor) === 'number') {
            rv = rv * factor;
        }
        if (typeof(offset) === 'number') {
            rv = rv + offset;
        }
        return rv;
    }

    public addRawValue (x: number, at?: Date): boolean {
        at = at || new Date();
        if (typeof x !== 'number' || this._last === at) {
            return false;
        }
        this._cnt++;
        if (this._cnt === 1) {
            this._start = at;
            if (this._value !== undefined)  { this._value = x; }
            if (this._min !== undefined)    { this._min = x; }
            if (this._max !== undefined)    { this._max = x; }
            if (this._avg !== undefined)    { this._avg = x; }
            if (this._twa !== undefined)    { this._twa = x; }
            if (this._ewa !== undefined) {
                const dt = at.getTime() - this._ewaStart.at.getTime();
                const a = dt / 1000 / this._ewaTau;
                this._ewa = this._ewa * (1 - a) + a * x;
            }
        } else {
            if (this._min !== undefined && x < this._min) { this._min = x; }
            if (this._max !== undefined && x > this._max) { this._max = x; }
            if (this._avg !== undefined) { this._avg = (this._avg * (this._cnt - 1) + x) / this._cnt; }

            // time weighted average
            if (this._twa !== undefined) {
                const dt1 = this._last.getTime() - this._start.getTime();
                const dt2 = at.getTime() - this._last.getTime();
                // debug.fine(' ---> %s', sprintf('dt1=%d dt2=%d twa=%.3f x=%.3f', dt1, dt2, this._twa, x));
                if (dt1 === 0) {
                    this._twa = (this._twa + x) / 2;
                } else {
                    this._twa = (this._twa * dt1 + x * dt2) / (dt1 + dt2);
                }
            }

            // exponentially weighted average
            if (this._ewa !== undefined) {
                const dt = at.getTime() - this._last.getTime();
                const a = dt / 1000 / this._ewaTau;
                this._ewa = this._ewa * (1 - a) + a * x;
            }
        }
        this._last = at;
        return true;
    }


    public addValue (mr: MonitorRecord) {
        this.addRawValue(this.getValue(this._id, mr), mr.createdAt);
    }

    public isCollectionFinished (now: Date): boolean {
        if (this._type === 'second' && this._cnt > 0) { return this.hasSecondsChanged(now, this._last); }
        if (this._type === 'minute' && this._cnt > 0) { return this.hasMinuteChanged(now, this._last); }
        if (this._type === 'hour'   && this._cnt > 0) { return this.hasHourChanged(now, this._last); }
        if (this._type === 'day'    && this._cnt > 0) { return this.hasDayChanged(now, this._last); }
        if (this._type === 'month'  && this._cnt > 0) { return this.hasMonthChanged(now, this._last); }
        if (this._type === 'year'   && this._cnt > 0) { return this.hasYearChanged(now, this._last); }
        return false;
    }


    private getValue (id: StatisticAttribute, mr: MonitorRecord): number {
        let rv: number;
        switch (id) {
            case 'pPv':            rv = Math.round(mr.getPvActivePowerAsNumber() * 100) / 100; break;
            case 'pPvS':           rv = Math.round(mr.getPvSouthActivePowerAsNumber() * 100) / 100; break;
            case 'pPvEW':          rv = Math.round(mr.getPvEastWestActivePowerAsNumber() * 100) / 100; break;
            case 'pBat':           rv = Math.round(mr.getBatteryPowerAsNumber() * 100) / 100; break;
            case 'pGrid':          rv = Math.round(mr.getGridActivePowerAsNumber() * 100) / 100; break;
            case 'pBoiler':        rv = Math.round(mr.getBoilerActivePowerAsNumber() * 100) / 100; break;
            case 'pHeatPump':      rv = Math.round(mr.getHeatpumpPowerAsNumber() * 100) / 100; break;
            case 'eIn':            rv = Math.round(mr.getEInAsNumber() * 100) / 100; break;
            case 'eOut':           rv = Math.round(mr.getEOutAsNumber() * 100) / 100; break;
            case 'eInDaily':       rv = Math.round(mr.getEInDailyAsNumber() * 100) / 100; break;
            case 'eOutDaily':      rv = Math.round(mr.getEOutDailyAsNumber() * 100) / 100; break;
            case 'eBoilerDaily':   rv = Math.round(mr.getBoilerEnergyDailyAsNumber() * 100) / 100; break;
            case 'eHeatPumpDaily': rv = Math.round(mr.getHeatpumpEnergyDailyAsNumber() * 100) / 100; break;
            case 'ePvDaily':       rv = Math.round(mr.getPvEnergyDailyAsNumber() * 100) / 100; break;
            case 'ePvSDaily':      rv = Math.round(mr.getPvSouthEnergyDailyAsNumber() * 100) / 100; break;
            case 'ePvEWDaily':     rv = Math.round(mr.getPvEastWestEnergyDailyAsNumber() * 100) / 100; break;
            case 'capBatPercent':  rv = Math.round(mr.getBatteryEnergyInPercentAsNumber() * 100) / 100; break;
            case 'tOutdoor':       rv = Math.round(mr.getOutdoorTempAsNumber() * 100) / 100; break;
            case 'tHeatSupply':    rv = Math.round(mr.getHeatpumpSupplyS1TempAsNumber() * 100) / 100; break;
            case 'tHeatBuffer':    rv = Math.round(mr.getHeatpumpSupplyTempAsNumber() * 100) / 100; break;

            default: {
                debug.warn('getValue(%s) - unsupported id -> return 0', id);
                return 0;
            }
        }
        return rv;
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
