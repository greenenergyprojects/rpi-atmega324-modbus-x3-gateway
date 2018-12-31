
import { sprintf } from 'sprintf-js';

import { CommonLogger } from '../../common-logger';
import { DataRecord } from '../data-record';
import { IFroniusSymoModel, FroniusSymoModel } from './fronius-symo-model';
import { IRegisterValues } from '../modbus/register-values';
import { ControlAttributes, FroniusSymoModbusRegisters } from './fronius-symo-modbus-registers';
import { RegisterDefinition, IRegisterDefinition } from '../modbus/register-definition';
import { ModbusNumber } from '../modbus/modbus-number';
import { IRegisterBlock } from '../modbus/register-block';


export interface IFroniusSymoModelStorage extends IFroniusSymoModel {
    registerValues: IRegisterValues;
}

export class FroniusSymoModelStorage extends FroniusSymoModel<IFroniusSymoModelStorage, ControlAttributes> implements IFroniusSymoModelStorage {

    public static createInstance (): FroniusSymoModelStorage {
        const x: IRegisterValues = {
            regBlocks: []
        };
        const data: IFroniusSymoModelStorage = {
            registerValues: x
        };
        const defBlockIds = RegisterDefinition.getBlockIds(FroniusSymoModbusRegisters.regDefByLabel.storage);
        defBlockIds.forEach( (v) => {
            const b: IRegisterBlock = {
                firstId: v[0],
                lastId: v[v.length - 1],
            };
            x.regBlocks.push(b);
        });
        return new FroniusSymoModelStorage(data);
    }


    public constructor (data: IFroniusSymoModelStorage) {
        try {
           super(data);
        } catch (err) {
            throw new FroniusSymoModelStorageError(data, 'parsing IFroniusSymoModelStorage fails', err);
        }
    }

    public toObject (preserveDate = true): IFroniusSymoModelStorage {
        const rv: IFroniusSymoModelStorage = {
            registerValues: this._registerValues.toObject(preserveDate)
        };
        return rv;
    }

    public getDefintion (): { [ id: string ]: IRegisterDefinition } {
        return FroniusSymoModbusRegisters.regDefByLabel.storage;
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

export class FroniusSymoModelStorageError extends Error {
    constructor (public data: IFroniusSymoModelStorage, msg: string, public cause?: Error) { super(msg); }
}

