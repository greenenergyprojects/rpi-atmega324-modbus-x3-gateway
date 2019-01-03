
import * as debugsx from 'debug-sx';
const debug: debugsx.IFullLogger = debugsx.createFullLogger('monitor');

import * as fs from 'fs';

import * as nconf from 'nconf';
import { sprintf } from 'sprintf-js';

import { FroniusSymo } from './devices/fronius-symo';
import { PiTechnik } from './devices/pi-technik';
import { Nibe1155 } from './devices/nibe1155';
import { ISaiaAle3Meter } from './data/common/saia-ale3-meter/saia-ale3-meter';
import { Statistics } from './statistics';
import { HotWaterController } from './devices/hot-water-controller';
import { Nibe1155ModbusRegisters, Nibe1155ModbusIds } from './data/common/nibe1155/nibe1155-modbus-registers';
import { Nibe1155Value } from './data/common/nibe1155/nibe1155-value';
import { MonitorRecord, IMonitorRecord } from './data/common/home-control/monitor-record';
import { ICalculated } from './data/common/home-control/calculated';
import { FroniusMeterTcp } from './devices/fronius-meter-tcp';
import { IEnergyDaily, EnergyDaily } from './data/common/home-control/energy-daily';

interface IMonitorConfig {
    disabled?:            boolean;
    periodMillis?:        number;
    timeOffset?:          { sec: number, ms: number };
    froniusPeriodMillis?: number;
    tempFile?:            { path: string; backups?: number };
    debugFile?:           { path: string };
    logfile?:             { type: 'csv'; path: string };
}


interface ITempFileRecord {
    createdAt: Date;
    pvSouthEnergyDaily: IEnergyDaily;
    pvEastWestEnergyDaily: IEnergyDaily;
    eInDaily: IEnergyDaily;
    eOutDaily: IEnergyDaily;
    batInDaily: IEnergyDaily;
    batOutDaily: IEnergyDaily;
}


export class Monitor {
    public static getInstance (): Monitor {
        if (this._instance === undefined) {
            throw new Error('no instance created');
        }
        return this._instance;
    }

    public static createInstance (config: IMonitorConfig): Monitor {
        if (this._instance !== undefined) {
            throw new Error('instance already created');
        }
        this._instance = new Monitor(config);
        return this._instance;
    }

    private static _instance: Monitor;

    // ************************************************

    private _config: IMonitorConfig;
    private _timer: NodeJS.Timer;
    private _symo: FroniusSymo;
    private _froniusmeter: FroniusMeterTcp;
    private _history: MonitorRecord [] = [];
    private _lastTimerEvent: Date;
    private _pvSouthEnergyDaily: EnergyDaily;
    private _pvEastWestEnergyDaily: EnergyDaily;
    private _eInDaily: EnergyDaily;
    private _eOutDaily: EnergyDaily;
    private _batInDaily: EnergyDaily;
    private _batOutDaily: EnergyDaily;
    private _lastTempCnt = 0;

    // private _lastCaclulated: ICalculated;
    // private _pvSouthEnergyDaily = 0;
    // private _eDaily: { eIn: number, eOut: number, eInOffset: number, eOutOffset: number } = { eIn: 0, eOut: 0, eInOffset: 0, eOutOffset: 0 };
    // private _lastTempCnt = 0;
    // private _debugLastTime: string;

    private constructor (config?: IMonitorConfig) {
        if (!config) { throw new Error('missing monitor config'); }
        this._config = config;
        if (!this._config.periodMillis) { this._config.periodMillis = 1000; }
        if (!this._config.froniusPeriodMillis) { this._config.froniusPeriodMillis = 1000; }
        this._lastTimerEvent = null;
    }

