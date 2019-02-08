
import * as debugsx from 'debug-sx';
const debug: debugsx.IFullLogger = debugsx.createFullLogger('StatisticsDataCollection');

import { sprintf } from 'sprintf-js';

import { StatisticsType, StatisticsOptions, IStatisticItemDefinition, StatisticAttribute, ValueType } from '../data/common/home-control/statistics';

export type CollectionType = 'fromTime' | 'toTime' | 'count' | 'value' | 'min' | 'max' | 'avg' | 'twa' | 'ewa';

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
    private _def: IStatisticItemDefinition;
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
        if (this._value !== undefined)  { this._value = null; }
        if (this._min !== undefined)    { this._min = null; }
        if (this._max !== undefined)    { this._max = null; }
        if (this._avg !== undefined)    { this._avg = null; }
        if (this._twa !== undefined)    { this._twa = null; }
        if (this._ewa !== undefined)    { this._ewa = null; }
        this._ewaStart = ewaStart;
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
    }


}
