
import { DataRecord } from '../data-record';

export interface IPowerSetting {
    createdAt: Date | number | string;
    createdFrom?: string;
    minWatts: number;
    maxWatts: number;
    desiredWatts: number;
}

export class PowerSetting extends DataRecord<IPowerSetting> implements IPowerSetting {

    private _createdAt: Date;
    private _createdFrom?: string;
    private _minWatts: number;
    private _maxWatts: number;
    private _desiredWatts: number;

    constructor (data: IPowerSetting) {
        super(data);
        try {
            let attCnt = 0;
            for (const a of Object.getOwnPropertyNames(data)) {
                if ( [ 'createdAt' ].indexOf(a) >= 0 ) {
                    (<any>this)['_' + a] = DataRecord.parseDate(data, { attribute: a, validate: true } );
                } else if ( [ 'minWatts', 'maxWatts', 'desiredWatts'  ].indexOf(a) >= 0 ) {
                    (<any>this)['_' + a] = DataRecord.parseNumber(data, { attribute: a, validate: true, min: 0, max: 2000 } );
                } else if ( [ 'createdFrom'  ].indexOf(a) >= 0 ) {
                    this._createdFrom = DataRecord.parseString(data, { attribute: 'createdFrom', validate: true });
                } else {
                    throw new Error('attribute ' + a + ' not found in data:IEnergyRecord');
                }
                attCnt++;
            }
            if (attCnt !== Object.getOwnPropertyNames(this).length) {
                throw new Error('attribute count mismatch');
            }
        } catch (err) {
            throw new PowerSettingError(data, 'parsing IPowerSetting fails', err);
        }
    }

    public toObject (convertData = false): IPowerSetting {
        const rv: IPowerSetting = {
            createdAt: convertData ? this._createdAt.getTime() : this._createdAt,
            minWatts:  this._minWatts,
            maxWatts:  this._maxWatts,
            desiredWatts:  this._desiredWatts,
        };
        if (this._createdFrom) {
            rv.createdFrom = this._createdFrom;
        }
        return rv;
    }

    public equals (value: PowerSetting, checkAllAttribute = false): boolean {
        if (!value || !(value instanceof PowerSetting)) { return false; }
        if (checkAllAttribute) {
            if (this.createdAt.getTime() !== value.createdAt.getTime()) { return false; }
            if (this.createdFrom !== value.createdFrom) { return false; }
        }
        if (this.minWatts !== value.minWatts) { return false; }
        if (this.maxWatts !== value.maxWatts) { return false; }
        if (this.desiredWatts !== value.desiredWatts) { return false; }
        return true;
    }

    public get createdAt (): Date {
        return this._createdAt;
    }

    public get createdFrom (): string {
        return this._createdFrom;
    }

    public get minWatts (): number {
        return this._minWatts;
    }

    public get maxWatts (): number {
        return this._maxWatts;
    }

    public get desiredWatts (): number {
        return this._desiredWatts;
    }

}

export class PowerSettingError extends Error {
    constructor (public data: IPowerSetting, msg: string, public cause?: Error) { super(msg); }
}
