
import * as debugsx from 'debug-sx';
const debug: debugsx.IFullLogger = debugsx.createFullLogger('devices:Nibe1155');

import * as http from 'http';

import { INibe1155Value, Nibe1155Value } from '../data/common/nibe1155/nibe1155-value';
import { IHttpGetDataMonitorQuery, IHttpGetDataMonitorResponse } from '../data/common/nibe1155/server-http';
import { Nibe1155Controller, HeatpumpControllerMode, INibe1155Controller } from '../data/common/nibe1155/nibe1155-controller';
// import { MonitorRecordNibe1155, IMonitorRecordNibe1155 } from '../data/common/home-control/monitor-record-nibe1155';
import { INibe1155MonitorRecord } from '../data/common/nibe1155/nibe1155-monitor-record';


interface INibe1155Config {
    disabled?: boolean;
    host: string;
    port: number;
    path: string;
    pathMode: string;
    timeoutMillis?: number;
    pollingPeriodMillis?: number;
}

export class Nibe1155 {

    public static getInstance (): Nibe1155 {
        if (!this._instance) { throw new Error('instance not initialized'); }
        return this._instance;
    }

    public static async createInstance (config: INibe1155Config): Promise<Nibe1155> {
        if (this._instance) { throw new Error('instance already created'); }
        const rv = new Nibe1155(config);
        await rv.init();
        this._instance = rv;
        return rv;
    }

    private static _instance: Nibe1155;

    // ****************************************************

    private _config: INibe1155Config;
    private _keepAliveAgent: http.Agent;
    private _options: http.RequestOptions;
    private _lastValidResponse: { at: Date, values: INibe1155Value [] };
    private _timer: NodeJS.Timer;
    private _getPendingSince: Date;

    private _logsetIds: number [];
    private _values: { [id: number]: Nibe1155Value } = {};
    private _controller: Nibe1155Controller;



    private constructor (config: INibe1155Config) {
        if (!config) { throw new Error('missing nibe1155 config'); }
        this._config = config;
        if (config.disabled) { return; }
        if (!config.host || typeof(config.host) !== 'string') { throw new Error('invalid/missing host in config'); }
        if (config.port < 0 || config.port > 65535) { throw new Error('invalid/missing port in config'); }
        if (!config.path || typeof(config.path) !== 'string') { throw new Error('invalid/missing path'); }
        if (!config.pathMode || typeof(config.pathMode) !== 'string') { throw new Error('invalid/missing pathMode in path'); }
    }

    public get lastValidResponse (): { at: Date; values: INibe1155Value [] } {
        return this._lastValidResponse;
    }

    public async start () {
        if (!this._config || this._config.disabled) { return; }
        if (!this._config.pollingPeriodMillis || this._config.pollingPeriodMillis < 0) { return; }
        if (this._timer) { throw new Error('polling already started'); }
        this._timer = setInterval( () => this.handleTimer(), this._config.pollingPeriodMillis);
        debug.info('periodic polling (%s seconds) of nibe1155 started', Math.round(this._config.pollingPeriodMillis / 100) / 10);
    }

    public async stop () {
        if (!this._timer) { return; }
        clearInterval(this._timer);
        this._timer = null;
        debug.info('periodic polling stopped');
    }

    public toObject (preserveDate = true): INibe1155MonitorRecord {
        const rv: INibe1155MonitorRecord = {
            createdAt: new Date(),
            values:    {}
        };
        if (this._controller) { rv.controller = this._controller.toObject(preserveDate); }
        if (Array.isArray(this._logsetIds) && this._logsetIds.length > 0) {
            rv.logsetIds = this._logsetIds;
        }
        const ids = Object.getOwnPropertyNames(this._values);
        ids.forEach( (id) => {
            (<any>rv.values)[id] = (<any>this._values)[id].toObject(preserveDate);
        });
        return rv;
    }

    public get logsetIds (): number [] {
        return this._logsetIds;
    }

    public get controller (): any {
        return this._controller;
    }

