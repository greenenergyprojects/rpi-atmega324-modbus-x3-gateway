
import * as debugsx from 'debug-sx';
const debug: debugsx.IFullLogger = debugsx.createFullLogger('devices:FroniusSymo');

import { ModbusDevice } from './modbus-device';
import { ModbusTcpDevice } from './modbus-tcp-device';
import { ModbusTcp, ModbusTransaction } from '../modbus/modbus-tcp';
import { setInterval } from 'timers';
import { FroniusSymoModelRegister } from '../data/common/fronius-symo/fronius-symo-model-register';
import { FroniusSymoModelCommon } from '../data/common/fronius-symo/fronius-symo-model-common';
import { IRegisterValues, RegisterValues } from '../data/common/modbus/register-values';

export interface IFroniusSymoModelConfig {
    disabled?: boolean;
    pollingMillis?: number | null;
    timeoutMillis?: number | null;
}

export interface IFroniusSymoConfig {
    disabled?:          boolean;
    host:               string;
    port:               number;
    modbusAddress:      number;
    register:           IFroniusSymoModelConfig;
    common:             IFroniusSymoModelConfig;
    inverter?:          IFroniusSymoModelConfig;
    nameplate?:         IFroniusSymoModelConfig;
    setting?:           IFroniusSymoModelConfig;
    status?:            IFroniusSymoModelConfig;
    control?:           IFroniusSymoModelConfig;
    storage?:           IFroniusSymoModelConfig;
    inverterExtension?: IFroniusSymoModelConfig;
    stringCombiner?:    IFroniusSymoModelConfig;
    meter?:             IFroniusSymoModelConfig;
}

export class FroniusSymo extends ModbusTcpDevice {

    public static MODELNAMES: string [] = [
        'register', 'common', 'inverter', 'nameplate', 'setting', 'status',
        'control', 'storage', 'inverterExtension', 'stringCombiner', 'meter'
    ];

    public static getInstance (id?: string | number): FroniusSymo {
        id = id.toString();
        let d: ModbusDevice;
        if (id) {
            d = ModbusDevice.getInstance(id);
        } else {
            d = ModbusDevice.instances.find( (x) => (x instanceof FroniusSymo) );
        }
        if (!d || !(d instanceof FroniusSymo)) {
            if (id) {
                throw new Error('FroniusSymo instance with id ' + id + ' not found');
            } else {
                throw new Error('FroniusSymo instance not found');
            }
        }
        return d;
    }


    private _config: IFroniusSymoConfig;
    private _timer: NodeJS.Timer;
    private _register: { nextPollingAt: number, regs: FroniusSymoModelRegister, config: IFroniusSymoModelConfig };
    private _common:   { nextPollingAt: number, regs: FroniusSymoModelCommon, config: IFroniusSymoModelConfig };

    public constructor (config: IFroniusSymoConfig) {
        super(new ModbusTcp(config), config.modbusAddress);
        try {
            if (!config.disabled) {
                if (!config.host || typeof(config.host) !== 'string') { throw new Error('missing/invalid host'); }
                if (!(config.port >= 0 && config.port <= 0xffff)) { throw new Error('missing/invalid port'); }
                if (!(config.modbusAddress >= 1 && config.modbusAddress < 255)) { throw new Error('missing/invalid modbusAddress'); }
                try {
                    if (config.register && !config.register.disabled) {
                        this._register = {
                            nextPollingAt: null,
                            regs: FroniusSymoModelRegister.createInstance(),
                            config: this.verifyModelConfig(config.register)
                        };
                        this._register.regs.on('f_site_energy_year', 'value', (src, value) => {
                            debug.info(' ---> update: %o (%o)', value, src);
                        });
                    }
                } catch (err) {
                    throw new FroniusSymoError('invalid config.register', err);
                }
                try {
                    if (config.common && !config.common.disabled) {
                        this._common = {
                            nextPollingAt: null,
                            regs: FroniusSymoModelCommon.createInstance(),
                            config: this.verifyModelConfig(config.common)
                        };
                    }
                    this._common.regs.on('all', 'value', (src, value) => {
                        debug.info(' ---> update: %o (%o)', value, src);
                    });

                } catch (err) {
                    throw new FroniusSymoError('invalid config.common', err);
                }
            }
            this._config = config;
        } catch (err) {
            throw new FroniusSymoError('invalid FroniusSymo config', err);
        }
    }

    public async start () {
        if (this._timer) { throw new Error('FroniusSymo already started'); }
        if (this._config.disabled) { return; }
        let dt;
        if (this._register && this._register.config.pollingMillis > 0) {
            dt = dt === undefined ? this._register.config.pollingMillis : this.greatestCommonDivider(this._register.config.pollingMillis, dt);
            this._register.nextPollingAt = Date.now();
        }
        if (this._common && this._common.config.pollingMillis > 0) {
            dt = dt === undefined ? this._common.config.pollingMillis : this.greatestCommonDivider(this._common.config.pollingMillis, dt);
            this._common.nextPollingAt = Date.now();
        }
        if (!(dt >= 100)) { throw new Error('invalid dt ' + dt ); }
        this._timer = setInterval( () => this.handleTimer(), dt);
        if (!this._gateway.isConnected) {
            process.nextTick( () => {
                this._gateway.start().catch( (err) => {
                    debug.warn('connecting FroniusSymo fails\n%e', err);
                });
            });
        }
    }

    public async stop () {
        if (!this._timer) { return; }
        clearInterval(this._timer);
        this._timer = null;
    }

