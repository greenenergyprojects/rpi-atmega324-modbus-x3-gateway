import { DataRecord } from '../data-record';
import { IValue, Value } from './value';

export interface ICurrent4To20mA {
    setpoint: IValue;
    current: IValue;
}

export class Current4To20mA extends DataRecord<ICurrent4To20mA> implements ICurrent4To20mA {

    private _setpoint: Value;
    private _current: Value;

    constructor (data: ICurrent4To20mA) {
        super(data);
        try {
            this._setpoint = new Value(data.setpoint);
            this._current = new Value(data.current);
        } catch (err) {
            throw new Current4To20mAdError('parsing ICurrent4To20mA fails', err);
        }
    }

    public toObject (convertData = false): ICurrent4To20mA {
        const rv: ICurrent4To20mA = {
            setpoint: this._setpoint.toObject(convertData),
            current: this._current.toObject(convertData)
        };
        return rv;
    }

    public get setpoint (): Value {
        return this._setpoint;
    }

    public get current (): Value {
        return this._current;
    }


}

export class Current4To20mAdError extends Error {
    constructor (msg: string, public cause?: Error) { super(msg); }
}