    public get values ():  { [id: number]: Nibe1155Value } {
        return this._values;
    }

    public get brinePumpPower (): number {
        const v = this._values[43439];
        if (!v || v.label !== 'brinePumpSpeed' || (Date.now() - v.valueAt.getTime()) > 5000) { return Number.NaN; }
        return 30 / 100 * v.value;
    }

    public get supplyPumpPower (): number {
        const v = this._values[43437];
        if (!v || v.label !== 'supplyPumpSpeed' || (Date.now() - v.valueAt.getTime()) > 5000) { return Number.NaN; }
        return 30 / 100 * v.value;
    }

    public get compressorPower (): number {
        const v = this._values[43141];
        if (!v || v.label !== 'compressorInPower' || (Date.now() - v.valueAt.getTime()) > 5000) { return Number.NaN; }
        return v.value;
    }

    public get compressorFrequency (): number {
        const v = this._values[43136];
        if (!v || v.label !== 'compressorFrequency' || (Date.now() - v.valueAt.getTime()) > 5000) { return Number.NaN; }
        return v.value;
    }


    public get electricHeaterPower (): number {
        const v = this._values[43084];
        if (!v || v.label !== 'electricHeaterPower' || (Date.now() - v.valueAt.getTime()) > 5000) { return Number.NaN; }
        return v.value;
    }

    public async getData (query?: IHttpGetDataMonitorQuery): Promise<IHttpGetDataMonitorResponse> {
        if (this._config.disabled) { throw new Error('nibe1155 is disabled'); }
        if (this._getPendingSince) { return Promise.reject(new Error('request pending')); }

        const options = Object.assign({}, this._options);
        query = query || { logsetIds: true, controller: true, valueIds: 'all' };

        let queryString = '';
        if (query.logsetIds)  { queryString += (queryString !== '' ? '&' : '') + 'logsetIds=true'; }
        if (query.controller) { queryString += (queryString !== '' ? '&' : '') + 'controller=true'; }
        if (query.valueIds) {
            if (query.valueIds === '*' || query.valueIds === 'all') {
                queryString += (queryString !== '' ? '&' : '') + 'valueIds=all';
            } else if (query.valueIds === 'none') {
                queryString += (queryString !== '' ? '&' : '') + 'valueIds=none';
            } else if (Array.isArray(query.valueIds)) {
                for (const id of query.valueIds) {
                    queryString += (queryString !== '' ? '&' : '') + 'valueIds=' + id;
                }
            } else {
                queryString += (queryString !== '' ? '&' : '') + 'valueIds=' + query.valueIds;
            }

        }
        if (queryString !== '') {
            options.path += '?' + queryString;
        }

        this._getPendingSince = new Date();
        debug.finer('send request %s:%s', options.host, options.path);
        const rv = new Promise<IHttpGetDataMonitorResponse>( (res, rej) => {
            const requ = http.request(options, (resp) => {
                if (resp.statusCode === 200) {
                    resp.setEncoding('utf8');
                    let s = '';
                    resp.on('data', chunk => {
                        s += chunk;
                    });
                    resp.on('end', () => {
                        try {
                            const r = <IHttpGetDataMonitorResponse>JSON.parse(s);
                            if (!r) {
                                debug.warn('invalid response\n%s', s);
                                this._getPendingSince = null;
                                rej(new Error('invalid response'));
                            } else {
                                if (debug.finest.enabled) {
                                    debug.finer('parsing response sucessful (INibe1155Values: %o)', r);
                                } else if (debug.finer.enabled) {
                                    debug.finer('parsing response sucessful (INibe1155Values)');
                                }
                                const values: INibe1155Value [] = [];
                                if (r.values) {
                                    for (const a of Object.getOwnPropertyNames(r.values)) {
                                        values.push((<any>r.values)[a]);
                                    }
                                }
                                this._lastValidResponse = {
                                    at: new Date(),
                                    values: values
                                };
                                this._getPendingSince = null;
                                res(r);
                            }
                        } catch (err) {
                            this._getPendingSince = null;
                            rej(err);
                        }
                    });
                } else {
                    this._getPendingSince = null;
                    rej(new Error('response status ' + resp.statusCode));
                }
            });
            requ.on('error', (err) => {
                this._getPendingSince = null;
                rej(err);
            });
            requ.end();
        });
        return rv;
    }

