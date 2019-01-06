
import { sprintf } from 'sprintf-js';

import { CommonLogger } from '../../common-logger';
import { DataRecord } from '../data-record';
import { RegisterValues, IRegisterValues } from '../modbus/register-values';
// import { FroniusSymoModbusRegisters } from './fronius-symo-modbus-registers';
import { IRegisterDefinition, RegisterDefinition } from '../modbus/register-definition';
import { IRegisterBlock } from '../modbus/register-block';
import { ModbusNumber } from '../modbus/modbus-number';
import { ModbusString } from '../modbus/modbus-string';
import { ModbusValue } from '../modbus/modbus-value';


export interface IFroniusSymoModel {
    registerValues: IRegisterValues;
}

export abstract class FroniusSymoModel<T extends IFroniusSymoModel, K> extends DataRecord<T> {

    protected _registerValues: RegisterValues;
    protected _values: { [ label: string ]: ModbusNumber | ModbusString } = {};
    private   _getDefByUid: (uid: string) => IRegisterDefinition;

    public constructor (data: T, getDefByUid: (uid: string) => IRegisterDefinition) {
        super(data);
        this._getDefByUid = getDefByUid;
        try {
            const missing = DataRecord.getMissingAttributes( data, [ 'registerValues']);
            if (missing) {
                throw new Error('missing attribute ' + missing);
            }
            let attCnt = 0;
            for (const a of Object.getOwnPropertyNames(data)) {
                switch (a) {
                    case 'registerValues': this._registerValues = new RegisterValues(data.registerValues); break;
                    default: throw new Error('attribute ' + a + ' not found in data');
                }
                attCnt++;
            }
            if (attCnt !== Object.getOwnPropertyNames(this).length - 2) {
                throw new Error('attribute count mismatch');
            }

            const defs = this.getDefintion();
            for (const label of Object.getOwnPropertyNames(defs)) {
                const d = <IRegisterDefinition>(<any>defs)[label];
                if (!d) { throw new Error('missing definition for ' + label); }
                if (d.class === ModbusNumber) {
                    (<any>this._values)[label] =  new ModbusNumber(d, (id) => this.getValue(id), (uid) => this.getScaleFactor(uid));
                } else if (d.class === ModbusString) {
                    (<any>this._values)[label] =  new ModbusString(d, (id) => this.getValue(id));
                } else {
                    throw new Error('missing class for definition of ' + label);
                }
            }

            const defBlockIds = RegisterDefinition.getBlockIds(defs);
            const myBlockIds = this._registerValues.getBlockIds();
            if (defBlockIds.length !== defBlockIds.length) { throw Error('block ids mismatch'); }
            for (let i = 0; i < defBlockIds.length; i++) {
                const dIds = defBlockIds[i];
                const myIds = myBlockIds[i];
                if (dIds.length !== myIds.length) { throw Error('block ids mismatch on block ' + i); }
                for (let j = 0; j < dIds.length; j++) {
                    if (dIds[j] !== myIds[j]) { throw new Error('id mismatch on block ' + i + ' item ' + j); }
                }
            }

        } catch (err) {
            throw new FroniusSymoModelError(data, 'parsing IFroniusSymoModel fails', err);
        }
    }

    public on (event: 'all' | K, type: 'value' | 'update',
               listener: ( src: ModbusNumber | ModbusString,
                           newValue: { at: Date, value: number | string }, oldValue: { at: Date, value: number | string }) => void) {
        if (event === 'all') {
            for (const a of Object.getOwnPropertyNames(this._values)) {
                const v = <ModbusValue<any>>(<any>this._values)[a];
                if (v) {
                    v.on(type, listener);
                }
            }
        } else {
            const v = <ModbusValue<any>>(<any>this._values)[event];
            if (v) {
                v.on(type, listener);
            }
        }
    }

    public off (event: 'all' | K, type: 'value' | 'update',
                listener: ( src: ModbusNumber | ModbusString,
                            newValue: { at: Date, value: number | string }, oldValue: { at: Date, value: number | string }) => void) {
        if (event === 'all') {
            for (const a of Object.getOwnPropertyNames(this._values)) {
                const v = <ModbusValue<any>>(<any>this._values)[a];
                if (v) {
                    v.off(type, listener);
                }
            }
        } else {
            const v = <ModbusValue<any>>(<any>this._values)[event];
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

    public invalidiateValues (at?: Date) {
        for (const a of Object.getOwnPropertyNames(this._values)) {
            const x = <ModbusValue<any>>(<any>this._values)[a];
            x.invalidateValue(at);
        }
    }

    public getMaxDeltaTimeMillis (model: FroniusSymoModel<any, any>): number | null {
        if (!this._registerValues || !model._registerValues) {
            return null;
        }
        return this._registerValues.getMaxDeltaTimeMillis(model._registerValues);
    }

    public getMinMaxTimeMillis (model: FroniusSymoModel<any, any>): { tMin: number, tMax: number } | null {
        if (!this._registerValues || !model._registerValues) {
            return null;
        }
        return this._registerValues.getMinMaxTimeMillis(model._registerValues);
    }

    protected abstract getDefintion (): { [ id: string ]: IRegisterDefinition };



    private getScaleFactor (uid: string): number {
        if (!this._getDefByUid) {
            CommonLogger.warn('getScaleFactor(): uid %s -> no getDefByUid() function, return factor 1.0', uid);
            return 1.0;
        }
        // const d = <IRegisterDefinition>(<any>FroniusSymoModbusRegisters.regDefById)[uid];
        const d = this._getDefByUid(uid);
        if (!d) {
            CommonLogger.warn('getScaleFactor(): uid %s not know for scalefactor, return factor 1.0', uid);
            return 1.0;
        }
        if (d.code !== 's16') {
            CommonLogger.warn('getScaleFactor(): uid %s -> invalid code %s, return factor 1.0', uid, d.code);
            return 1.0;
        }
        if (!(d.id >= 0 && d.id <= 0xffff)) {
            CommonLogger.warn('getScaleFactor(): uid %s -> invalid id %o, return factor 1.0', uid, d.id);
            return 1.0;
        }
        const sf = this._registerValues.getValue(<any>d.id);
        if (!sf.at || sf.value === null) {
            CommonLogger.warn('getScaleFactor(): uid %s -> invalid scale factor %i, return factor 1.0', uid, sf);
            return 1.0;
        }
        if (sf.value >= 32768) {
            sf.value = sf.value - 65536;
        }
        // CommonLogger.info('--> scalefactor %s = %d', uid, sf.value);
        return sf.value;
    }

}

export class FroniusSymoModelError extends Error {
    constructor (public data: IFroniusSymoModel, msg: string, public cause?: Error) { super(msg); }
}


