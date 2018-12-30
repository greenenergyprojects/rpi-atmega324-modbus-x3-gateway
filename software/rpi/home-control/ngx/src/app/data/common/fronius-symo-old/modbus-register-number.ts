
import { sprintf } from 'sprintf-js';

import { CommonLogger } from '../../common-logger';
import { DataRecord } from '../data-record';

export interface IModbusRegisterNumber {
    id: number;
    value?: number | string;
    valueAt?: Date | number | string;
    recentValue?: number | string;
    recentValueAt?: Date | number | string;
    rawValue?: number | number [];
}

export abstract class ModbusRegisterNumber extends DataRecord<IModbusRegisterNumber> implements IModbusRegisterNumber {
    protected _id: number;
    protected _value: number;
    protected _valueAt: Date;
    protected _rawValue: number;
    protected _recentValue?: number;
    protected _recentValueAt?: Date;

    public constructor (data: IModbusRegisterNumber) {
        super(data);
        try {
            const missing = DataRecord.getMissingAttributes( data, [ 'id' ]);
            if (missing) {
                throw new Error('missing attribute ' + missing);
            }
            let attCnt = 0;
            for (const a of Object.getOwnPropertyNames(data)) {
                if ( [ 'id' ].indexOf(a) >= 0 ) {
                    (<any>this)['_' + a] = DataRecord.parseNumber(data, { attribute: a, validate: true, min: 0, max: 65535 } );
                } else if ( [ 'value', 'recentValue' ].indexOf(a) >= 0 ) {
                    (<any>this)['_' + a] = DataRecord.parseNumber(data, { attribute: a, validate: true } );
                } else if ( [ 'rawValue' ].indexOf(a) >= 0 ) {
                    (<any>this)['_' + a] = DataRecord.parseNumber(data, { attribute: a, validate: true, min: 0 } );
                } else if ( [ 'valueAt', 'recentValueAt' ].indexOf(a) >= 0 ) {
                    (<any>this)['_' + a] = DataRecord.parseDate(data, { attribute: a, validate: true } );
                } else {
                    throw new Error('attribute ' + a + ' not found in data:IModbusRegisterNumber');
                }
                attCnt++;
            }
            if (attCnt !== Object.getOwnPropertyNames(this).length) {
                throw new Error('attribute count mismatch');
            }
            if (this._value === undefined) { this._value = null; }
            if (this._valueAt === undefined) { this._valueAt = null; }
            if (this._recentValue === undefined) { this._recentValue = null; }
            if (this._recentValueAt === undefined) { this._recentValueAt = null; }
            if (this._rawValue === undefined) { this._rawValue = null; }

            if (!this.isKnownRegister()) {
                throw new Error('invalid modbus id ' + this._id);
            }
        } catch (err) {
            throw new ModbusRegisterNumberError(data, 'parsing IModbusRegisterNumber fails', err);
        }
    }

    public toObject (preserveDate = true): IModbusRegisterNumber {
        const rv: IModbusRegisterNumber = {
            id: this._id,
        };
        if (this._value !== null) { rv.value = this._value; }
        if (this._valueAt !== null) { rv.valueAt = preserveDate ? this.valueAt : this.valueAt.getTime(); }
        if (this._recentValue !== null) { rv.recentValue = this._recentValue; }
        if (this._recentValueAt !== null) { rv.recentValueAt = preserveDate ? this._recentValueAt : this._recentValueAt.getTime(); }
        if (this._rawValue !== null) { rv.rawValue = this._rawValue; }
        return rv;
    }

    public get id (): number {
        return this._id;
    }

    public get value (): number {
        return (this._value || this._value === 0) ? this._value : Number.NaN;
    }

    public get valueAt (): Date {
        return this._valueAt ? this._valueAt : new Date();
    }

    public get recentValue (): number {
        return (this._recentValue || this._recentValue === 0) ? this._recentValue : Number.NaN;
    }

    public get recentValueAt (): Date {
        return this._recentValueAt ? this._recentValueAt : new Date();
    }

    public get rawValue (): number {
        return (this._rawValue || this._rawValue === 0) ? this._rawValue : Number.NaN;
    }

    public abstract isKnownRegister (): boolean;
    public abstract get label (): string | null;
    public abstract get description (): string | null;
    public abstract get help (): string | null;
    public abstract get type (): 'R' | 'R/W' | null;
    public abstract get unit (): '' | '°C' | 'h' | 'Wh' | 'W' | 'VA' | 'VAr' | 'A' | 'V' | 'Hz' | '%' | null;
    public abstract get format (): string | null;
    public abstract get modbusRegSize (): 'u8' | 's8' | 'u16' | 's16' | 'u32' | 's32' |'u64' | 's64' | 'str16' | 'str32' | null;
    public abstract get modbusValueFactor (): number | null;

    public  get isValueChanged (): boolean {
        if (this._recentValueAt === null ) {
            return this._valueAt !== null;
        }
        return this._recentValueAt !== this._valueAt && this._recentValue !== this._value;
    }

