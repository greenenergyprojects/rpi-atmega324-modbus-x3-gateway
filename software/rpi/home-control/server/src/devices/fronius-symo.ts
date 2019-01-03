
import * as debugsx from 'debug-sx';
const debug: debugsx.IFullLogger = debugsx.createFullLogger('devices:FroniusSymo');

import { ModbusDevice } from './modbus-device';
import { ModbusTcpDevice } from './modbus-tcp-device';
import { ModbusTcp, ModbusTransaction } from '../modbus/modbus-tcp';
import { setInterval } from 'timers';
import { FroniusSymoModelRegister } from '../data/common/fronius-symo/fronius-symo-model-register';
import { FroniusSymoModelCommon } from '../data/common/fronius-symo/fronius-symo-model-common';
import { FroniusSymoModelInverter } from '../data/common/fronius-symo/fronius-symo-model-inverter';
import { FroniusSymoModelNameplate } from '../data/common/fronius-symo/fronius-symo-model-nameplate';
import { IRegisterValues, RegisterValues } from '../data/common/modbus/register-values';
import { FroniusSymoModelSettings } from '../data/common/fronius-symo/fronius-symo-model-settings';
import { FroniusSymoModelStatus } from '../data/common/fronius-symo/fronius-symo-model-status';
import { FroniusSymoModelControl } from '../data/common/fronius-symo/fronius-symo-model-control';
import { FroniusSymoModelStorage } from '../data/common/fronius-symo/fronius-symo-model-storage';
import { FroniusSymoModelInverterExtension } from '../data/common/fronius-symo/fronius-symo-model-inverter-extension';
import { FroniusSymoModel } from '../data/common/fronius-symo/fronius-symo-model';
import { IFroniusSymo } from '../data/common/fronius-symo/fronius-symo';

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
    settings?:          IFroniusSymoModelConfig;
    status?:            IFroniusSymoModelConfig;
    control?:           IFroniusSymoModelConfig;
    storage?:           IFroniusSymoModelConfig;
    inverterExtension?: IFroniusSymoModelConfig;
}

export class FroniusSymo extends ModbusTcpDevice {

    public static MODELNAMES: string [] = [
        'register', 'common', 'inverter', 'nameplate', 'settings', 'status',
        'control', 'storage', 'inverterExtension'
    ];

