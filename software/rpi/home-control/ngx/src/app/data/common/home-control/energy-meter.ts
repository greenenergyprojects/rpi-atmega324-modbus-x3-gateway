
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
    passivePower?:        number;
    passivePxPower?:      number [];
    powerFactor?:         number;
    powerFactorPx?:       number [];
    frequency?:           number;
    energyTotal?:         number;
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
    private _passivePower:        number;
    private _passivePxPower:      number [];
    private _powerFactor:         number;
    private _powerFactorPx:       number [];
    private _frequency:           number;
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
            const attNumbers = [
                'activePower', 'apparentPower', 'passivePower', 'powerFactor', 'frequency', 'energyTotal', 'energyTotalExported', 'energyTotalImported'
            ];
            const attNumberArray = [
                'voltagePxToN', 'voltagePxToPx', 'activePxPower', 'passivePxPower', 'powerFactorPx', 'apparentPxPower', 'energyPartitial'
            ];
            let attCnt = 0;
            for (const a of Object.getOwnPropertyNames(data)) {
                if ( [ 'createdAt' ].indexOf(a) >= 0 ) {
                    (<any>this)['_' + a] = DataRecord.parseDate(data, { attribute: a, validate: true } );
                } else if ( [ 'manufacturer', 'type', , 'serial' ].indexOf(a) >= 0 ) {
                    (<any>this)['_' + a] = DataRecord.parseString(data, { attribute: a, validate: true } );
                } else if ( [ 'numberOfPhases' ].indexOf(a) >= 0 ) {
                    (<any>this)['_' + a] = DataRecord.parseNumber(data, { attribute: a, validate: true, min: 0 } );
                } else if ( attNumbers.indexOf(a) >= 0 ) {
                    (<any>this)['_' + a] = DataRecord.parseNumber(data, { attribute: a } );
                } else if ( attNumberArray.indexOf(a) >= 0 ) {
                    (<any>this)['_' + a] = DataRecord.parseNumberArray(data, { attribute: a, validate: true } );
                } else {
                    throw new Error('attribute ' + a + ' not found in data:IEnergyMeter');
                }
                attCnt++;
            }
            if (attCnt !== Object.getOwnPropertyNames(this).length) {
                throw new Error('attribute count mismatch');
            }

            if (this._numberOfPhases === undefined) {
                this._numberOfPhases = 0;
            } else if (this._numberOfPhases < 0) {
                throw new Error('numberOfPhases: illegal value ' + this._numberOfPhases);
            }

            if (!this._voltagePxToN)    { this._voltagePxToN = Array(this._numberOfPhases).fill(null); }
            if (!this._voltagePxToPx)   { this._voltagePxToPx = Array(this._numberOfPhases).fill(null); }
            if (!this._activePxPower)   { this._activePxPower = Array(this._numberOfPhases).fill(null); }
            if (!this._apparentPxPower) { this._apparentPxPower = Array(this._numberOfPhases).fill(null); }
            if (!this._passivePxPower)  { this._passivePxPower = Array(this._numberOfPhases).fill(null); }
            if (!this._powerFactorPx)   { this._powerFactorPx = Array(this._numberOfPhases).fill(null); }
            if (!this._energyPartitial) { this._energyPartitial = []; }

            if (this._passivePower === undefined) { this._passivePower = null; }
            if (this._powerFactor === undefined) { this._powerFactor = null; }
            if (this._frequency === undefined) { this._frequency = null; }
            if (this._energyTotalExported === undefined) { this._energyTotalExported = null; }
            if (this._energyTotalImported === undefined) { this._energyTotalImported = null; }


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
        if (this._manufacturer)                            { rv.manufacturer = this._manufacturer; }
        if (this._type)                                    { rv.type = this._type; }
        if (this._serial)                                  { rv.serial = this._serial; }
        if (this._numberOfPhases > 0)                      { rv.numberOfPhases = this._numberOfPhases; }
        if (this._voltagePxToN.length > 0)                 { rv.voltagePxToN = [].concat(this._voltagePxToN); }
        if (this._voltagePxToPx.length > 0)                { rv.voltagePxToPx = [].concat(this._voltagePxToN); }
        if (this._activePxPower.length > 0)                { rv.activePxPower = [].concat(this._activePxPower); }
        if (this._apparentPxPower.length > 0)              { rv.apparentPxPower = [].concat(this._apparentPxPower); }
        if (typeof this._passivePower === 'number')        { rv.passivePower = this._passivePower; }
        if (this._passivePxPower.length > 0)               { rv.passivePxPower = [].concat(this._passivePxPower); }
        if (typeof this._powerFactor === 'number')         { rv.powerFactor = this._powerFactor; }
        if (this._powerFactorPx.length > 0)                { rv.powerFactorPx = [].concat(this._powerFactorPx); }
        if (typeof this._frequency === 'number')           { rv.frequency = this._frequency; }
        if (this._energyPartitial.length > 0)              { rv.energyPartitial = [].concat(this._energyPartitial); }
        if (typeof this._energyTotalExported === 'number') { rv.energyTotalExported = this._energyTotalExported; }
        if (typeof this._energyTotalImported === 'number') { rv.energyTotalImported = this._energyTotalImported; }

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

    public get passivePower (): number {
        return this._passivePower;
    }

    public get passivePxPower (): number [] {
        return this._passivePxPower;
    }

    public get powerFactor (): number {
        return this._powerFactor;
    }

    public get powerFactorPx (): number [] {
        return this._powerFactorPx;
    }

    public get frequency (): number {
        return this._frequency;
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
