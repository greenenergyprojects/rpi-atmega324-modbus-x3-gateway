
import * as debugsx from 'debug-sx';
const debug: debugsx.IFullLogger = debugsx.createFullLogger('devices:FroniusMeterTcp');

import { ModbusTcpDevice } from './modbus-tcp-device';
import { ModbusDevice } from './modbus-device';
import { ModbusTcp, ModbusTransaction } from '../modbus/modbus-tcp';
import { FroniusMeterModel } from '../data/common/fronius-meter/fronius-meter-model';
import { RegisterValues } from '../data/common/modbus/register-values';
import { IEnergyMeter, EnergyMeter } from '../data/common/home-control/energy-meter';

export interface IFroniusMeterConfig {
    disabled?:          boolean;
    host:               string;
    port:               number;
    modbusAddress:      number;
    pollingMillis?: number | null;
    timeoutMillis?: number | null;
}

export class FroniusMeterTcp extends ModbusTcpDevice {

    public static getInstance (id?: string | number): FroniusMeterTcp {
        id = id && id.toString();
        let d: ModbusDevice;
        if (id) {
            d = ModbusDevice.getInstance(id);
        } else {
            d = ModbusDevice.instances.find( (x) => (x instanceof FroniusMeterTcp) );
        }
        if (!d || !(d instanceof FroniusMeterTcp)) {
            if (id) {
                throw new Error('FroniusMeterTcp instance with id ' + id + ' not found');
            } else {
                throw new Error('FroniusMeterTcp instance not found');
            }
        }
        return d;
    }

    // ******************************************************************

    private _config: IFroniusMeterConfig;
    private _timer: NodeJS.Timer;
    private _nextPollingAt: number;
    private _regs: FroniusMeterModel;
    private _serialNumber: string;

    public constructor (config: IFroniusMeterConfig) {
        super(new ModbusTcp(config), config.modbusAddress);
        try {
            if (!config.disabled) {
                if (!config.host || typeof(config.host) !== 'string') { throw new Error('missing/invalid host'); }
                if (!(config.port >= 0 && config.port <= 0xffff)) { throw new Error('missing/invalid port'); }
                if (!(config.modbusAddress >= 1 && config.modbusAddress < 255)) { throw new Error('missing/invalid modbusAddress'); }
                this._regs = FroniusMeterModel.createInstance();
                // this._regs.on('all', 'update', (src, v) => {
                //     debug.info('     ---> %s\n%o', v.value, src);
                // });
            }
            this._config = config;
        } catch (err) {
            throw new FroniusMeterTcpError('invalid FroniusMeterTcp config', err);
        }
    }

    public async start () {
        if (this._timer) { throw new Error('FroniusMeterTcp already started'); }
        if (this._config.disabled) { return; }
        const dt = this._config && this._config.pollingMillis;
        if (!(dt >= 100)) { throw new Error('invalid dt ' + dt ); }
        this._nextPollingAt = Date.now();
        this._timer = setInterval( () => this.handleTimer(), dt);
        if (!this._gateway.isConnected) {
            process.nextTick( () => {
                this._gateway.start().then( () => {
                    process.nextTick( () => { this.handleTimer(); });
                }).catch( (err) => {
                    debug.warn('connecting FroniusMeterTcp fails\n%e', err);
                });
            });
        }
    }

    public async stop () {
        if (!this._timer) { return; }
        clearInterval(this._timer);
        this._timer = null;
    }

    public get serialNumber (): string {
        return this._serialNumber;
    }

    public set serialNumber (sn: string) {
        this._serialNumber = sn;
    }

    public toEnergyMeter (serialNumber: string, preserveDate = true): EnergyMeter {
        return this._regs ? this._regs.toEnergyMeter(serialNumber || this._serialNumber || null) : null;
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
                this._regs.updateValues(startId, startId  + values.length - 1);
            } catch (err) {
                rv.push( err instanceof Error ? err : new Error('modbus transaction fails') );
            }
        }
        return rv;
    }

    private async handleTimer () {
        try {
            const now = Date.now();
            debug.finest('handleTimer()');
            if (!this._config || !(this._config.pollingMillis > 0) || this._nextPollingAt > now) {
                debug.finer('--> skip reading...');
                return;
            }
            while (this._nextPollingAt <= Date.now()) {
                this._nextPollingAt += this._config.pollingMillis;
            }
            try {
                debug.finer('  --> read values');
                if (!this._gateway.isConnected) {
                    debug.finer('no connection established, try to reconnect...');
                    await this._gateway.start();
                }
                this.readRegisters(this._regs.registerValues, this._config.timeoutMillis).then( (rv) => {
                    let ok = true;
                    for (let i = 0; i < rv.length; i++) {
                        const r = rv[i];
                        if (r instanceof Error) {
                            debug.warn('updating FroniusMeter model fails on part %d/%d\n%e', i + 1, rv.length, r);
                            ok = false;
                        } else {
                            debug.finer(' --> reading FroniusMeter model regs (%d/%d) ok: %o -> %o',
                                        i + 1, rv.length, r.request.pdu, r.response.pdu);
                        }
                    }
                }).catch( (err) => {
                    debug.warn('updating FroniusMeter fails\n%e', err);
                });
            } catch (err) {
                debug.warn('polling FroniusMeter fails\n%e', err);
                this._regs.invalidiateValues();
            }

        } catch (err) {
            debug.warn('handleTimer() fails\n%e', err);
        }
    }
}

export class FroniusMeterTcpError extends Error {
    public constructor (msg: string, public cause?: Error) {
        super(msg);
    }
}