    public async start () {
        if (this._config.disabled) { return; }

        if (this._config.tempFile && this._config.tempFile.path) {
            const backups = this._config.tempFile.backups > 0 ? this._config.tempFile.backups : 1;
            const now = new Date();
            for (let i = 0; i < backups; i++) {
                const fn = this._config.tempFile.path + '.' + i;
                if (!fs.existsSync(fn)) { continue; }
                try {
                    const s = fs.readFileSync(fn).toString('utf-8');
                    const o: ITempFileRecord = <ITempFileRecord>JSON.parse(s);
                    try {
                        if (!this._pvEastWestEnergyDaily && o.pvEastWestEnergyDaily) {
                            this._pvEastWestEnergyDaily = new EnergyDaily(o.pvEastWestEnergyDaily);
                            debug.info('found pvEastWestEnergyDaily in temp file %s (%o)', fn, this._pvEastWestEnergyDaily);
                        } else {
                            debug.warn('missing pvEastWestEnergyDaily from temp file %s', fn);
                        }
                    } catch (err) {
                        debug.warn('reading pvEastWestEnergyDaily fails...');
                    }
                    try {
                        if (!this._pvSouthEnergyDaily && o.pvSouthEnergyDaily) {
                            this._pvSouthEnergyDaily = new EnergyDaily(o.pvSouthEnergyDaily);
                            debug.info('found pvSouthEnergyDaily in temp file %s (%o)', fn, this._pvSouthEnergyDaily);
                        } else {
                            debug.warn('missing pvSouthEnergyDaily from temp file %s', fn);
                        }
                    } catch (err) {
                        debug.warn('reading pvSouthEnergyDaily fails...');
                    }
                    try {
                        if (!this._eInDaily && o.eInDaily) {
                            this._eInDaily = new EnergyDaily(o.eInDaily);
                            debug.info('found eInDaily in temp file %s (%o)', fn, this._eInDaily);
                        } else {
                            debug.warn('missing eInDaily from temp file %s', fn);
                        }
                    } catch (err) {
                        debug.warn('reading eInDaily fails...');
                    }
                    try {
                        if (!this._eOutDaily && o.eOutDaily) {
                            this._eOutDaily = new EnergyDaily(o.eOutDaily);
                            debug.info('found eOutDaily in temp file %s (%o)', fn, this._eOutDaily);
                        } else {
                            debug.warn('missing eOutDaily from temp file %s', fn);
                        }
                    } catch (err) {
                        debug.warn('reading eOutDaily fails...');
                    }
                    try {
                        if (!this._batInDaily && o.batInDaily) {
                            this._batInDaily = new EnergyDaily(o.batInDaily);
                            debug.info('found batInDaily in temp file %s (%o)', fn, this._batInDaily);
                        } else {
                            debug.warn('missing batInDaily from temp file %s', fn);
                        }
                    } catch (err) {
                        debug.warn('reading batInDaily fails...');
                    }
                    try {
                        if (!this._batOutDaily && o.batOutDaily) {
                            this._batOutDaily = new EnergyDaily(o.batOutDaily);
                            debug.info('found batOutDaily in temp file %s (%o)', fn, this._batOutDaily);
                        } else {
                            debug.warn('missing batOutDaily from temp file %s', fn);
                        }
                    } catch (err) {
                        debug.warn('reading batOutDaily fails...');
                    }

                } catch (err) {
                    debug.warn('reading temp file fails', err);
                }
            }
        }
        if (!this._pvEastWestEnergyDaily ) { this._pvEastWestEnergyDaily = new EnergyDaily({ totalEnergy: 0 }); }
        if (!this._pvSouthEnergyDaily) { this._pvSouthEnergyDaily = new EnergyDaily({ totalEnergy: 0 }); }
        if (!this._eInDaily) { this._eInDaily = new EnergyDaily({ totalEnergy: 0 }); }
        if (!this._eOutDaily) { this._eOutDaily = new EnergyDaily({ totalEnergy: 0 }); }
        if (!this._batInDaily) { this._batInDaily = new EnergyDaily({ totalEnergy: 0 }); }
        if (!this._batOutDaily) { this._batOutDaily = new EnergyDaily({ totalEnergy: 0 }); }

        this._symo = FroniusSymo.getInstance();
        this._froniusmeter = FroniusMeterTcp.getInstance();

        if (this._config.timeOffset instanceof Object && this._config.timeOffset.sec > 0 && this._config.timeOffset.ms >= 0) {
            const sec = Math.round(this._config.timeOffset.sec);
            const ms = Math.round(this._config.timeOffset.ms);
            const now = new Date();
            const x = new Date();
            x.setTime(now.getTime() + 60000);
            x.setSeconds(sec); x.setMilliseconds(ms);
            let dt = x.getTime() - now.getTime();
            dt = dt - Math.floor(dt / this._config.froniusPeriodMillis) * this._config.froniusPeriodMillis;
            debug.finer('now = %d, dt = %d', now, dt);
            const thiz = this;
            setTimeout( () => {
                this._lastTimerEvent = new Date();
                thiz.handleTimerEvent();
                thiz._timer = setInterval( () => thiz.handleTimerEvent(), this._config.periodMillis);
            }, dt);
        } else {
            this._timer = setInterval( () => this.handleTimerEvent(), this._config.periodMillis);
        }
        debug.info('Monitor started');
    }