    public clearValueChanged () {
        this._recentValue = this._value;
        this._recentValueAt = this._valueAt;
    }

    public valueAsString (options?: { addDate?: true | false | 'whenAnotherDay', addTime?: 'HH:MM:SS' | 'timeLeft-(hrs).(min).sec' }): string | null {
        try {
            if (this._valueAt instanceof Date) {
                let s = '';
                if (options.addDate) {
                    const year = this._valueAt.getFullYear();
                    const month = this._valueAt.getMonth() + 1;
                    const day = this._valueAt.getDate();
                    switch (options.addDate) {
                        case true: {
                            s += sprintf(' (@ %04d-%02d-%02d', year, month, day);
                            break;
                        }
                        case 'whenAnotherDay': {
                            const now = new Date();
                            if (year !== now.getFullYear() || month !== (now.getMonth() + 1) || day !== now.getDate()) {
                                s += sprintf(' (@ %04d-%02d-%02d', year, month, day);
                            }
                            break;
                        }
                        default:
                            throw new Error('invalid options.addDate ' + options.addDate);
                    }
                }
                if (options.addTime) {
                    switch (options.addTime) {
                        case 'HH:MM:SS': {
                            s += s === '' ? ' (@' : ', ';
                            s += sprintf('%02d:%02d:%02d', this._valueAt.getHours(), this._valueAt.getMinutes(), this._valueAt.getSeconds());
                            break;
                        }
                        case 'timeLeft-(hrs).(min).sec': {
                            if (s === '') {
                                let dt = Date.now() - this._valueAt.getTime();
                                if (dt < 0) {
                                    s += ' (in';
                                    dt = -dt;
                                } else if (dt > 0) {
                                    s += ' (before';
                                } else {
                                    s += ' (now';
                                }
                                const hrs = Math.floor(dt / 3600);
                                const min = Math.floor((dt - hrs * 3600) / 60);
                                const sec = Math.floor((dt - hrs * 3600 - min * 60) / 60);
                                if (hrs > 0) { s += sprintf(' %dhrs', hrs); }
                                if (min > 0) { s += sprintf(' %dmin', min); }
                                if (sec > 0) { s += sprintf(' %dsec', sec); }
                            }
                            break;
                        }
                        default: {
                            throw new Error('invalid options.addTime ' + options.addTime);
                        }
                    }
                }
                if (s !== '') {
                    s += ')';
                }
                const s1 = sprintf(this.format, this._value).trim();
                return s1 + this.unit + s;
            } else {
                return null;
            }
        } catch (err) {
            CommonLogger.warn('valueAsString() fails\%e', err);
            return null;
        }
    }


    public setRawValue (value: number, at: Date) {
        this._rawValue = value;
        /* tslint:disable:no-bitwise */
        try {
            const factor = this.modbusValueFactor;
            if (!(factor < 0 || factor > 0)) {
                throw new Error('invalid modbus factor ' + factor);
            }
            switch (this.modbusRegSize) {
                case 'u8':  { const x = (value &       0xff); this.setValue(x / factor, at); break; }
                case 'u16': { const x = (value &     0xffff); this.setValue(x / factor, at); break; }
                case 'u32': { const x = (value & 0xffffffff); this.setValue(x / factor, at); break; }
                case 'u64': { const x = (value & 0xffffffffffffffff); this.setValue(x / factor, at); break; }
                case 's8':  { const x = (value &       0xff); this.setValue((x >= 0x80 ? x - 0x100 : x ) / factor, at); break; }
                case 's16': { const x = (value &     0xffff); this.setValue((x >= 0x8000 ? x - 0x10000 : x) / factor , at); break; }
                case 's32': {
                    const x = (value & 0xffffffff); this.setValue((x >= 0x80000000 ? x - 0x100000000 : x) / factor, at); break;
                }
                case 's64': {
                    const x = (value & 0xffffffffffffffff); this.setValue((x >= 0x8000000000000000 ? x - 0x10000000000000000 : x) / factor, at); break;
                }
                default:
                    this.setValue(Number.NaN, at);
                    throw new Error('unsupported size ' + this.modbusRegSize);
            }
            /* tslint:enable:no-bitwise */

        } catch (err) {
            CommonLogger.warn('ModbusRegisterValue.setRawValue(): cannot set raw value\n%e', err);
        }
    }

    private setValue (value: number, at: Date) {
        if (value !== undefined && value !== null && at instanceof Date) {
            this._recentValue = this._value;
            this._recentValueAt = this._valueAt;
            this._value = value;
            this._valueAt = at;
        } else {
            CommonLogger.warn('ModbusRegisterValue.setValue(): cannot set value');
        }
    }

}

export class ModbusRegisterNumberError extends Error {
    constructor (public data: IModbusRegisterNumber, msg: string, public cause?: Error) { super(msg); }
}

