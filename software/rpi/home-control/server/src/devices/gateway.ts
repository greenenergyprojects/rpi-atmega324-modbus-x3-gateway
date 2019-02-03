
import * as debugsx from 'debug-sx';
const debug: debugsx.IFullLogger = debugsx.createFullLogger('devices:Gateway');

import * as http from 'http';
import * as zlib from 'zlib';
import { IUserAuth, IUserLogin } from '../data/common/nibe1155/user';
import { MonitorRecord } from '../data/common/home-control/monitor-record';
import { Monitor } from '../monitor';

interface IGatewayConfig {
    disabled?: boolean;
    user: IUserLogin;
    master: { host: string; port: number };
    timeoutMillis: number;
    pollingPeriodMillis?: number;
}

export class Gateway {

    public static getInstance (): Gateway {
        if (!this._instance) { throw new Error('instance not initialized'); }
        return this._instance;
    }

    public static async createInstance (config: IGatewayConfig): Promise<Gateway> {
        if (this._instance) { throw new Error('instance already created'); }
        const rv = new Gateway(config);
        await rv.init();
        this._instance = rv;
        return rv;
    }

    private static _instance: Gateway;

    // ****************************************************

    private _config: IGatewayConfig;
    private _keepAliveAgent: http.Agent;
    private _options: http.RequestOptions;
    private _requestPendingSince: Date;
    private _timer: NodeJS.Timer;
    private _authBearerToken: string;
    private _lastMonitorRecord: MonitorRecord;

    private constructor (config: IGatewayConfig) {
        this._config = config || { disabled: true, user: null, master: null, timeoutMillis: null, pollingPeriodMillis: null };
        if (config.disabled) { return; }
        if (!config.user) { throw new Error('invalid/missing user in config'); }
        if (!config.user.userid || typeof config.user.userid !== 'string')  { throw new Error('invalid/missing config.user.userid'); }
        if (!config.user.password || typeof config.user.password !== 'string')  { throw new Error('invalid/missing config.user.password'); }
        if (!config.master)  { throw new Error('invalid/missing master in config'); }
        if (!config.master.host || typeof config.master.host !== 'string')  { throw new Error('invalid/missing config.master.host'); }
        if (!config.master.port || !(config.master.port >= 0 && config.master.port <= 65535)) { throw new Error('invalid/missing config.master.port'); }
        if (!(config.timeoutMillis > 0)) { throw new Error('invalid/missing config.timeoutMillis'); }
        if (!(config.pollingPeriodMillis > 0)) { throw new Error('invalid/missing config.pollingPeriodMillis'); }
    }

    public async start () {
        if (!this._config || this._config.disabled) { return; }
        // this._timer = setInterval( () => this.handleTimer(), this._config.pollingPeriodMillis);
    }

    public async stop () {
        if (this._timer) {
            clearInterval(this._timer);
            this._timer = null;
        }
    }

    public isEnabled (): boolean {
        return !this._config.disabled;
    }

    public async getMonitorRecord (): Promise<MonitorRecord> {
        if (this._requestPendingSince) {
            return this._lastMonitorRecord;
        }
        const transaction = await this.httpGet('/data/monitor', this._config.user);
        const x = JSON.parse(transaction.resp.body);
        if (!Array.isArray(x) || x.length !== 1) { throw new Error('invalid response for GET /data/monitor'); }
        const mr = new MonitorRecord(x[0]);
        this._lastMonitorRecord = mr;
        return mr;
    }

    // **********************************************

    private async handleTimer () {
        if (this._requestPendingSince) { return; }
        try {
            const transaction = await this.httpGet('/data/monitor', this._config.user);
            const x = JSON.parse(transaction.resp.body);
            if (!Array.isArray(x) || x.length !== 1) { throw new Error('invalid response for GET /data/monitor'); }
            const mr = new MonitorRecord(x[0]);
        } catch (err) {
            debug.warn('%e', err);
        }
    }



    // *****************************************************************

    private async init () {
        if (this._config.disabled) {
            return;
        }
        this._keepAliveAgent = new http.Agent({ keepAlive: true });
        this._options = {
            agent: this._keepAliveAgent,
            host: this._config.master.host,
            port: this._config.master.port,
            path: '/gateway/monitorrecord',
            method: 'GET',
            timeout: this._config.timeoutMillis > 0 ? this._config.timeoutMillis : 1000
        };
        debug.finer('init for %s:%s/%s', this._options.host, this._options.port, this._options.path);
    }

    private async authenticate (authUser?: IUserLogin) {
        try {
            const user = JSON.stringify(this._config.user);
            const transaction1 = await this.httpPost('/auth', user);
            let rv = <IUserAuth> JSON.parse(transaction1.resp.body);
            if (!rv.userid || !rv.token) { throw new Error('invalid POST /auth response: ' + transaction1.resp.body); }
            if (rv.token.type === 'remote') {
                this._authBearerToken = rv.token.value;
                const transaction2 = await this.httpGet('/auth');
                rv = <IUserAuth> JSON.parse(transaction2.resp.body);
                if (!rv.userid || !rv.token) { throw new Error('invalid GET /auth response: ' + transaction2.resp.body); }
            }
            if (rv.token.type !== 'access' || !rv.token.value) {
                debug.warn('invalid/missing token from server: %o', rv.token);
                throw new Error('invalid/missing token from server');
            }
            this._authBearerToken = rv.token.value;
        } catch (err) {
            debug.warn(err);
            throw new GatewayError('authentication fails', err);
        }
    }


