
import { sprintf } from 'sprintf-js';

import { CommonLogger } from '../../common-logger';
import { DataRecord } from '../data-record';
import { IFroniusSymoModel, FroniusSymoModel } from './fronius-symo-model';
import { IRegisterValues } from '../modbus/register-values';
import { FroniusSymoModbusRegisters, InverterExtensionAttributes } from './fronius-symo-modbus-registers';
import { RegisterDefinition, IRegisterDefinition } from '../modbus/register-definition';
import { ModbusNumber } from '../modbus/modbus-number';
import { IRegisterBlock } from '../modbus/register-block';


export interface IFroniusSymoModelInverterExtension extends IFroniusSymoModel {
    registerValues: IRegisterValues;
}

export class FroniusSymoModelInverterExtension extends FroniusSymoModel<IFroniusSymoModelInverterExtension, InverterExtensionAttributes>
                                               implements IFroniusSymoModelInverterExtension {

    public static createInstance (): FroniusSymoModelInverterExtension {
        const x: IRegisterValues = {
            regBlocks: []
        };
        const data: IFroniusSymoModelInverterExtension = {
            registerValues: x
        };
        const defBlockIds = RegisterDefinition.getBlockIds(FroniusSymoModbusRegisters.regDefByLabel.inverterExtension);
        defBlockIds.forEach( (v) => {
            const b: IRegisterBlock = {
                firstId: v[0],
                lastId: v[v.length - 1],
            };
            x.regBlocks.push(b);
        });
        return new FroniusSymoModelInverterExtension(data);
    }


    public constructor (data: IFroniusSymoModelInverterExtension) {
        try {
           super(data);
        } catch (err) {
            throw new FroniusSymoModelInverterExtensionError(data, 'parsing IFroniusSymoModelInverterExtension fails', err);
        }
    }

    public toObject (preserveDate = true): IFroniusSymoModelInverterExtension {
        const rv: IFroniusSymoModelInverterExtension = {
            registerValues: this._registerValues.toObject(preserveDate)
        };
        return rv;
    }

    public getDefintion (): { [ id: string ]: IRegisterDefinition } {
        return FroniusSymoModbusRegisters.regDefByLabel.inverterExtension;
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

export class FroniusSymoModelInverterExtensionError extends Error {
    constructor (public data: IFroniusSymoModelInverterExtension, msg: string, public cause?: Error) { super(msg); }
}


