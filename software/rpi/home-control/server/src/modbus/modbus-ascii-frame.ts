
import * as debugsx from 'debug-sx';
const debug: debugsx.ISimpleLogger = debugsx.createSimpleLogger('modbus:ModbusAsciiFrame');

import { sprintf } from 'sprintf-js';
import { ModbusFrame } from './modbus-frame';


export class ModbusAsciiFrame implements ModbusFrame {

    private _createdAt: Date;
    private _frame?: string;
    private _buffer?: Buffer;
    private _lrcOk: boolean;
    private _error: Error;

    public constructor (x?: Buffer | string ) {
        this._createdAt = new Date();
        try {
            if (x && x instanceof Buffer && x.length >= 2) {
                this._buffer = x;
                let lrc = 0;
                let s = ':';
                for (let i = 0; i < x.length; i++) {
                    /* tslint:disable-next-line:no-bitwise */
                    lrc = (lrc + x[i]) & 0xff;
                    s = s + sprintf('%02X', x[i]);
                }
                this._frame = s + sprintf('%02X\r\n', ((255 - lrc) + 1) % 256);
                this._lrcOk = true;

            } else if (x && typeof(x) === 'string' && x.length >= 9 && x.match(/^:([0-9A-F][0-9A-F])+\x0d\x0a$/)) {
                this._frame = x;
                this._buffer = Buffer.alloc((x.length - 5) / 2);
                let lrc = 0;
                for (let i = 1, j = 0; i < x.length - 4; i += 2, j++) {
                    const b = parseInt(x.substr(i, 2), 16);
                    /* tslint:disable-next-line:no-bitwise */
                    lrc = (lrc + b) & 0xff;
                    this._buffer[j] = b;
                }
                const fLrc = parseInt(x.substr(x.length - 4, 2), 16);
                this._lrcOk = fLrc === (((255 - lrc) + 1) % 256);
            } else {
                throw new Error('cannot create frame from ' + x.toString());
            }
        } catch (err) {
            this._error = err;
        }
    }

    public get createdAt (): Date {
        return this._createdAt;
    }

    public get frame (): string {
        return this._frame;
    }

    public get buffer(): Buffer {
        return this._buffer;
    }

    public get checkSumOk (): boolean {
        return this.lrcOk;
    }

    public get ok (): boolean {
        return this._error === undefined;
    }

    public get lrcOk (): boolean {
        return this._lrcOk;
    }

    public get address (): number {
        return this._buffer[0];
    }

    public get funcCode (): number {
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

    public wordAt (index: number): number {
        return this._buffer[index] * 256 + this._buffer[index + 1];
    }

}
