

import { sprintf } from 'sprintf-js';

import { CommonLogger } from '../../common-logger';
import { DataRecord } from '../data-record';
import { RegisterValues, IRegisterValues } from '../modbus/register-values';
import { FroniusSymoModbusRegisters } from './fronius-symo-modbus-registers';
import { IRegisterDefinition, RegisterDefinition } from '../modbus/register-definition';
import { FroniusRegisterAttributes } from '../fronius-symo/fronius-symo-modbus-registers';
import { IRegisterBlock } from '../modbus/register-block';
import { ModbusNumber } from '../modbus/modbus-number';
import { ModbusValue } from '../modbus/modbus-value';

export interface IFroniusSymoModelRegister {
    registerValues: IRegisterValues;
}

export class FroniusSymoModelRegister extends DataRecord<IFroniusSymoModelRegister> implements IFroniusSymoModelRegister {

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

    // *********************************************************************

    private _registerValues: RegisterValues;

    private _values: { [ id in FroniusRegisterAttributes ]: ModbusNumber } = {
        f_delete_data:           undefined,
        f_store_data:            undefined,
        f_active_state_code:     undefined,
        f_reset_all_event_flags: undefined,
        f_model_type:            undefined,
        f_site_power:            undefined,
        f_site_energy_day:       undefined,
        f_site_energy_year:      undefined,
        f_site_energy_total:     undefined
    };

    public constructor (data: IFroniusSymoModelRegister) {
        super(data);
        try {
            const missing = DataRecord.getMissingAttributes( data, [ 'registerValues' ]);
            if (missing) {
                throw new Error('missing attribute ' + missing);
            }
            let attCnt = 0;
            for (const a of Object.getOwnPropertyNames(data)) {
                if ( a === 'registerValues' ) {
                    this._registerValues = new RegisterValues(data.registerValues);
                } else {
                    throw new Error('attribute ' + a + ' not found in data:IFroniusSymoModelRegister');
                }
                attCnt++;
            }
            if (attCnt !== Object.getOwnPropertyNames(this).length - 1) {
                throw new Error('attribute count mismatch');
            }

            const defs = FroniusSymoModbusRegisters.regDefByLabel.register;
            const defBlockIds = RegisterDefinition.getBlockIds(defs);
            const myBlockIds = this._registerValues.getBlockIds();
            if (defBlockIds.length !== defBlockIds.length) { throw Error('register block ids mismatch'); }
            for (let i = 0; i < defBlockIds.length; i++) {
                const dIds = defBlockIds[i];
                const myIds = myBlockIds[i];
                if (dIds.length !== myIds.length) { throw Error('register block ids mismatch on block ' + i); }
                for (let j = 0; j < dIds.length; j++) {
                    if (dIds[j] !== myIds[j]) { throw new Error('register id mismatch on block ' + i + ' item ' + j); }
                }
            }
            for (const a of Object.getOwnPropertyNames(this._values)) {
                const d = <IRegisterDefinition>(<any>defs)[a];
                if (!d) { throw new Error('missing definition for ' + a); }
                (<any>this._values)[a] =  new ModbusNumber(d, (id) => this.getValue(id), (uid) => this.getScaleFactor(uid));
            }

        } catch (err) {
            throw new FroniusSymoRegisterModelError(data, 'parsing IFroniusSymoModelRegister fails', err);
        }
    }

    public toObject (preserveDate = true): IFroniusSymoModelRegister {
        const rv: IFroniusSymoModelRegister = {
            registerValues: this._registerValues.toObject(preserveDate)
        };
        return rv;
    }

    public on (event: 'all' | FroniusRegisterAttributes, type: 'value' | 'update',
               listener: ( src: ModbusNumber, newValue: { at: Date, value: number }, oldValue: { at: Date, value: number }) => void) {
        if (event === 'all') {
            for (const a of Object.getOwnPropertyNames(this._values)) {
                const v = <ModbusValue<number>>(<any>this._values)[a];
                if (v) {
                    v.on(type, listener);
                }
            }
        } else {
            const v = <ModbusValue<number>>(<any>this._values)[event];
            if (v) {
                v.on(type, listener);
            }
        }
    }

    public off (event: 'all' | FroniusRegisterAttributes, type: 'value' | 'update',
               listener: ( src: ModbusNumber, newValue: { at: Date, value: number }, oldValue: { at: Date, value: number }) => void) {
        if (event === 'all') {
            for (const a of Object.getOwnPropertyNames(this._values)) {
                const v = <ModbusValue<number>>(<any>this._values)[a];
                if (v) {
                    v.off(type, listener);
                }
            }
        } else {
            const v = <ModbusValue<number>>(<any>this._values)[event];
            if (v) {
                v.off(type, listener);
            }
        }
    }

    public get registerValues (): RegisterValues {
        return this._registerValues;
    }

    public isValidId (id: number): boolean {
        return this._registerValues.getValue(id) !== undefined;
    }

    public getValue (id: number): { at: Date, value: number | null } | null | undefined {
        return this._registerValues.getValue(id);
    }

    public updateValues (firstId: number, lastId: number) {
        if (this._registerValues.isIdMatching(firstId, lastId)) {
            for (const a of Object.getOwnPropertyNames(this._values)) {
                const x = <ModbusValue<any>>(<any>this._values)[a];
                x.updateValue(firstId, lastId);
            }
        }
    }

    public get f_delete_data (): { at: Date, value: number } | null {
        return this._values.f_delete_data.value;
    }

    public get f_store_data (): { at: Date, value: number } | null {
        return this._values.f_store_data.value;
    }

    public get f_active_state_code (): { at: Date, value: number } | null {
        return this._values.f_active_state_code.value;
    }

    public get f_reset_all_event_flags (): { at: Date, value: number } | null {
        return this._values.f_reset_all_event_flags.value;
    }

    public get f_model_type (): { at: Date, value: number } | null {
        return this._values.f_model_type.value;
    }

    public get f_site_power (): { at: Date, value: number } | null {
        return this._values.f_site_power.value;
    }

    public get f_site_energy_day (): { at: Date, value: number } | null {
        return this._values.f_site_energy_day.value;
    }

    public get f_site_energy_year (): { at: Date, value: number } | null {
        return this._values.f_site_energy_year.value;
    }

    public get f_site_energy_total (): { at: Date, value: number } | null {
        return this._values.f_site_energy_total.value;
    }

    private getScaleFactor (uid: string): number {
        CommonLogger.warn('FroniusSymoModelRegister:getScaleFactor(): scalefactor not implemented');
        return 1.0;
    }

}

export class FroniusSymoRegisterModelError extends Error {
    constructor (public data: IFroniusSymoModelRegister, msg: string, public cause?: Error) { super(msg); }
}


