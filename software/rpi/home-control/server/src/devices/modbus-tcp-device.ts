import { ModbusTcp } from '../modbus/modbus-tcp';
import { ModbusDevice } from './modbus-device';

export class ModbusTcpDevice extends ModbusDevice {

    protected _gateway: ModbusTcp;

    public constructor (gateway: ModbusTcp, unitId: number) {
        super(unitId);
        this._gateway = gateway;
    }

    public get id (): string {
        return this._gateway.host + ':' + this._gateway.port + (this.address >= 0 ? ':' + this.address : '');
    }
}
