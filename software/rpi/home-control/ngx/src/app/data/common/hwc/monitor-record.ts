
import { DataRecord } from '../data-record';
import { IEnergyRecord, EnergyRecord } from './energy-record';
import { ICurrent4To20mA, Current4To20mA } from './current4-to-20ma';
import { IPowerSetting, PowerSetting } from './power-setting';
import { IValue, Value } from './value';
import { ControllerMode } from './boiler-mode';

export interface IMonitorRecord {
    createdAt: Date | number | string;
    mode: ControllerMode | string;
    powerSetting: IPowerSetting;
    activePower: IValue;
    setpointPower: IValue;
    maxPower: IValue;
    energy?: IEnergyRecord [];
    energyDaily?: IValue;
    current4to20mA?: ICurrent4To20mA;
}

export class MonitorRecord extends DataRecord<IMonitorRecord> implements IMonitorRecord {

    private _createdAt: Date;
    private _mode: ControllerMode;
    private _powerSetting: PowerSetting;
    private _activePower: Value;
    private _setpointPower: Value;
    private _maxPower: Value;
    private _energy: EnergyRecord [] = [];
    private _energyDaily?: Value;
    private _current4to20mA?: Current4To20mA;

    constructor (data: IMonitorRecord) {
        super(data);
        try {
            this._createdAt = DataRecord.parseDate(data, { attribute: 'createdAt', validate: true });
            this._mode = DataRecord.parseEnum<ControllerMode>(
                data, {attribute: 'mode', validate: true, validValues: DataRecord.enumToStringValues(ControllerMode) }
            );
            this._powerSetting = new PowerSetting(data.powerSetting);
            this._activePower = new Value(data.activePower);
            this._setpointPower = new Value(data.setpointPower);
            this._maxPower = new Value(data.maxPower);
            if (Array.isArray(data.energy)) {
                data.energy.forEach( (element, i) => this._energy.push(new EnergyRecord(element)));
            }
            if (data.current4to20mA) {
                this._current4to20mA = new Current4To20mA(data.current4to20mA);
            }
            if (data.energyDaily) {
                this._energyDaily = new Value(data.energyDaily);
            }
        } catch (err) {
            console.log('--->', err);
            throw new MonitorRecordError('parsing IMonitorRecord fails', err);
        }
    }

    public toObject (convertDate = false): IMonitorRecord {
        const rv: IMonitorRecord = {
            createdAt: convertDate ? this._createdAt.getTime() : new Date(this._createdAt.getTime()),
            mode: this._mode,
            powerSetting: this._powerSetting.toObject(convertDate),
            activePower: this._activePower.toObject(convertDate),
            setpointPower: this._setpointPower.toObject(convertDate),
            maxPower: this._maxPower.toObject(convertDate),
        };
        if (this._energy.length > 0) {
            rv.energy = [];
            this._energy.forEach(element => { rv.energy.push(element.toObject(convertDate)); });
        }
        if (this._current4to20mA) {
            rv.current4to20mA = this._current4to20mA.toObject(convertDate);
        }
        if (this._energyDaily) {
            rv.energyDaily = this._energyDaily.toObject(convertDate);
        }

        return rv;
    }

    public get createdAt (): Date {
        return this._createdAt;
    }

    public get mode (): ControllerMode {
        return this._mode;
    }

    public get powerSetting (): PowerSetting {
        return this._powerSetting;
    }

    public get setpointPower (): Value {
        return this._setpointPower;
    }

    public get maxPower (): Value {
        return this._maxPower;
    }

    public get activePower (): Value {
        return this._activePower;
    }

    public get energy (): EnergyRecord [] {
        return this._energy;
    }

    public get current4to20mA (): Current4To20mA {
        return this._current4to20mA;
    }

    public get energyDaily (): Value {
        return this._energyDaily;
    }

}



export class MonitorRecordError extends Error {
    constructor (msg: string, public cause?: Error) { super(msg); }
}
