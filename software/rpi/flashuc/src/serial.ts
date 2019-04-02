
import * as debugsx from 'debug-sx';
const debug: debugsx.IFullLogger = debugsx.createFullLogger('serial');

import { sprintf } from 'sprintf-js';
import * as SerialPort from 'serialport';
import { Device } from './devices/device';
import { timingSafeEqual } from 'crypto';
import { Gpio } from './gpio';
import { EventEmitter } from 'events';

export interface ISerialConfig {
    device: string;
    options: SerialPort.OpenOptions;
    timeoutMillis?: number;
    targets: ITarget [];
}

export interface ITarget {
    index: number;
    name: string;
    disabled: boolean;
    program: { path: string; cpu: 'atmega324p'; };
    reset?: { typ: 'rpi-gpio', pin: string, level: 'low' | 'high', timeMillis: number };
}

export interface ITargetId {
    target: ITarget;
    id?: string;
}

export class Serial {

    public static get instance (): Serial {
        if (!this._instance) {
            throw new Error('no instance created yet');
        }
        return this._instance;
    }

    public static async createInstance (config: ISerialConfig): Promise<Serial> {
        if (this._instance) {
            throw new Error('instance already created');
        }
        const instance = new Serial(config);
        await instance.init();
        this._instance = instance;
        return this._instance;
    }

    private static _instance: Serial;

    // ************************************************************************

    private _config: ISerialConfig;
    private _port: SerialPort;
    private _eventEmitter: EventEmitter;
    private _responseState: 'none' | 'id' | 'cmd' | 'resp' = 'none';
    private _strBuffer = '';
    private _history: HistoryRecord [] = [];
    private _waiting: SendRequest [] = [];
    private _pending: SendRequest | ResetRequest;
    private _timer: NodeJS.Timer;

    private constructor (config: ISerialConfig) {
        this._config = Object.assign({}, config);
        this._eventEmitter = new EventEmitter();
        if (!Array.isArray(config.targets)) {
            this._config.targets = [];
        }
        if (config.timeoutMillis === undefined) {
            this._config.timeoutMillis = 10000;
        }
        this._config.timeoutMillis = 0;
    }

    public on (event: 'id', listener: (...args: any[]) => void): EventEmitter {
        return this._eventEmitter.on(event, listener);
    }

    public once (event: 'id', listener: (...args: any[]) => void): EventEmitter {
        return this._eventEmitter.once(event, listener);
    }

    public removeListener (event: 'id', listener: (...args: any[]) => void): EventEmitter {
        return this._eventEmitter.removeListener(event, listener);
    }

    public async close () {
        return new Promise<void>( (res, rej) => {
            if (this._port) {
                this._port.close( (err) => {
                    if (err) {
                        rej(err);
                    } else {
                        debug.info('serial port closed');
                        res();
                    }
                });
                this._port = null;
            }
        });
    }

    public async resetAll (timeoutMillis = 500): Promise<ITargetId []> {
        const rv: ITargetId [] = [];
        for (const t of this._config.targets) {
            rv.push(await this.reset(t.name));
        }
        return rv;
    }

    public async reset (target?: number | string, timeoutMillis = 500): Promise<ITargetId> {
        const t = this.getTarget(target);
        if (!t) { throw new Error('invalid target ' + target); }
        if (!t.reset) {
            return { target: t };
        }
        if (t.reset.typ !== 'rpi-gpio') { throw new Error('invalid reset type in config for ' + t.name); }
        if (t.reset.timeMillis < 1) { throw new Error('invalid timeMillis in reset config for ' + t.name); }
        if (t.reset.level !== 'low' && t.reset.level !== 'high') {
            throw new Error('invalid reset level in config for ' + t.name);
        }
        this.clear(new Error('reset request'));
        const expired = timeoutMillis > 0 ? Date.now() + timeoutMillis : 0;
        this._pending = {
            type: 'ResetRequest',
            at: new Date(),
            promise: null,
            timeout: 0
        };
        await Gpio.setup(t.reset.pin, 'OUT');
        const value = t.reset.level === 'high' ? true : false;
        await Gpio.setPin(t.reset.pin, !value, t.reset.timeMillis);

        const waitForTargetId = this.waitForNextTargetId(timeoutMillis);
        await Gpio.setPin(t.reset.pin, value, t.reset.timeMillis);
        await Gpio.setPin(t.reset.pin, !value, t.reset.timeMillis);

        try {
            const id = await waitForTargetId;
            return { target: t, id: id };
        } catch (err) {
            throw err;
        } finally {
            this._pending = null;
            process.nextTick( () => this.sendNextRequest() );
        }
    }

