
import { DataRecord } from '../data-record';
import { ControllerMode } from './boiler-mode';
import { PowerSetting, IPowerSetting } from './power-setting';
import { Value, IValue } from './value';

export interface IBoilerController {
    createdAt: Date | number | string;
    mode: ControllerMode;
    powerSetting: IPowerSetting;
    activePower: IValue;
    setpointPower: IValue;
    maxPower: IValue;
    energyDaily: IValue;
    energyTotal: IValue;
}

// export type IBoilerControllerAttributes = keyof IBoilerController;

export class BoilerController extends DataRecord<IBoilerController> implements IBoilerController {

    private _createdAt: Date;
    private _mode: ControllerMode;
    private _powerSetting: PowerSetting;
    private _activePower: Value;
    private _setpointPower: Value;
    private _maxPower: Value;
    private _energyDaily: Value;
    private _energyTotal: Value;


    constructor (data: IBoilerController) {
        super(data);
        try {
            const missing = DataRecord.getMissingAttributes( data, [
                'mode', 'powerSetting', 'activePower', 'setpointPower', 'maxPower', 'energyDaily', 'energyTotal'
            ]);
            if (missing) {
                throw new Error('missing attribute ' + missing);
            }
            let attCnt = 0;
            for (const a of Object.getOwnPropertyNames(data)) {
                if ( [ 'createdAt' ].indexOf(a) >= 0 ) {
                    (<any>this)['_' + a] = DataRecord.parseDate(data, { attribute: a, validate: true } );
                } else if ( [ 'mode' ].indexOf(a) >= 0 ) {
                    (<any>this)['_' + a] = DataRecord.parseEnum<ControllerMode>(
                        data, {attribute: a, validate: true, validValues: DataRecord.enumToStringValues(ControllerMode) }
                    );
                } else if ( [ 'powerSetting' ].indexOf(a) >= 0 ) {
                    const x: IPowerSetting = (<any>data)[a];
                    (<any>this)['_' + a] = new PowerSetting(x);
                } else if ( [ 'activePower', 'setpointPower', 'maxPower', 'energyDaily', '_energyTotal' ].indexOf(a) >= 0 ) {
                    const x: IValue = (<any>data)[a];
                    (<any>this)['_' + a] = new Value(x);
                } else {
                    throw new Error('attribute ' + a + ' not found in data:IBoilerController');
                }
                attCnt++;
            }
            if (attCnt !== Object.getOwnPropertyNames(this).length) {
                throw new Error('attribute count mismatch');
            }
        } catch (err) {
            throw new BoilerControllerError(data, 'parsing IBoilerController fails', err);
        }
    }

    public toObject (convertDate = false): IBoilerController {
        const rv: IBoilerController = {
            createdAt:     convertDate ? this._createdAt.getTime() : this._createdAt,
            mode:          this._mode,
            powerSetting:  this._powerSetting.toObject(convertDate),
            activePower:   this._activePower.toObject(convertDate),
            setpointPower: this._setpointPower.toObject(convertDate),
            maxPower:      this._maxPower.toObject(convertDate),
            energyDaily:   this._energyDaily.toObject(convertDate),
            energyTotal:   this._energyTotal.toObject(convertDate),
        };
        return rv;
    }

    public get createdAt  (): Date {
        return this._createdAt;
    }

    public get mode (): ControllerMode {
        return this._mode;
    }

    public get powerSetting (): PowerSetting {
        return this._powerSetting;
    }

    public get activePower (): Value {
        return this._activePower;
    }

    public get setpointPower (): Value {
        return this._setpointPower;
    }

    public get maxPower (): Value {
        return this._maxPower;
    }

    public get energyDaily (): Value {
        return this._energyDaily;
    }

    public get energyTotal (): Value {
        return this._energyTotal;
    }

}

export class BoilerControllerError extends Error {
    constructor (public data: IBoilerController, msg: string, public cause?: Error) { super(msg); }
}
