
import * as net from 'net';

import { sprintf } from 'sprintf-js';

import * as debugsx from 'debug-sx';
const debug: debugsx.IFullLogger = debugsx.createFullLogger('modbus:ModbusTCP');

export interface IModbusTcpConfig {
    disabled?: boolean;
    host: string;
    port: number;
}


export class ModbusTcp {

    private _config: IModbusTcpConfig;
    private _connection: ModbusTcpConnection = null;
    private _tID = 0;
    private _isStopped: boolean;

    public constructor (config: IModbusTcpConfig) {
        this._config = config;
    }

    public get disabled (): boolean {
        return this._config.disabled;
    }

    public get host (): string {
        return this._config.host;
    }

    public get port (): number {
        return this._config.port;
    }

    public async start () {
        if (this._config.disabled) {
            return;
        }
        this._connection = new ModbusTcpConnection('conn #1', this._config.host, this._config.port);
        return this._connection.connect();
    }

    public async stop () {
        this._isStopped = true;
        if (this._connection) {
            const conn = this._connection;
            this._connection = null;
            return conn.destroy();
        }
    }

    public get isConnected (): boolean {
        return this._connection && this._connection.isConnected;
    }


    /* tslint:disable:no-bitwise */
    public async readHoldRegisters (devId: number, addr: number, quantity: number, timeoutMillis?: number): Promise<ModbusTransaction> {
        // console.log('  --> readHoldRegisters, timeoutMillis=' + timeoutMillis);
        if (this.disabled) { return Promise.reject(new Error('ModbusTCP is disabled')); }
        if (!this._connection) { return Promise.reject(new Error('ModbusTCP connection closed')); }
        const transactionId = this._tID;
        this._tID = (this._tID + 1) & 0xffff;

        const b = Buffer.alloc(12, 0);
        b[0] = (transactionId >> 8) & 0xff;
        b[1] = transactionId & 0xff;
        b[5] = 6;            // length
        b[6] = devId & 0xff; // Unit-ID
        b[7] = 0x03;         // function Code
        b[8] = ((addr - 1) >> 8) & 0xff;
        b[9] = (addr - 1) & 0xff;
        b[10] = (quantity >> 8) & 0xff;
        b[11] = quantity & 0xff;
        debug.fine('Read %d Hold registers from devId/addr=%d/%d (timeout=%d)\nsending: %o', quantity, devId, addr, timeoutMillis, b);

        return this._connection.send(b, timeoutMillis);
    }
    /* tslint:enable:no-bitwise */

}

export class ModbusTransaction {
    protected _timer: NodeJS.Timer;
    protected _request: ModbusTcpRequest;
    protected _response: ModbusTcpResponse;
    protected _error: Error;
    protected _resolve: (result: ModbusTransaction) => void;
    protected _reject: (error: ModbusTcpTransactionError) => void;

    public constructor (request?: ModbusTcpRequest) {
        if (request) {
            this._request = request;
        }
    }

    public get request (): ModbusTcpRequest {
        return this._request;
    }

    public get response (): ModbusTcpResponse {
        return this._response;
    }

    public get transactionId (): number {
        return this._request.transactionId;
    }

    public get isSent (): boolean {
        return this._response !== undefined || this._resolve !== undefined;
    }

    public get isPending (): boolean {
        return this._request !== undefined && (this._response === undefined && this._error === undefined);
    }

    public get error (): Error {
        return this._error;
    }

    public getRegisterAsUint16 (address: number): number {
        if (!this._request || !this._response) { throw new Error('request/response not available'); }
        if (this.request.pdu[0] !== 3) { throw new Error('invalid function code'); }
        const start = this.request.pduUint16(1) + 1;
        return this.response.pduUint16(2 + 2 * (address - start));
    }

    public getRegisterAsInt16 (address: number): number {
        if (!this._request || !this._response) { throw new Error('request/response not available'); }
        if (this.request.pdu[0] !== 3) { throw new Error('invalid function code'); }
        const start = this.request.pduUint16(1) + 1;
        return this.response.pduInt16(2 + 2 * (address - start));
    }

    public getRegisterAsUint32 (address: number): number {
        if (!this._request || !this._response) { throw new Error('request/response not available'); }
        if (this.request.pdu[0] !== 3) { throw new Error('invalid function code'); }
        const start = this.request.pduUint16(1) + 1;
        return this.response.pduUint32(2 + 2 * (address - start));
    }

    public getRegisterAsInt32 (address: number): number {
        if (!this._request || !this._response) { throw new Error('request/response not available'); }
        if (this.request.pdu[0] !== 3) { throw new Error('invalid function code'); }
        const start = this.request.pduUint16(1) + 1;
        return this.response.pduInt32(2 + 2 * (address - start));
    }

