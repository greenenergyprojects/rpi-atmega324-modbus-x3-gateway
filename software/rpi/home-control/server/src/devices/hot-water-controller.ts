
import * as debugsx from 'debug-sx';
const debug: debugsx.IFullLogger = debugsx.createFullLogger('devices:HotWaterController');

import * as http from 'http';

import { IMonitorRecord, MonitorRecord } from '../data/common/hot-water-controller/monitor-record';
import { BoilerMode } from '../data/common/hot-water-controller/boiler-mode';
import { IBoilerController, BoilerController } from '../data/common/hot-water-controller/boiler-controller';


interface IHotWaterControllerConfig {
    disabled?: boolean;
    host: string;
    port: number;
    path: string;
    pathController: string;
    timeoutMillis?: number;
    pollingPeriodMillis?: number;
}

export class HotWaterController {

    public static get Instance (): HotWaterController {
        if (!this._instance) { throw new Error('instance not initialized'); }
        return this._instance;
    }

    public static async createInstance (config: IHotWaterControllerConfig): Promise<HotWaterController> {
        if (this._instance) { throw new Error('instance already created'); }
        const rv = new HotWaterController(config);
        await rv.init();
        this._instance = rv;
        return rv;
    }

    private static _instance: HotWaterController;

    // ****************************************************

    private _config: IHotWaterControllerConfig;
    private _keepAliveAgent: http.Agent;
    private _options: http.RequestOptions;
    private _lastValidResponse: { at: Date, value: MonitorRecord };
    private _timer: NodeJS.Timer;
    private _getPendingSince: Date;


    private constructor (config: IHotWaterControllerConfig) {
        if (!config) { throw new Error('missing HotWaterController config'); }
        this._config = config;
        if (!config || config.disabled) { return; }
        if (!config.host || typeof(config.host) !== 'string') { throw new Error('invalid/missing host in config'); }
        if (config.port < 0 || config.port > 65535) { throw new Error('invalid/missing port in config'); }
        if (!config.path || typeof(config.path) !== 'string') { throw new Error('invalid/missing path'); }
    }

    public get lastValidResponse (): { at: Date, value: MonitorRecord } {
        return this._lastValidResponse;
    }

    public async start () {
        if (!this._config || this._config.disabled) { return; }
        if (!this._config.pollingPeriodMillis || this._config.pollingPeriodMillis < 0) { return; }
        if (this._timer) { throw new Error('polling already started'); }
        this._timer = setInterval( () => this.handleTimer(), this._config.pollingPeriodMillis);
        debug.info('periodic polling (%s seconds) of HotWaterController started', Math.round(this._config.pollingPeriodMillis / 100) / 10);
    }

    public async stop () {
        if (!this._timer) { return; }
        clearInterval(this._timer);
        this._timer = null;
        debug.info('periodic polling stopped');
    }



    /* tslint:disable:unified-signatures */
    public async getData (): Promise<MonitorRecord> {
        if (this._config.disabled) {
            throw new Error('HotWaterController disabled');
        }
        if (this._getPendingSince) {
            return Promise.reject(new Error('request pending'));
        }

        const options = Object.assign({}, this._options);
        this._getPendingSince = new Date();
        debug.finest('send request %s:%s', options.host, options.path);
        const rv = new Promise<MonitorRecord>( (res, rej) => {
            const requ = http.request(options, (resp) => {
                if (resp.statusCode === 200) {
                    resp.setEncoding('utf8');
                    let s = '';
                    resp.on('data', chunk => {
                        s += chunk;
                    });
                    resp.on('end', () => {
                        try {
                            debug.finest(s);
                            const r: IMonitorRecord [] = JSON.parse(s);
                            if (!Array.isArray(r) || r.length !== 1) {
                                debug.warn('invalid response\n%s', s);
                                this._getPendingSince = null;
                                rej(new Error('invalid response'));
                            } else {
                                r[0].mode = 'power';
                                const mr = new MonitorRecord(r[0]);
                                debug.finer('reading successful: %o', r);
                                this._lastValidResponse = { at: new Date(), value: mr };
                                this._getPendingSince = null;
                                res(mr);
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

    public async setBoilerMode (mode: BoilerMode): Promise<BoilerController> {
        if (this._config.disabled) {
            throw new Error('HotWaterController disabled');
        }
        const rv = new Promise<BoilerController>( (resolve, reject) => {
            const body = JSON.stringify(mode.toObject());
            const options = Object.assign({}, this._options);
            options.method = 'POST';
            options.path = this._config.pathController;
            options.headers = {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body)
            };
            debug.info('send %o', options);
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
                        debug.info('POST hwc -> %s', s);
                        const x: IBoilerController = JSON.parse(s);
                        const r = new BoilerController(x);
                        resolve(r);
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

    // *****************************************************************************

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
        try {
            const rv = await this.getData();
            debug.fine('HotWaterController update done');
        } catch (err) {
            debug.warn('request fails\n%e', err);
        }
    }


}


