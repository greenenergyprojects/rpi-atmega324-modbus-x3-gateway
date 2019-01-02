
import { sprintf } from 'sprintf-js';

import { CommonLogger } from '../../common-logger';
import { DataRecord } from '../data-record';
import { IFroniusSymoModel, FroniusSymoModel } from './fronius-symo-model';
import { IRegisterValues } from '../modbus/register-values';
import { FroniusSymoModbusRegisters, StatusAttributes } from './fronius-symo-modbus-registers';
import { RegisterDefinition, IRegisterDefinition } from '../modbus/register-definition';
import { ModbusNumber } from '../modbus/modbus-number';
import { IRegisterBlock } from '../modbus/register-block';
import { ModbusString } from '../modbus/modbus-string';


export interface IFroniusSymoModelStatus extends IFroniusSymoModel {
    registerValues: IRegisterValues;
}

export class FroniusSymoModelStatus extends FroniusSymoModel<IFroniusSymoModelStatus, StatusAttributes> implements IFroniusSymoModelStatus {

    public static createInstance (): FroniusSymoModelStatus {
        const x: IRegisterValues = {
            regBlocks: []
        };
        const data: IFroniusSymoModelStatus = {
            registerValues: x
        };
        const defBlockIds = RegisterDefinition.getBlockIds(FroniusSymoModbusRegisters.regDefByLabel.status);
        defBlockIds.forEach( (v) => {
            const b: IRegisterBlock = {
                firstId: v[0],
                lastId: v[v.length - 1],
            };
            x.regBlocks.push(b);
        });
        return new FroniusSymoModelStatus(data);
    }


    public constructor (data: IFroniusSymoModelStatus) {
        try {
            super(data, (uid: string) => { return <IRegisterDefinition>(<any>FroniusSymoModbusRegisters.regDefByUid)[uid]; });
        } catch (err) {
            throw new FroniusSymoModelStatusError(data, 'parsing IFroniusSymoModelStatus fails', err);
        }
    }

    public toObject (preserveDate = true): IFroniusSymoModelStatus {
        const rv: IFroniusSymoModelStatus = {
            registerValues: this._registerValues.toObject(preserveDate)
        };
        return rv;
    }

    public getDefintion (): { [ id: string ]: IRegisterDefinition } {
        return FroniusSymoModbusRegisters.regDefByLabel.status;
    }

    public get id (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.id;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get l (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.l;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get pvConn (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.pvConn;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get storconn (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.storconn;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get ecpconn (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.ecpconn;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get actwh (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.actwh;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get stactctl (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.stactctl;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get tmsrc (): { at: Date, value: string } | null  {
        const x = <ModbusString>this._values.tmsrc;
        return  x instanceof ModbusString ? x.value : null;
    }

    public get tms (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.tms;
        return  x instanceof ModbusNumber ? x.value : null;
    }

}

export class FroniusSymoModelStatusError extends Error {
    constructor (public data: IFroniusSymoModelStatus, msg: string, public cause?: Error) { super(msg); }
}


