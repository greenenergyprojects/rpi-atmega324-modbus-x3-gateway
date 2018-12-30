
import { FroniusSymoModbusRegisters, IFroniusSymoModbusRegisterDefinition } from './fronius-symo-modbus-registers';
import { IModbusRegisterNumber, ModbusRegisterNumber } from './modbus-register-number';

export interface IFroniusSymoNumber extends IModbusRegisterNumber {
    id: number;
    value?: number | string;
    valueAt?: Date | number | string;
    recentValue?: number | string;
    recentValueAt?: Date | number | string;
    rawValue?: number | number [];
}

export class FroniusSymoNumber extends ModbusRegisterNumber implements IFroniusSymoNumber {

    private _getScaleFactor: (label: string) => number;

    public constructor (data: IFroniusSymoNumber, getScaleFactor?: (label: string) => number) {
        try {
            super(data);
            this._getScaleFactor = getScaleFactor;
        } catch (err) {
            throw new FroniusSymoNumberError(data, 'parsing IFroniusSymoNumber fails', err);
        }
    }

    public toObject (preserveDate = true): IFroniusSymoNumber {
        return super.toObject(preserveDate);
    }

    public get label (): string | null {
        const x: { [ id: number ]: IFroniusSymoModbusRegisterDefinition } = FroniusSymoModbusRegisters.regDefById;
        const r = x[this._id];
        return r ? r.label : null;
    }

    public get description (): string | null {
        const x: { [ id: number ]: IFroniusSymoModbusRegisterDefinition } = FroniusSymoModbusRegisters.regDefById;
        const r: IFroniusSymoModbusRegisterDefinition = x[this._id];
        return r ? r.description : null;
    }

    public get help (): string | null {
        const x: { [ id: number ]: IFroniusSymoModbusRegisterDefinition } = FroniusSymoModbusRegisters.regDefById;
        const r: IFroniusSymoModbusRegisterDefinition = x[this._id];
        return r ? r.help : null;
    }

    public get type (): 'R' | 'R/W' | null {
        const x: { [ id: number ]: IFroniusSymoModbusRegisterDefinition } = FroniusSymoModbusRegisters.regDefById;
        const r: IFroniusSymoModbusRegisterDefinition = x[this._id];
        return r ? r.type : null;
    }

    public get unit (): '' | '°C' | 'h' | 'Wh' | 'W' | 'VA' | 'VAr' | 'A' | 'V' | 'Hz' | '%' | null {
        const x: { [ id: number ]: IFroniusSymoModbusRegisterDefinition } = FroniusSymoModbusRegisters.regDefById;
        const r: IFroniusSymoModbusRegisterDefinition = x[this._id];
        return r ? r.unit : null;
    }

    public get format (): string | null {
        const x: { [ id: number ]: IFroniusSymoModbusRegisterDefinition } = FroniusSymoModbusRegisters.regDefById;
        const r: IFroniusSymoModbusRegisterDefinition = x[this._id];
        return r ? r.format : null;
    }

    public get modbusRegSize (): 'u8' | 's8' | 'u16' | 's16' | 'u32' | 's32' |'u64' | 's64' | 'str16' | 'str32' | null {
        const x: { [ id: number ]: IFroniusSymoModbusRegisterDefinition } = FroniusSymoModbusRegisters.regDefById;
        const r: IFroniusSymoModbusRegisterDefinition = x[this._id];
        return r ? r.size : null;
    }

    public get modbusValueFactor (): number | null {
        const x: { [ id: number ]: IFroniusSymoModbusRegisterDefinition } = FroniusSymoModbusRegisters.regDefById;
        const r: IFroniusSymoModbusRegisterDefinition = x[this._id];
        if (!r) {
            return null;
        }
        let f = 1;
        if (r.scalefactor) {
            f = this._getScaleFactor(r.scalefactor);
        }
        if (r.factor > 0 || r.factor < 0) {
            f = f * r.factor;
        }
        return f;
    }

    public isKnownRegister (): boolean {
        const x: { [ id: number ]: IFroniusSymoModbusRegisterDefinition } = FroniusSymoModbusRegisters.regDefById;
        const r: IFroniusSymoModbusRegisterDefinition = x[this._id];
        return r !== undefined;
    }

}

export class FroniusSymoNumberError extends Error {
    constructor (public data: IFroniusSymoNumber, msg: string, public cause?: Error) { super(msg); }
}