    public async stop () {
        if (this._timer) {
            clearInterval(this._timer);
            this._timer = null;
            debug.info('Monitor stopped');
        }
        return new Promise<void>( (res, rej) => { setTimeout( () => { res(); }, 200); } );
    }

    public get latest (): MonitorRecord {
        return this._history.length > 0 ? this._history[this._history.length - 1] : null;
    }

    private async handleTimerEvent () {
        debug.fine('handleTimerEvent now = %d', Date.now());

        try {
            const now = new Date();
            const oldLastTimerEvent = this._lastTimerEvent || now;
            const dayHasChanged =  oldLastTimerEvent.getDay() !==  now.getDay();

            const boiler = HotWaterController.getInstance();
            const nibe1155 = Nibe1155.getInstance();
            const saiameter = PiTechnik.getInstance().getSaiamater('PV Ost/West');
            const gridmeter = this._froniusmeter ? this._froniusmeter.toEnergyMeter('?') : null;
            const boilerValues = boiler ? boiler.lastValidResponse : null;

            const x: IMonitorRecord = {
                createdAt: now,
                calculated: {
                    pvSouthEnergyDaily:     this._pvSouthEnergyDaily.dailyEnergy,
                    saiaDe1Offset:          0,
                    froniusSiteDailyOffset: 0,
                    eOutDaily:              this._eOutDaily.dailyEnergy,
                    eInDaily:               this._eInDaily.dailyEnergy,
                }
            };
            if (this._symo)   { x.froniussymo = this._symo.toObject(); }
            if (gridmeter)    {
                x.gridmeter = gridmeter.toObject();
            }
            if (nibe1155)     { x.nibe1155 = nibe1155.toObject(); }
            if (boilerValues) { x.boiler = boilerValues.value.toObject(); }

            if (saiameter)    {
                x.extPvMeter = { saiameter: saiameter.toEnergyMeter()};
                this._pvEastWestEnergyDaily.setTotalEnergy(saiameter.e1, saiameter.createdAt);
                debug.info('  pvE/W ---> %dW ==> %dWh', saiameter.p, this._pvEastWestEnergyDaily.dailyEnergy);
            }

            if (gridmeter) {
                if (gridmeter.energyTotalImported >= 0) {
                    this._eInDaily.setTotalEnergy(gridmeter.energyTotalImported, gridmeter.createdAt);
                    debug.info('  eIn  ---> %dW ==> %dWh', gridmeter.energyTotalImported, this._eInDaily.dailyEnergy);
                } else if (gridmeter.energyTotal >= 0) {
                    this._eInDaily.setTotalEnergy(gridmeter.activePower, gridmeter.createdAt);
                }
                if (gridmeter.energyTotalExported >= 0) {
                    this._eOutDaily.setTotalEnergy(gridmeter.energyTotalExported, gridmeter.createdAt);
                    debug.info('  eOut ---> %dW ==> %dWh', gridmeter.activePower, this._eOutDaily.dailyEnergy);
                }
            }

            if (this._symo) {
                const pPvS = this._symo.getPvSouthActivePower();
                if (pPvS && pPvS.value >= 0) {
                    this._pvSouthEnergyDaily.accumulateEnergy(pPvS.value, pPvS.at);
                    debug.info('  pvSouth ---> %dW ==> %dWh', pPvS.value, this._pvSouthEnergyDaily.dailyEnergy);
                } else {
                    debug.info('  pvSouth ---> ??W ==> %dWh', this._pvSouthEnergyDaily.dailyEnergy);
                }
                const pBatt = this._symo.getBatteryActivePower();
                if (pBatt) {
                    if (pBatt.value === 0) {
                        this._batInDaily.accumulateEnergy(0, pBatt.at);
                        this._batOutDaily.accumulateEnergy(0, pBatt.at);
                    } else if (pBatt.value < 0) {
                        this._batInDaily.accumulateEnergy(-pBatt.value, pBatt.at);
                        this._batOutDaily.accumulateEnergy(0, pBatt.at);
                    } else if (pBatt.value > 0) {
                        this._batInDaily.accumulateEnergy(0, pBatt.at);
                        this._batOutDaily.accumulateEnergy(pBatt.value, pBatt.at);
                    }
                    debug.info('  pBatt ---> %dW ==> in=%dWh / out=%dWh', pBatt.value, this._batInDaily.dailyEnergy, this._batOutDaily.dailyEnergy );
                }


            }

            const mr = new MonitorRecord(x);
            this.saveTemp(mr);
            // debug.info('%o', mr.toObject());

            // if (dayHasChanged) {
            //     x.calculated.saiaDe1Offset = saiaMeter.de1;
            //     x.calculated.froniusSiteDailyOffset = x.froniusRegister.siteEnergyDay;
            // }
            // if (x.calculated.saiaDe1Offset > saiaMeter.de1) {
            //     x.calculated.saiaDe1Offset = 0;
            // }
            // if (x.calculated.froniusSiteDailyOffset > x.froniusRegister.siteEnergyDay) {
            //     x.calculated.froniusSiteDailyOffset = 0;
            // }
            // this._lastCaclulated = x.calculated;



        // try {
        //     if ( (now.getTime() - this._lastFroniusPoll.getTime()) > this._config.froniusPeriodMillis) {
        //         this._lastFroniusPoll = now;
        //         debug.fine('polling FroniusSymo');
        //         const oldInv = this._symo.inverter;
        //         const oldInvExt = this._symo.inverterExtension;
        //         const oldSto = this._symo.storage;
        //         await Promise.all([
        //             this._symo.readFroniusRegister(),
        //             this._symo.readInverter(),
        //             this._symo.readInverterExtension(),
        //             this._symo.readStorage()]
        //         );
        //         const froReg = this._symo.froniusRegister;
        //         const inv = this._symo.inverter;
        //         const invExt = this._symo.inverterExtension;
        //         const sto = this._symo.storage;

        //         if (oldInvExt && invExt) {
        //             const dt = (invExt.createdAt.getTime() - oldInvExt.createdAt.getTime());
        //             if (dt > 0) {
        //                 const de = invExt.string1_Power * dt  / 1000 / 3600;
        //                 this._pvSouthEnergyDaily =
        //                     invExt.createdAt.getDay() !== oldInvExt.createdAt.getDay() ? de : this._pvSouthEnergyDaily + de;
        //                 if (debug.fine.enabled) {
        //                     debug.fine('String 1 (PV-South): P=%sW, dt=%sms, dE=%sWh, E-day=%sWh  E-site-day=%sWh',
        //                                  sprintf('%7.02f',  invExt.string1_Power), dt,
        //                                  sprintf('%7.03f', de),
        //                                  sprintf('%9.03f', this._pvSouthEnergyDaily),
        //                                  sprintf('%8.01f',  froReg.siteEnergyDay)
        //                               );
        //                 }
        //             }
        //         }
        //         let hasChanged = false;

        //         for (const a in froReg.regs) {
        //             if (!froReg.regs.hasOwnProperty(a)) { continue; }
        //             const addr = +a.substr(1, 3);
        //             if (addr < 500 || addr > 510) { continue; }
        //             const v2 = (<any>inv.regs)[a];
        //             const v1 = (<any>oldInv.regs)[a];
        //             if ( v1 !== v2) {
        //                 debug.finer('froniusRegister changed %s: %s -> %s', a, v1, v2);
        //                 hasChanged = true;
        //             }
        //         }
        //         for (const a in inv.regs) {
        //             if (!inv.regs.hasOwnProperty(a)) { continue; }
        //             const addr = +a.substr(1, 5);
        //             if (addr < 40072 || addr === 40100 || addr === 40102 || addr >= 40110) { continue; }
        //             const v2 = (<any>inv.regs)[a];
        //             const v1 = (<any>oldInv.regs)[a];
        //             if ( v1 !== v2) {
        //                 debug.finer('inverter changed %s: %s -> %s', a, v1, v2);
        //                 hasChanged = true;
        //             }
        //         }
        //         for (const a in invExt.regs) {
        //             if (!invExt.regs.hasOwnProperty(a)) { continue; }
        //             const addr = +a.substr(1, 2);
        //             if (addr < 11 || addr === 25 || addr > 48) { continue; }
        //             const v2 = (<any>invExt.regs)[a];
        //             const v1 = (<any>oldInvExt.regs)[a];
        //             if ( v1 !== v2) {
        //                 debug.finer('InverterExtension changed %s: %s -> %s', a, v1, v2);
        //                 hasChanged = true;
        //             }
        //         }
        //         for (const a in sto.regs) {
        //             if (!sto.regs.hasOwnProperty(a)) { continue; }
        //             const addr = +a.substr(1, 2);
        //             if (addr !== 9 && addr === 12) { continue; }
        //             const v2 = (<any>sto.regs)[a];
        //             const v1 = (<any>oldSto.regs)[a];
        //             if ( v1 !== v2) {
        //                 debug.finer('Storage changed %s: %s -> %s', a, v1, v2);
        //                 hasChanged = true;
        //             }
        //         }
        //     }

        //     // const d = FroniusMeter.getInstance(1);
        //     const d: FroniusMeter = null;
        //     const fm = d instanceof FroniusMeter ? d.toValuesObject() : null;
        //     let saiaMeter: ISaiaAle3Meter;
        //     if (fm) {
        //         const rv = await Promise.all([ PiTechnik.instance.getData() ]);
        //         saiaMeter = rv[0];
        //     } else {
        //         const oldMeter = this._symo.meter;
        //         const rv = await Promise.all([ PiTechnik.instance.getData(), this._symo.readMeter() ]);
        //         saiaMeter = rv[0];
        //         const newMeter = rv[1];
        //         if (newMeter.createdAt.getDay() !== oldMeter.createdAt.getDay()) {
        //             this._eDaily.eInOffset = newMeter.totalImportedEnergy;
        //             this._eDaily.eOutOffset =  newMeter.totalExportedEnergy;
        //         }
        //         this._eDaily.eIn = newMeter.totalImportedEnergy - this._eDaily.eInOffset;
        //         this._eDaily.eOut = newMeter.totalExportedEnergy - this._eDaily.eOutOffset;
        //     }


        //     const x: IMonitorRecordData = {
        //         froniusRegister: this._symo.froniusRegister,
        //         inverter: this._symo.inverter,
        //         nameplate: this._symo.nameplate,
        //         inverterExtension: this._symo.inverterExtension,
        //         storage: this._symo.storage,
        //         extPvMeter: [],
        //         calculated: {
        //             pvSouthEnergyDaily: this._pvSouthEnergyDaily,
        //             saiaDe1Offset: this._lastCaclulated.saiaDe1Offset,
        //             froniusSiteDailyOffset: this._lastCaclulated.froniusSiteDailyOffset,
        //             eInDaily: this._eDaily.eIn,
        //             eOutDaily: this._eDaily.eOut
        //         }
        //     };
        //     if (dayHasChanged) {
        //         x.calculated.saiaDe1Offset = saiaMeter.de1;
        //         x.calculated.froniusSiteDailyOffset = x.froniusRegister.siteEnergyDay;
        //     }
        //     if (x.calculated.saiaDe1Offset > saiaMeter.de1) {
        //         x.calculated.saiaDe1Offset = 0;
        //     }
        //     if (x.calculated.froniusSiteDailyOffset > x.froniusRegister.siteEnergyDay) {
        //         x.calculated.froniusSiteDailyOffset = 0;
        //     }
        //     this._lastCaclulated = x.calculated;

        //     if (fm) {
        //         x.gridmeter = fm;
        //     } else {
        //         x.meter = this._symo.meter;
        //     }
        //     if (saiaMeter) {
        //         x.extPvMeter.push(saiaMeter);
        //     }

        //     const nibe = Nibe1155.getInstance();
        //     if (nibe) {
        //         x.heatpump = {
        //             createdAt: new Date(),
        //             controller: nibe.controller.toObject(),
        //             values: {}
        //         };
        //     }
        //     const strIds = Object.getOwnPropertyNames(Nibe1155ModbusRegisters.regDefById);
        //     for (const strId of strIds) {
        //         const id = +strId;
        //         const v = nibe.values[id];
        //         x.heatpump.values[<Nibe1155ModbusIds>id] = v instanceof Nibe1155Value ? v.toObject() : null;
        //     }

        //     const hwc = HotWaterController.Instance;
        //     if (hwc) {
        //         x.hwcMonitorRecord = hwc.lastValidResponse.value.toObject();
        //     }
        //     this.saveDebugFile(x);
        //     const r = MonitorRecord.create(x);
        //     debug.info('%O', r);
        //     this._history.push(r);
        //     if (this._history.length > 60) {
        //         this._history.splice(0, 1);
        //     }
        //     Statistics.getInstance().handleMonitorRecord(r);
        //     debug.fine('%O', r.toHumanReadableObject());
        //     this.saveTemp(r);

        } catch (err) {
            debug.warn('%e', err);
        }
    }

