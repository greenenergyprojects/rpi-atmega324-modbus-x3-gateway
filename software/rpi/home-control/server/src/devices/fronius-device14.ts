
import { ModbusDevice } from './modbus-device';
import { ModbusSerialDevice } from './modbus-serial-device';
import { ModbusSerial } from '../modbus/modbus-serial';
import { ModbusFrame } from '../modbus/modbus-frame';
import { sprintf } from 'sprintf-js';
import { EventEmitter } from 'events';

import * as debugsx from 'debug-sx';
import { ModbusRtu } from '../modbus/modbus-rtu';
const debug: debugsx.IFullLogger = debugsx.createFullLogger('devices:FroniusDevice14');


export interface IFroniusDevice14Values {
    regs: number[];
}



export class FroniusDevice14 extends ModbusSerialDevice implements IFroniusDevice14Values {

    public static FIRST_HOLDREG_ADDRESS = 0xafcc;

    public static getInstance (id: string): FroniusDevice14 {
        const rv = ModbusDevice.getInstance(id);
        return rv instanceof FroniusDevice14 ? rv : null;
    }

    // *******************************************************************

    private _regs: number [];
    private _lastUpdateAt: Date;
    private _lastDemandAt: Date;
    private _eventEmitter: EventEmitter;

    private _lastRegs: number [];

    public constructor (serial: ModbusSerial, address: number) {
        super(serial, address);
        this._regs = Array(154).fill(-1);
        this._eventEmitter = new EventEmitter();
    }

    public on (event: 'update', listener: (values: IFroniusDevice14Values) => void) {
        this._eventEmitter.on(event, listener);
        return this;
    }

    public off (event: 'update', listener: (values: IFroniusDevice14Values) => void) {
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
                    if (l !== requ.wordAt(4) * 2) {
                        err = new Error('invalid response, wrong number of registers');
                    } else {
                        debug.finer('response for modbus device 0x14');
                        this.setHoldRegisters(requ.wordAt(2), resp.buffer, 3, l);
                        debug.finest('%O', this.toValuesObject());

                        if (this._lastRegs) {
                            let s = '', cnt = 0;
                            for (let i = 0; i < this._regs.length; i++) {
                                if (this._lastRegs[i] !== -1 && this._regs[i] !== this._lastRegs[i]) {
                                    s += sprintf(' r%03d=%d', i, this._regs[i]); cnt++;
                                }
                            }
                            if (cnt >= 0) {
                                debug.fine(sprintf('%d regs changed: %s r0=%-5d, r153=%-5d', cnt, s, this._regs[0], this._regs[153]));
                            }
                        }
                        this._lastRegs = this._regs.slice();
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

    public get regs (): number [] {
        return this._regs;
    }

    public setHoldRegisters (startAddr: number, data: Buffer, offset = 0, length?: number, regStartAddress = 4096) {
        debug.finer('setHoldRegisters(): register start Address=%d, buffer: %d bytes, using %d bytes beginning on index %d',
                    regStartAddress, data.length, length, offset);
        const firstIndex = startAddr - FroniusDevice14.FIRST_HOLDREG_ADDRESS;
        const lastIndex = startAddr + length / 2 - FroniusDevice14.FIRST_HOLDREG_ADDRESS - 1;
        if (firstIndex < 0 || lastIndex >= this._regs.length) {
            throw new Error('register out of range');
        }
        this._lastUpdateAt = new Date();
        for (let i = firstIndex; i <= lastIndex; i++) {
            this._regs[i] = data[offset] * 256 + data[offset];
            offset += 2;
        }
    }

    public toValuesObject (): IFroniusDevice14Values {
        const rv = {
            regs: this._regs.slice()
        };
        return rv;
    }

}