    public async waitForNextTargetId (timeoutMillis = 500): Promise<string> {
        return new Promise<string>( (res, rej) => {
            const h = (id: string) => {
                res(id);
            };
            this.once('id', h);
            setTimeout( () => {
                this.removeListener('id', h);
                rej(new Error('Timeout'));
            }, timeoutMillis);
        });
    }

    public async flash (target: ITarget, address: number, buffer?: Buffer): Promise<{ address: number, buffer: Buffer, error?: Error}> {
        if (address < 0 || address > 0xffffff) {
            throw new SerialFlashError('address out of range' + address, address, buffer);
        }

        // if (address !== 0x80 && address !== 0x180) {
        //     return Promise.resolve({ address, buffer });
        // } else {
        //     return Promise.reject(new SerialFlashError('Problem addr ' + address, address, buffer));
        // }
        const b = Buffer.alloc(4);
        /* tslint:disable:no-bitwise */
        b[0] = (address >> 24) & 0xff;
        b[1] = (address >> 16) & 0xff;
        b[2] = (address >> 8) & 0xff;
        b[3] = address & 0xff;
        /* tslint:enable:no-bitwise */
        if (buffer && buffer.length > 0) {
            if ((buffer.length + 4) % 3 === 0) {
                buffer = Buffer.concat([b, buffer]);
            } else {
                buffer = Buffer.concat([b, buffer, Buffer.alloc(3 - (buffer.length + 4) % 3, 0xff)]);
            }
        } else {
            buffer = b;
        }
        const slave_channel = target.index;
        const cmd = '@' + slave_channel + 'w' + buffer.toString('base64');
        // let cmd = '@' + slave_channel + 'w';
        // for (let i = 0; i < buffer.length; i++) {
        //     cmd = cmd + (i % 10);
        // }
        // debug.info('%s', cmd);
        // if (address !== 0x80) {
        //     return Promise.resolve({address: address, buffer: buffer });
        // }
        try {
            await this.send(sprintf('write page addr 0x%04x', address), cmd);
            return { address: address, buffer: buffer };
        } catch (err) {
            throw new SerialFlashError('sending ' + cmd.substr(0, 3) + ' command to bootloader fails', address, buffer, err);
        }

    }

    private async init () {
        return new Promise<void>( (res, rej) => {
            this._port = new SerialPort(this._config.device, this._config.options, (err) => {
                if (err) {
                    rej(err);
                } else {
                    this._port.on('data', (b) => this.handleData(b));
                    res();
                }
            });
        });
    }

    private clear (cause: Error) {
        if (this._waiting.length > 0) {
            for (const w of this._waiting) {
                w.promise.rej(new SerialClearError('request aborted', cause));
            }
            this._waiting = [];
        }
        if (this._pending) {
            if (this._timer) {
                clearTimeout(this._timer);
                this._timer = null;
            }
            this._pending.promise.rej(new SerialClearError('request aborted', cause));
            this._pending = null;
        }
    }


    private getTarget (target: number | string): ITarget {
        if (target === undefined || target === null) {
            return null;

        } else if (typeof target === 'string') {
            const rv = this._config.targets.find( (t) => t.name === target );
            return rv;

        } else if (typeof target === 'number') {
            const rv = this._config.targets.find( (t) => t.index === target );
            return rv;

        } else {
            throw new Error('invalid target');
        }

    }


