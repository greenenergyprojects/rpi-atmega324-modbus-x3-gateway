
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
           super(data, (uid: string) => { return <IRegisterDefinition>(<any>FroniusSymoModbusRegisters.regDefByUid)[uid]; });
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

    public get wchamax (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.wchamax;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get wchagra (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.wchagra;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get wdischagra (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.wdischagra;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get storctl_mod (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.storctl_mod;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get minrsvpct (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.minrsvpct;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get chastate (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.chastate;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get chast (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.chast;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get outwrte (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.outwrte;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get inwrte (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.inwrte;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get chagriset (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.inwrte;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    // ************************************************

    public getBatteryStateAsString (maxAgeSeconds = 10000): string | null {
        const x = <ModbusNumber>this._values.chast;
        if (!(x instanceof ModbusNumber)) { return null; }
        const tMin = Date.now() - maxAgeSeconds * 1000;
        const ts = x.valueAt;
        if (!(ts instanceof Date)  || ts.getTime() < tMin) { return null; }
        switch (x.value.value) {
            case 1: return 'OFF';
            case 2: return 'EMPTY';
            case 3: return 'DISCHARGING';
            case 4: return 'CHARGING';
            case 5: return 'FULL';
            case 6: return 'HOLDING';
            case 7: return 'CALIBRATING';
            default: return '? (' + x.value.value + ')';
        }
    }

}

export class FroniusSymoModelStorageError extends Error {
    constructor (public data: IFroniusSymoModelStorage, msg: string, public cause?: Error) { super(msg); }
}