    private saveTemp (r: MonitorRecord) {
        if (!this._config.tempFile || !this._config.tempFile.path) {
            return;
        }
        try {
            const t: ITempFileRecord = {
                createdAt: new Date(),
                pvSouthEnergyDaily:    this._pvSouthEnergyDaily.toObject(),
                pvEastWestEnergyDaily: this._pvEastWestEnergyDaily.toObject(),
                eInDaily: this._eInDaily.toObject(),
                eOutDaily: this._eOutDaily.toObject(),
                batInDaily: this._batInDaily.toObject(),
                batOutDaily: this._batOutDaily.toObject()
            };
            const tOut = JSON.stringify(t, null, 2) + '\n';
            const backups = this._config.tempFile.backups > 0 ? this._config.tempFile.backups : 1;
            const index = (this._lastTempCnt + 1) % backups;
            this._lastTempCnt = index;
            const fn = this._config.tempFile.path + '.' + index;
            fs.writeFile(fn, tOut, { encoding: 'utf-8' }, (err) => {
                if (err) {
                    debug.warn('tempFile error\n%e', err);
                } else if (debug.fine.enabled) {
                    debug.fine('temp file ' + fn + 'written');
                }
            } );

        } catch (err) {
            debug.warn('tempFile error\n%e', err);
        }
    }

