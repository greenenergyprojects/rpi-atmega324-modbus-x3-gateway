
import * as debugsx from 'debug-sx';
const debug: debugsx.IFullLogger = debugsx.createFullLogger('devices:FroniusMeter');

import { EventEmitter } from 'events';

import { sprintf } from 'sprintf-js';

import { ModbusDevice } from './modbus-device';
import { ModbusSerial } from '../modbus/modbus-serial';
import { ModbusSerialDevice } from '../devices/modbus-serial-device';
import { ModbusFrame } from '../modbus/modbus-frame';


export interface IFroniusMeterValues {
    lastUpdateAt: Date;           // Zeitpunkt der gemessenen Werte
    voltageL1: number;            // Phasenspannung L1 - N in Volt
    voltageL2: number;            // Phasenspannung L2 - N in Volt
    voltageL3: number;            // Phasenspannung L3 - N in Volt
    currentL1: number;            // Phasenstrom in L1 in Ampere
    currentL2: number;            // Phasenstrom in L2 in Ampere
    currentL3: number;            // Phasenstrom in L3 in Ampere
    voltageL12: number;           // Phasenspannung L1 - L2 in Volt
    voltageL23: number;           // Phasenspannung L2 - L3 in Volt
    voltageL31: number;           // Phasenspannung L3 - L1 in Volt
    activePower: number;          // Wirkleistung in W (+/-)
    reactivePower: number;        // Blindleistung in var (+/-)
    apparentPower: number;        // Scheinleistung in VA
    activeEnergy: number;         // Wirkeinergie Bezug in Wh
    reactiveEnergy: number;       // Blindenergie Bezug in varh
    activeFeedEnergy: number;     // Wirkeinergie Lieferung in Wh
    reactiveFeedEnergy: number;   // Blindenergie Lieferung in varh
    powerFactor: number;          // Leistungsfaktor (+ IND, - CAP)
    powerStatus: 'NoPower' | 'Inductive' | 'Capacitice' | '?';
    frequency: number;            // Frequency in Hz
    activePowerDemand: number;    // Wirkleistungmittelwert in letztem 5 Minuten Zeitintervall in W
    activePowerMaxDemand: number; // Maximaler Wirkleistungsmittelwert seit Reset in W
    lastDemandAt: Date;           // Zeitpunkt der letzten Mittelwerte
    demandMinute: 0 | 1 | 2 | 3 | 4 | undefined;
    activePowerL1: number;        // Wirkleistung von Phase 1 in W (+/-)
    activePowerL2: number;        // Wirkleistung von Phase 2 in W (+/-)
    activePowerL3: number;        // Wirkleistung von Phase 3 in W (+/-)
    reactivePowerL1: number;      // Blindleitung von Phase 1 in var (+/-)
    reactivePowerL2: number;      // Blindleitung von Phase 2 in var (+/-)
    reactivePowerL3: number;      // Blindleitung von Phase 3 in var (+/-)
    powerFactorL1: number;        // Leistungsfaktor von Phase 1 (+ IND, - CAP)
    powerFactorL2: number;        // Leistungsfaktor von Phase 2 (+ IND, - CAP)
    powerFactorL3: number;        // Leistungsfaktor von Phase 3 (+ IND, - CAP)
}


export class FroniusMeter extends ModbusSerialDevice implements IFroniusMeterValues {

    public static getInstance (id: string | number): FroniusMeter {
        id = id.toString();
        let rv = ModbusDevice.getInstance(id);
        if (!rv) {
            rv = ModbusDevice.instances.find( (d) => (d instanceof FroniusMeter) && (d.address === +id) );
        }
        return rv instanceof FroniusMeter ? rv : null;
    }

    // *******************************************************************

    private _regs: number [];
    private _lastUpdateAt: Date;
    private _lastDemandAt: Date;
    private _lastRegs43: number;
    private _eventEmitter: EventEmitter;

