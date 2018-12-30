
import * as debugsx from 'debug-sx';
const debug: debugsx.ISimpleLogger = debugsx.createSimpleLogger('modbus:ModbusFrame');

import { sprintf } from 'sprintf-js';
import { ModbusCrc } from './modbus-crc';
import { ModbusFrame } from './modbus-frame';

export class ModbusRTUFrame implements ModbusFrame {

    private _createdAt: Date;
    private _frame?: string;
    private _buffer: Buffer;
    private _frameErrorCount: number;
    private _crcOk: boolean;
    private _error: Error;

    public constructor (frame?: string, length?: number) {
        this._createdAt = new Date();
        this._frame = frame;
        if (typeof(frame) !== 'string') {
            this._error = new Error('invalid frame type');

        } else if (frame.length < 8) {
            this._error = new Error('frame to short');

        } else {
            this._frameErrorCount = 0;
            try {
                this.initFromHexString(frame, length >= 0 ? length : frame.length);
                const crc = new ModbusCrc();
                crc.update(this._buffer, 0, this._buffer.length - 2);
                this._crcOk = crc.crc === (this._buffer[this._buffer.length - 2] * 256 + this._buffer[this._buffer.length - 1]);
            } catch (err) {
                if (err instanceof Error) {
                    this._error = err;
                } else {
                    this._error = new Error(err);
                }
            }
        }

    }

    public get createdAt (): Date {
        return this._createdAt;
    }

    public get frame (): string {
        return this._frame;
    }

    public get buffer (): Buffer {
        return this._buffer;
    }

    public get ok (): boolean {
        return this._error === undefined;
    }

    public get error (): Error {
        return this._error;
    }

    public get checkSumOk (): boolean {
        return this.crcOk;
    }

    public get crcOk (): boolean {
        return this._crcOk;
    }

    public get address (): number {
        if (this._error) {
            throw new Error('cannot get address from invalid frame');
        }
        return this._buffer[0];
    }

    public get funcCode (): number {
        if (this._error) {
            throw new Error('cannot get function code from invalid frame');
        }
        return this._buffer[1];
    }

    public get excCode (): number {
        if (this.funcCode < 128) {
            return Number.NaN;
        } else {
            return this._buffer[2];
        }
    }

    public byteAt (index: number): number {
        return this._buffer[index];
    }

    public wordAt (byteIndex: number): number {
        return this._buffer[byteIndex] * 256 + this._buffer[byteIndex + 1];
    }

    private hexToByte (s: string, offset: number): number {
        const x = s.substr(offset, 2);
        return parseInt(x, 16);
    }

    private initFromHexString (frame: string, length?: number) {
        const b = Buffer.alloc(256);
        length = length >= 0 ? length : frame.length;
        let offset = 0;
        for (let i = 0; i <= length; i += 2) {
            try {
                b[offset++] = this.hexToByte(frame, i);
            } catch (err) {
                this._frameErrorCount++;
            }
        }
        this._buffer = Buffer.alloc(offset - 1, b);
        // debug.info(this._frame);
        // console.log('Errors: ' + this._frameErrorCount);
        // console.log('Frame: ' + this._frame);
        // console.log(this._buffer);

    }

}
