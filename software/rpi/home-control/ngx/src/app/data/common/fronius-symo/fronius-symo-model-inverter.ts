
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
           super(data);
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

// a:      
// apha:   
// aphb:   
// aphc:   
// a_sf:   
// ppvphab:
// ppvphbc:
// ppvphca:
// phvpha: 
// phvphb: 
// phvphc: 
// v_sf:   
// w:      
// w_sf:   
// hz:     
// hz_sf:  
// va:     
// va_sf:  
// var:    
// var_sf: 
// pf:     
// pf_sf:  
// wh:     
// wh_sf:  
// dca:    
// dca_sf: 
// dcv:    
// dcv_sf: 
// dcw:    
// dcw_sf: 
// tmpcab: 
// tmpsnk: 
// tmptms: 
// tmpot:  
// tmp_sf: 
// st:     
// stvnd:  
// evt1:   
// evt2:   
// evtvnd1:
// evtvnf2:
// evtvnd3:
// evtvnd4:

}

export class FroniusSymoModelInverterError extends Error {
    constructor (public data: IFroniusSymoModelInverter, msg: string, public cause?: Error) { super(msg); }
}


