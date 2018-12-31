import { DataRecord } from '../data-record';
import { IRegisterValues, RegisterValues } from './register-values';
import { IRegisterDefinition, RegisterDefinition } from './register-definition';
import { CommonLogger } from '../../common-logger';

export interface IModbusValue {
    uid: string;
}

export abstract class ModbusValue<T> extends DataRecord<IModbusValue> {

    protected _definition: IRegisterDefinition;
    private _cachedIds: number [];
    private _valueListeners: ((src: ModbusValue<T>, newValue: { at: Date, value: T }, oldValue: { at: Date, value: T }) => void) [];
    private _updateListeners: ((src: ModbusValue<T>, newValue: { at: Date, value: T }, oldValue: { at: Date, value: T }) => void) [];

    public constructor (def: IRegisterDefinition) {
        super({ uid: def.uid });
        if (!def || !def.uid) { throw new Error('invalid argument def'); }
        this._definition = def;
    }

    public toObject (preserveDate = true): IModbusValue {
        const rv: IModbusValue = {
            uid: this._definition.uid
        };
        return rv;
    }

    public get definition (): IRegisterDefinition {
        return this._definition;
    }

    public get uid (): string {
        return this._definition.uid;
    }

    public get ids (): number [] {
        if (!this._cachedIds) {
            this._cachedIds = RegisterDefinition.getIds([this._definition]);
        }
        return this._cachedIds;
    }

    public on (event: 'value' | 'update',
               listener: (src: ModbusValue<T>, newValue: { at: Date, value: T }, oldValue: { at: Date, value: T }) => void) {
        if (event === 'value')  {
            if (!this._valueListeners) {
                this._valueListeners = [ listener ];
            } else {
                this._valueListeners.push(listener);
            }
        } else if (event === 'update') {
            if (!this._updateListeners) {
                this._updateListeners = [ listener ];
            } else {
                this._updateListeners.push(listener);
            }
        }
    }

    public off (event: 'value' | 'update',
                listener: (src: ModbusValue<T>, newValue: { at: Date, value: T }, oldValue: { at: Date, value: T }) => void) {
        if (event === 'value')  {
            const index = this._valueListeners.findIndex( (item) => item === listener);
            if (index < 0) { return; }
            if (this._valueListeners.length === 1) {
                this._valueListeners = null;
            } else {
                this._valueListeners.splice(index, 1);
            }
        } else if (event === 'update') {
            const index = this._updateListeners.findIndex( (item) => item === listener);
            if (this._updateListeners.length === 1) {
                this._updateListeners = null;
            } else {
                this._updateListeners.splice(index, 1);
            }
        }
   }

    public abstract get value (): { at: Date, value: T } | null;
    public abstract get valueAt (): Date | null;
    public abstract get hasChanged (): boolean;
    public abstract clearHasChanged (): void;
    public abstract updateValue (firstId?: number, lastId?: number): boolean;
    public abstract invalidateValue (at?: Date): void;


    protected fireValueUpdated (newValue: { at: Date, value: T }, oldValue: { at: Date, value: T }) {
        // CommonLogger.warn('fireValueChanged not implemented, %s: %o -> %o', this.uid, oldValue, newValue);
        if (!this._updateListeners) {
            return;
        }
        if (!newValue || !newValue.at || (oldValue && !oldValue.at)) {
            CommonLogger.warn('ModbusString:fireValueUpdate(): illegal arguments, %s: %o -> %o', this.uid, oldValue, newValue);
        } else {
            this._updateListeners.forEach( (h) => h(this, newValue, oldValue));
        }
    }

    protected fireValueChanged (newValue: { at: Date, value: T }, oldValue: { at: Date, value: T }) {
        // CommonLogger.warn('fireValueChanged not implemented, %s: %o -> %o', this.uid, oldValue, newValue);
        if (!this._valueListeners) {
            return;
        }
        if (!newValue || !newValue.at) {
            CommonLogger.warn('ModbusString:fireValueChanged(): illegal arguments, %s: %o -> %o', this.uid, oldValue, newValue);
        } else {
            this._valueListeners.forEach( (h) => h(this, newValue, oldValue));
        }
    }

}

export class ModbusValueError extends Error {
    constructor (public data: IModbusValue, msg: string, public cause?: Error) { super(msg); }
}
