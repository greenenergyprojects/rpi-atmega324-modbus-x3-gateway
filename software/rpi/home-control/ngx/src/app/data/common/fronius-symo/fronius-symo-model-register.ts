
import { sprintf } from 'sprintf-js';

import { CommonLogger } from '../../common-logger';
import { DataRecord } from '../data-record';
import { IFroniusSymoModel, FroniusSymoModel } from './fronius-symo-model';
import { IRegisterValues } from '../modbus/register-values';
import { FroniusSymoModbusRegisters, FroniusRegisterAttributes } from './fronius-symo-modbus-registers';
import { RegisterDefinition, IRegisterDefinition } from '../modbus/register-definition';
import { ModbusNumber } from '../modbus/modbus-number';
import { IRegisterBlock } from '../modbus/register-block';


export interface IFroniusSymoModelRegister extends IFroniusSymoModel {
    registerValues: IRegisterValues;
}

export class FroniusSymoModelRegister extends FroniusSymoModel<IFroniusSymoModelRegister, FroniusRegisterAttributes> implements IFroniusSymoModelRegister {

    public static createInstance (): FroniusSymoModelRegister {
        const x: IRegisterValues = {
            regBlocks: []
        };
        const data: IFroniusSymoModelRegister = {
            registerValues: x
        };
        const defBlockIds = RegisterDefinition.getBlockIds(FroniusSymoModbusRegisters.regDefByLabel.register);
        defBlockIds.forEach( (v) => {
            const b: IRegisterBlock = {
                firstId: v[0],
                lastId: v[v.length - 1],
            };
            x.regBlocks.push(b);
        });
        return new FroniusSymoModelRegister(data);
    }


    public constructor (data: IFroniusSymoModelRegister) {
        try {
            super(data, (uid: string) => { return <IRegisterDefinition>(<any>FroniusSymoModbusRegisters.regDefByUid)[uid]; });
        } catch (err) {
            throw new FroniusSymoModelRegisterError(data, 'parsing IFroniusSymoModelRegister fails', err);
        }
    }

    public toObject (preserveDate = true): IFroniusSymoModelRegister {
        const rv: IFroniusSymoModelRegister = {
            registerValues: this._registerValues.toObject(preserveDate)
        };
        return rv;
    }

    public getDefintion (): { [ id: string ]: IRegisterDefinition } {
        return FroniusSymoModbusRegisters.regDefByLabel.register;
    }


    public get f_delete_data (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.f_delete_data;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get f_store_data (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.f_store_data;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get f_active_state_code (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values._f_active_state_code;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get f_reset_all_event_flags (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.f_reset_all_event_flags;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get f_model_type (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.f_model_type;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get f_site_power (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.f_site_power;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get f_site_energy_day (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.f_site_energy_day;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get f_site_energy_year (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.f_site_energy_year;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get f_site_energy_total (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.f_site_energy_total;
        return  x instanceof ModbusNumber ? x.value : null;
    }


}

export class FroniusSymoModelRegisterError extends Error {
    constructor (public data: IFroniusSymoModelRegister, msg: string, public cause?: Error) { super(msg); }
}