    public getRegisterAsUint64 (address: number): number {
        if (!this._request || !this._response) { throw new Error('request/response not available'); }
        if (this.request.pdu[0] !== 3) { throw new Error('invalid function code'); }
        const start = this.request.pduUint16(1) + 1;
        return this.response.pduUint64(2 + 2 * (address - start));
    }

    public getRegisterAsFloat32 (address: number): number {
        if (!this._request || !this._response) { throw new Error('request/response not available'); }
        if (this.request.pdu[0] !== 3) { throw new Error('invalid function code'); }
        const start = this.request.pduUint16(1) + 1;
        return this.response.pduFloat32(2 + 2 * (address - start));

    }

    public getRegisterAsString (from: number, to: number): string {
        if (!this._request || !this._response) { throw new Error('request/response not available'); }
        if (this.request.pdu[0] !== 3) { throw new Error('invalid function code'); }
        const start = this.request.pduUint16(1) + 1;
        const length = this.request.pduUint16(3);
        if (to < from || from < start || to > (start + length)) { throw new Error('out of range'); }
        const b = this._response.pdu.slice(2 + (from - start) * 2, 2 + (to - start) * 2);
        const i = b.findIndex((x) => x === 0 );
        const rv = i < 0 ? b.toString('utf-8') : b.slice(0, i).toString('utf-8');
        return rv;
    }

}

export class ModbusTcpTransactionFactory extends ModbusTransaction {

    public async send (to: net.Socket, request: Buffer, timeoutMillis = 1000): Promise<ModbusTransaction> {
        // console.log('      --> ModbusTcpTransactionFactory.send, timeoutMillis=' + timeoutMillis);
        if (this._request || this._resolve || this._reject) {
            return Promise.reject(new ModbusTcpTransactionError(this, 'sending fails, request already set or send'));
        }
        this._request = new ModbusTcpRequest(request);
        if (!to || to.destroyed) {
            return Promise.reject(new ModbusTcpTransactionError(this, 'sending request fails, socket closed'));
        }
        return new Promise<ModbusTransaction>( (res, rej) => {
            try {
                this._resolve = res;
                this._reject = rej;
                to.write(request);
                this._timer = setTimeout( () => this.timeout(), timeoutMillis);
            } catch (err) {
                debug.warn('cannot send Modbus TCP request\n%e', err);
                const reject = this._reject;
                this._resolve = null;
                this._reject = null;
                if (this._timer) {
                    clearTimeout(this._timer);
                    this._timer = null;
                }
                reject(new ModbusTcpTransactionError(this, 'sending request fails'));
            }
        });
    }

    public final (response: ModbusTcpResponse) {
        if (this._response) { throw new Error('response already set'); }
        if (!response) { throw new Error('missing response'); }
        if (!this._resolve) { throw new Error('final fails, missing resolve function'); }
        this._response = response;
        if (this._response.transactionId === this._request.transactionId) {
            if (!this._resolve) {
                debug.warn('cannot finalize transaction, missing resolve function');
            } else {
                const res = this._resolve;
                this._resolve = null;
                this._reject = null;
                if (this._timer) {
                    clearTimeout(this._timer);
                    this._timer = null;
                }
                res(this);
            }
        } else {
            if (!this._reject) {
                debug.warn('cannot finalize transaction, missing reject function');
            } else {
                const rej = this._reject;
                this._resolve = null;
                this._reject = null;
                if (this._timer) {
                    clearTimeout(this._timer);
                    this._timer = null;
                }
                rej(new ModbusTcpTransactionError(this, 'invalid transaction id'));
            }
        }
    }

    public cancel (error: Error) {
        if (this._reject) {
            const rej = this._reject;
            this._resolve = null;
            this._reject = null;
            if (this._timer) {
                clearTimeout(this._timer);
                this._timer = null;
            }
            rej(new ModbusTcpTransactionError(this, 'cancelled'));
        }
    }

    private timeout () {
        if (!this._reject) {
            debug.warn('timeout cannot handled, missing reject function');
        } else {
            const rej = this._reject;
            this._resolve = null;
            this._reject = null;
            this._timer = null;
            rej(new ModbusTcpTransactionError(this, 'Timeout'));
        }
    }
}


export class ModbusTcpTransactionError extends Error {
    private _transaction: ModbusTransaction;

    public constructor (transaction: ModbusTransaction, msg?: string) {
        super(msg);
        this._transaction = transaction;
    }

