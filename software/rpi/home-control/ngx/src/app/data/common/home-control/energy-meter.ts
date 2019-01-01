
import { CommonLogger } from '../../common-logger';
import { DataRecord } from '../data-record';

export interface IEnergyMeter {
    createdAt:            Date | number | string;
    manufacturer?:        string;
    type?:                string;
    serial?:              string;
    numberOfPhases?:      number;
    voltagePxToN?:        number [];
    voltagePxToPx?:       number [];
    activePower:          number;
    activePxPower?:       number [];
    apparentPower:        number;
    apparentPxPower?:     number [];
    energyTotal:          number;
    energyTotalExported?: number;
    energyTotalImported?: number;
    energyPartitial?:     number [];
}

export class EnergyMeter extends DataRecord<IEnergyMeter> implements IEnergyMeter {

    private _createdAt:           Date;
    private _manufacturer?:       string;
    private _type?:               string;
    private _serial?:             string;
    private _numberOfPhases:      number;
    private _voltagePxToN:        number [];
    private _voltagePxToPx:       number [];
    private _activePower:         number;
    private _activePxPower:       number [];
    private _apparentPower:       number;
    private _apparentPxPower:     number [];
    private _energyTotal:         number;
    private _energyTotalExported: number;
    private _energyTotalImported: number;
    private _energyPartitial:     number [];

    constructor (data: IEnergyMeter) {
        super(data);
        try {
            const missing = DataRecord.getMissingAttributes( data, [ 'createdAt', 'activePower', 'apparentPower', 'energyTotal' ]);
            if (missing) {
                throw new Error('missing attribute ' + missing);
            }
            let attCnt = 0;
            for (const a of Object.getOwnPropertyNames(data)) {
                if ( [ 'createdAt' ].indexOf(a) >= 0 ) {
                    (<any>this)['_' + a] = DataRecord.parseDate(data, { attribute: a, validate: true } );
                } else if ( [ 'manufacturer', 'type', , 'serial' ].indexOf(a) >= 0 ) {
                    (<any>this)['_' + a] = DataRecord.parseString(data, { attribute: a, validate: true } );
                } else if ( [ 'numberOfPhases' ].indexOf(a) >= 0 ) {
                    (<any>this)['_' + a] = DataRecord.parseNumber(data, { attribute: a, validate: true, min: 0 } );
                } else if ( [ 'activePower', 'apparentPower', 'energyTotal', 'energyTotalExported', 'energyTotalImported'  ].indexOf(a) >= 0 ) {
                    (<any>this)['_' + a] = DataRecord.parseNumber(data, { attribute: a, validate: true, min: 0 } );
                } else if ( [ 'voltagePxToN', 'voltagePxToPx', , 'activePxPower', , 'apparentPxPower', , 'energyPartitial' ].indexOf(a) >= 0 ) {
                    (<any>this)['_' + a] = DataRecord.parseNumberArray(data, { attribute: a, validate: true } );
                } else {
                    throw new Error('attribute ' + a + ' not found in data:IEnergyMeter');
                }
                attCnt++;
            }
            if (attCnt !== Object.getOwnPropertyNames(this).length) {
                throw new Error('attribute count mismatch');
            }
            if (!this._voltagePxToN)    { this._voltagePxToN = []; }
            if (!this._voltagePxToPx)   { this._voltagePxToPx = []; }
            if (!this._activePxPower)   { this._activePxPower = []; }
            if (!this._apparentPxPower) { this._apparentPxPower = []; }
            if (!this._energyPartitial) { this._energyPartitial = []; }
            if (this._energyTotalExported === undefined) { this._energyTotalExported = null; }
            if (this._energyTotalImported === undefined) { this._energyTotalImported = null; }

            if (this._numberOfPhases === undefined) {
                this._numberOfPhases = 0;
            } else if (this._numberOfPhases < 0) {
                throw new Error('numberOfPhases: illegal value ' + this._numberOfPhases);
            }

            if (this._voltagePxToN.length !== this._numberOfPhases) { throw new Error('voltagePxToN: invalid array length'); }
            if (this._voltagePxToPx.length !== this._numberOfPhases) { throw new Error('voltagePxToPx: invalid array length'); }
            if (this._activePxPower.length !== this._numberOfPhases) { throw new Error('activePxPower: invalid array length'); }
            if (this._apparentPxPower.length !== this._numberOfPhases) { throw new Error('apparentPxPower: invalid array length'); }

        } catch (err) {
            throw new EnergyMeterError(data, 'parsing IEnergyMeter fails', err);
        }
    }

    public toObject (convertData = false): IEnergyMeter {
        const rv: IEnergyMeter = {
            createdAt:     convertData ? this._createdAt.getTime() : this._createdAt,
            activePower:   this._activePower,
            apparentPower: this._apparentPower,
            energyTotal:   this._energyTotal
        };
        if (this._manufacturer)                 { rv.manufacturer = this._manufacturer; }
        if (this._type)                         { rv.type = this._type; }
        if (this._serial)                       { rv.serial = this._serial; }
        if (this._numberOfPhases > 0)           { rv.numberOfPhases = this._numberOfPhases; }
        if (this._voltagePxToN.length > 0)      { rv.voltagePxToN = [].concat(this._voltagePxToN); }
        if (this._voltagePxToPx.length > 0)     { rv.voltagePxToPx = [].concat(this._voltagePxToN); }
        if (this._activePxPower.length > 0)     { rv.activePxPower = [].concat(this._activePxPower); }
        if (this._apparentPxPower.length > 0)   { rv.apparentPxPower = [].concat(this._apparentPxPower); }
        if (this._energyPartitial.length > 0)   { rv.energyPartitial = [].concat(this._energyPartitial); }
        if (this._energyTotalExported !== null) { rv.energyTotalExported = this._energyTotalExported; }
        if (this._energyTotalImported !== null) { rv.energyTotalImported = this._energyTotalImported; }

        return rv;
    }

    public get createdAt (): Date {
        return this._createdAt;
    }

    public get manufacturer (): string {
        return this._manufacturer;
    }

    public get type (): string {
        return this._type;
    }

    public get serial (): string {
        return this._serial;
    }

    public get numberOfPhases (): number {
        return this._numberOfPhases;
    }

    public get voltagePxToN (): number [] {
        return this._voltagePxToN;
    }

    public get voltagePxToPx (): number [] {
        return this._voltagePxToPx;
    }

    public get activePower (): number {
        return this._activePower;
    }

    public get activePxPower (): number [] {
        return this._activePxPower;
    }

    public get apparentPower (): number {
        return this._apparentPower;
    }

    public get apparentPxPower (): number [] {
        return this._apparentPxPower;
    }

    public get energyTotal (): number {
        return this._energyTotal;
    }

    public get energyTotalExported (): number {
        return this._energyTotalExported;
    }

    public get energyTotalImported (): number {
        return this._energyTotalImported;
    }

    public get energyPartitial (): number [] {
        return this._energyPartitial;
    }

}

export class EnergyMeterError extends Error {
    constructor (public data: IEnergyMeter, msg: string, public cause?: Error) { super(msg); }
}