    public async setHeatpumpMode (mode: Nibe1155Controller): Promise<Nibe1155Controller> {
        if (this._config.disabled) {
            throw new Error('nibe1155 is disabled');
        }
        if (!mode || !mode.createdAt || !mode.desiredMode
             || !mode.pin) {
            return Promise.reject(new Error('invalid mode'));
        }
        const rv = new Promise<Nibe1155Controller>( (resolve, reject) => {
            const body = JSON.stringify(mode);
            const options = Object.assign({}, this._options);
            options.method = 'POST';
            options.path = this._config.pathMode;
            options.headers = {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body)
            };
            const req = http.request(options, (res) => {
                if (res.statusCode !== 200) {
                    reject(new Error('response error status ' + res.statusCode));
                    return;
                }
                res.setEncoding('utf8');
                let s = '';
                res.on('data', chunk => {
                    s += chunk;
                });
                res.on('end', () => {
                    try {
                        resolve(new Nibe1155Controller(JSON.parse(s)));
                    } catch (err) {
                        debug.warn(err);
                        reject(err);
                    }
                });
            });
            req.on('error', (err) => {
                debug.warn(err);
            });
            req.write(body);
            req.end();
        });
        return rv;
    }

    // *****************************************************************

    private async init () {
        if (this._config.disabled) {
            return;
        }
        debug.info('init for %s:%s/%s', this._config.host, this._config.port, this._config.path);
        this._keepAliveAgent = new http.Agent({ keepAlive: true });
        this._options = {
            agent: this._keepAliveAgent,
            host: this._config.host,
            port: this._config.port,
            path: this._config.path,
            method: 'GET',
            timeout: this._config.timeoutMillis > 0 ? this._config.timeoutMillis : 1000
        };
        await this.handleTimer(true);
    }

    private async handleTimer (init?: boolean) {
        if (init || !this._values || Object.keys(this._values).length === 0) {
            try {
                debug.fine('no values found, send request for all');
                const rv = await this.getData();
                if (!Array.isArray(rv.logsetIds)) {
                    throw new Error('invalid/missing logsetIds in response');
                }
                if (!rv.controller) {
                    throw new Error('invalid/missing controller in response');
                }
                this._logsetIds = rv.logsetIds;
                this._controller = new Nibe1155Controller(rv.controller);
                const values: { [id: number ]: Nibe1155Value } = {};
                if (rv.values) {
                    for (const id of Object.getOwnPropertyNames(rv.values)) {
                        values[+id] = new Nibe1155Value((<any>rv.values)[+id]);
                        debug.finer('add value %o', this._values[+id]);
                    }
                }
                this._values = values;
                debug.info('valid init response from Nibe1155 server, %s values available', Object.keys(this._values).length);
            } catch (err) {
                debug.warn('invalid init response form Nibe1155 server\n%e', err);
                this._values = {};
            }

        } else {
            try {
                debug.fine('values available, send request values');
                const rv = await this.getData({ controller: true, valueIds: 'all' });
                let cnt = 0;
                if (rv.controller) {
                    this._controller = new Nibe1155Controller(rv.controller);
                }
                if (rv.values) {
                    for (const id of Object.getOwnPropertyNames(rv.values)) {
                        const vNew = (<any>rv.values)[id];
                        const v = this._values[+id];
                        if (!v) {
                            debug.warn('cannot find id %s in values, reinit values...', id);
                            await this.handleTimer(true);
                            return;
                        }
                        v.setRawValue(vNew.rawValue, new Date(vNew.rawValueAt));
                        cnt++;
                    }
                }
                debug.fine('%s values updated', cnt);
            } catch (err) {
                this._values = {};
                debug.warn('request for simple values fails\n%e', err);
            }
        }
    }


}


