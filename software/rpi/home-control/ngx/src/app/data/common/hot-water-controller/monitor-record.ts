
import { DataRecord } from '../data-record';
import { ICurrent4To20mA, Current4To20mA } from './current4-to-20ma';
import { IValue, Value } from './value';
import { IEnergyRecord, EnergyRecord } from './energy-record';
import { IControllerStatus, ControllerStatus } from './controller-status';

export interface IMonitorRecord {
    createdAt:       Date | number | string;
    controller?:     IControllerStatus;
    current4to20mA?: ICurrent4To20mA;
    energy?:         IEnergyRecord [];
}

export class MonitorRecord extends DataRecord<IMonitorRecord> implements IMonitorRecord {

    private _createdAt:       Date;
    private _controller?:     ControllerStatus;
    private _current4to20mA?: Current4To20mA;
    private _energy?:         EnergyRecord [];

    constructor (data: IMonitorRecord) {
        super(data);
        try {
            const missing = DataRecord.getMissingAttributes( data, [ 'createdAt' ]);
            if (missing) {
                throw new Error('missing attribute ' + missing);
            }
            let attCnt = 0;
            for (const a of Object.getOwnPropertyNames(data)) {
                if ( [ 'createdAt' ].indexOf(a) >= 0 ) {
                    (<any>this)['_' + a] = DataRecord.parseDate(data, { attribute: a, validate: true } );
                } else if ( [ 'controller' ].indexOf(a) >= 0 ) {
                    this._controller = new ControllerStatus(data.controller);
                } else if ( [ 'energyDaily', '_energyTotal' ].indexOf(a) >= 0 ) {
                    const x: IValue = (<any>data)[a];
                    (<any>this)['_' + a] = new Value(x);
                } else if (data.current4to20mA) {
                    this._current4to20mA = new Current4To20mA(data.current4to20mA);
                } else if (Array.isArray(data.energy) ) {
                    this._energy = [];
                    for (const e of data.energy) { this._energy.push(new EnergyRecord(e)); }
                } else {
                    throw new Error('attribute ' + a + ' not found in data:IMonitorRecord');
                }
                attCnt++;
            }
            if (attCnt !== Object.getOwnPropertyNames(this).length) {
                throw new Error('attribute count mismatch');
            }

        } catch (err) {
            console.log('--->', err);
            throw new MonitorRecordError('parsing IMonitorRecord fails', err);
        }
    }

    public toObject (convertDate = false): IMonitorRecord {
        const rv: IMonitorRecord = {
            createdAt: convertDate ? this._createdAt.getTime() : new Date(this._createdAt.getTime())
        };
        if (this._controller) {
            rv.controller = this._controller.toObject(convertDate);
        }
        if (this._current4to20mA) {
            rv.current4to20mA = this._current4to20mA.toObject(convertDate);
        }
        if (this._energy) {
            rv.energy = [];
            for (const e of this._energy) {
                rv.energy.push(e.toObject(convertDate));
            }
        }

        return rv;
    }

    public get createdAt (): Date {
        return this._createdAt;
    }

    public get controller (): ControllerStatus | null {
        return this._controller;
    }

    public get current4to20mA (): Current4To20mA | null {
        return this._current4to20mA;
    }

    public get energy (): EnergyRecord [] {
        return this._energy ? this._energy : [];
    }

    // ************************************************************

    public getModeAsString (maxAgeSeconds = 20): string | null {
        // console.log('--> getModeAsString():', this._monitorRecord);
        if (!this._controller) { return null; }
        const tMin = Date.now() - maxAgeSeconds * 1000;
        const ts = this._controller.createdAt;
        if (!(ts instanceof Date)  || ts.getTime() < tMin) { return null; }
        const rv = this._controller.mode;
        if (!rv) { return null; }
        return rv;
    }

    public getActivePowerAsNumber (maxAgeSeconds = 20): number | null {
        if (!this._controller || !(this._controller.activePower >= 0)) { return null; }
        const tMin = Date.now() - maxAgeSeconds * 1000;
        const ts = this._controller.createdAt;
        if (!(ts instanceof Date)  || ts.getTime() < tMin) { return null; }
        const rv = this._controller.activePower;
        if (!(rv >= 0)) { return null; }
        return rv;

    }

    public getEnergyDailyAsNumber (maxAgeSeconds = 20): number | null {
        if (!this._controller || !(this._controller.energyDaily >= 0)) { return null; }
        const tMin = Date.now() - maxAgeSeconds * 1000;
        const ts = this._controller.createdAt;
        if (!(ts instanceof Date)  || ts.getTime() < tMin) { return null; }
        const rv = this._controller.energyDaily;
        if (!(rv >= 0)) { return null; }
        return rv;
    }

    public getEnergyTotalAsNumber (maxAgeSeconds = 20): number | null {
        if (!this._controller || !(this._controller.energyTotal >= 0)) { return null; }
        const tMin = Date.now() - maxAgeSeconds * 1000;
        const ts = this._controller.createdAt;
        if (!(ts instanceof Date)  || ts.getTime() < tMin) { return null; }
        const rv = this._controller.energyTotal;
        if (!(rv >= 0)) { return null; }
        return rv;
    }

}



export class MonitorRecordError extends Error {
    constructor (msg: string, public cause?: Error) { super(msg); }
}