    // private saveDebugFile (x: MonitorRecord) {
    //     if (!this._config.debugFile || !this._config.debugFile.path) { return; }
    //     try {
    //         const ts = new Date();
    //         const tsString = ts.toLocaleTimeString();
    //         if (tsString === this._debugLastTime) { return; }
    //         this._debugLastTime = tsString;
    //         let filename = this._config.debugFile.path;
    //         const now = new Date();
    //         // const date = sprintf('%04d-%02d-%02d', now.getFullYear(), now.getMonth() + 1, now.getDate());
    //         filename = filename.replace(/%Y/g, sprintf('%04d', now.getFullYear()));
    //         filename = filename.replace(/%M/g, sprintf('%02d', now.getMonth() + 1));
    //         filename = filename.replace(/%D/g, sprintf('%02d', now.getDate()));
    //         let s = '';
    //         let t = '"Time"';       s = '"' + tsString + '"';
    //         // t += ',"String1-P/Wh"'; s += sprintf(',"%8.01f"', x.inverterExtension.string1_Power);
    //         // t += ',"String1-V/V"';  s += sprintf(',"%8.01f"', x.inverterExtension.string1_Voltage);
    //         // t += ',"String1_I/A"';  s += sprintf(',"%8.02f"', x.inverterExtension.string1_Current);
    //         // t += ',"PVEW-P/Wh"';    s += sprintf(',"%7.02f"', x.extPvMeter[0].p);
    //         // t += ',"PVS-E/Wh"';    s += sprintf(',"%7.02f"', x.calculated.pvSouthEnergyDaily);
    //         // t += ',"PVEW-E/Wh"';    s += sprintf(',"%7.02f"', x.extPvMeter[0].e2);
    //         t += '\n';

    //         if (!fs.existsSync(filename)) {
    //             fs.writeFileSync(filename, t);
    //         }

    //         s = s.replace(/\./g, ',');
    //         fs.appendFileSync(filename, s + '\n');
    //     } catch (err) {
    //         debug.warn('cannot write debug file...\n%e', err);
    //     }
    // }

}
