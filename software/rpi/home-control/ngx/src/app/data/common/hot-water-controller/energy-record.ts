import { DataRecord } from '../data-record';

export interface IEnergyRecord {
    startedAt: Date | number | string;
    endedAt: Date | number | string;
    energyWattHours: number;
}

export class EnergyRecord extends DataRecord<IEnergyRecord> implements IEnergyRecord {

    public _startedAt: Date;
    public _endedAt: Date;
    public _energyWattHours: number;

    constructor (data: IEnergyRecord) {
        super(data);
        try {
            const missing = DataRecord.getMissingAttributes( data, [ 'startedAt', 'endedAt', 'energyWattHours' ]);
            if (missing) {
                throw new Error('missing attribute ' + missing);
            }
            let attCnt = 0;
            for (const a of Object.getOwnPropertyNames(data)) {
                if ( [ 'startedAt', 'endedAt' ].indexOf(a) >= 0 ) {
                    (<any>this)['_' + a] = DataRecord.parseDate(data, { attribute: a, validate: true } );
                } else if ( [ 'energyWattHours' ].indexOf(a) >= 0 ) {
                    (<any>this)['_' + a] = DataRecord.parseNumber(data, { attribute: a, validate: true, min: 0 } );
                } else {
                    throw new Error('attribute ' + a + ' not found in data:IEnergyRecord');
                }
                attCnt++;
            }
            if (attCnt !== Object.getOwnPropertyNames(this).length) {
                throw new Error('attribute count mismatch');
            }
        } catch (err) {
            throw new EnergyRecordError(data, 'parsing IEnergyRecord fails', err);
        }
    }

    public toObject (convertData = false): IEnergyRecord {
        const rv: IEnergyRecord = {
            startedAt:       convertData ? this._startedAt.getTime() : this._startedAt,
            endedAt:         convertData ? this._endedAt.getTime() : this._endedAt,
            energyWattHours: this._energyWattHours
        };
        return rv;
    }

    public get startedAt (): Date {
        return this._startedAt;
    }

    public get endedAt (): Date {
        return this._endedAt;
    }

    public get energyWattHours (): number {
        return this._energyWattHours;
    }

}

export class EnergyRecordError extends Error {
    constructor (public data: IEnergyRecord, msg: string, public cause?: Error) { super(msg); }
}
