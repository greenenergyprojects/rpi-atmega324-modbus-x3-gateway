
import { sprintf } from 'sprintf-js';

import { CommonLogger } from '../../common-logger';
import { DataRecord } from '../data-record';
import { IFroniusSymoModel, FroniusSymoModel } from './fronius-symo-model';
import { IRegisterValues } from '../modbus/register-values';
import { FroniusSymoModbusRegisters, ControlAttributes } from './fronius-symo-modbus-registers';
import { RegisterDefinition, IRegisterDefinition } from '../modbus/register-definition';
import { ModbusNumber } from '../modbus/modbus-number';
import { IRegisterBlock } from '../modbus/register-block';


export interface IFroniusSymoModelControl extends IFroniusSymoModel {
    registerValues: IRegisterValues;
}

export class FroniusSymoModelControl extends FroniusSymoModel<IFroniusSymoModelControl, ControlAttributes> implements IFroniusSymoModelControl {

    public static createInstance (): FroniusSymoModelControl {
        const x: IRegisterValues = {
            regBlocks: []
        };
        const data: IFroniusSymoModelControl = {
            registerValues: x
        };
        const defBlockIds = RegisterDefinition.getBlockIds(FroniusSymoModbusRegisters.regDefByLabel.control);
        defBlockIds.forEach( (v) => {
            const b: IRegisterBlock = {
                firstId: v[0],
                lastId: v[v.length - 1],
            };
            x.regBlocks.push(b);
        });
        return new FroniusSymoModelControl(data);
    }


    public constructor (data: IFroniusSymoModelControl) {
        try {
            super(data, (uid: string) => { return <IRegisterDefinition>(<any>FroniusSymoModbusRegisters.regDefByUid)[uid]; });
        } catch (err) {
            throw new FroniusSymoModelControlError(data, 'parsing IFroniusSymoModelControl fails', err);
        }
    }

    public toObject (preserveDate = true): IFroniusSymoModelControl {
        const rv: IFroniusSymoModelControl = {
            registerValues: this._registerValues.toObject(preserveDate)
        };
        return rv;
    }

    public getDefintion (): { [ id: string ]: IRegisterDefinition } {
        return FroniusSymoModbusRegisters.regDefByLabel.control;
    }

    public get id (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.id;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get l (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.l;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get conn_wintms (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.conn_wintms;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get conn_rvrttms (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.conn_rvrttms;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get conn (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.conn;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get wmaxlimpct (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.wmaxlimpct;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get wmaxlimpct_wintms (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.wmaxlimpct_wintms;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get wmaxlimpct_rvrttms (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.wmaxlimpct_rvrttms;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get wmaxlim_ena (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.wmaxlim_ena;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get outpfset (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.outpfset;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get outpfset_wintms (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.outpfset_wintms;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get outpfset_rvrttms (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.outpfset_rvrttms;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get outpfset_ena (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.outpfset_ena;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get varmaxpct (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.varmaxpct;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get varpct_wintms (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.varpct_wintms;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get varpct_rvrttms (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.varpct_rvrttms;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get varpct_mod (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.varpct_mod;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get varpct_ena (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.varpct_ena;
        return  x instanceof ModbusNumber ? x.value : null;
    }

}

export class FroniusSymoModelControlError extends Error {
    constructor (public data: IFroniusSymoModelControl, msg: string, public cause?: Error) { super(msg); }
}


