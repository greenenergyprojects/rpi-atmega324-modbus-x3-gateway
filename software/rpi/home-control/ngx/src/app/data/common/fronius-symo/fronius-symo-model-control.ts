
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
           super(data);
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
}

export class FroniusSymoModelControlError extends Error {
    constructor (public data: IFroniusSymoModelControl, msg: string, public cause?: Error) { super(msg); }
}