    private async send (name: string, cmd: string, timeoutMillis?: number): Promise<string> {
        if (!this._port || !this._port.isOpen) { return Promise.reject(new Error('serial port not open')); }
        timeoutMillis = timeoutMillis || this._config.timeoutMillis;
        return new Promise<string>( (res, rej) => {
            const now = new Date();
            const expired = timeoutMillis > 0 ? now.getTime() + timeoutMillis : 0;
            const request: SendRequest = {
                type: 'SendRequest',
                at: now,
                timeout: expired,
                promise: { res: res, rej: rej },
                name: name,
                cmd: cmd,
                state: 'waitingForSend'
            };
            this._waiting.push(request);
            if (!this._pending) {
                this.sendNextRequest();
            }
        });
    }


    private handleData (buf: Buffer) {
        if (debug.finest.enabled) {
            debug.finest('serial receive %s bytes: %h', buf.length, buf);
        }
        debug.info('serial receive %s bytes: %h', buf.length, buf);
        for (const b of buf.values()) {
            const c = b >= 32 && b < 127 ? String.fromCharCode(b) : undefined;
            if (c === undefined || c === '#' || c === '@' || c === '$') {
                this.handleReceivedString(this._strBuffer);
                this._strBuffer = '';
            }
            if (b >= 32 && b < 127) {
                this._strBuffer += c;
            } else if (b !== 10 && b !== 13 && b !== 0) {
                this._strBuffer += '<' + b.toString(16) + '>';
            }
        }
    }

    private handleReceivedString (s: string) {
        if (s.length === 0) { return; }

        this._history.push({ at: new Date(), str: s });
        switch (s.charAt(0)) {
            case '#': this.updateId(s); return;
            case '@': this.handleReceivedCmd(s); return;
            case '$': this.handleReceivedResponse(s); return;
        }



    }


    private updateId (id: string) {
        if (!this._pending || this._pending.type !== 'ResetRequest') {
            debug.warn('unexpected target reset (id received)?\n%s', id);
            return;
        }
        this._eventEmitter.emit('id', id);
    }


    private handleReceivedCmd (cmd: string) {
        if (!this._pending || this._pending.type !== 'SendRequest') {
            debug.warn('receiving command, but no command pending...??\n%s', cmd);
            return;
        }
        const requ: SendRequest = <SendRequest>this._pending;
        if (requ.state !== 'waitingForCommand') {
            const err = new Error('receiving command, but expecting something different (state ' + requ.state +
                                    ')\nreceived: ' + cmd);
            debug.warn(err);
            this.finalizePendingSendRequest(err);
        } else if (requ.cmd !== cmd) {
            const err = new Error('receiving wrong command\n  sent: ' + requ.cmd + '\n  expect: ' + cmd);
            debug.warn(err);
            this.finalizePendingSendRequest(err);
        } else {
            debug.finer('command of pending request received, waiting for response...');
            requ.state = 'waitingForResponse';
        }
    }

    private handleReceivedResponse (response: string) {
        if (!this._pending || this._pending.type !== 'SendRequest') {
            debug.warn('receiving response, but no command pending...??\n%s', response);
            return;
        }
        const requ: SendRequest = <SendRequest>this._pending;
        if (requ.state !== 'waitingForResponse') {
            const err = new Error('receiving response, but expecting something different (state ' + requ.state +
                                    ')\nreceived: ' + response);
            debug.warn(err);
            this.finalizePendingSendRequest(err);
        } else {
            debug.finer('response for pending request received');
            requ.response = response;
            this.finalizePendingSendRequest();
        }

    }