    private greatestCommonDivider (a: number, b: number): number {
        if (!(a > 0 && b >= 0)) { throw new Error('illegal arguments'); }
        if (b === 0) {
            return a;
        }
        return this.greatestCommonDivider(b, a % b);
    }

    private verifyModelConfig (cfg: IFroniusSymoModelConfig): IFroniusSymoModelConfig {
        const rv: IFroniusSymoModelConfig = {};
        if (cfg.disabled) { throw new Error('config disabled'); }

        if (cfg.pollingMillis === undefined || cfg.pollingMillis === null) {
            rv.pollingMillis = null;
        } else if (cfg.pollingMillis > 100) {
            rv.pollingMillis = Math.round(cfg.pollingMillis / 100) * 100;
        } else {
            throw new Error('invalid pollingMillis');
        }

        if (cfg.timeoutMillis === undefined || cfg.timeoutMillis === null) {
            rv.timeoutMillis = null;
        } else if (cfg.timeoutMillis > 100) {
            rv.timeoutMillis = Math.round(cfg.timeoutMillis / 100) * 100;
        } else {
            throw new Error('invalid pollingMillis');
        }

        return rv;
    }

    private async readHoldRegister (start: number, quantity: number, timeoutMillis: number): Promise<ModbusTransaction> {
        return this._gateway.readHoldRegisters(this._config.modbusAddress, start, quantity, timeoutMillis);
    }

    private async readRegisters (regs: RegisterValues, timeoutMillis: number): Promise<(ModbusTransaction | Error) []> {
        const rv: (ModbusTransaction | Error) [] = [];
        const ids = regs.ids;
        debug.finer('update registers %o', ids);
        if (ids.length <= 0) { return; }
        const promisses: Promise<ModbusTransaction> [] = [];
        let i = 0;
        while (i < ids.length) {
            const start = ids[i];
            let quantity = 1;
            while (++i <= ids.length) {
                if (ids[i] !== (start + quantity)) {
                    i--;
                    break;
                }
                quantity++;
            }
            debug.finer('refresh register start=%d, quantity=%d', start, quantity);
            i++;
            promisses.push(this.readHoldRegister(start, quantity, timeoutMillis));
        }
        for (const p of promisses) {
            try {
                const m = await p;
                if (!m.response.isValidResponse()) { throw new Error('invalid response'); }
                if (m.response.isErrorFrame()) { throw new Error('response is error frame'); }
                const funcCode = m.response.getFunctionCode();
                if (funcCode !== 0x03 || funcCode !== m.request.getFunctionCode()) {
                     throw new Error('unexpected response, wrong function code');
                }
                rv.push(m);
                const startId = (m.request.pdu[1] * 256 + m.request.pdu[2]) + 1;
                const values = m.response.getValues();
                debug.finest('update with idStart=%d, values=%o at=%o', startId, values, m.response.at);
                regs.updateValues(startId, values, m.response.at);
                this._register.regs.updateValues(startId, startId  + values.length - 1);
                this._common.regs.updateValues(startId, startId  + values.length - 1);
            } catch (err) {
                rv.push( err instanceof Error ? err : new Error('modbus transaction fails') );
            }
        }
        return rv;
    }

    private refreshRegisters (regs: RegisterValues, modbus: ModbusTransaction []) {

    }

    private async handleTimer () {
        try {
            const now = Date.now();
            debug.fine('handleTimer()');
            if (!this._gateway.isConnected) {
                await this._gateway.start();
            }

            try {
                if (this._register && this._register.nextPollingAt <= Date.now()) {
                    debug.finer('update FroniusSymo register model now...');
                    this._register.nextPollingAt = now + this._register.config.pollingMillis;
                    this.readRegisters(this._register.regs.registerValues, this._register.config.timeoutMillis).then( (rv) => {
                        let ok = true;
                        for (let i = 0; i < rv.length; i++) {
                            const x = rv[i];
                            if (x instanceof Error) {
                                debug.warn('updating FroniusSymo register model fails on part %d/%d\n%e', i + 1, rv.length, x);
                                ok = false;
                            } else {
                                debug.fine(' --> reading FroniusSymo register model regs (%d/%d) ok: %o -> %o',
                                           i + 1, rv.length, x.request.pdu, x.response.pdu);
                            }
                        }
                        if (!ok) {
                            throw new Error('reading from modbus fails');
                        } else {
                            this.refreshRegisters(this._register.regs.registerValues, <ModbusTransaction []>rv);
                        }
                    }).catch( (err) => {
                        debug.warn('updating FroniusSymo register fails\n%e', err);
                    });
                }
            } catch (err) {
                debug.warn('polling FroniusSymo register fails\n%e', err);
            }

            try {
                if (this._common && this._common.nextPollingAt <= Date.now()) {
                    debug.finer('update FroniusSymo common model now...');
                    this._common.nextPollingAt = now + this._common.config.pollingMillis;
                    this.readRegisters(this._common.regs.registerValues, this._common.config.timeoutMillis).then( (rv) => {
                        for (const x of rv) {
                            if (x instanceof Error) {
                                debug.warn('updating FroniusSymo common model fails\n%e', x);
                            } else {
                                debug.info(' --> polling common ok: %o -> %o', x.request.pdu, x.response.pdu);
                            }
                        }
                    }).catch( (err) => {
                        debug.warn('polling FroniusSymo common fails\n%e', err);
                    });
                }
            } catch (err) {
                debug.warn('polling FroniusSymo common fails\n%e', err);
            }

        } catch (err) {
            debug.warn('handleTimer() fails\n%e', err);
        }
    }
}

export class FroniusSymoError extends Error {
    public constructor (msg: string, public cause?: Error) {
        super(msg);
    }
}

