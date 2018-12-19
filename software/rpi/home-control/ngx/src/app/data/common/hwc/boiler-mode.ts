
import { DataRecord } from '../data-record';
import { CommonLogger } from '../../common-logger';

export enum ControllerMode { off = 'off', power = 'power', test = 'test', shutdown = 'shutdown' }

export interface IBoilerMode {
    createdAt: Date | number | string;
    desiredMode: ControllerMode;
    currentMode?: ControllerMode;
    pin?: string;
    setpointPower: number;
}

export class BoilerMode extends DataRecord<IBoilerMode> implements IBoilerMode {

    private _createdAt: Date;
    private _desiredMode: ControllerMode;
    private _pin?: string;
    private _setpointPower: number;

    constructor (data: IBoilerMode) {
        super(data);
        try {
            let attCnt = 0;
            for (const a of Object.getOwnPropertyNames(data)) {
                CommonLogger.info('check attribute %s', a);
                if ( [ 'createdAt' ].indexOf(a) >= 0 ) {
                    (<any>this)['_' + a] = DataRecord.parseDate(data, { attribute: a, validate: true } );
                } else if ( [ 'setpointPower' ].indexOf(a) >= 0 ) {
                    (<any>this)['_' + a] = DataRecord.parseNumber(data, { attribute: a, validate: true, min: 0 } );
                } else if ( [ 'desiredMode' ].indexOf(a) >= 0 ) {
                    (<any>this)['_' + a] = DataRecord.parseEnum<ControllerMode>(
                        data, {attribute: a, validate: true, validValues: DataRecord.enumToStringValues(ControllerMode) }
                    );
                } else if ( [ 'pin' ].indexOf(a) >= 0 ) {
                        (<any>this)['_' + a] = DataRecord.parseString(data, { attribute: a, validate: true } );
                } else {
                    throw new Error('attribute ' + a + ' not found in data:IBoilerMode');
                }
                attCnt++;
            }
            if (attCnt !== Object.getOwnPropertyNames(this).length) {
                throw new Error('attribute count mismatch');
            }
        } catch (err) {
            throw new BoilerModeError(data, 'parsing IBoilerMode fails', err);
        }
    }

    public toObject (convertData = false): IBoilerMode {
        const rv: IBoilerMode = {
            createdAt:     convertData ? this._createdAt.getTime() : this._createdAt,
            desiredMode:   this._desiredMode,
            setpointPower: this._setpointPower
        };
        if (this._pin) { rv.pin = this._pin; }
        return rv;
    }

    public get createdAt  (): Date {
        return this._createdAt;
    }

    public get desiredMode (): ControllerMode {
        return this._desiredMode;
    }

    public get pin (): string {
        return this._pin;
    }

    public get setpointPower (): number {
        return this._setpointPower;
    }

}

export class BoilerModeError extends Error {
    constructor (public data: IBoilerMode, msg: string, public cause?: Error) { super(msg); }
}
