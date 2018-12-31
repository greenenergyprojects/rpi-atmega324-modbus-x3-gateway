
import { ModbusValue, IModbusValue } from './modbus-value';
import { IRegisterDefinition, Type, RegisterDefinition } from './register-definition';
import { CommonLogger } from '../../common-logger';

export class ModbusNumber extends ModbusValue<number> {

    private _value: { at: Date, value: number };
    private _recentValue: { at: Date, value: number };
    private _getValue: (id: number) => { at: Date, value: number };
    private _getScaleFactor: (uid: string) => number;

    constructor (def: IRegisterDefinition, getValue: (id: number) => { at: Date, value: number }, getScaleFactor?: (uid: string) => number) {
        super (def);
        if (!getValue) { throw new Error('illegal argument getValue'); }
        if (def.type && !def.type.int && !def.type.float) { throw new Error('invalid definition type'); }
        this._getValue = getValue;
        this._getScaleFactor = getScaleFactor;
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

    public get ids (): number [] {
        return super.ids;
    }

    public get value (): { at: Date, value: number } | null {
        return this._value;
    }

    public get valueAt (): Date | null {
        return this._value ? this._value.at : null;
    }


    public get hasChanged (): boolean {
        return this._recentValue !== null;
    }

    public clearHasChanged () {
        this._recentValue = null;
    }

    public invalidateValue (at?: Date) {
        at = at || new Date();
        this._recentValue = this._value;
        this._value = { at: at, value: null };
        // this.fireEvents();
    }

    public updateValue (firstId?: number, lastId?: number): boolean {
        firstId = (firstId >= 0 && firstId <= 0xffff) ? firstId : 0;
        lastId = (lastId >= 0 && lastId <= 0xffff) ? lastId : 0xffff;
        let x = 0;
        let at: Date;
        let idOutOfUpdatedRange = true;
        for (const id of this.ids) {
            if (!(id > lastId || id < firstId)) {
                idOutOfUpdatedRange = false;
                const v = this._getValue(id);
                if (v === null) {
                    x = null;
                    break;
                }
                if (!at) {
                    at = v.at;
                } else if (at !== v.at) {
                    at = at < v.at ? v.at : at;
                }
                x = x * 65536 + v.value;
            }
        }
        if (idOutOfUpdatedRange) { return false; }

        if (this._value && at && this._value.at >= at) {
            CommonLogger.warn('updateValue()', 'updateValue() called, but new value older than current value, skip update');
            return;
        }
        if (x !== null) {
            /* tslint:disable:no-bitwise */
            switch (this._definition.code) {
                case 'u8':  { x = x & 0xff; break; }
                case 'u16': break;
                case 'u32': break;
                case 'u64': break;
                case 's8':  { x = x & 0xff; x = x >= 0x80 ? x - 0x100 : x; break; }
                case 's16': { x = x & 0xffff; x = x >= 0x8000 ? x - 0x10000 : x; break; }
                case 's32': { x = x & 0xffffffff; x = x >= 0x80000000 ? x - 0x100000000 : x; break; }
                case 's64': { x = x >= 0x8000000000000000 ? x - 0x10000000000000000 : x; break; }
                default: {
                    throw new Error('uid=' + this.uid + ': illegal definition.size (' + this._definition.code + ') for ModbusNumber');
                }
            }
            /* tslint:enable:no-bitwise */
            const t = this._definition.type;
            if (t && t.string) {
                throw new Error('invalid definition.type (string) for ModbusNumber');
            } else if (t && t.float ) {
                if (this._definition.type.float.factor || this._definition.type.float.factor === 0) {
                    x = x * this._definition.type.float.factor;
                }
            } else if (!t || t.int) {
                // scale factor see http://sunspec.org/wp-content/uploads/2015/06/SunSpec-Information-Models-12041.pdf
                // valid scale factors: -10 to 10, 0x8000 for not implemented (NaN)
                if (t && t.int.scale) {
                    let sf: number;
                    try {
                        sf = this._getScaleFactor(this._definition.type.int.scale);
                    } catch (err) {
                        throw new Error('cannot get scale factor for uid ' + this.uid);
                    }
                    switch (sf) {
                        case     10: x = x * 10000000000; break;
                        case      9: x = x * 1000000000; break;
                        case      8: x = x * 100000000; break;
                        case      7: x = x * 10000000; break;
                        case      6: x = x * 1000000; break;
                        case      5: x = x * 100000; break;
                        case      4: x = x * 10000; break;
                        case      3: x = x * 1000; break;
                        case      2: x = x * 100; break;
                        case      1: x = x * 10; break;
                        case      0: break;
                        case     -1: x = x * 0.1; break;
                        case     -2: x = x * 0.01; break;
                        case     -3: x = x * 0.001; break;
                        case     -4: x = x * 0.0001; break;
                        case     -5: x = x * 0.00001; break;
                        case     -6: x = x * 0.000001; break;
                        case     -7: x = x * 0.0000001; break;
                        case     -8: x = x * 0.00000001; break;
                        case     -9: x = x * 0.000000001; break;
                        case    -10: x = x * 0.0000000001; break;
                        case -32768: x = Number.NaN; break;
                        default: {
                            throw new Error('invalid scale factor value (' + sf + ') for uid ' + this.uid + ' (value=' + x + ')');
                        }
                    }
                }
                if (t && t.int && (t.int.factor >= 0 || t.int.factor < 0)) {
                    x = x * t.int.factor;
                }
            }
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
