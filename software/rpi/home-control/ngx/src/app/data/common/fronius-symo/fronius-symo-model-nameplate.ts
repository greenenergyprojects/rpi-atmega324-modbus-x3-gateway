

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

    public get dertyp (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.dertyp;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get wrtg (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.wrtg;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get wrtg_sf (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.wrtg_sf;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get vatg (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.vatg;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get vatg_sf (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.vatg_sf;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get vartgq1 (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.vartgq1;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get vartgq2 (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.vartgq2;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get vartgq3 (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.vartgq3;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get vartgq4 (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.vartgq4;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get vartgx_sf (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.vartgx_sf;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get artg (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.artg;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get artg_sf (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.artg_sf;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get pfrtgq1 (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.pfrtgq1;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get pfrtgq2 (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.pfrtgq2;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get pfrtgq3 (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.pfrtgq3;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get pfrtgq4 (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.pfrtgq4;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get pfrtg_sf (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.pfrtg_sf;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get whrtg (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.whrtg;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get whrtg_sf (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.whrtg_sf;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get ahrrtg (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.ahrrtg;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get ahrrtg_sf (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.ahrrtg_sf;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get maxcharte (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.maxcharte;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get maxcharte_sf (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.maxcharte_sf;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get maxdischarte (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.ahrrtgmaxdischarte_sf;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get maxdischarte_sf (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.maxdischarte_sf;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get pad (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.pad;
        return  x instanceof ModbusNumber ? x.value : null;
    }

}

export class FroniusSymoModelNameplateError extends Error {
    constructor (public data: IFroniusSymoModelNameplate, msg: string, public cause?: Error) { super(msg); }
}