    public static getInstance (id?: string | number): FroniusSymo {
        id = id && id.toString();
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
    private _register:          { nextPollingAt: number, regs: FroniusSymoModelRegister, config: IFroniusSymoModelConfig };
    private _common:            { nextPollingAt: number, regs: FroniusSymoModelCommon, config: IFroniusSymoModelConfig };
    private _inverter:          { nextPollingAt: number, regs: FroniusSymoModelInverter, config: IFroniusSymoModelConfig };
    private _nameplate:         { nextPollingAt: number, regs: FroniusSymoModelNameplate, config: IFroniusSymoModelConfig };
    private _settings:          { nextPollingAt: number, regs: FroniusSymoModelSettings, config: IFroniusSymoModelConfig };
    private _status:            { nextPollingAt: number, regs: FroniusSymoModelStatus, config: IFroniusSymoModelConfig };
    private _control:           { nextPollingAt: number, regs: FroniusSymoModelControl, config: IFroniusSymoModelConfig };
    private _storage:           { nextPollingAt: number, regs: FroniusSymoModelStorage, config: IFroniusSymoModelConfig };
    private _inverterExtension: { nextPollingAt: number, regs: FroniusSymoModelInverterExtension, config: IFroniusSymoModelConfig };

    public constructor (config: IFroniusSymoConfig) {
        super(new ModbusTcp(config), config.modbusAddress);
        try {
            if (!config.disabled) {
                if (!config.host || typeof(config.host) !== 'string') { throw new Error('missing/invalid host'); }
                if (!(config.port >= 0 && config.port <= 0xffff)) { throw new Error('missing/invalid port'); }
                if (!(config.modbusAddress >= 1 && config.modbusAddress < 255)) { throw new Error('missing/invalid modbusAddress'); }
                config.disabled = true;
                for (const mn of FroniusSymo.MODELNAMES) {
                    if (!config || !(<any>config)[mn] || (<any>config)[mn].disabled) { continue; }
                    config.disabled = false;
                    const x: IMyFroniusSymoModel = {
                        nextPollingAt: Date.now(),
                        regs: null,
                        config: this.verifyModelConfig((<any>config)[mn])
                    };
                    switch (mn) {
                        case 'register':          x.regs = FroniusSymoModelRegister.createInstance(); break;
                        case 'common':            x.regs = FroniusSymoModelCommon.createInstance(); break;
                        case 'inverter':          x.regs = FroniusSymoModelInverter.createInstance(); break;
                        case 'nameplate':         x.regs = FroniusSymoModelNameplate.createInstance(); break;
                        case 'settings':          x.regs = FroniusSymoModelSettings.createInstance(); break;
                        case 'status':            x.regs = FroniusSymoModelStatus.createInstance(); break;
                        case 'control':           x.regs = FroniusSymoModelControl.createInstance(); break;
                        case 'storage':           x.regs = FroniusSymoModelStorage.createInstance(); break;
                        case 'inverterExtension': x.regs = FroniusSymoModelInverterExtension.createInstance(); break;
                        default: {
                            throw new Error('unsupported modelname ' + mn);
                        }
                    }
                    (<any>this)['_' + mn] = x;
                    // x.regs.on('all', 'update', (src, v) => {
                    //     debug.fine(' ---> %o\n%o', v, src);
                    // });

                }
                // if (this._status) {
                //     this._status.regs.on('all', 'update', (src, v) => {
                //         debug.fine(' ---> %o\n%o', v, src);
                //     });
                // }
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
        for (const mn of FroniusSymo.MODELNAMES) {
            const x = <IMyFroniusSymoModel>(<any>this)['_' + mn];
            if (!x || !x.config || !(x.config.pollingMillis > 0)) { continue; }
            dt = dt === undefined ? x.config.pollingMillis : this.greatestCommonDivider(x.config.pollingMillis, dt);
            x.nextPollingAt = Date.now();
        }

        if (!(dt >= 100)) { throw new Error('invalid dt ' + dt ); }
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

    public toObject (preserveDate = true): IFroniusSymo {
        const rv: IFroniusSymo = {
            createdAt: new Date()
        };
        if (this._register) { rv.register = this._register.regs.toObject(preserveDate); }
        if (this._common) { rv.common = this._common.regs.toObject(preserveDate); }
        if (this._inverter) { rv.inverter = this._inverter.regs.toObject(preserveDate); }
        if (this._nameplate) { rv.nameplate = this._nameplate.regs.toObject(preserveDate); }
        if (this._settings) { rv.settings = this._settings.regs.toObject(preserveDate); }
        if (this._status) { rv.status = this._status.regs.toObject(preserveDate); }
        if (this._control) { rv.control = this._control.regs.toObject(preserveDate); }
        if (this._storage) { rv.storage = this._storage.regs.toObject(preserveDate); }
        if (this._inverterExtension) { rv.inverterExtension = this._inverterExtension.regs.toObject(preserveDate); }
        return rv;
    }

    public get register (): FroniusSymoModelRegister {
        return this._register ? this._register.regs : null;
    }

    public get common (): FroniusSymoModelCommon {
        return this._common ? this._common.regs : null;
    }

    public get inverter (): FroniusSymoModelInverter {
        return this._inverter ? this._inverter.regs : null;
    }

    public get nameplate (): FroniusSymoModelNameplate {
        return this._nameplate ? this._nameplate.regs : null;
    }

    public get settings (): FroniusSymoModelSettings {
        return this._settings ? this._settings.regs : null;
    }

    public get status (): FroniusSymoModelStatus {
        return this._status ? this._status.regs : null;
    }

    public get control (): FroniusSymoModelControl {
        return this._control ? this._control.regs : null;
    }

    public get storage (): FroniusSymoModelStorage {
        return this._storage ? this._storage.regs : null;
    }

    public get inverterExtension (): FroniusSymoModelInverterExtension {
        return this._inverterExtension ? this._inverterExtension.regs : null;
    }

    // ************************************************************************

    public getPvSouthActivePower (): { at: Date, value: number } | null {
        if (!this._inverterExtension || !this._inverterExtension.regs) { return null; }
        return this._inverterExtension.regs.getPvSouthActivePower();
    }

    public getBatteryActivePower (): { at: Date, value: number } | null {
        if (!this._inverterExtension || !this._inverterExtension.regs) { return null; }
        if (!this._inverter || !this._inverter.regs) { return null; }
        const dt = this._inverter.regs.getMaxDeltaTimeMillis(this._inverterExtension.regs);
        if (!(dt >= 0 && dt <= 2000)) {
            debug.warn('getBatteryActivePower() fails, values out of sync (%d)', dt);
            return null;
        }
        // const pInv = this._inverter.regs.pf.at ? this._inverter.regs.pf.value : null;
        const pInv = this._inverter.regs.dcw.at ? this._inverter.regs.dcw.value : null;
        let pBatt = this._inverterExtension.regs.dcw_2.at ? this._inverterExtension.regs.dcw_2.value : null;
        const pPvSouth = this._inverterExtension.regs.dcw_1.at ? this._inverterExtension.regs.dcw_1.value : null;
        if (pInv === null || pBatt === null || pPvSouth === null) { return null; }

        if (pPvSouth > pInv) {
            pBatt = -pBatt;
        }

        debug.fine('-----------> getBatteryActivePower() => %d (PInv=%d, String1=%d, String2=%d)', pBatt, pInv, pPvSouth, pBatt);
        return { at: this._inverterExtension.regs.dcw_2.at, value: pBatt };
    }


    // ************************************************************************

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
                for (const mn of FroniusSymo.MODELNAMES) {
                    const x = <IMyFroniusSymoModel>(<any>this)['_' + mn];
                    if (x && x.regs) {
                        x.regs.updateValues(startId, startId  + values.length - 1);
                    }
                }
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
            if (!this._gateway.isConnected) {
                await this._gateway.start();
            }

            for (const mn of FroniusSymo.MODELNAMES) {
                const x = <IMyFroniusSymoModel>(<any>this)['_' + mn];
                if (!x || !x.config || !(x.config.pollingMillis > 0)) { continue; }
                try {
                    if (x.nextPollingAt <= Date.now()) {
                        debug.finer('update FroniusSymo %s model now...', mn);
                        x.nextPollingAt = now + x.config.pollingMillis;
                        this.readRegisters(x.regs.registerValues, x.config.timeoutMillis).then( (rv) => {
                            let ok = true;
                            for (let i = 0; i < rv.length; i++) {
                                const r = rv[i];
                                if (r instanceof Error) {
                                    debug.warn('updating FroniusSymo register model fails on part %d/%d\n%e', i + 1, rv.length, r);
                                    ok = false;
                                } else {
                                    debug.finer(' --> reading FroniusSymo %s model regs (%d/%d) ok: %o -> %o',
                                                mn, i + 1, rv.length, r.request.pdu, r.response.pdu);
                                }
                            }
                        }).catch( (err) => {
                            debug.warn('updating FroniusSymo %s fails\n%e', mn, err);
                        });
                    }

                } catch (err) {
                    debug.warn('polling FroniusSymo %s fails\n%e', mn, err);
                    this._register.regs.invalidiateValues();
                }

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

interface IMyFroniusSymoModel {
    nextPollingAt: number;
    regs: FroniusSymoModel<any, any>;
    config: IFroniusSymoModelConfig;
}
