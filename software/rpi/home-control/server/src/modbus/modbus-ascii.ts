import * as fs from 'fs';

import * as debugsx from 'debug-sx';
const debug: debugsx.IFullLogger = debugsx.createFullLogger('modbus:ModbusAscii');

import * as SerialPort from 'serialport';
import { sprintf } from 'sprintf-js';
import { ModbusSerial } from './modbus-serial';
import { ModbusDevice } from '../devices/modbus-device';
import { ModbusAsciiFrame } from './modbus-ascii-frame';

interface IModbusAsciiConfig {
    device:   string;
    options: SerialPort.OpenOptions;
}

export class ModbusAscii implements ModbusSerial {

    private _config: IModbusAsciiConfig;
    private _serialPort: SerialPort;
    private _openPromise: { resolve: () => void, reject: (err: Error) => void};
    private _frame = '';
    private _lastRequest: ModbusAsciiFrame;
    private _monitor: ModbusAsciiMonitor;

    public constructor (config: IModbusAsciiConfig) {
        if (!config || !config.device || !config.options || !config.options.baudRate || typeof config.device !== 'string' ) {
            throw new Error ('invalid/misssing config');
        }
        this._config = { device: config.device, options: Object.assign(config.options) };
        this._config.options.autoOpen = false;
        this._monitor = new ModbusAsciiMonitor();
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
            this._serialPort.on('error', this.handleOnSerialError.bind(this));
            this._serialPort.on('data', this.handleOnSerialData.bind(this));
            this._openPromise = { resolve: resolve, reject: reject };
            this._serialPort.open( (err) => {
                if (!this._openPromise || !this._openPromise.resolve) { return; }
                if (err) {
                    debug.warn('cannot open serial port ' + this._config.device);
                    this._openPromise.reject(err);
                } else {
                    const o: IModbusAsciiConfig = { device: this._config.device, options: this.options };
                    debug.info('serial port ' + this._config.device + ' opened (' + JSON.stringify(o) + ')');
                    this._openPromise.resolve();
                }
                this._openPromise = null;
            });
        });
        return rv;
    }

    public get status (): ModbusAsciiStatus {
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
        for (const b of data) {
            const c = String.fromCharCode(b);
            if (c === ':') {
                if (this._frame) {
                    debug.warn('unexpected start of frame, ignore recent bytes (%s)', this.frameAsPrintableString(this._frame));
                }
                this._frame = ':';
            } else if (c !== '\n') {
                this._frame += c;
            } else {
                this._frame += c;
                try {
                    const f = new ModbusAsciiFrame(this._frame);
                    if (f.lrcOk) {
                        if (debug.finer.enabled) {
                            debug.finer('Valid modbus frame received: %s', this.frameAsDebugString(f.frame));
                        }
                    } else {
                        if (debug.fine.enabled) {
                            debug.fine('Modbus frame with LRC error received: %s', this.frameAsDebugString(f.frame));
                        }
                    }
                    this.handleFrame(f);
                } catch (err) {
                    debug.warn('invalid modbus frame received: %s\n%e', this.frameAsPrintableString(this._frame), err);
                }
                this._frame = null;
            }
        }
    }

    private frameAsDebugString (frame: string): string {
        if (debug.fine.enabled) {
            return '(' + frame.length + ' bytes)\n' + frame;
        } else {
            return '(' + frame.length + ' bytes): ' + frame.substr(0, 16) + '...';
        }
    }

    private frameAsPrintableString (f: string): string {
        f = f || '';
        let rv = f.length + ' bytes (';
        for (let i = 0; i < f.length; i++) {
            const c = f.charCodeAt(i);
            if (c >= 32 && c < 127) {
                rv += String.fromCharCode(c);
            } else if (c === 13) {
                rv += ' <CR>';
            } else if (c === 10) {
                rv += ' <LF>';
            } else {
                rv += ' <' + c + '>';
            }
        }
        return rv + ')';
    }

    private handleFrame (f: ModbusAsciiFrame) {
        switch (f.address) {
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
                debug.warn('invalid address on frame %s', this.frameAsDebugString(f.frame));
            }
        }

        let signalProblem = false;

        if (f.funcCode >= 128) {
            if (f.frame.length === 13) {
                f = new ModbusAsciiFrame(f.frame.substr(0, 11));
                this._monitor.incErrorSignalCnt();
                signalProblem = true;
            } else {
                this._monitor.incErrorFrameCnt();
                debug.warn('bad frame %s', this.frameAsDebugString(f.frame));
                this._lastRequest = null;
                return;
            }
            if (!f.lrcOk) {
                this._monitor.incErrorLrcCnt();
                debug.warn('bad frame (LRC error) %s', this.frameAsDebugString(f.frame));

            } else if (signalProblem) {
                this._monitor.incErrorSignalCnt();
                debug.finer('signal problem and modbus frame %s', this.frameAsDebugString(f.frame));

            }
            this._monitor.incErrroExceptCnt();
            debug.warn('modbus exception %s from address %d', f.excCode, f.address, this.frameAsDebugString(f.frame));
            this._lastRequest = null;
            return;
        }

        let expectedRequestLength;
        switch (f.funcCode) {
            case 0x03: expectedRequestLength = 16; break;
            default:
                this._monitor.incErrorInvFuncCnt();
                debug.warn('unexpected function code %s from address %d %s', f.funcCode, f.address, this.frameAsDebugString(f.frame));
                this._lastRequest = null;
                return;
        }

        if (f.frame.length === expectedRequestLength) {
            if (this._lastRequest) {
                debug.warn('no response for last request from address %d func %s', this._lastRequest.address, this._lastRequest.funcCode);
                this._lastRequest = null;
            }

        } else if (f.frame.length === (expectedRequestLength + 2)) {
            this._monitor.incErrorSignalCnt();
            debug.finer('signal problem and modbus frame %s', this.frameAsDebugString(f.frame));
            f = new ModbusAsciiFrame(f.frame.substr(0, expectedRequestLength));

        } else if (this._lastRequest) {
            // debugger;
            const length = f.byteAt(2);
            if (length === (f.buffer.length - 3)) {
                // OK

            } else if (length === (f.buffer.length - 1)) {
                f = new ModbusAsciiFrame(f.frame.substr(0, f.frame.length - 2));
                signalProblem = true;

            } else if (f.address !== this._lastRequest.address) {
                debug.warn('invalid response to request addr %s func %s %s, wrong address %s',
                    this._lastRequest.address, this._lastRequest.funcCode, this.frameAsDebugString(f.frame));
                this._lastRequest = null;
                return;

            } else if (f.funcCode !== this._lastRequest.funcCode) {
                debug.warn('invalid response to request addr %s func %s %s, wrong function code %s',
                this._lastRequest.address, this._lastRequest.funcCode, this.frameAsDebugString(f.frame));
                this._lastRequest = null;
                return;

            } else {
                this._monitor.incErrorFrameCnt();
                debug.warn('invalid response to request addr %s func %s %s, wrong length %s',
                    this._lastRequest.address, this._lastRequest.funcCode, this.frameAsDebugString(f.frame));
                this._lastRequest = null;
                return;
            }
        }

        if (!f.lrcOk) {
            this._monitor.incErrorLrcCnt();
            debug.warn('invalid response to request addr %s func %s, LRC error %s',
                        this._lastRequest.address, this._lastRequest.funcCode, this.frameAsDebugString(f.frame));
            this._lastRequest = null;
            return;

        } else if (signalProblem) {
            this._monitor.incErrorSignalCnt();
            debug.finer('signal problem and modbus frame %s', this.frameAsDebugString(f.frame));
        }

        // frame ok and parsed into modbusFrame
        // now handle content of frame

        if (!this._lastRequest) {
            // handle request on last request
            this._monitor.incRequestCnt();
            this._lastRequest = f;
            return;
        }

        const md = ModbusDevice.getInstance(this._config.device + ':' + f.address);
        if (!md) {
            this._monitor.incErrorOthersCnt();
            debug.warn('Response from unknown ModbusDevice %s %s', f.address, this.frameAsDebugString(f.frame));
        } else {
            this._monitor.incResponseCnt();
            try {
                md.handleResponse(this._lastRequest, f);
            } catch (err) {
                debug.warn('handleResponse() fails\n%e', err);
            }
        }
        this._lastRequest = null;
    }

}

export class ModbusAsciiStatus {

    protected _receivedByteCnt: number;
    protected _requestCnt:      number;
    protected _responseCnt:     number;
    protected _errorOthersCnt:  number;  // all errors not covered by the following errors
    protected _errorFrameCnt:   number;  // invalid modbus frame, not covered by following errors (too short, ...)
    protected _errorSignalCnt:  number;  // weak RS485 signal, additional '00' after frame end (does not cause CRC error)
    protected _errorInvAddrCnt: number;  // frame received with unexpected address
    protected _errorInvFuncCnt: number;  // frame received with unexpected address
    protected _errorNoRequCnt:  number;  // response without request
    protected _errorLrcCnt:     number;  // modbus frame CRC error
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
        this._errorLrcCnt     = 0;
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
        return this._errorLrcCnt;
    }

    public get errorExceptCnt (): number {
        return this._errorExceptCnt;
    }
}


export class ModbusAsciiMonitor  extends ModbusAsciiStatus {

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

    public incErrorLrcCnt () {
        this._errorLrcCnt++;
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
