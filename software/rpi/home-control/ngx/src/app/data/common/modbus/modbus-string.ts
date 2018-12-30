
import { CommonLogger } from '../../common-logger';
import { ModbusValue, IModbusValue } from './modbus-value';
import { IRegisterDefinition } from './register-definition';


export class ModbusString extends ModbusValue<string> {

    private _value: { at: Date, value: string };
    private _recentValue: { at: Date, value: string };
    private _getValue: (id: number) => { at: Date, value: number };

    constructor (def: IRegisterDefinition, getValue: (id: number) => { at: Date, value: number }) {
        super (def);
        if (!getValue) { throw new Error('illegal argument getValue'); }
        this._getValue = getValue;
        if (def.type && (def.type.int || def.type.float || (def.type.string && def.type.string !== 'utf-8'))) {
            throw new Error('invalid definition type/code');
        }
        this._value = null;
        this._recentValue = null;
        this._definition = def;
        this.updateValue();
    }

    public toObject (preserveDate = true): IModbusValue {
        return super.toObject(preserveDate);
    }

    public get uid (): string {
        return super.uid;
    }

    public get definition (): IRegisterDefinition {
        return super.definition;
    }

    public get value (): { at: Date, value: string | null } | null {
        return this._value;
    }

    public get valueAt (): Date {
        return this._value ? this._value.at : null;
    }

    public get ids (): number [] {
        return super.ids;
    }

    public get hasChanged (): boolean {
        return this._recentValue !== null;
    }

    public clearHasChanged () {
        this._recentValue = null;
    }


    public updateValue (firstId?: number, lastId?: number): boolean {
        firstId = (firstId >= 0 && firstId <= 0xffff) ? firstId : 0;
        lastId = (lastId >= 0 && lastId <= 0xffff) ? lastId : 0xffff;
        let x: string = null;
        let at: Date;
        let idOutOfUpdatedRange = true;
        let bytes: number [] = [];
        for (const id of this.ids) {
            if (!(id > lastId || id < firstId)) {
                idOutOfUpdatedRange = false;
                const v = this._getValue(id);
                if (v === null) {
                    bytes = [];
                    break;
                }
                if (!at) {
                    at = v.at;
                } else if (at !== v.at) {
                    at = at < v.at ? v.at : at;
                }
                /* tslint:disable:no-bitwise */
                bytes.push(v.value >> 8);
                bytes.push(v.value & 0xff);
                /* tslint:enable:no-bitwise */
            }
        }
        if (idOutOfUpdatedRange) { return false; }

        if (this._value && at && this._value.at >= at) {
            CommonLogger.warn('ModbusString:updateValue() called, but new value older than current value, skip update');
            return;
        }

        if (bytes.length > 0) {
            const utf16: number [] = [];
            /* tslint:disable:no-bitwise */
            for (let i = 0; i < bytes.length; i++) {
                let todo: number;
                let b = bytes[i];
                if (b <= 0x7f) {
                    todo = 0;
                } else if (b <= 0xbf) {
                    throw new Error('not an UTF-8 string');
                } else if (b <= 0xdf) {
                    b = b & 0x1f;
                    todo = 1;
                } else if (b <= 0xef) {
                    b = b & 0x0f;
                    todo = 2;
                } else if (b <= 0xf7) {
                    b = b & 0x07;
                    todo = 3;
                } else {
                    throw new Error('not an UTF-8 string');
                }

                while (todo-- > 0) {
                    if (i === bytes.length) { throw new Error('not an UTF-8 string'); }
                    const bNext = bytes[i++];
                    if (bNext < 0x80 || bNext > 0xbf) { throw new Error('not an UTF-8 string'); }
                    b <<= 6;
                    b += (bNext & 0x3f);
                }
                if (b >= 0xd800 && b <= 0xdffff) { throw new Error('not an UTF-8 string'); }
                if (b > 0x10ffff) { throw new Error('not an UTF-8 string'); }
                if (b === 0) { break; }
                utf16.push(b);
            }
            /* tslint:enable:no-bitwise */
            x = String.fromCharCode(...utf16);
        }

        let rv = false;
        if (!this._value && x !== null) {
            this._value = { at: at, value: x };
            this.fireValueUpdated(this._value, null);
            this.fireValueChanged(this._value, null);
            rv = true;
        } else if (this._value && x === null) {
            this._recentValue = this._value;
            this._value = { at: new Date(), value: null };
            this.fireValueUpdated(this._value, null);
            this.fireValueChanged(this._value, this._recentValue);
            rv = true;
        } else if (this._value && x !== null) {
            this._recentValue = this._value;
            this._value = { at: at, value: x };
            this.fireValueUpdated(this._value, this._recentValue);
            if (this._recentValue.value !== this._value.value) {
                this.fireValueChanged(this._value, this._recentValue);
            }
            rv = true;
        }
        return rv;
    }

}
