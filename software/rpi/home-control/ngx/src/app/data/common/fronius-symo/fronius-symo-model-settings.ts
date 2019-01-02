
import { sprintf } from 'sprintf-js';

import { CommonLogger } from '../../common-logger';
import { DataRecord } from '../data-record';
import { IFroniusSymoModel, FroniusSymoModel } from './fronius-symo-model';
import { IRegisterValues } from '../modbus/register-values';
import { FroniusSymoModbusRegisters, SettingsAttributes } from './fronius-symo-modbus-registers';
import { RegisterDefinition, IRegisterDefinition } from '../modbus/register-definition';
import { ModbusNumber } from '../modbus/modbus-number';
import { IRegisterBlock } from '../modbus/register-block';


export interface IFroniusSymoModelSettings extends IFroniusSymoModel {
    registerValues: IRegisterValues;
}

export class FroniusSymoModelSettings extends FroniusSymoModel<IFroniusSymoModelSettings, SettingsAttributes> implements IFroniusSymoModelSettings {

    public static createInstance (): FroniusSymoModelSettings {
        const x: IRegisterValues = {
            regBlocks: []
        };
        const data: IFroniusSymoModelSettings = {
            registerValues: x
        };
        const defBlockIds = RegisterDefinition.getBlockIds(FroniusSymoModbusRegisters.regDefByLabel.settings);
        defBlockIds.forEach( (v) => {
            const b: IRegisterBlock = {
                firstId: v[0],
                lastId: v[v.length - 1],
            };
            x.regBlocks.push(b);
        });
        return new FroniusSymoModelSettings(data);
    }


    public constructor (data: IFroniusSymoModelSettings) {
        try {
            super(data, (uid: string) => { return <IRegisterDefinition>(<any>FroniusSymoModbusRegisters.regDefByUid)[uid]; });
        } catch (err) {
            throw new FroniusSymoModelSettingsError(data, 'parsing IFroniusSymoModelStatus fails', err);
        }
    }

    public toObject (preserveDate = true): IFroniusSymoModelSettings {
        const rv: IFroniusSymoModelSettings = {
            registerValues: this._registerValues.toObject(preserveDate)
        };
        return rv;
    }

    public getDefintion (): { [ id: string ]: IRegisterDefinition } {
        return FroniusSymoModbusRegisters.regDefByLabel.settings;
    }

    public get id (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.id;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get l (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.l;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get wmax (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.wmax;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get vref (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.vref;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get vrefofs (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.vrefofs;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get vamax (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.vamax;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get varmaxq1 (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.varmaxq1;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get varmaxq4 (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.varmaxq4;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get pfminq1 (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.pfminq1;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get pfminq4 (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.pfminq4;
        return  x instanceof ModbusNumber ? x.value : null;
    }

}

export class FroniusSymoModelSettingsError extends Error {
    constructor (public data: IFroniusSymoModelSettings, msg: string, public cause?: Error) { super(msg); }
}