    public constructor (serial: ModbusSerial, address: number) {
        super(serial, address);
        this._regs = Array(59).fill(-1);
        this._eventEmitter = new EventEmitter();
    }

    public on (event: 'update', listener: (values: IFroniusMeterValues) => void) {
        this._eventEmitter.on(event, listener);
        return this;
    }

    public off (event: 'update', listener: (values: IFroniusMeterValues) => void) {
        this._eventEmitter.removeListener(event, listener);
        return this;
    }


    public handleResponse (requ: ModbusFrame, resp: ModbusFrame) {
        let err: Error;
        if (!requ || !requ.ok || !requ.checkSumOk || requ.address !== this.address) {
            err = new Error('invalid request, cannot handle response');
        } else if (!resp || !resp.ok || !resp.checkSumOk || resp.address !== this.address || (resp.byteAt(2) !== (requ.wordAt(4) * 2))) {
            err = new Error('invalid response');
        }
        switch (resp.funcCode) {
            case 0x03: {
                    const l = resp.buffer.length - 3;
                    if (l !== 118) {
                        err = new Error('invalid response, wrong number of registers');
                    } else {
                        this.setHoldRegisters(resp.buffer, 3, l);
                        debug.finer('%O', this.toValuesObject());
                    }
                    break;
            }
            default: {
                err = new Error('invalid function code, cannot handle response'); break;
            }
        }
        if (err) {
            debug.warn(err);
            throw err;
        }
    }

    public setHoldRegisters (data: Buffer, offset = 0, length?: number, regStartAddress = 4096) {
        debug.fine('setHoldRegisters(): register start Address=%d, buffer: %d bytes, using %d bytes beginning on index %d',
                    regStartAddress, data.length, length, offset);
        this._lastUpdateAt = new Date();
        for (let i = offset; i < (offset + length); i += 2) {
            const regIndex = regStartAddress + (i - offset) / 2 - 4096;
            if (regIndex < 0 || regIndex > this._regs.length) {
                throw new Error('register out of range');
            }
            this._regs[regIndex] = data[i] * 256 + data[i + 1];
        }
        if (this._lastRegs43 === 4 && this._regs[43] === 0) {
            this._lastDemandAt = new Date();
        }
        this._lastRegs43 = this._regs[43];
        if (this._eventEmitter.eventNames().indexOf('update') >= 0) {
            this._eventEmitter.emit('update', this.toValuesObject());
        }
    }

    public get lastUpdateAt (): Date {
        return this._lastUpdateAt;
    }

    public get voltageL1 (): number {
        if (this._regs[0] < 0 || this._regs[1] < 0) {
            return undefined;
        }
        return (this._regs[0] * 65536 + this._regs[1]) / 1000;
    }

    public get voltageL2 (): number {
        if (this._regs[2] < 0 || this._regs[3] < 0) {
            return undefined;
        }
        return (this._regs[2] * 65536 + this._regs[3]) / 1000;
    }

    public get voltageL3 (): number {
        if (this._regs[4] < 0 || this._regs[5] < 0) {
            return undefined;
        }
        return (this._regs[4] * 65536 + this._regs[5]) / 1000;
    }

    public get currentL1 (): number {
        if (this._regs[6] < 0 || this._regs[7] < 0) {
            return undefined;
        }
        return (this._regs[6] * 65536 + this._regs[7]) / 1000;
    }

    public get currentL2 (): number {
        if (this._regs[8] < 0 || this._regs[9] < 0) {
            return undefined;
        }
        return (this._regs[8] * 65536 + this._regs[9]) / 1000;
    }

    public get currentL3 (): number {
        if (this._regs[10] < 0 || this._regs[11] < 0) {
            return undefined;
        }
        return (this._regs[10] * 65536 + this._regs[11]) / 1000;
    }

    // register 12 and 13 ( + 4096) always zero

