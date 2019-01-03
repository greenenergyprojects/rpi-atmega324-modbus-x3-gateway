
import { sprintf } from 'sprintf-js';

import { CommonLogger } from '../../common-logger';
import { DataRecord } from '../data-record';
import { IFroniusSymoModel, FroniusSymoModel } from './fronius-symo-model';
import { IRegisterValues } from '../modbus/register-values';
import { FroniusSymoModbusRegisters, InverterExtensionAttributes } from './fronius-symo-modbus-registers';
import { RegisterDefinition, IRegisterDefinition } from '../modbus/register-definition';
import { ModbusNumber } from '../modbus/modbus-number';
import { IRegisterBlock } from '../modbus/register-block';
import { ModbusString } from '../modbus/modbus-string';


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
            super(data, (uid: string) => { return <IRegisterDefinition>(<any>FroniusSymoModbusRegisters.regDefByUid)[uid]; });
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

    public get evt (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.evt;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get n (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.n;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get id_1 (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.id_1;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get idstr_1 (): { at: Date, value: string } | null  {
        const x = <ModbusString>this._values.idstr_1;
        return  x instanceof ModbusString ? x.value : null;
    }

    public get dca_1 (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.dca_1;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get dcv_1 (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.dcv_1;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get dcw_1 (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.dcw_1;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get dcwh_1 (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.dcwh_1;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get tms_1 (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.tms_1;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get dcst_1 (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.dcst_1;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get dcevt_1 (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.dcevt_1;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get id_2 (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.id_2;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get idstr_2 (): { at: Date, value: string } | null  {
        const x = <ModbusString>this._values.idstr_2;
        return  x instanceof ModbusString ? x.value : null;
    }

    public get dca_2 (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.dca_2;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get dcv_2 (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.dcv_2;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get dcw_2 (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.dcw_2;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get dcwh_2 (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.dcwh_2;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get tms_2 (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.tms_2;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get dcst_2 (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.dcst_2;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get dcevt_2 (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.dcevt_2;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public getPvSouthActivePower (): { at: Date, value: number } | null {
        return this.dcw_1;
    }

}

export class FroniusSymoModelInverterExtensionError extends Error {
    constructor (public data: IFroniusSymoModelInverterExtension, msg: string, public cause?: Error) { super(msg); }
}


