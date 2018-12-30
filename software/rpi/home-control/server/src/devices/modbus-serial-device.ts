
import { ModbusSerial } from '../modbus/modbus-serial';
import { ModbusDevice } from './modbus-device';

export class ModbusSerialDevice extends ModbusDevice {

    protected _serial: ModbusSerial;

    public constructor (serial: ModbusSerial, address: number) {
        super(address);
        this._serial = serial;
    }

    public get id (): string {
        return this._serial.device + ':' + this.address;
    }
}
