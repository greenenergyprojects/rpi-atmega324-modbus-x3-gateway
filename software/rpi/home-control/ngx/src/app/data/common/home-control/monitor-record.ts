import { CommonLogger } from '../../common-logger';
import { DataRecord } from '../data-record';

import { IFroniusSymo, FroniusSymo } from '../fronius-symo/fronius-symo';
import { IEnergyMeter, EnergyMeter } from './energy-meter';
import { IMonitorRecordNibe1155, MonitorRecordNibe1155 } from './monitor-record-nibe1155';
import { IMonitorRecordBoiler, MonitorRecordBoiler } from './monitor-record-boiler';
import { ICalculated, Calculated } from './calculated';

export interface IMonitorRecord {
    createdAt:    Date | number | string;
    froniussymo?: IFroniusSymo;
    gridmeter?:   IEnergyMeter;
    nibe1155?:    IMonitorRecordNibe1155;
    calculated?:  ICalculated;
    boiler?:      IMonitorRecordBoiler;
    extPvMeter?:  { [ name: string ]: IEnergyMeter };
}

export class MonitorRecord extends DataRecord<IMonitorRecord> implements IMonitorRecord {

    private _createdAt:    Date;
    private _froniussymo?: FroniusSymo;
    private _gridmeter?:   EnergyMeter;
    private _nibe1155?:    MonitorRecordNibe1155;
    private _boiler?:      MonitorRecordBoiler;
    private _calculated?:  Calculated;
    private _extPvMeter?:  { [ name: string ]: EnergyMeter };


    constructor (data: IMonitorRecord) {
        super(data);
        try {
            const missing = DataRecord.getMissingAttributes( data, [ 'startedAt', 'endedAt', 'energyWattHours' ]);
            if (missing) {
                throw new Error('missing attribute ' + missing);
            }
            let attCnt = 0;
            for (const a of Object.getOwnPropertyNames(data)) {
                switch (a) {
                    case 'createdAt':   this._createdAt = DataRecord.parseDate(data, { attribute: a, validate: true } ); break;
                    case 'froniussymo': this._froniussymo = new FroniusSymo(data[a]); break;
                    case 'gridmeter':   this._gridmeter = new EnergyMeter(data[a]); break;
                    case 'nibe1155':    this._nibe1155 = new MonitorRecordNibe1155(data[a]); break;
                    case 'boiler':      this._boiler = new MonitorRecordBoiler(data[a]); break;
                    case 'calculated':  this._calculated = new Calculated(data[a]); break;
                    case 'extPvMeter': {
                        this._extPvMeter = {};
                        for (const name of Object.getOwnPropertyNames(data.extPvMeter)) {
                            this._extPvMeter[name] = new EnergyMeter(data.extPvMeter[name]);
                        }
                        break;
                    }
                    default: throw new Error('attribute ' + a + ' not found in data:IMonitorRecord');
                }
                attCnt++;
            }
            if (attCnt !== Object.getOwnPropertyNames(this).length) {
                throw new Error('attribute count mismatch');
            }
        } catch (err) {
            throw new MonitorRecordError(data, 'parsing IMonitorRecord fails', err);
        }
    }

    public toObject (preserveDate = true): IMonitorRecord {
        const rv: IMonitorRecord = {
            createdAt: preserveDate ? this._createdAt : this._createdAt.getTime()
        };
        if (this._froniussymo) { rv.froniussymo = this._froniussymo.toObject(preserveDate); }
        if (this._gridmeter)   { rv.gridmeter   = this._gridmeter.toObject(preserveDate); }
        if (this._nibe1155)    { rv.nibe1155    = this._nibe1155.toObject(preserveDate); }
        if (this._boiler)      { rv.boiler      = this._boiler.toObject(preserveDate); }
        if (this._calculated)  { rv.calculated  = this._calculated.toObject(preserveDate); }
        if (this._extPvMeter) {
            rv.extPvMeter = {};
            for (const name of Object.getOwnPropertyNames(this._extPvMeter)) {
                rv.extPvMeter[name] = this._extPvMeter[name].toObject(preserveDate);
            }
        }
        return rv;
    }

    public get createdAt (): Date {
        return this._createdAt;
    }

    public get froniussymo (): FroniusSymo | undefined {
        return this._froniussymo;
    }

    public get gridmeter (): EnergyMeter  | undefined {
        return this._gridmeter;
    }

    public get nibe1155 ():  MonitorRecordNibe1155 | undefined {
        return this._nibe1155;
    }

    public get boiler (): MonitorRecordBoiler | undefined {
        return this._boiler;
    }

    public get calculated (): Calculated | undefined {
        return this._calculated;
    }

    public get extPvMeter (): { [ name: string ]: EnergyMeter } | undefined {
        return this._extPvMeter;
    }

}

export class MonitorRecordError extends Error {
    constructor (public data: IMonitorRecord, msg: string, public cause?: Error) { super(msg); }
}

