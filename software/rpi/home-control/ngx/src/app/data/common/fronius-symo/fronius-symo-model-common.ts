
import { sprintf } from 'sprintf-js';

import { CommonLogger } from '../../common-logger';
import { DataRecord } from '../data-record';
import { IFroniusSymoModel, FroniusSymoModel } from './fronius-symo-model';
import { IRegisterValues } from '../modbus/register-values';
import { FroniusSymoModbusRegisters, CommonAttributes } from './fronius-symo-modbus-registers';
import { RegisterDefinition, IRegisterDefinition } from '../modbus/register-definition';
import { ModbusNumber } from '../modbus/modbus-number';
import { IRegisterBlock } from '../modbus/register-block';
import { ModbusString } from '../modbus/modbus-string';


export interface IFroniusSymoModelCommon extends IFroniusSymoModel {
    registerValues: IRegisterValues;
}

export class FroniusSymoModelCommon extends FroniusSymoModel<IFroniusSymoModelCommon, CommonAttributes> implements IFroniusSymoModelCommon {

    public static createInstance (): FroniusSymoModelCommon {
        const x: IRegisterValues = {
            regBlocks: []
        };
        const data: IFroniusSymoModelCommon = {
            registerValues: x
        };
        const defBlockIds = RegisterDefinition.getBlockIds(FroniusSymoModbusRegisters.regDefByLabel.common);
        defBlockIds.forEach( (v) => {
            const b: IRegisterBlock = {
                firstId: v[0],
                lastId: v[v.length - 1],
            };
            x.regBlocks.push(b);
        });
        return new FroniusSymoModelCommon(data);
    }


    public constructor (data: IFroniusSymoModelCommon) {
        try {
            super(data, (uid: string) => { return <IRegisterDefinition>(<any>FroniusSymoModbusRegisters.regDefByUid)[uid]; });
        } catch (err) {
            throw new FroniusSymoCommonModelError(data, 'parsing IFroniusSymoModelCommon fails', err);
        }
    }

    public toObject (preserveDate = true): IFroniusSymoModelCommon {
        const rv: IFroniusSymoModelCommon = {
            registerValues: this._registerValues.toObject(preserveDate)
        };
        return rv;
    }

    public getDefintion (): { [ id: string ]: IRegisterDefinition } {
        return FroniusSymoModbusRegisters.regDefByLabel.common;
    }


    public get sid (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.sid;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get id (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.id;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get l (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.l;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get mn (): { at: Date, value: string } | null {
        const x = <ModbusString>this._values.mn;
        return  x instanceof ModbusString ? x.value : null;
    }

    public get md (): { at: Date, value: string } | null {
        const x = <ModbusString>this._values.md;
        return  x instanceof ModbusString ? x.value : null;
    }

    public get opt (): { at: Date, value: string } | null  {
        const x = <ModbusString>this._values.opt;
        return  x instanceof ModbusString ? x.value : null;
    }

    public get vr (): { at: Date, value: string } | null  {
        const x = <ModbusString>this._values.vr;
        return  x instanceof ModbusString ? x.value : null;
    }

    public get sn (): { at: Date, value: string } | null  {
        const x = <ModbusString>this._values.sn;
        return  x instanceof ModbusString ? x.value : null;
    }

    public get da (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.da;
        return  x instanceof ModbusNumber ? x.value : null;
    }

}

export class FroniusSymoCommonModelError extends Error {
    constructor (public data: IFroniusSymoModelCommon, msg: string, public cause?: Error) { super(msg); }
}


