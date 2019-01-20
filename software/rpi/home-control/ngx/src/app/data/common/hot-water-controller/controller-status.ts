
import { DataRecord } from '../data-record';
import { IControllerParameter, ControllerParameter } from './controller-parameter';
import { ControllerMode } from './controller-mode';
import { SmartModeValues, ISmartModeValues } from './smart-mode-values';

export interface IControllerStatus {
    createdAt:       Date | number | string;
    parameter:       IControllerParameter;
    mode:            ControllerMode;
    smartModeValues: ISmartModeValues;
    setpointPower:   number;
    activePower:     number;
    energyDaily:     number;
    energyTotal:     number;
}


export class ControllerStatus extends DataRecord<IControllerStatus> implements IControllerStatus {

    private _createdAt:       Date;
    private _parameter:       ControllerParameter;
    private _mode:            ControllerMode;
    private _smartModeValues: SmartModeValues;
    private _setpointPower:   number;
    private _activePower:     number;
    private _energyDaily:     number;
    private _energyTotal:     number;

    constructor (data: IControllerStatus) {
        super(data);
        try {
            const missing = DataRecord.getMissingAttributes( data, [
                'createdAt', 'parameter', 'mode', 'smartModeValues', 'setpointPower', 'activePower', 'energyDaily', 'energyTotal'
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
                } else if ( [ 'smartModeValues' ].indexOf(a) >= 0 ) {
                    this._smartModeValues = new SmartModeValues(data.smartModeValues);
                } else if ( [ 'parameter' ].indexOf(a) >= 0 ) {
                    const x: IControllerParameter = (<any>data)[a];
                    (<any>this)['_' + a] = new ControllerParameter(x);
                } else if ( [ 'setpointPower', 'activePower', 'energyDaily', 'energyDaily', 'energyTotal' ].indexOf(a) >= 0 ) {
                    (<any>this)['_' + a] = DataRecord.parseNumber(data, { attribute: a, validate: true, min: 0 } );
                } else {
                    throw new Error('attribute ' + a + ' not found in data:IControllerStatus');
                }
                attCnt++;
            }
            if (attCnt !== Object.getOwnPropertyNames(this).length) {
                throw new Error('attribute count mismatch');
            }
        } catch (err) {
            throw new ControllerStatusError(data, 'parsing IControllerStatus fails', err);
        }
    }

    public toObject (convertDate = false): IControllerStatus {
        const rv: IControllerStatus = {
            createdAt:       convertDate ? this._createdAt.getTime() : this._createdAt,
            parameter:       this._parameter.toObject(convertDate),
            mode:            this._mode,
            smartModeValues: this._smartModeValues.toObject(convertDate),
            setpointPower:   this._setpointPower,
            activePower:     this._activePower,
            energyDaily:     this._energyDaily,
            energyTotal:     this._energyTotal
        };
        return rv;
    }

    public get createdAt (): Date {
        return this._createdAt;
    }

    public get parameter (): ControllerParameter {
        return this._parameter;
    }

    public get mode (): ControllerMode {
        return this._mode;
    }

    public get smartModeValues (): SmartModeValues {
        return this._smartModeValues;
    }

    public get setpointPower (): number {
        return this._setpointPower;
    }

    public get activePower (): number {
        return this._activePower;
    }

    public get energyDaily (): number {
        return this._energyDaily;
    }

    public get energyTotal (): number {
        return this._energyTotal;
    }

}

export class ControllerStatusError extends Error {
    constructor (public data: IControllerStatus, msg: string, public cause?: Error) { super(msg); }
}
