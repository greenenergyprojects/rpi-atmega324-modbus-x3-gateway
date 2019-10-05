
import { sprintf } from 'sprintf-js';

import { CommonLogger } from '../../common-logger';
import { DataRecord } from '../data-record';
import { IFroniusSymoModel, FroniusSymoModel } from '../fronius-symo//fronius-symo-model';
import { IRegisterValues } from '../modbus/register-values';
import { FroniusMeterRegisters, FroniusMeterAttributes } from './fronius-meter-modbus-registers';
import { RegisterDefinition, IRegisterDefinition } from '../modbus/register-definition';
import { ModbusNumber } from '../modbus/modbus-number';
import { IRegisterBlock } from '../modbus/register-block';
import { ModbusString } from '../modbus/modbus-string';
import { IEnergyMeter, EnergyMeter } from '../home-control/energy-meter';


export interface IFroniusMeterModel extends IFroniusSymoModel {
    registerValues: IRegisterValues;
}

export class FroniusMeterModel extends FroniusSymoModel<IFroniusMeterModel, FroniusMeterAttributes> implements IFroniusMeterModel {

    public static createInstance (): FroniusMeterModel {
        const x: IRegisterValues = {
            regBlocks: []
        };
        const data: IFroniusMeterModel = {
            registerValues: x
        };
        const defBlockIds = RegisterDefinition.getBlockIds(FroniusMeterRegisters.regDefByLabel);
        defBlockIds.forEach( (v) => {
            const b: IRegisterBlock = {
                firstId: v[0],
                lastId: v[v.length - 1],
            };
            x.regBlocks.push(b);
        });
        return new FroniusMeterModel(data);
    }


    public constructor (data: IFroniusMeterModel) {
        try {
            super(data, (uid: string) => { return <IRegisterDefinition>(<any>FroniusMeterRegisters.regDefByUid)[uid]; });
        } catch (err) {
            throw new FroniusMeterModelError(data, 'parsing IFroniusSymoModelCommon fails', err);
        }
    }

    public toObject (preserveDate = true): IFroniusMeterModel {
        const rv: IFroniusMeterModel = {
            registerValues: this._registerValues.toObject(preserveDate)
        };
        return rv;
    }

    public getDefintion (): { [ id: string ]: IRegisterDefinition } {
        return FroniusMeterRegisters.regDefByLabel;
    }

    // public get mn (): { at: Date, value: string } | null {
    //     const x = <ModbusString>this._values.mn;
    //     return  x instanceof ModbusString ? x.value : null;
    // }

    public toEnergyMeter (serialNumber: string, preserveDate = true): EnergyMeter {
        let rv: IEnergyMeter;
        try {
            const x = this._registerValues.regBlocks[0].toObject();
            // CommonLogger.info('toEnergyMeter() pf    regBlocks[0].values[33] = %s', x.values[33] );
            // CommonLogger.info('toEnergyMeter() pf_sf regBlocks[0].values[37] = %s', x.values[37] );
            // CommonLogger.info('toEnergyMeter() pf = %o', this.pf);
            rv = {
                createdAt:            preserveDate ? this._registerValues.regBlocks[0].at : this._registerValues.regBlocks[0].at.getTime(),
                manufacturer:        'Fronius',
                type:                'Smartmeter 63A-3',
                serial:              serialNumber,
                numberOfPhases:      3,
                voltagePxToN:        [ this.phvpha.value, this.phvphb.value, this.phvphc.value ],
                voltagePxToPx:       [ this.ppvphab.value, this.ppvphbc.value, this.ppvphca.value ],
                activePower:         this.w.value,
                activePxPower:       [ this.wpha.value, this.wphb.value, this.wphc.value ],
                apparentPower:       this.va.value,
                apparentPxPower:     [ this.vapha.value, this.vaphb.value, this.vaphc.value ],
                passivePower:        this.var.value,
                passivePxPower:      [ this.varpha.value, this.varphb.value, this.varphc.value ],
                powerFactor:         this.pf.value,
                powerFactorPx:       [ this.pfpha.value, this.pfphb.value, this.pfphc.value ],
                frequency:           this.hz.value,
                energyTotal:         this.totwhimp.value - this.totwhexp.value,
                energyTotalExported: this.totwhexp.value,
                energyTotalImported: this.totwhimp.value,
            };
        } catch (err) {
            // CommonLogger.warn('toEnergyMeter() fails\n%e', err);
            CommonLogger.warn('toEnergyMeter() fails (%s)', err.message);
            rv = {
                createdAt:           new Date(),
                manufacturer:        'Fronius',
                type:                'Smartmeter 63A-3',
                serial:              serialNumber,
                numberOfPhases:      3,
                voltagePxToN:        [ null, null, null ],
                voltagePxToPx:       [ null, null, null ],
                activePower:         null,
                activePxPower:       [ null, null, null ],
                apparentPower:       null,
                apparentPxPower:     [ null, null, null ],
                passivePower:        null,
                passivePxPower:      [ null, null, null ],
                powerFactor:         null,
                powerFactorPx:       [ null, null, null ],
                frequency:           null,
                energyTotal:         null,
                energyTotalExported: null,
                energyTotalImported: null,
            };
        }
        return new EnergyMeter(rv);
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

    public get phv (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.phv;
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

    public get ppv (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.ppv;
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

    public get hz (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.hz;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get w (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.w;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get wpha (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.wpha;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get wphb (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.wphb;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get wphc (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.wphc;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get va (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.va;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get vapha (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.vapha;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get vaphb (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.vaphb;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get vaphc (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.vaphc;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get var (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.var;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get varpha (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.varpha;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get varphb (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.varphb;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get varphc (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.varphc;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get pf (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.pf;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get pfpha (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.pfpha;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get pfphb (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.pfphb;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get pfphc (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.pfphc;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get totwhexp (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.totwhexp;
        return  x instanceof ModbusNumber ? x.value : null;
    }

    public get totwhimp (): { at: Date, value: number } | null {
        const x = <ModbusNumber>this._values.totwhimp;
        return  x instanceof ModbusNumber ? x.value : null;
    }

}

export class FroniusMeterModelError extends Error {
    constructor (public data: IFroniusMeterModel, msg: string, public cause?: Error) { super(msg); }
}


