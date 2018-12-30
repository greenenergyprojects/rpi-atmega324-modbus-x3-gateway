
interface IModbusRtuConfig {
    device:   string;
    options: SerialPort.OpenOptions;
}

import * as SerialPort from 'serialport';
import { sprintf } from 'sprintf-js';
import { ModbusSerial } from './modbus-serial';
import { ModbusDevice } from '../devices/modbus-device';
import { ModbusRTUFrame } from './modbus-rtu-frame';

import * as debugsx from 'debug-sx';
const debug: debugsx.IFullLogger = debugsx.createFullLogger('modbus:ModbusRTU');


export class ModbusRtu implements ModbusSerial {

    private _config: IModbusRtuConfig;
    private _serialPort: SerialPort;
    private _openPromise: { resolve: () => void, reject: (err: Error) => void};
    private _frame = '';
    private _lastRequest: ModbusRTUFrame;
    private _monitor: ModbusRtuMonitor;

    public constructor (config: IModbusRtuConfig) {
        if (!config || !config.device || !config.options || !config.options.baudRate || typeof config.options !== 'string' ) {
            throw new Error ('invalid/misssing config');
        }
        this._config = { device: config.device, options: Object.assign(config.options) };
        this._config.options.autoOpen = false;
        this._monitor = new ModbusRtuMonitor();
    }

    public get device (): string {
        return this._config.device;
    }

    public get options (): SerialPort.OpenOptions {
        const o = Object.assign(this._config.options);
        delete o.autoOpen;
        return o;
    }

    public async open () {
        if (this._openPromise) {
            return Promise.reject(new Error('open already called, execute close() first.'));
        }
        const rv: Promise<void> = new Promise<void>( (resolve, reject) => {
            this._serialPort = new SerialPort(this._config.device, this._config.options);
            // this._serialPort.on('open', this.handleOnSerialOpen.bind(this));
            this._serialPort.on('error', this.handleOnSerialError.bind(this));
            this._serialPort.on('data', this.handleOnSerialData.bind(this));
            this._openPromise = { resolve: resolve, reject: reject };
            this._serialPort.open( (err) => {
                if (!this._openPromise || !this._openPromise.resolve) { return; }
                if (err) {
                    debug.warn('cannot open serial port ' + this._config.device);
                    this._openPromise.reject(err);
                } else {
                    const o: IModbusRtuConfig = { device: this._config.device, options: this.options };
                    debug.info('serial port ' + this._config.device + ' opened (' + JSON.stringify(o) + ')');
                    this._openPromise.resolve();
                }
                this._openPromise = null;
            });
        });
        return rv;
    }

    public get status (): ModbusRtuStatus {
        return this._monitor;
    }

    public async close () {
        this._monitor.shutdown();
        if (!this._serialPort || !this._serialPort.isOpen) {
            return Promise.reject(new Error('serial port not open'));
        }
        if (this._openPromise && this._openPromise.reject) {
            this._openPromise.reject(new Error('serial port closed while opening pending'));
        }
        this._openPromise = null;
        try {
            await this._serialPort.close();
            debug.info('serial port ' + this._config.device + ' closed');
        } catch (err) {
            debug.warn('cannot close serial port ' + this._config.device, err);
        }
    }

    private handleOnSerialOpen () {
        debug.info('serial port ' + this._config.device + ' opened');
        if (this._openPromise && this._openPromise.resolve) {
            this._openPromise.resolve();
            this._openPromise.resolve = null;
            this._openPromise.reject = null;
        }
    }

    private handleOnSerialError (err: any) {
        debug.warn(err);
    }

    private handleOnSerialData (data: Buffer) {

        if (!(data instanceof Buffer)) {
            debug.warn('serial input not as expected...');
            return;
        }

        try {
            this._monitor.incReceivedByteCnt(data.length);
                //         // console.log('Buffer with ' + data.length + ' Bytes received');
            for (const b of data.values()) {
                if (b === 10) {
                    try {
                        this.handleFrame(this._frame);
                    } catch (err) {
                        this._monitor.incErrorOthersCnt();
                        debug.warn('handleFrame() fails\n%e', err);
                    }
                    this._frame = '';
                } else if (b !== 13) {
                    this._frame = this._frame + String.fromCharCode(b);
                }
            }
        } catch (err) {
            debug.warn(err);
        }
    }

    private frameAsDebugString (frame: string): string {
        if (debug.fine.enabled) {
            return '(' + frame.length + ' bytes)\n' + frame;
        } else {
            return '(' + frame.length + ' bytes): ' + frame.substr(0, 16) + '...';
        }
    }