    public get transaction (): ModbusTransaction {
        return this._transaction;
    }
}

export class ModbusTcpFrame {
    protected _at: Date;
    protected _mbap_header: Buffer;
    protected _pdu: Buffer;

    public constructor () {
        this._at = new Date();
    }

    public get at (): Date {
        return this._at;
    }

    public get isComplete (): boolean {
        return this._pdu !== undefined;
    }

    public get transactionId (): number {
        if (!this._mbap_header) { throw new Error('MBAP header missing'); }
        return this._mbap_header[0] * 256 + this._mbap_header[1];
    }

    public get protocolId (): number {
        if (!this._mbap_header) { throw new Error('MBAP header missing'); }
        return this._mbap_header[2] * 256 + this._mbap_header[3];
    }

    public get pduLength (): number {
        if (!this._mbap_header) { throw new Error('MBAP header missing'); }
        return (this._mbap_header[4] * 256 + this._mbap_header[5]) - 1;
    }

    public get unitIdentifier (): number {
        if (!this._mbap_header) { throw new Error('MBAP header missing'); }
        return this._mbap_header[6];
    }

    public get mbapHeader (): Buffer {
        if (!this._mbap_header) { throw new Error('MBAP header missing'); }
        return this._mbap_header;
    }

    public get pdu (): Buffer {
        if (!this._pdu) { throw new Error('PDU not available'); }
        return this._pdu;
    }

    public pduUint16 (byteIndex: number): number {
        if (!this._pdu) { throw new Error('PDU not available'); }
        if (byteIndex < 0 || byteIndex > (this._pdu.length - 2)) { throw new Error('out of range'); }
        return this._pdu[byteIndex] * 256 + this._pdu[byteIndex + 1];
    }

    public pduInt16 (byteIndex: number): number {
        const x = this.pduUint16(byteIndex);
        return x > 0x7fff ? x - 0x10000 : x;
    }

    public pduUint32 (byteIndex: number): number {
        if (!this._pdu) { throw new Error('PDU not available'); }
        if (byteIndex < 0 || byteIndex > (this._pdu.length - 4)) { throw new Error('out of range'); }
        let rv = 0;
        for (let i = 0; i < 4; i++) {
            rv = rv * 256 + this._pdu[byteIndex + i];
        }
        return rv;
    }

    public pduInt32 (byteIndex: number): number {
        const x = this.pduUint32(byteIndex);
        return x > 0x7fffffff ? x - 0x100000000 : x;
    }

    public pduUint64 (byteIndex: number): number {
        if (!this._pdu) { throw new Error('PDU not available'); }
        if (byteIndex < 0 || byteIndex > (this._pdu.length - 8)) { throw new Error('out of range'); }
        let rv = 0;
        for (let i = 0; i < 8; i++) {
            rv = rv * 256 + this._pdu[byteIndex + i];
        }
        return rv;
    }

    public pduInt64 (byteIndex: number): number {
        const x = this.pduUint64(byteIndex);
        return x > 0x7fffffffffffffff ? x - 0x10000000000000000 : x;
    }

    public pduFloat32 (byteIndex: number): number {
        if (!this._pdu) { throw new Error('PDU not available'); }
        if (byteIndex < 0 || byteIndex > (this._pdu.length - 4)) { throw new Error('out of range'); }
        const b = new ArrayBuffer(4);
        const bytes = new Uint8Array(b);
        for (let i = 0; i < 4; i++) {
            bytes[i] = this._pdu[i + byteIndex];
        }
        const v = new DataView(b, 0, 4);
        return v.getFloat32(0, false);
    }

    public getFunctionCode (): number {
        if (!this._pdu || this._pdu.length < 2) { throw new Error('no valid PDU'); }
        return this._pdu[0] >= 128 ? this._pdu[0] - 128 : this._pdu[0];
    }
}

export class ModbusTcpRequest extends ModbusTcpFrame {

    public constructor (frame: Buffer) {
        super();
        if (!frame || frame.length < 7 || frame.length !== (6 + frame[4] * 256 + frame[5])) {
            throw new Error('invalid frame');
        }
        this._mbap_header = Buffer.alloc(7);
        for (let i = 0; i < 7; i++) {
            this._mbap_header[i] = frame[i];
        }
        this._pdu = Buffer.alloc(frame.length - 7);
        for (let i = 7; i < frame.length; i++) {
            this._pdu[i - 7] = frame[i];
        }
    }
}

export class ModbusTcpResponse extends ModbusTcpFrame {

    public isValidResponse (): boolean {
        return this._pdu.length >= 2;
    }

