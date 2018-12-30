import * as http from 'http';

import { ModbusDevice } from './modbus-device';
import { ISaiaAle3Meter } from '../data/common/saia-ale3-meter/saia-ale3-meter';

import * as debugsx from 'debug-sx';
const debug: debugsx.IDefaultLogger = debugsx.createDefaultLogger('devices:PiTechnik');

interface IPiTechnikConfig {
    disabled?: boolean;
    host: string;
    port: number;
    path: string;
    timeoutMillis?: number;
}

export class PiTechnik {

    public static get instance (): PiTechnik {
        if (!this._instance) { throw new Error('instance not initialized'); }
        return this._instance;
    }

    public static async createInstance (config: IPiTechnikConfig): Promise<PiTechnik> {
        if (this._instance) { throw new Error('instance already created'); }
        const rv = new PiTechnik(config);
        await rv.init();
        this._instance = rv;
        return rv;
    }

    private static _instance: PiTechnik;

    // ****************************************************

    private _config: IPiTechnikConfig;
    private _keepAliveAgent: http.Agent;
    private _options: http.RequestOptions;

    private constructor (config: IPiTechnikConfig) {
        if (!config) { throw new Error('missing config for PiTechnik'); }
        this._config = config;
        if (config.disabled) {
            return;
        }
        if (!config.host || typeof(config.host) !== 'string') { throw new Error('invalid/missing host in config'); }
        if (config.port < 0 || config.port > 65535) { throw new Error('invalid/missing port in config'); }
        if (!config.path || typeof(config.path) !== 'string') { throw new Error('invalid/missing host in path'); }
    }

    public async getData (): Promise<ISaiaAle3Meter> {
        if (this._config.disabled) {
            throw new Error('pi-technik diabled');
        }
        const rv = new Promise<ISaiaAle3Meter>( (res, rej) => {
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
                                debug.fine('reading meter successful: %o', d);
                                res(d);
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
        const rv = await this.getData();
        debug.info('init done, data available');
    }


    private async handleResponse (res: http.IncomingMessage) {
        debug.info('response status %d', res.statusCode);
    }
}


