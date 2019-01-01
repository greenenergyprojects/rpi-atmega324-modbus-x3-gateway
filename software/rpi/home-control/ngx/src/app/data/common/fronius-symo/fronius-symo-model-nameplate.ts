

import { sprintf } from 'sprintf-js';

import { CommonLogger } from '../../common-logger';
import { DataRecord } from '../data-record';
import { IFroniusSymoModel, FroniusSymoModel } from './fronius-symo-model';
import { IRegisterValues } from '../modbus/register-values';
import { FroniusSymoModbusRegisters, NameplateAttributes } from './fronius-symo-modbus-registers';
import { RegisterDefinition, IRegisterDefinition } from '../modbus/register-definition';
import { ModbusNumber } from '../modbus/modbus-number';
import { IRegisterBlock } from '../modbus/register-block';
import { ModbusString } from '../modbus/modbus-string';


export interface IFroniusSymoModelNameplate extends IFroniusSymoModel {
    registerValues: IRegisterValues;
}

export class FroniusSymoModelNameplate extends FroniusSymoModel<IFroniusSymoModelNameplate, NameplateAttributes> implements IFroniusSymoModelNameplate {

    public static createInstance (): FroniusSymoModelNameplate {
        const x: IRegisterValues = {
            regBlocks: []
        };
        const data: IFroniusSymoModelNameplate = {
            registerValues: x
        };
        const defBlockIds = RegisterDefinition.getBlockIds(FroniusSymoModbusRegisters.regDefByLabel.nameplate);
        defBlockIds.forEach( (v) => {
            const b: IRegisterBlock = {
                firstId: v[0],
                lastId: v[v.length - 1],
            };
            x.regBlocks.push(b);
        });
        return new FroniusSymoModelNameplate(data);
    }


    public constructor (data: IFroniusSymoModelNameplate) {
        try {
            super(data, (uid: string) => { return <IRegisterDefinition>(<any>FroniusSymoModbusRegisters.regDefByUid)[uid]; });
        } catch (err) {
            throw new FroniusSymoModelNameplateError(data, 'parsing IFroniusSymoModelNameplate fails', err);
        }
    }

    public toObject (preserveDate = true): IFroniusSymoModelNameplate {
        const rv: IFroniusSymoModelNameplate = {
            registerValues: this._registerValues.toObject(preserveDate)
        };
        return rv;
    }

    public getDefintion (): { [ id: string ]: IRegisterDefinition } {
        return FroniusSymoModbusRegisters.regDefByLabel.nameplate;
    }


    public get id (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.id;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get l (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.l;
        return  x instanceof ModbusNumber ? x.value : null;
    }

}

export class FroniusSymoModelNameplateError extends Error {
    constructor (public data: IFroniusSymoModelNameplate, msg: string, public cause?: Error) { super(msg); }
}


