
import { CommonLogger } from '../../common-logger';
import { DataRecord } from '../data-record';
import { isExpressionWrapper } from 'babel-types';

export interface IEnergyDaily {
    offsetAt?: Date | number | string;
    offset?: number;
    totalEnergy: number;
}

export class EnergyDaily extends DataRecord<IEnergyDaily> implements IEnergyDaily {

    private _offsetAt: Date;
    private _offset: number;
    private _totalEnergy: number;
    private _lastPower: { at: Date, power: number };

    constructor (data: IEnergyDaily) {
        super(data);
        try {
            const missing = DataRecord.getMissingAttributes( data, [ 'totalEnergy' ]);
            if (missing) {
                throw new Error('missing attribute ' + missing);
            }
            let attCnt = 0;
            for (const a of Object.getOwnPropertyNames(data)) {
                if ( [ 'offsetAt' ].indexOf(a) >= 0 ) {
                    (<any>this)['_' + a] = DataRecord.parseDate(data, { attribute: a, validate: true } );
                } else if ( [ 'offset', 'totalEnergy' ].indexOf(a) >= 0 ) {
                    (<any>this)['_' + a] = DataRecord.parseNumber(data, { attribute: a, validate: true, min: 0 } );
                } else {
                    throw new Error('attribute ' + a + ' not found in data:IEnergyDaily');
                }
                attCnt++;
            }
            if (attCnt !== Object.getOwnPropertyNames(this).length) {
                throw new Error('attribute count mismatch');
            }
            if (this._offset === undefined) {
                this._offset = 0;
            }

        } catch (err) {
            throw new EnergyDailyError(data, 'parsing IEnergyDaily fails', err);
        }
    }

    public toObject (preserveDate = true): IEnergyDaily {
        const rv: IEnergyDaily = {
            offset:      this._offset,
            totalEnergy: this._totalEnergy
        };
        if (this._offsetAt) { rv.offsetAt = preserveDate ? this._offsetAt : this._offsetAt.getTime(); }
        return rv;
    }

    public get offsetAt (): Date {
        return this._offsetAt;
    }

    public get offset (): number {
        return this._offset;
    }

    public get totalEnergy (): number {
        return this._totalEnergy;
    }

    public get dailyEnergy (): number {
        return this._totalEnergy - this._offset;
    }

    public setTotalEnergy (value: number, at?: Date) {
       at = at || new Date();
       if (!(value >= 0)) {
            CommonLogger.warn('invalid value for totalEnergy (%s)', value);
       } else if (!this._offsetAt || this._offsetAt.getDate() !== at.getDate() ||
                   this._offsetAt.getFullYear() !== at.getFullYear() || this._offsetAt.getMonth() !== at.getMonth()) {
            this._totalEnergy = value;
            this._offset = value;
            this._offsetAt = at;
        } else if (value >= this._totalEnergy) {
            this._totalEnergy = value;
        } else {
            CommonLogger.warn('totalEnergy: value=%d not above _totalEnergy=%d', value, this._totalEnergy);
        }
    }

    public accumulateEnergy (power: number, at?: Date) {
        try {
            if (!(power >= 0)) {
                CommonLogger.warn('invalid argument power (%s), skip energy accumulation', power);
                return;
            }
            at = at || new Date();
            if (!this._lastPower) {
                this._lastPower = { at: at, power: power };
            } else {
                const dt = at.getTime() - this._lastPower.at.getTime();
                if (dt < 0) {
                    throw new Error('invaild dt ' + dt);
                } else if (dt > 30000) {
                    CommonLogger.warn('dt > 30s, skip energy accumulation');
                } else if (dt > 0) {
                    const de = (power + this._lastPower.power) / 2 * dt / 1000 / 3600;
                    this._totalEnergy += de;
                    this._lastPower = { at: at, power: power };
                    // CommonLogger.info('--> dt=%d, de=%d ==> e=%d', dt, de, this._totalEnergy);
                }

            }
        } catch (err) {
            CommonLogger.warn('accumulateEnergy(%o, %o) fails\n%e', power, at, err);
        }
    }

}

export class EnergyDailyError extends Error {
    constructor (public data: IEnergyDaily, msg: string, public cause?: Error) { super(msg); }
}