    public isErrorFrame (): boolean {
        if (this._pdu.length >= 2 && this._pdu[0] < 128) {
            return false;
        } else if (this._pdu.length >= 2 && this._pdu[0] >= 128) {
            return true;
        } else {
            throw new Error('invalid response');
        }
    }

    public getByteCount () {
        if (this._pdu.length >= 2 && this._pdu[0] < 128) {
            return this._pdu[1];
        } else if (this._pdu.length >= 2 && this._pdu[0] >= 128) {
            throw new Error('response is a error frame');
        } else {
            throw new Error('invalid response');
        }
    }


    public getExceptionCode () {
        if (this._pdu.length >= 2 && this._pdu[0] < 128) {
            throw new Error('response is not an error frame');
        } else if (this._pdu.length === 2 && this._pdu[0] >= 128) {
            return this._pdu[1];
        } else {
            throw new Error('invalid response');
        }
    }

    public getValues (): number [] {
        if (this._pdu.length >= 2 && this._pdu[0] < 128) {
            const rv = [];
            for (let i = 0; i < this._pdu[1]; i += 2) {
                rv.push( this._pdu[i + 2] * 256 + this._pdu[i + 3]);
            }
            return rv;
        } else if (this._pdu.length >= 2 && this._pdu[0] >= 128) {
            throw new Error('response is a error frame');
        } else {
            throw new Error('invalid response');
        }
    }

}


export class ModbusTcpResponseFactory extends ModbusTcpResponse {
    private _buffer: Buffer;
    private _index: number;

    public constructor () {
        super();
    }


    /**
     * Add Bytes to the frame
     * @param data buffer of bytes which contains bytes to add
     * @param offset start index in data
     * @param length number of bytes from buffer which can be used
     * @returns number of bytes taken from buffer, is 0 if frame already completed
     */
    public add (data: Buffer, offset = 0, length?: number): number {
        if (this._pdu !== undefined) { return 0; } // frame already complete
        let rv = 0;
        let maxLength = data.length - offset;
        length = length >= 0 && length <= maxLength ? length : maxLength;

        if (!this._mbap_header) {
            if (!this._buffer && maxLength >= 6) {
                this._mbap_header = Buffer.alloc(7);
                this._index = 0;
                for (let i = 0; i < 7; i++) {
                    this._mbap_header[i] = data[offset++];
                    rv++;
                }
            } else {
                if (!this._buffer) {
                    this._buffer = Buffer.alloc(7);
                    this._index = 0;
                }
                while (this._index < 7 && maxLength > 0) {
                    this._buffer[this._index++] = data[offset++];
                    maxLength--; rv++;
                }
                if (this._index === 7) {
                    this._mbap_header = this._buffer;
                    this._index = undefined;
                    this._buffer = undefined;
                }
            }
        }

        if (this._mbap_header && !this._buffer) {
            const expectedLength = (this._mbap_header[4] * 256 + this._mbap_header[5]) - 1;
            if (expectedLength > 0) {
                this._buffer = Buffer.alloc(expectedLength);
                this._index = 0;
            } else {
                this._pdu = null;
            }
        }

        while (this._index < this._buffer.length && maxLength > 0) {
            this._buffer[this._index++] = data[offset++];
            maxLength--; rv++;
        }

        if (this._index === this._buffer.length) {
            this._pdu = this._buffer;
            this._index = undefined;
        }

        return rv;
    }

}

class ModbusTcpConnection {

    private _name: string;
    private _host: string;
    private _port: number;
    private _socket: net.Socket = null;
    private _pendingRequest: ModbusTcpTransactionFactory;
    private _waitingRequests: {
                timeout: number,
                res: (rv: ModbusTransaction) => void,
                rej: (err: ModbusTcpTransactionError) => void,
                request: Buffer
            } [] = [];
    private _waitingTimer: NodeJS.Timer;
    private _responseFactory: ModbusTcpResponseFactory;
    private _connectionReject: (err: any) => void;
    private _destroyResolve: () => void;
    private _destroyReject: (err: any) => void;

    public constructor (name: string, host: string, port: number) {
        this._name = name;
        this._host = host;
        this._port = port;
        this._socket = new net.Socket();
        this._socket.on('data', (data) => this.handleData(data));
        this._socket.on('end', () => this.handleEnd());
        this._socket.on('error', (err) => this.handleError(err));
        this._socket.on('close', () => this.handleClose());
    }

    public get isConnected (): boolean {
        return this._socket !== null;
    }