    private handleFrame (frame: string) {
        if (frame.length < 8) {
            this._monitor.incErrorFrameCnt();
            debug.warn('invalid modbus frame %s', this.frameAsDebugString(frame));
            this._lastRequest = null;
            return;
        }

        const addr = parseInt(frame.substr(0, 2), 16);
        switch (addr) {
            case 0x01: break; // Froniusmeter
            case 0x14: break; // ?
            case 0x28: break;
            case 0x29: break;
            case 0x2a: break;
            case 0x2b: break;
            case 0x2c: break;
            case 0x2d: break;
            case 0x2e: break;
            case 0x2f: break;
            default: {
                this._monitor.incErrorInvAddrCnt();
                debug.warn('invalid address on frame %s', this.frameAsDebugString(frame));
            }
        }

        const funcCode = Number.parseInt(frame.substr(2, 2), 16);

        let modbusFrame: ModbusRTUFrame;
        let signalProblem = false;

        if (funcCode >= 128) {
            if (this._frame.length === 10) {
                modbusFrame = new ModbusRTUFrame(frame);
            } else if (this._frame.length === 12) {
                modbusFrame = new ModbusRTUFrame(frame, 10);
                signalProblem = true;
            } else {
                this._monitor.incErrorFrameCnt();
                debug.warn('bad frame %s', this.frameAsDebugString(frame));
                this._lastRequest = null;
                return;
            }
            if (!modbusFrame.crcOk) {
                this._monitor.incErrorCrcCnt();
                debug.warn('bad frame (CRC error) %s', this.frameAsDebugString(frame));

            } else if (signalProblem) {
                this._monitor.incErrorSignalCnt();
                debug.finer('signal problem and modbus frame %s', this.frameAsDebugString(frame));

            }
            this._monitor.incErrroExceptCnt();
            debug.warn('modbus exception %s from address %d', frame.substr(2, 4), addr, this.frameAsDebugString(frame));
            this._lastRequest = null;
            return;
        }

        let expectedRequestLength;
        switch (funcCode) {
            case 0x03: expectedRequestLength = 16; break;
            default:
                this._monitor.incErrorInvFuncCnt();
                debug.warn('unexpected function code %s from address %d %s', frame.substr(2, 2), addr, this.frameAsDebugString(frame));
                this._lastRequest = null;
                return;
        }

        if (frame.length === expectedRequestLength) {
            if (this._lastRequest) {
                debug.warn('no response for last request from address %d func %s', this._lastRequest.address, this._lastRequest.funcCode);
                this._lastRequest = null;
            }
            modbusFrame = new ModbusRTUFrame(frame);

        } else if (frame.length === (expectedRequestLength + 2)) {
            this._monitor.incErrorSignalCnt();
            debug.finer('signal problem and modbus frame %s', this.frameAsDebugString(frame));
            modbusFrame = new ModbusRTUFrame(frame, expectedRequestLength);

        } else if (this._lastRequest) {
            const length = parseInt(frame.substr(4, 2), 16) * 2 + 10;
            if (length === frame.length) {
                modbusFrame = new ModbusRTUFrame(frame);

            } else if (length === (frame.length + 2)) {
                modbusFrame = new ModbusRTUFrame(frame, length);
                signalProblem = true;

            } else if (addr !== this._lastRequest.address) {
                debug.warn('invalid response to request addr %s func %s %s, wrong address %s',
                    this._lastRequest.address, this._lastRequest.funcCode, this.frameAsDebugString(frame));
                this._lastRequest = null;
                return;

            } else if (funcCode !== this._lastRequest.funcCode) {
                debug.warn('invalid response to request addr %s func %s %s, wrong function code %s',
                this._lastRequest.address, this._lastRequest.funcCode, this.frameAsDebugString(frame));
                this._lastRequest = null;
                return;

            } else {
                this._monitor.incErrorFrameCnt();
                debug.warn('invalid response to request addr %s func %s %s, wrong length %s',
                    this._lastRequest.address, this._lastRequest.funcCode, this.frameAsDebugString(frame));
                this._lastRequest = null;
                return;
            }
        }

        if (!modbusFrame.crcOk) {
            this._monitor.incErrorCrcCnt();
            debug.warn('invalid response to request addr %s func %s, CRC error %s',
                    this._lastRequest.address, this._lastRequest.funcCode, this.frameAsDebugString(frame));
            this._lastRequest = null;
            return;

        } else if (signalProblem) {
            this._monitor.incErrorSignalCnt();
            debug.finer('signal problem and modbus frame %s', this.frameAsDebugString(frame));
        }

        // frame ok and parsed into modbusFrame
        // now handle content of frame

        if (!this._lastRequest) {
            // handle request on last request
            this._monitor.incRequestCnt();
            this._lastRequest = modbusFrame;
            return;
        }

        const md = ModbusDevice.getInstance(this._config.device + ':' + modbusFrame.address);
        if (!md) {
            this._monitor.incErrorOthersCnt();
            debug.warn('Response from unknown ModbusDevice %s %s', addr, this.frameAsDebugString(frame));
        } else {
            this._monitor.incResponseCnt();
            try {
                md.handleResponse(this._lastRequest, modbusFrame);
            } catch (err) {
                debug.warn('handleResponse() fails\n%e', err);
            }
        }
        this._lastRequest = null;
    }

}

