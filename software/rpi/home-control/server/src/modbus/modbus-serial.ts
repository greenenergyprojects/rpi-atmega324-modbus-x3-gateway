
import * as SerialPort from 'serialport';

export abstract class ModbusSerial {

    public abstract get device (): string;
    public abstract get options (): SerialPort.OpenOptions;

}
