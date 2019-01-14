import { CommonLogger } from '../../common-logger';
import { DataRecord } from '../data-record';

import { IBoilerController, BoilerController } from '../hot-water-controller/boiler-controller';
import { IMonitorRecord, MonitorRecord } from '../hot-water-controller/monitor-record';

export interface IMonitorRecordBoiler {
    createdAt:      Date | number | string;
    controller?:    IBoilerController;
    monitorRecord?: IMonitorRecord;
}

export class MonitorRecordBoiler extends DataRecord<IMonitorRecordBoiler> implements IMonitorRecordBoiler {

    private _createdAt?:     Date;
    private _controller?:    BoilerController;
    private _monitorRecord?: MonitorRecord;

    constructor (data: IMonitorRecordBoiler) {
        super(data);
        try {
            const missing = DataRecord.getMissingAttributes( data, [ 'createdAt' ]);
            if (missing) {
                throw new Error('missing attribute ' + missing);
            }
            let attCnt = 0;
            for (const a of Object.getOwnPropertyNames(data)) {
                switch (a) {
                     case 'createdAt':     this._createdAt = DataRecord.parseDate(data, { attribute: a, validate: true } ); break;
                    case 'controller':    this._controller = new BoilerController(data[a]); break;
                    case 'monitorRecord':  this._monitorRecord = new MonitorRecord(data[a]); break;
                    default: throw new Error('attribute ' + a + ' not found in data:IMonitorRecordBoiler');
                }
                attCnt++;
            }
            if (attCnt !== Object.getOwnPropertyNames(this).length) {
                throw new Error('attribute count mismatch');
            }
        } catch (err) {
            throw new MonitorRecordBoilerError(data, 'parsing IMonitorRecordBoiler fails', err);
        }
    }

    public toObject (preserveDate = true): IMonitorRecordBoiler {
        const rv: IMonitorRecordBoiler = {
            createdAt:  preserveDate ? this._createdAt : this._createdAt.getTime()
        };
        if (this._controller)    { rv.controller    = this._controller.toObject(preserveDate); }
        if (this._monitorRecord) { rv.monitorRecord = this._monitorRecord.toObject(preserveDate); }
        return rv;
    }

    public get createdAt (): Date {
        return this._createdAt;
    }

    public get controller (): BoilerController {
        return this._controller;
    }

    public get monitorRecord (): MonitorRecord {
        return this._monitorRecord;
    }

    // ********************************************************

    public getModeAsString (maxAgeSeconds = 20): string | null {
        // console.log('--> getModeAsString():', this._monitorRecord);
        if (!this._monitorRecord) { return null; }
        const tMin = Date.now() - maxAgeSeconds * 1000;
        const ts = this._monitorRecord.createdAt;
        if (!(ts instanceof Date)  || ts.getTime() < tMin) { return null; }
        const rv = this._monitorRecord.mode;
        if (!rv) { return null; }
        return rv;
    }

    public getActivePowerAsNumber (maxAgeSeconds = 20): number | null {
        if (!this._monitorRecord || !this._monitorRecord.activePower) { return null; }
        const tMin = Date.now() - maxAgeSeconds * 1000;
        const ts = this._monitorRecord.activePower.createdAt;
        if (!(ts instanceof Date)  || ts.getTime() < tMin) { return null; }
        const rv = this._monitorRecord.activePower.value;
        if (!(rv >= 0)) { return null; }
        return rv;

    }

}

export class MonitorRecordBoilerError extends Error {
    constructor (public data: IMonitorRecordBoiler, msg: string, public cause?: Error) { super(msg); }
}