export class ModbusRtuStatus {

    protected _receivedByteCnt: number;
    protected _requestCnt:      number;
    protected _responseCnt:     number;
    protected _errorOthersCnt:  number;  // all errors not covered by the following errors
    protected _errorFrameCnt:   number;  // invalid modbus frame, not covered by following errors (too short, ...)
    protected _errorSignalCnt:  number;  // weak RS485 signal, additional '00' after frame end (does not cause CRC error)
    protected _errorInvAddrCnt: number;  // frame received with unexpected address
    protected _errorInvFuncCnt: number;  // frame received with unexpected address
    protected _errorNoRequCnt:  number;  // response without request
    protected _errorCrcCnt:     number;  // modbus frame CRC error
    protected _errorExceptCnt:  number;  // modbus frame with exception response

    constructor () {
        this._receivedByteCnt = 0;
        this._requestCnt      = 0;
        this._responseCnt     = 0;
        this._errorSignalCnt  = 0;
        this._errorOthersCnt  = 0;
        this._errorFrameCnt   = 0;
        this._errorInvAddrCnt = 0;
        this._errorInvFuncCnt = 0;
        this._errorNoRequCnt  = 0;
        this._errorCrcCnt     = 0;
        this._errorExceptCnt  = 0;
    }

    public get errorCount (): number {
        let rv = 0;
        for (const a in this) {
            if (!this.hasOwnProperty(a)) { continue; }
            if (a.startsWith('_error')) {
                const n = +this[a];
                rv = rv + (n >= 0 ? n : 1);
            }
        }
        return rv;
    }

    public get receivedByteCnt (): number {
        return this._receivedByteCnt;
    }

    public get requestCnt (): number {
        return this._requestCnt;
    }

    public get responseCnt (): number {
        return this._responseCnt;
    }

    public get errorOthersCnt (): number {
        return this._errorOthersCnt;
    }

    public get errorFrameCnt (): number {
        return this._errorFrameCnt;
    }

    public get errorSignalCnt (): number {
        return this._errorSignalCnt;
    }

    public get errorInvAddrCnt (): number {
        return this._errorInvAddrCnt;
    }

    public get errorInvFuncCnt (): number {
        return this._errorInvFuncCnt;
    }

    public get errorNoRequCnt (): number {
        return this._errorNoRequCnt;
    }

    public get errorCrcCnt (): number {
        return this._errorCrcCnt;
    }

    public get errorExceptCnt (): number {
        return this._errorExceptCnt;
    }
}


export class ModbusRtuMonitor  extends ModbusRtuStatus {

    private _timer: NodeJS.Timer;

    constructor () {
        super();
        this._timer = setInterval( () => this.handleTimer(), 5000);
    }

    public shutdown () {
        if (this._timer) {
            clearInterval(this._timer);
            this._timer = null;
        }
    }

    public incReceivedByteCnt (n: number) {
        this._receivedByteCnt += n;
    }

    public incRequestCnt () {
        this._requestCnt++;
    }

    public incResponseCnt () {
        this._responseCnt++;
    }


    public incErrorOthersCnt () {
        this._errorOthersCnt++;
    }

    public incErrorFrameCnt () {
        this._errorFrameCnt++;
    }

    public incErrorSignalCnt () {
        this._errorSignalCnt++;
    }

    public incErrorInvAddrCnt () {
        this._errorInvAddrCnt++;
    }

    public incErrorInvFuncCnt () {
        this._errorInvFuncCnt++;
    }

    public incErrorNoRequCnt () {
        this._errorNoRequCnt++;
    }

    public incErrorCrcCnt () {
        this._errorCrcCnt++;
    }

    public incErrroExceptCnt () {
        this._errorExceptCnt++;
    }


    private handleTimer () {
        let s = sprintf('monitor: errors=%d, requests=%d, responses=%d, bytes=%d',
                    this.errorCount, this.requestCnt, this.responseCnt, this.receivedByteCnt);
        if (debug.finer.enabled) {
            s = s + sprintf('\n');
            for (const a in this) {
                if (!this.hasOwnProperty(a)) { continue; }
                if (a.startsWith('error')) {
                    s = s + '  ' + a + '=' + this[a];
                }
            }
            debug.fine(s);
        } else {
            debug.fine(s);
        }
    }

}
