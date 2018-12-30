
import { CommonLogger } from '../../common-logger';
import { DataRecord } from '../data-record';

export interface ICalculated {
    pvSouthEnergyDaily:     number;
    saiaDe1Offset:          number;
    froniusSiteDailyOffset: number;
    eOutDaily:              number;
    eInDaily:               number;
}

export class Calculated extends DataRecord<ICalculated> implements ICalculated {

    private _pvSouthEnergyDaily:     number;
    private _saiaDe1Offset:          number;
    private _froniusSiteDailyOffset: number;
    private _eOutDaily:              number;
    private _eInDaily:               number;

    constructor (data: ICalculated) {
        super(data);
        try {
            const missing = DataRecord.getMissingAttributes( data, [
                'pvSouthEnergyDaily', 'saiaDe1Offset', 'froniusSiteDailyOffset', 'eOutDaily', 'eInDaily'
            ]);
            if (missing) {
                throw new Error('missing attribute ' + missing);
            }
            let attCnt = 0;
            for (const a of Object.getOwnPropertyNames(data)) {
                if ( [ 'pvSouthEnergyDaily', 'saiaDe1Offset', 'froniusSiteDailyOffset', 'eOutDaily', 'eInDaily' ].indexOf(a) >= 0 ) {
                    (<any>this)['_' + a] = DataRecord.parseNumber(data, { attribute: a, validate: true } );
                } else {
                    throw new Error('attribute ' + a + ' not found in data:ICalculated');
                }
                attCnt++;
            }
            if (attCnt !== Object.getOwnPropertyNames(this).length) {
                throw new Error('attribute count mismatch');
            }
        } catch (err) {
            throw new CalculatedError(data, 'parsing ICalculated fails', err);
        }
    }

    public toObject (preserveDate = true): ICalculated {
        const rv: ICalculated = {
            pvSouthEnergyDaily:     this._pvSouthEnergyDaily,
            saiaDe1Offset:          this._saiaDe1Offset,
            froniusSiteDailyOffset: this._froniusSiteDailyOffset,
            eOutDaily:              this._eOutDaily,
            eInDaily:               this._eInDaily
        };
        return rv;
    }

    public get pvSouthEnergyDaily (): number {
        return this._pvSouthEnergyDaily;
    }

    public get saiaDe1Offset (): number {
        return this._saiaDe1Offset;
    }

    public get froniusSiteDailyOffset (): number {
        return this._froniusSiteDailyOffset;
    }

    public get eOutDaily (): number {
        return this._eOutDaily;
    }

    public get eInDaily (): number {
        return this._eInDaily;
    }

}

export class CalculatedError extends Error {
    constructor (public data: ICalculated, msg: string, public cause?: Error) { super(msg); }
}
