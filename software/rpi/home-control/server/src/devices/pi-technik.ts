
import * as debugsx from 'debug-sx';
const debug: debugsx.IFullLogger = debugsx.createFullLogger('devices:PiTechnik');

import * as http from 'http';

import { ModbusDevice } from './modbus-device';
import { ISaiaAle3Meter, SaiaAle3Meter } from '../data/common/saia-ale3-meter/saia-ale3-meter';
import { runInThisContext } from 'vm';


interface IPiTechnikConfig {
    disabled?: boolean;
    host: string;
    port: number;
    path: string;
    pollingMillis: number;
    timeoutMillis: number;
}

export class PiTechnik {

    public static getInstance (): PiTechnik {
        if (!this._instance) { throw new Error('instance not initialized'); }
        return this._instance;
    }

    public static async createInstance (config: IPiTechnikConfig): Promise<PiTechnik> {
        if (this._instance) { throw new Error('instance already created'); }
        const rv = new PiTechnik(config);
        this._instance = rv;
        return rv;
    }

    private static _instance: PiTechnik;

    // ****************************************************

    private _config: IPiTechnikConfig;
    private _keepAliveAgent: http.Agent;
    private _options: http.RequestOptions;
    private _timer: NodeJS.Timer;
    private _nextPollingAt: number;
    private _lastPolling: SaiaAle3Meter;

    private constructor (config: IPiTechnikConfig) {
        if (!config) { throw new Error('missing config for PiTechnik'); }
        this._config = config;
        if (config.disabled) {
            return;
        }
        if (!config.host || typeof(config.host) !== 'string') { throw new Error('invalid/missing host in config'); }
        if (config.port < 0 || config.port > 65535) { throw new Error('invalid/missing port in config'); }
        if (!config.path || typeof(config.path) !== 'string') { throw new Error('invalid/missing host in path'); }
        if (!(config.pollingMillis > 0)) { throw new Error('invalid/missing pollingMillis'); }
        if (!(config.timeoutMillis > 0)) { throw new Error('invalid/missing timeoutMillis'); }
    }

    public async start () {
        if (this._timer) { throw new Error('PiTechnik already started'); }
        if (this._config.disabled) { return; }
        if (!this._keepAliveAgent) {
            this._keepAliveAgent = new http.Agent({ keepAlive: true });
        }
        this._options = {
            agent: this._keepAliveAgent,
            host: this._config.host,
            port: this._config.port,
            path: this._config.path,
            method: 'GET',
            timeout: this._config.timeoutMillis
        };
        const dt = this._config && this._config.pollingMillis;
        if (!(dt >= 100)) { throw new Error('invalid dt ' + dt ); }

        debug.info('init for %s:%s/%s', this._config.host, this._config.port, this._config.path);
        this._nextPollingAt = Date.now();
        this._timer = setInterval( () => this.handleTimer(), dt);
        process.nextTick( () => {
            this.handleTimer();
        });
    }

    public async stop () {
        if (!this._timer) { return; }
        clearInterval(this._timer);
        this._timer = null;
    }

    public getSaiamater (name?: string): SaiaAle3Meter {
        return this._lastPolling;
    }

    public async getData (): Promise<SaiaAle3Meter> {
        if (this._config.disabled) {
            throw new Error('pi-technik diabled');
        }
        const rv = new Promise<SaiaAle3Meter>( (res, rej) => {
            const requ = http.request(this._options, (resp) => {
                if (resp.statusCode === 200) {
                    resp.setEncoding('utf8');
                    let s = '';
                    resp.on('data', chunk => {
                        s += chunk;
                    });
                    resp.on('end', () => {
                        try {
                            const r: { devices: ISaiaAle3Meter [] } = JSON.parse(s);
                            if (!Array.isArray(r.devices)) {
                                debug.warn('invalid response, no array of devices\n%s', s);
                                rej(new Error('invalid response, no array of devices'));
                            }
                            for (const d of r.devices) {
                                if (d.typ !== 'Saia ALE3D5FD10C3A00' || d.name !== 'PV Ost/West') { continue; }
                                debug.finer('reading meter successful: %o', d);
                                res(new SaiaAle3Meter(d));
                                return;
                            }
                            rej(new Error('proper device not found in response'));
                        } catch (err) {
                            rej(err);
                        }
                    });
                } else {
                    rej(new Error('response status ' + resp.statusCode));
                }

            });
            requ.on('error', (err) => {
                rej(err);
            });
            requ.end();
        });
        return rv;
    }

    private async handleResponse (res: http.IncomingMessage) {
        debug.info('response status %d', res.statusCode);
    }

    private async handleTimer () {
        try {
            const now = Date.now();
            debug.finest('handleTimer()');
            if (!this._config || !(this._config.pollingMillis > 0) || this._nextPollingAt > now) {
                debug.finest('skip reading...');
                return;
            }
            while (this._nextPollingAt <= Date.now()) {
                this._nextPollingAt += this._config.pollingMillis;
            }
            try {
                debug.finer('read saiameter...');
                const result = await this.getData();
                this._lastPolling = result;
            } catch (err) {
                debug.warn('polling PiTechnik fails\n%e', err);
                this._lastPolling = null;
            }
        } catch (err) {
            debug.warn('handleTimer() fails\n%e', err);
        }
    }
}

export class PiTechnikError extends Error {
    public constructor (msg: string, public cause?: Error) {
        super(msg);
    }
}