    private async httpSendRequest (options: http.RequestOptions, body?: string): Promise<HttpResponse> {
        const opt = Object.assign({}, options);
        opt.headers['Accept-Encoding'] = 'gzip,deflate';
        if (body) {
            if (!opt.headers) {  opt.headers = {}; }
            opt.headers['Content-Length'] = Buffer.byteLength(body);
        }
        if (this._authBearerToken) {
            opt.headers['Authorization'] = 'Bearer ' + this._authBearerToken;
        }

        const rv = new Promise<HttpResponse>( (resolve, reject) => {
            this._requestPendingSince = new Date();
            const result: HttpResponse = {
                requ:  {
                    sentAt: new Date(),
                    options: opt
                }
            };
            if (body) {
                result.requ.body = body;
            }
            const requ = http.request(opt, (resp) => {
                result.resp = { receivedAt: null, response: resp };
                if (resp.headers['content-encoding'] === 'gzip') {
                    const gunzip = zlib.createGunzip();
                    resp.pipe(gunzip);
                } else {
                    resp.setEncoding('utf-8');
                }
                const chunks: any [] = [];
                resp.on('data', chunk => {
                    chunks.push(chunk);
                });
                resp.on('end', () => {
                    this._requestPendingSince = null;
                    const res = resolve; resolve = null;
                    const rej = reject; reject = null;
                    if (!res || !rej) { return; }
                    if (resp.headers['content-encoding'] === 'gzip') {
                        const d = Buffer.concat(chunks);
                        zlib.gunzip(d, (err, unzipped) => {
                            result.resp.receivedAt = new Date();
                            if (err) {
                                rej(new HttpResponseError('gunzip error', result, err));
                            } else {
                                result.resp.body = unzipped.toString('utf-8');
                                if (resp.statusCode !== 200) {
                                    rej(new HttpResponseError('HTTP STATUS ' + resp.statusCode, result, err));
                                } else {
                                    res(result);
                                }
                            }
                        });
                    } else {
                        let s = '';
                        chunks.forEach( (x) => s += x);
                        result.resp.body = s;
                        if (resp.statusCode !== 200) {
                            rej(new HttpResponseError('HTTP STATUS ' + resp.statusCode, result));
                        } else {
                            res(result);
                        }
                    }
                });
            });
            requ.on('error', (err) => {
                this._requestPendingSince = null;
                const res = resolve; resolve = null;
                const rej = reject; reject = null;
                if (!res || !rej) { return; }
                rej(new HttpResponseError('cannot send request', result, err));
            });
            if (body) {
                requ.write(body);
            }
            requ.end();
        });
        return rv;
    }

    private async httpGet (path: string, authUser?: IUserLogin): Promise<HttpResponse> {
        const options = Object.assign({}, this._options);
        options.method = 'GET';
        options.path = path;
        options.headers = {
            'Content-Type': 'application/json',
        };
        try {
            debug.finer('---> %s %s:%d %s', options.method, options.host, options.port, options.path);
            let rv: HttpResponse;
            try {
                rv = await this.httpSendRequest(options);
                return rv;
            } catch (err) {
                if (err instanceof HttpResponseError) {
                    if (err.response && err.response.resp && err.response.resp.response.statusCode === 401) {
                        await this.authenticate(authUser);
                        return await this.httpGet(path);
                    }
                }
                throw err;
            }
        } catch (err) {
            debug.warn('http %s %s fails', options.headers.method, options.headers.path);
            throw new GatewayError('http GET fails', err);
        }

    }

    private async httpPost (path: string, body: string, authUser?: IUserLogin): Promise<HttpResponse> {
        const options = Object.assign({}, this._options);
        options.method = 'POST';
        options.path = path;
        options.headers = {
            'Content-Type': 'application/json',
        };
        try {
            debug.finer('---> %s %s:%d %s', options.method, options.host, options.port, options.path);
            let rv: HttpResponse;
            try {
                rv = await this.httpSendRequest(options, body);
                return rv;
            } catch (err) {
                if (err instanceof HttpResponseError) {
                    if (err.response && err.response.resp && err.response.resp.response.statusCode === 401) {
                        await this.authenticate(authUser);
                        return await this.httpPost(path, body);
                    }
                }
                throw err;
            }
        } catch (err) {
            debug.warn('http %s %s fails', options.headers.method, options.headers.path);
            throw new GatewayError('http POST fails', err);
        }
    }

}

interface HttpResponse {
    requ:  { sentAt: Date, options: http.RequestOptions, body?: string };
    resp?: { receivedAt: Date, response: http.IncomingMessage, body?: string };
}

class GatewayError extends Error {
    constructor (msg: string, public cause: Error) { super(msg); }
}

class HttpResponseError extends Error {
    constructor (msg: string, public response: HttpResponse, public cause?: Error) { super(msg); }
}