    public get voltageL12 (): number {
        if (this._regs[14] < 0 || this._regs[15] < 0) {
            return undefined;
        }
        return (this._regs[14] * 65536 + this._regs[15]) / 1000;
    }

    public get voltageL23 (): number {
        if (this._regs[16] < 0 || this._regs[17] < 0) {
            return undefined;
        }
        return (this._regs[16] * 65536 + this._regs[17]) / 1000;
    }

    public get voltageL31 (): number {
        if (this._regs[18] < 0 || this._regs[19] < 0) {
            return undefined;
        }
        return (this._regs[18] * 65536 + this._regs[19]) / 1000;
    }

    public get activePower (): number {
        if (this._regs[20] < 0 || this._regs[21] < 0) {
            return undefined;
        }
        const x = this._regs[20] * 65536 + this._regs[21];
        return  (x > 0x7fffffff ? (x - 0x100000000) : x) / 100;
    }

    public get reactivePower (): number {
        if (this._regs[22] < 0 || this._regs[23] < 0) {
            return undefined;
        }
        const x = this._regs[22] * 65536 + this._regs[23];
        return (x > 0x7fffffff ? (x - 0x100000000) : x) / 100;
    }

    public get apparentPower (): number {
        if (this._regs[24] < 0 || this._regs[25] < 0) {
            return undefined;
        }
        const x = this._regs[24] * 65536 + this._regs[25];
        return x / 100;
    }

    // register 26 and 27 ( + 4096) always zero

    public get activeEnergy (): number {
        if (this._regs[28] < 0 || this._regs[29] < 0) {
            return undefined;
        }
        const x = this._regs[28] * 65536 + this._regs[29];
        return x;
    }

    public get reactiveEnergy (): number {
        if (this._regs[30] < 0 || this._regs[31] < 0) {
            return undefined;
        }
        const x = this._regs[30] * 65536 + this._regs[31];
        return x;
    }

    public get activeFeedEnergy (): number {
        if (this._regs[32] < 0 || this._regs[33] < 0) {
            return undefined;
        }
        const x = this._regs[32] * 65536 + this._regs[33];
        return x;
    }

    public get reactiveFeedEnergy (): number {
        if (this._regs[34] < 0 || this._regs[35] < 0) {
            return undefined;
        }
        const x = this._regs[34] * 65536 + this._regs[35];
        return x;
    }

    public get powerFactor (): number {
        if (this._regs[36] < 0) {
            return undefined;
        }
        const x = this._regs[36];
        return (x > 0x7fff ? (x - 0x10000) : x) / 100;
    }

    public get powerStatus (): 'NoPower' | 'Inductive' | 'Capacitice' | '?' {
        switch (this._regs[37]) {
            case 0:  return 'NoPower';
            case 1:  return 'Inductive';
            case 2:  return 'Capacitice';
            default: return '?';
        }
    }

    public get frequency (): number {
        if (this._regs[38] < 0) {
            return undefined;
        }
        return this._regs[38] / 10;
    }

    public get activePowerDemand (): number {
        if (this._regs[39] < 0 || this._regs[40] < 0) {
            return undefined;
        }
        return (this._regs[39] * 65536 + this._regs[40]) / 100;
    }

    public get activePowerMaxDemand (): number {
        if (this._regs[41] < 0 || this._regs[42] < 0) {
            return undefined;
        }
        return (this._regs[41] * 65536 + this._regs[42]) / 100;
    }

    public get lastDemandAt (): Date {
        return this._lastDemandAt;
    }

    public get demandMinute (): 0 | 1 | 2 | 3 | 4 | undefined {
        switch (this._regs[43]) {
            case 0: return 0;
            case 1: return 1;
            case 2: return 2;
            case 3: return 3;
            case 4: return 4;
            default: return undefined;
        }
    }

