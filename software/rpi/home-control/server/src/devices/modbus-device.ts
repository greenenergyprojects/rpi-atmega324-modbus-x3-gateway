
import * as debugsx from 'debug-sx';
const debug: debugsx.IFullLogger = debugsx.createFullLogger('devices:ModbusDevice');

import { sprintf } from 'sprintf-js';
import { EventEmitter } from 'events';
import { ModbusFrame } from '../modbus//modbus-frame';


export abstract class ModbusDevice  {

    public static getInstance (id: string | number): ModbusDevice {
        const rv = this._instances[id.toString()];
        if (rv instanceof ModbusDevice) {
            return rv;
        }
        return null;
    }

    public static addInstance (device: ModbusDevice) {
        const d = this._instances[device.address];
        if (d) {
            throw new Error('Device with id ' + device.id + ' already added');
        }
        this._instances[device.id] = device;
    }


    public static get instances (): ModbusDevice [] {
        const rv: ModbusDevice [] = [];
        for (const i in this._instances) {
            if (!this._instances.hasOwnProperty(i)) { continue; }
            rv.push(this._instances[i]);
        }
        return rv;
    }

    private static _instances: { [ addr: string ]: ModbusDevice } = {};

    // *****************************************************************************

    private _address: number;

    public constructor (address: number) {
        if (address < 0 || address > 255) {
            throw new Error('invalid modbus address');
        }
        this._address = address;
    }

    public abstract get id (): string;

    public get address (): number {
        return this._address;
    }

    public handleResponse (requ: ModbusFrame, resp: ModbusFrame) {
        debug.warn('handleResponse() not implemented');
    }
}


