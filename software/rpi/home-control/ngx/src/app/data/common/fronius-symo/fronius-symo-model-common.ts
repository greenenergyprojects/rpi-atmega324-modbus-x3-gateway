
import { sprintf } from 'sprintf-js';

import { CommonLogger } from '../../common-logger';
import { DataRecord } from '../data-record';
import { RegisterValues, IRegisterValues } from '../modbus/register-values';
import { FroniusSymoModbusRegisters, ICommonDefinition } from './fronius-symo-modbus-registers';
import { IRegisterDefinition, RegisterDefinition } from '../modbus/register-definition';
import { CommonAttributes } from '../fronius-symo/fronius-symo-modbus-registers';
import { IRegisterBlock } from '../modbus/register-block';
import { ModbusNumber } from '../modbus/modbus-number';
import { ModbusString } from '../modbus/modbus-string';
import { ModbusValue } from '../modbus/modbus-value';


export interface IFroniusSymoModelCommon {
    registerValues: IRegisterValues;
}

export class FroniusSymoModelCommon extends DataRecord<IFroniusSymoModelCommon> implements IFroniusSymoModelCommon {

    public static createInstance (): FroniusSymoModelCommon {
        const x: IRegisterValues = {
            regBlocks: []
        };
        const data: IFroniusSymoModelCommon = {
            registerValues: x
        };
        const defBlockIds = RegisterDefinition.getBlockIds(FroniusSymoModbusRegisters.regDefByLabel.common);
        defBlockIds.forEach( (v) => {
            const b: IRegisterBlock = {
                firstId: v[0],
                lastId: v[v.length - 1],
            };
            x.regBlocks.push(b);
        });
        return new FroniusSymoModelCommon(data);
    }


    private _registerValues: RegisterValues;

    private _values: { [ id in CommonAttributes ]: ModbusNumber | ModbusString } = {
        sid: undefined,
        id:  undefined,
        l:   undefined,
        mn:  undefined,
        md:  undefined,
        opt: undefined,
        vr:  undefined,
        sn:  undefined,
        da:  undefined
    };


    public constructor (data: IFroniusSymoModelCommon) {
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
                    throw new Error('attribute ' + a + ' not found in data:IFroniusSymoModelCommon');
                }
                attCnt++;
            }
            if (attCnt !== Object.getOwnPropertyNames(this).length - 1) {
                throw new Error('attribute count mismatch');
            }

            const defs = FroniusSymoModbusRegisters.regDefByLabel.common;
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
                if (d.class === ModbusNumber) {
                    (<any>this._values)[a] =  new ModbusNumber(d, (id) => this.getValue(id), (uid) => this.getScaleFactor(uid));
                } else if (d.class === ModbusString) {
                    (<any>this._values)[a] =  new ModbusString(d, (id) => this.getValue(id));
                } else {
                    throw new Error('missing class for definition of ' + a);
                }
            }

        } catch (err) {
            throw new FroniusSymoCommonModelError(data, 'parsing IFroniusSymoModelCommon fails', err);
        }
    }

    public toObject (preserveDate = true): IFroniusSymoModelCommon {
        const rv: IFroniusSymoModelCommon = {
            registerValues: this._registerValues.toObject(preserveDate)
        };
        return rv;
    }

    public on (event: 'all' | CommonAttributes, type: 'value' | 'update',
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

    public off (event: 'all' | CommonAttributes, type: 'value' | 'update',
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

    public get sid (): { at: Date, value: number } | null {
        return (<ModbusNumber>this._values.sid).value;
    }

    public get id (): { at: Date, value: number } | null {
        return (<ModbusNumber>this._values.id).value;
    }

    public get l (): { at: Date, value: number } | null {
        return (<ModbusNumber>this._values.l).value;
    }

    public get mn (): { at: Date, value: string } | null {
        return (<ModbusString>this._values.mn).value;
    }

    public get md (): { at: Date, value: string } | null {
        return (<ModbusString>this._values.md).value;
    }

    public get opt (): { at: Date, value: string } | null  {
        return (<ModbusString>this._values.opt).value;
    }

    public get vr (): { at: Date, value: string } | null  {
        return (<ModbusString>this._values.vr).value;
    }

    public get sn (): { at: Date, value: string } | null  {
        return (<ModbusString>this._values.sn).value;
    }

    public get da (): { at: Date, value: number } | null {
        return (<ModbusNumber>this._values.da).value;
    }

    private getScaleFactor (uid: string): number {
        CommonLogger.warn('FroniusSymoModelRegister:getScaleFactor(): scalefactor not implemented');
        return 1.0;
    }

}

export class FroniusSymoCommonModelError extends Error {
    constructor (public data: IFroniusSymoModelCommon, msg: string, public cause?: Error) { super(msg); }
}