    private finalizePendingSendRequest (err?: Error) {
        if (!this._pending || this._pending.type !== 'SendRequest') {
            if (err) {
                debug.warn('cannot finalize pending request for error %e', err);
            } else {
                debug.warn('cannot finalize pending request');
            }
            return;
        }
        const requ: SendRequest = <SendRequest>this._pending;
        this._pending = null;
        if (requ.state === 'done') {
            if (err) {
                debug.warn('pending request already done, cannot finalize with error\n%o\n%e', requ, err);
            } else {
                debug.warn('pending request already done, cannot finalize\n%o', requ);
            }
            return;
        }
        if (this._timer) {
            clearTimeout(this._timer);
            this._timer = null;
        }
        if (!err && requ.response) {
            try {
                requ.responseBuffer = Buffer.from(requ.response.substr(1), 'base64');
                if (requ.responseBuffer.length < 1 || requ.responseBuffer[0] !== 0)  {
                    err = new Error(sprintf('command fails on target, response status 0x%02x', requ.responseBuffer[0]) );
                }
            } catch (err) {
                err = new Error('invalid response, conversion from base64 fails');
            }
        }
        requ.state = 'done';
        if (err) {
            requ.error = err;
            debug.warn('request <%s> complete with error\n%o\n%e', requ.name, requ, requ.error);
            requ.promise.rej(err);
        } else if (!requ.response) {
            requ.error = new Error('missing response');
            debug.warn('request <%s> complete with error\n%o\n%e', requ.name, requ, requ.error);
            requ.promise.rej(err);
        } else {
            if (debug.finer.enabled) {
                debug.fine('request <%s> complete without error\n%o', requ.name, requ);
            } else if (debug.fine.enabled) {
                debug.fine('request <%s> complete without error', requ.name);
            }
            requ.promise.res(requ.response);
        }
        this.sendNextRequest();
    }

    private sendNextRequest () {
        if (this._pending || this._waiting.length === 0) {
            return;
        }
        const requ = this._waiting.splice(0, 1)[0];
        if (!this._port || !this._port.isOpen) {
            requ.error = new Error('serial port not open');
            requ.promise.rej(requ.error);
            this.sendNextRequest();
            return;
        }
        const toMillis = requ.timeout > 0 ? requ.timeout - Date.now() : 0;
        if (requ.timeout > 0 && toMillis <= 0) {
            requ.error = new Error('Timeout');
            requ.promise.rej(requ.error);
            this.sendNextRequest();
            return;
        }

        debug.finer('serial write with \\n on end:\n%s', requ.cmd);
        debug.info('serial write with \\n on end:\n%s', requ.cmd);
        this._port.write(requ.cmd + '\n', (err) => {
            if (err) {
                requ.error = err;
                if (this._timer) {
                    clearTimeout(this._timer);
                    this._timer = null;
                }
                requ.promise.rej(requ.error);
                if (this._pending === requ) {
                    this._pending = null;
                    this.sendNextRequest();
                }
            } else {
                requ.state = 'waitingForCommand';
                debug.finer('serial write done');
            }
        });
        requ.state = 'waitingForBytesWritten';
        this._pending = requ;
        if (toMillis > 0) {
            this._timer = setTimeout( () => this.handleTimeout(requ), toMillis);
        }
    }

    private handleTimeout (requ: SendRequest) {
        this._timer = null;
        requ.error = new Error('Timeout');
        requ.promise.rej(requ.error);
        if (this._pending === requ) {
            this._pending = null;
            this.sendNextRequest();
        }
    }

}

interface HistoryRecord {
    at: Date;
    str: string;
    err?: Error;
}

interface Request<T> {
    type: 'SendRequest' | 'ResetRequest';
    at: Date;
    timeout: number;
    promise: { res: (response: T) => void, rej: (err: Error) => void };
}

interface SendRequest extends Request<string> {
    type: 'SendRequest';
    name: string;
    cmd: string;
    state?: 'waitingForSend' | 'waitingForBytesWritten' | 'waitingForCommand' | 'waitingForResponse' | 'done';
    response?: string;
    responseBuffer?: Buffer;
    error?: Error;
}


interface ResetRequest extends Request<void> {
    type: 'ResetRequest';
}

export class SerialFlashError extends Error {
    public address: number;
    public buffer: Buffer;
    public cause: Error;

    constructor (msg: string, address: number, buffer: Buffer, cause?: Error) {
        super(msg);
        this.address = address;
        this.buffer = buffer;
        this.cause = cause;
    }

}

export class SerialClearError extends Error {
    public cause: Error;
    constructor (msg: string, cause?: Error) {
        super(msg);
        this.cause = cause;
    }
}
