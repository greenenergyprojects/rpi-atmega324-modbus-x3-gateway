
import * as debugsx from 'debug-sx';
const debug: debugsx.IFullLogger = debugsx.createFullLogger('StatisticsDataCollection');

import { StatisticsType, StatisticsOptions, IStatisticItemDefinition, StatisticAttribute } from '../data/common/home-control/statistics';

export interface IStatisticsDataCollection {
    start: Date | number | string;
    last: Date | number | string;
    cnt: number;
    value?: number;
    min?: number;
    max?: number;
    avg?: number;
    twa?: number;
    ewa?: number;
}

export class StatisticsDataCollection {

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
    private _def: StatisticsOptions;
    private _ewaStart: { at: Date, value: number };
    private _ewaTau: number;

    public constructor (id: StatisticAttribute, type: StatisticsType, def: IStatisticItemDefinition, ewaStart?: { at: Date, value: number }) {
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

    public get id (): StatisticAttribute {
        return this._id;
    }

    public get cnt (): number {
        return this._cnt;
    }

    public get last (): Date {
        return this._last;
    }

    public get type (): StatisticsType {
        return this._type;
    }

    public addValue (x: number, at?: Date): boolean {
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
                if (dt1 === 0) {
                    this._twa = (this._twa + x) / 2;
                } else {
                    this._twa = (this._twa * dt1 + x) / (dt1 + dt2);
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
    }

    public reset (ewaStart?: { at: Date, value: number }) {
        this._start = this._last;
        this._last = undefined;
        this._cnt = 0;
        if (this._value !== undefined)  { this._value = null; }
        if (this._min !== undefined)    { this._min = null; }
        if (this._max !== undefined)    { this._max = null; }
        if (this._avg !== undefined)    { this._avg = null; }
        if (this._twa !== undefined)    { this._twa = null; }
        if (this._ewa !== undefined)    { this._ewa = null; }
        this._ewaStart = ewaStart;
    }

    public toObject (preserveDate = true): IStatisticsDataCollection {
        const rv: IStatisticsDataCollection = {
            start: preserveDate ? this._start : this._start.getTime(),
            last:  preserveDate ? this._last : this._last.getTime(),
            cnt:   this._cnt
        };
        if (this._value !== undefined) { rv.value = this._value; }
        if (this._min !== undefined)   { rv.min = this._min; }
        if (this._max !== undefined)   { rv.max = this._max; }
        if (this._avg !== undefined)   { rv.avg = this._avg; }
        if (this._twa !== undefined)   { rv.twa = this._twa; }
        if (this._ewa !== undefined)   { rv.ewa = this._ewa; }
        return rv;
    }

}
