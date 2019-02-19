
import { CommonLogger } from '../../common-logger';
import { DataRecord } from '../data-record';

export interface ICalculated {
    createdAt:             Date | number | string;
    eOutDaily:             number;
    eInDaily:              number;
    eHeatPumpDaily:        number;
    batOutDaily:           number;
    batInDaily:            number;
    pvSouthEnergy:         number;
    pvSouthEnergyDaily:    number;
    pvEastWestEnergyDaily: number;
    froniusSiteDaily:      number;
    pPvSouth:              number;
}

export class Calculated extends DataRecord<ICalculated> implements ICalculated {

    public static ATTRIBUTES = [
        'createdAt', 'eOutDaily', 'eInDaily', 'eHeatPumpDaily', 'batOutDaily', 'batInDaily', 'pvSouthEnergy', 'pvSouthEnergyDaily',
        'pvEastWestEnergyDaily', 'froniusSiteDaily', 'pPvSouth'
    ];

    private _createdAt:             Date;
    private _eOutDaily:             number;
    private _eInDaily:              number;
    private _eHeatPumpDaily:        number;
    private _batOutDaily:           number;
    private _batInDaily:            number;
    private _pvSouthEnergy:         number;
    private _pvSouthEnergyDaily:    number;
    private _pvEastWestEnergyDaily: number;
    private _froniusSiteDaily:      number;
    private _pPvSouth:              number;

    constructor (data: ICalculated) {
        super(data);
        try {
            const missing = DataRecord.getMissingAttributes( data, Calculated.ATTRIBUTES);
            if (missing) {
                throw new Error('missing attribute ' + missing);
            }
            let attCnt = 0;
            for (const a of Object.getOwnPropertyNames(data)) {
                if ( [ 'createdAt' ].indexOf(a) >= 0 ) {
                    (<any>this)['_' + a] = DataRecord.parseDate(data, { attribute: a, validate: true } );
                } else if ( Calculated.ATTRIBUTES.indexOf(a) >= 0 ) {
                    (<any>this)['_' + a] = DataRecord.parseNumber(data, { attribute: a, validate: false } );
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
            createdAt:              preserveDate ? this._createdAt : this._createdAt.getTime(),
            eOutDaily:              this._eOutDaily,
            eInDaily:               this._eInDaily,
            eHeatPumpDaily:         this._eHeatPumpDaily,
            batOutDaily:            this._batOutDaily,
            batInDaily:             this._batInDaily,
            pvSouthEnergy:          this._pvSouthEnergy,
            pvSouthEnergyDaily:     this._pvSouthEnergyDaily,
            pvEastWestEnergyDaily:  this._pvEastWestEnergyDaily,
            froniusSiteDaily:       this._froniusSiteDaily,
            pPvSouth:               this._pPvSouth
        };
        return rv;
    }

    public get createdAt (): Date {
        return this._createdAt;
    }

    public get eOutDaily (): number {
        return this._eOutDaily;
    }

    public get eInDaily (): number {
        return this._eInDaily;
    }

    public get eHeatPumpDaily (): number {
        return this._eHeatPumpDaily;
    }

    public get batOutDaily (): number {
        return this._batOutDaily;
    }

    public get batInDaily (): number {
        return this._batInDaily;
    }

    public get pvSouthEnergy (): number {
        return this._pvSouthEnergy;
    }

    public get pvSouthEnergyDaily (): number {
        return this._pvSouthEnergyDaily;
    }

    public get pvEastWestEnergyDaily (): number {
        return this._pvEastWestEnergyDaily;
    }

    public get froniusSiteDaily (): number {
        return this._froniusSiteDaily;
    }

    public get pPvSouth (): number {
        return this._pPvSouth;
    }

}

export class CalculatedError extends Error {
    constructor (public data: ICalculated, msg: string, public cause?: Error) { super(msg); }
}