    public async connect () {
        if (this._connectionReject) {
            return Promise.reject('connect pending');
        }
        return new Promise<void>( (res, rej) => {
            this._connectionReject = rej;
            this._socket.connect(this._port, this._host, () => {
                debug.fine('%s: socket %s:%s to %s:%s opened',
                            this._name, this._socket.localAddress, this._socket.localPort, this._host, this._port);
                this._connectionReject = null;
                res();
            });
        });
    }

    public async destroy () {
        if (this._destroyResolve || this._destroyReject) {
            return Promise.reject('destroy pending');
        }
        if (this._socket && !this._socket.destroyed) {
            return new Promise<void>( (res, rej) => {
                this._destroyResolve = res;
                this._destroyReject = rej;
                this._socket.end();
            });
        }
    }

    public async send (b: Buffer, timeoutMillis = 2000): Promise<ModbusTransaction> {
        if (!this._pendingRequest) {
            const mt = new ModbusTcpTransactionFactory();
            this._pendingRequest = mt;
            debug.finest('%s: sending request\n%o', this._name, b);
            // console.log('    --> ModbusTcpConnection.send, timeoutMillis=' + timeoutMillis);
            return mt.send(this._socket, b, timeoutMillis);
        } else {
            debug.finest('connection #%s, request pending, queue new request (%d queued)', this._name, this._waitingRequests.length);
            return new Promise<ModbusTransaction>( (res, rej) => {
                // console.log('    --> ModbusTcpConnection.push, timeoutMillis=' + timeoutMillis);
                this._waitingRequests.push( { timeout: Date.now() + timeoutMillis, res: res, rej: rej, request: b } );
                if (!this._waitingTimer) {
                    this._waitingTimer = setInterval( () => this.checkWaitingRequests (), 1000);
                }
            });
        }
    }

    private handleData (data: Buffer) {
        debug.finest('%s: receive %d bytes %o', this._name, data.length, data);
        let length = data.length;
        while (length > 0) {
            if (!this._responseFactory) {
                this._responseFactory = new ModbusTcpResponseFactory();
            }
            length -= this._responseFactory.add(data);
            if (this._responseFactory.isComplete) {
                debug.finer('%s: response complete', this._name);
                if (!this._pendingRequest) {
                    debug.warn('%s: response without request', this._name);
                    this._responseFactory = null;
                }
                const resp = this._responseFactory;
                this._responseFactory = null;
                const pr = this._pendingRequest;
                this._pendingRequest = null;
                while (this._waitingRequests.length > 0) {
                    try {
                        const r = this._waitingRequests.splice(0, 1);
                        const mt = new ModbusTcpTransactionFactory();
                        this._pendingRequest = mt;
                        const to = r[0].timeout - Date.now();
                        if (to > 0) {
                            mt.send(this._socket, r[0].request, to).then( (result) => {
                                r[0].res(result);
                            }).catch( (err) =>  {
                                r[0].rej(err);
                            });
                            break;
                        } else {
                            r[0].rej(new ModbusTcpTransactionError(mt, 'Timeout'));
                        }
                    } catch (err) {
                        debug.warn('handleData ???\n%e', err);
                    }
                }
                try {
                    pr.final(resp);
                } catch (err) { debug.warn('response available, final fails -> increase timeout?\n%e', err); }
            }
        }
    }

    private handleEnd () {
        debug.fine('%s handleEnd()', this._name);
        // if (this._socket) {
        //     this._socket.destroy();
        // }
        this._socket = null;
    }

    private handleError (err: any) {
        debug.fine('%s handleError()\n%o', this._name, err);
        debug.warn(err);
        if (this._connectionReject) {
            const r = this._connectionReject;
            this._connectionReject = null;
            this._socket = null;
            r(err);
        }
        if (this._destroyReject) {
            const r = this._destroyReject;
            this._destroyResolve = null;
            this._destroyReject = null;
            this._socket = null;
            r(err);
        }
    }

    private handleClose () {
        debug.fine('%s handleClose()\n%o', this._name);
        if (this._destroyResolve) {
            const r = this._destroyResolve;
            this._destroyResolve = null;
            this._destroyReject = null;
            r();
        }
    }

    private checkWaitingRequests () {
        const now = Date.now();
        for (let i = 0; i < this._waitingRequests.length; i++) {
            const wr = this._waitingRequests[i];
            if (wr.timeout < now) {
                const mt = new ModbusTcpTransactionFactory(new ModbusTcpRequest(wr.request));
                wr.rej(new ModbusTcpTransactionError(mt, 'cannot send request, waiting timeout'));
                this._waitingRequests.splice(i, 1);
                i--;
            }
        }
        if (this._waitingRequests.length === 0) {
            clearInterval(this._waitingTimer);
            this._waitingTimer = null;
        }
    }


}