    public get activePowerL1 (): number {
        if (this._regs[44] < 0 || this._regs[45] < 0) {
            return undefined;
        }
        const x = this._regs[44] * 65536 + this._regs[45];
        return  (x > 0x7fffffff ? (x - 0x100000000) : x) / 100;
    }

    public get activePowerL2 (): number {
        if (this._regs[46] < 0 || this._regs[47] < 0) {
            return undefined;
        }
        const x = this._regs[46] * 65536 + this._regs[47];
        return  (x > 0x7fffffff ? (x - 0x100000000) : x) / 100;
    }

    public get activePowerL3 (): number {
        if (this._regs[48] < 0 || this._regs[49] < 0) {
            return undefined;
        }
        const x = this._regs[48] * 65536 + this._regs[49];
        return  (x > 0x7fffffff ? (x - 0x100000000) : x) / 100;
    }

    public get reactivePowerL1 (): number {
        if (this._regs[50] < 0 || this._regs[51] < 0) {
            return undefined;
        }
        const x = this._regs[50] * 65536 + this._regs[51];
        return  (x > 0x7fffffff ? (x - 0x100000000) : x) / 100;
    }

    public get reactivePowerL2 (): number {
        if (this._regs[52] < 0 || this._regs[53] < 0) {
            return undefined;
        }
        const x = this._regs[52] * 65536 + this._regs[53];
        return  (x > 0x7fffffff ? (x - 0x100000000) : x) / 100;
    }

    public get reactivePowerL3 (): number {
        if (this._regs[54] < 0 || this._regs[55] < 0) {
            return undefined;
        }
        const x = this._regs[54] * 65536 + this._regs[55];
        return  (x > 0x7fffffff ? (x - 0x100000000) : x) / 100;
    }

    public get powerFactorL1 (): number {
        if (this._regs[56] < 0) {
            return undefined;
        }
        const x = this._regs[56];
        return (x > 0x7fff ? (x - 0x10000) : x) / 100;
    }

    public get powerFactorL2 (): number {
        if (this._regs[57] < 0) {
            return undefined;
        }
        const x = this._regs[57];
        return (x > 0x7fff ? (x - 0x10000) : x) / 100;
    }

    public get powerFactorL3 (): number {
        if (this._regs[58] < 0) {
            return undefined;
        }
        const x = this._regs[58];
        return (x > 0x7fff ? (x - 0x10000) : x) / 100;
    }


    public toValuesObject (): IFroniusMeterValues {
        const rv = {
            lastUpdateAt: this.lastUpdateAt,
            voltageL1: this.voltageL1,
            voltageL2: this.voltageL2,
            voltageL3: this.voltageL3,
            currentL1: this.currentL1,
            currentL2: this.currentL2,
            currentL3: this.currentL3,
            voltageL12: this.voltageL12,
            voltageL23: this.voltageL23,
            voltageL31: this.voltageL31,
            activePower: this.activePower,
            reactivePower: this.reactivePower,
            apparentPower: this.apparentPower,
            activeEnergy: this.activeEnergy,
            reactiveEnergy: this.reactiveEnergy,
            activeFeedEnergy: this.activeFeedEnergy,
            reactiveFeedEnergy: this.reactiveFeedEnergy,
            powerFactor: this.powerFactor,
            powerStatus: this.powerStatus,
            frequency: this.frequency,
            activePowerDemand: this.activePowerDemand,
            activePowerMaxDemand: this.activePowerMaxDemand,
            lastDemandAt: this.lastDemandAt,
            demandMinute: this.demandMinute,
            activePowerL1: this.activePowerL1,
            activePowerL2: this.activePowerL2,
            activePowerL3: this.activePowerL3,
            reactivePowerL1: this.reactivePowerL1,
            reactivePowerL2: this.reactivePowerL2,
            reactivePowerL3: this.reactivePowerL3,
            powerFactorL1: this.powerFactorL1,
            powerFactorL2: this.powerFactorL2,
            powerFactorL3: this.powerFactorL3
        };
        return rv;
    }

}
