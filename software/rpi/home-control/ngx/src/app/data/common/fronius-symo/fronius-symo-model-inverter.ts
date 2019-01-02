
import { sprintf } from 'sprintf-js';

import { CommonLogger } from '../../common-logger';
import { DataRecord } from '../data-record';
import { IFroniusSymoModel, FroniusSymoModel } from './fronius-symo-model';
import { IRegisterValues } from '../modbus/register-values';
import { FroniusSymoModbusRegisters, InverterAttributes } from './fronius-symo-modbus-registers';
import { RegisterDefinition, IRegisterDefinition } from '../modbus/register-definition';
import { ModbusNumber } from '../modbus/modbus-number';
import { IRegisterBlock } from '../modbus/register-block';
import { ModbusString } from '../modbus/modbus-string';


export interface IFroniusSymoModelInverter extends IFroniusSymoModel {
    registerValues: IRegisterValues;
}

export class FroniusSymoModelInverter extends FroniusSymoModel<IFroniusSymoModelInverter, InverterAttributes> implements IFroniusSymoModelInverter {

    public static createInstance (): FroniusSymoModelInverter {
        const x: IRegisterValues = {
            regBlocks: []
        };
        const data: IFroniusSymoModelInverter = {
            registerValues: x
        };
        const defBlockIds = RegisterDefinition.getBlockIds(FroniusSymoModbusRegisters.regDefByLabel.inverter);
        defBlockIds.forEach( (v) => {
            const b: IRegisterBlock = {
                firstId: v[0],
                lastId: v[v.length - 1],
            };
            x.regBlocks.push(b);
        });
        return new FroniusSymoModelInverter(data);
    }


    public constructor (data: IFroniusSymoModelInverter) {
        try {
            super(data, (uid: string) => { return <IRegisterDefinition>(<any>FroniusSymoModbusRegisters.regDefByUid)[uid]; });
        } catch (err) {
            throw new FroniusSymoModelInverterError(data, 'parsing IFroniusSymoModelInverter fails', err);
        }
    }

    public toObject (preserveDate = true): IFroniusSymoModelInverter {
        const rv: IFroniusSymoModelInverter = {
            registerValues: this._registerValues.toObject(preserveDate)
        };
        return rv;
    }

    public getDefintion (): { [ id: string ]: IRegisterDefinition } {
        return FroniusSymoModbusRegisters.regDefByLabel.inverter;
    }


    public get id (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.id;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get l (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.l;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get a (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.a;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get apha (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.apha;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get aphb (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.aphb;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get aphc (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.aphc;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get ppvphab (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.ppvphab;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get ppvphbc (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.ppvphbc;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get ppvphca (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.ppvphca;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get phvpha (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.phvpha;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get phvphb (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.phvphb;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get phvphc (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.phvphc;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get w (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.w;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get hz (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.hz;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get va (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.va;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get var (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.var;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get pf (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.pf;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get wh (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.wh;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get dca (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.dca;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get dcv (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.dcv;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get dcw (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.dcw;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get st (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.st;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get stvnd (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.stvnd;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get evt1 (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.evt1;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get evt2 (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.evt2;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get evtvnd1 (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.evtvnd1;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get evtvnd2 (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.evtvnd2;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get evtvnd3 (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.evtvnd3;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get evtvnd4 (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.evtvnd4;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    // tmpcab
    // tmpsnk
    // tmptms
    // tmpot
    // tmp_sf

}

export class FroniusSymoModelInverterError extends Error {
    constructor (public data: IFroniusSymoModelInverter, msg: string, public cause?: Error) { super(msg); }
}


