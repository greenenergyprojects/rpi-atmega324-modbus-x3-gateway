
import * as debugsx from 'debug-sx';
const debug: debugsx.IFullLogger = debugsx.createFullLogger('monitor');

import * as fs from 'fs';

import * as nconf from 'nconf';
import { sprintf } from 'sprintf-js';

import { FroniusSymo } from './devices/fronius-symo';
import { PiTechnik } from './devices/pi-technik';
import { Nibe1155 } from './devices/nibe1155';
import { ISaiaAle3Meter } from './data/common/saia-ale3-meter/saia-ale3-meter';
import { Statistics as OldStatistics } from './statistics';
import { Statistics as NewStatistics } from './statistics/statistics';
import { HotWaterController } from './devices/hot-water-controller';
import { Nibe1155ModbusRegisters, Nibe1155ModbusIds } from './data/common/nibe1155/nibe1155-modbus-registers';
import { Nibe1155Value } from './data/common/nibe1155/nibe1155-value';
import { MonitorRecord, IMonitorRecord } from './data/common/home-control/monitor-record';
import { ICalculated } from './data/common/home-control/calculated';
import { FroniusMeterTcp } from './devices/fronius-meter-tcp';
import { IEnergyDaily, EnergyDaily } from './data/common/home-control/energy-daily';
import { Main } from './main';
import { Gateway } from './devices/gateway';

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
    pvSouthEnergy: IEnergyDaily;
    pvSouthEnergyDaily: IEnergyDaily;
    pvEastWestEnergyDaily: IEnergyDaily;
    eInDaily: IEnergyDaily;
    eOutDaily: IEnergyDaily;
    eHeatPumpDaily: IEnergyDaily;
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
    private _pvSouthEnergy: EnergyDaily;
    private _pvSouthEnergyDaily: EnergyDaily;
    private _pvEastWestEnergyDaily: EnergyDaily;
    private _eInDaily: EnergyDaily;
    private _eOutDaily: EnergyDaily;
    private _eHeatPumpDaily: EnergyDaily;
    private _batInDaily: EnergyDaily;
    private _batOutDaily: EnergyDaily;
    private _lastTempCnt = 0;
    private _pvsPBugSpy: PvsBugSpyRecord [] = [];

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
                        if (!this._pvSouthEnergy && o.pvSouthEnergy) {
                            this._pvSouthEnergy = new EnergyDaily(o.pvSouthEnergy);
                            debug.info('found pvSouthEnergy in temp file %s (%o)', fn, this._pvSouthEnergy);
                        } else {
                            debug.warn('missing pvSouthEnergy from temp file %s', fn);
                        }
                    } catch (err) {
                        debug.warn('reading pvSouthEnergy fails...');
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
                        if (!this._eHeatPumpDaily && o.eHeatPumpDaily) {
                            this._eHeatPumpDaily = new EnergyDaily(o.eHeatPumpDaily);
                            debug.info('found eHeatPumpDaily in temp file %s (%o)', fn, this._eHeatPumpDaily);
                        } else {
                            debug.warn('missing eHeatPumpDaily from temp file %s', fn);
                        }
                    } catch (err) {
                        debug.warn('reading eHeatPumpDaily fails...');
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
                if (this._pvEastWestEnergyDaily && this._pvSouthEnergy && this._pvSouthEnergyDaily &&
                    this._eInDaily && this._eOutDaily && this._batInDaily && this._batOutDaily && this._eHeatPumpDaily) {
                    break;
                }
            }
        }
        if (!this._pvEastWestEnergyDaily ) { this._pvEastWestEnergyDaily = new EnergyDaily({ totalEnergy: 0 }); }
        if (!this._pvSouthEnergy) { this._pvSouthEnergy = new EnergyDaily({ totalEnergy: 0 }); }
        if (!this._pvSouthEnergyDaily) { this._pvSouthEnergyDaily = new EnergyDaily({ totalEnergy: 0 }); }
        if (!this._eInDaily) { this._eInDaily = new EnergyDaily({ totalEnergy: 0 }); }
        if (!this._eOutDaily) { this._eOutDaily = new EnergyDaily({ totalEnergy: 0 }); }
        if (!this._eHeatPumpDaily) { this._eHeatPumpDaily = new EnergyDaily({ totalEnergy: 0 }); }
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

    public getLatestMonitorRecord (): MonitorRecord {
        return this._history.length > 0 ? this._history[this._history.length - 1] : null;
    }

    private async handleTimerEvent () {
        debug.finer('handleTimerEvent now = %d', Date.now());

        try {
            const now = new Date();
            const oldLastTimerEvent = this._lastTimerEvent || now;
            const dayHasChanged =  oldLastTimerEvent.getDay() !==  now.getDay();
            let mr: MonitorRecord;
            let mrObj: IMonitorRecord;

            if (Gateway.getInstance().isEnabled()) {
                mr = await Gateway.getInstance().getMonitorRecord();
                if (mr instanceof MonitorRecord) {
                    mrObj = mr.toObject();
                }

            } else {
                const boiler = HotWaterController.getInstance();
                const nibe1155 = Nibe1155.getInstance();
                const saiameter = PiTechnik.getInstance().getSaiamater('PV Ost/West');
                const gridmeter = this._froniusmeter ? this._froniusmeter.toEnergyMeter('?') : null;

                const x: IMonitorRecord = {
                    createdAt: now
                };
                if (this._symo)   { x.froniussymo = this._symo.toObject(); }
                if (gridmeter)    {
                    x.gridmeter = gridmeter.toObject();
                }

                if (nibe1155)     {
                    try {
                        x.nibe1155 = nibe1155.toObject();
                        const pElHeater = nibe1155.getElectricHeaterPowerAsNumber();
                        const pCompressor = nibe1155.getCompressorInPowerAsNumber();
                        const p = (pElHeater >= 0 ? pElHeater : 0) + (pCompressor >=0 ? pCompressor : 0);
                        this._eHeatPumpDaily.accumulateTotalEnergy(p, nibe1155.controller.createdAt);
                        // debug.info('===> NIB1155 controller:\n%o', x.nibe1155.controller);
                        // debug.info('===> NIB1155 %s f=%dHz, P=%dW, tVorlauf=%d°C  tPuffer=%d°C %s %s', nibe1155.controller.currentMode,
                        //             nibe1155.getCompressorFrequencyAsNumber(), nibe1155.getCompressorInPowerAsNumber(),
                        //             nibe1155.getSupplyS1TempAsNumber(), nibe1155.getSupplyTempAsNumber(),
                        //             nibe1155.getOutdoorTemp().valueAsString(true), nibe1155.getDegreeMinutesAsNumber());
                    } catch (err) {
                        debug.warn('%e', err);
                    }
                }

                if (boiler) {
                    const r = boiler.toObject();
                    if (r) {
                        x.boiler = r;
                    }
                }

                if (saiameter)    {
                    x.extPvMeter = { pveastwest: saiameter.toEnergyMeter()};
                    this._pvEastWestEnergyDaily.setTotalEnergy(saiameter.e1, saiameter.createdAt);
                    // debug.info('  pvE/W ---> %dW ==> %dWh', saiameter.p, this._pvEastWestEnergyDaily.dailyEnergy);
                }

                if (gridmeter) {
                    if (gridmeter.energyTotalImported >= 0) {
                        this._eInDaily.setTotalEnergy(gridmeter.energyTotalImported, gridmeter.createdAt);
                        // debug.info('  eIn  ---> %dW ==> %dWh', gridmeter.energyTotalImported, this._eInDaily.dailyEnergy);
                    } else if (gridmeter.energyTotal >= 0) {
                        this._eInDaily.setTotalEnergy(gridmeter.activePower, gridmeter.createdAt);
                    }
                    if (gridmeter.energyTotalExported >= 0) {
                        this._eOutDaily.setTotalEnergy(gridmeter.energyTotalExported, gridmeter.createdAt);
                        // debug.info('  eOut ---> %dW ==> %dWh', gridmeter.activePower, this._eOutDaily.dailyEnergy);
                    }
                }

                const pPvS: { at: Date, value: number } = this._symo ? this._symo.getPvSouthActivePower() : { at: new Date(), value: 0 };
                if (pPvS) {
                    const ie = this._symo.inverterExtension;
                    const dcw_1 = ie.registerValues.getValue(40275);
                    const dcst_1 = ie.registerValues.getValue(40281);
                    if (Array.isArray(this._pvsPBugSpy) && dcst_1 && dcw_1 && dcst_1.value >= 0 && dcw_1.value >= 0) {
                        this._pvsPBugSpy.push({ dcst_1: dcst_1, dcw_1: dcw_1 });
                        while (this._pvsPBugSpy.length > 10) {
                            this._pvsPBugSpy.splice(0, 1);
                        }
                        if (this._pvsPBugSpy.length > 6 && dcw_1.value === 65535 && dcst_1.value === 4) {
                            for (const o of this._pvsPBugSpy) {
                                if (o.dcst_1.value !== dcst_1.value || o.dcw_1.value !== dcw_1.value) {
                                    debug.fine(sprintf('PV-S Spy --> %s: dcw_1=%dW  dcst_1=%d', dcst_1.at.toISOString(), dcw_1.value, dcst_1.value));
                                }
                            }
                        }
                        if (this._pvsPBugSpy.length > 6 && dcw_1.value === 65535 && dcst_1.value === 4) {
                            const pbs0 = this._pvsPBugSpy[0];
                            if (pbs0.dcst_1.value === 3 && pbs0.dcw_1.value === 65535) {
                                debug.warn('Fronius Inverter Exetension Bug, set pvs power to zero');
                                pPvS.value = 0;
                            }
                        }
                    }
                }
                if (this._symo) {
                    const pBatt = this._symo.getBatteryActivePower();

                    if (pPvS && pPvS.value >= 0) {
                        // Fronius Bug, Battery (string 2) leads to wrong PV power (string 1)
                        if (pPvS.value > 0 && pPvS.value < 10 && pBatt && pBatt.value > 100) {
                            debug.finer('Fronius Bug string2/string1 pBatt=%dW pPvS: %sW -> 0W', pBatt.value, pPvS.value);
                            pPvS.value = 0;
                        }
                        this._pvSouthEnergy.accumulateTotalEnergy(pPvS.value, pPvS.at);
                        const before = this._pvSouthEnergyDaily.dailyEnergy;
                        this._pvSouthEnergyDaily.accumulateDailyEnergy(pPvS.value, pPvS.at);
                    } else {

                    }

                    if (pBatt) {
                        if (pBatt.value === 0) {
                            this._batInDaily.accumulateDailyEnergy(0, pBatt.at);
                            this._batOutDaily.accumulateDailyEnergy(0, pBatt.at);
                        } else if (pBatt.value < 0) {
                            this._batInDaily.accumulateDailyEnergy(-pBatt.value, pBatt.at);
                            this._batOutDaily.accumulateDailyEnergy(0, pBatt.at);
                        } else if (pBatt.value > 0) {
                            this._batInDaily.accumulateDailyEnergy(0, pBatt.at);
                            this._batOutDaily.accumulateDailyEnergy(pBatt.value, pBatt.at);
                        }
                        // debug.info(sprintf('  pBatt ---> %.2fW ==> in=%.2fWh / out=%.2fWh',
                        //           pBatt.value, this._batInDaily.dailyEnergy, this._batOutDaily.dailyEnergy ));
                    }
                }

                const froniusSiteDaily = this._symo ? this._symo.getFroniusSiteDaily() : null;
                x.calculated = {
                    createdAt:             new Date(),
                    eOutDaily:             this._eOutDaily.dailyEnergy,
                    eInDaily:              this._eInDaily.dailyEnergy,
                    eHeatPumpDaily:        this._eHeatPumpDaily.dailyEnergy,
                    batOutDaily:           this._batOutDaily.dailyEnergy,
                    batInDaily:            this._batInDaily.dailyEnergy,
                    pvSouthEnergy:         this._pvSouthEnergy.totalEnergy,
                    pvSouthEnergyDaily:    this._pvSouthEnergyDaily.dailyEnergy,
                    pvEastWestEnergyDaily: this._pvEastWestEnergyDaily.dailyEnergy,
                    froniusSiteDaily:      froniusSiteDaily ? froniusSiteDaily.value : null,
                    pPvSouth:              pPvS ? pPvS.value : null
                };

                mr = new MonitorRecord(x);
                mrObj = x;
            }

            if (debug.finest.enabled) {
                debug.finest('new monitorrecord\n%O', mr);
            } else {
                debug.finer('new monitorrecord');
            }

            const w = Main.getInstance().getRunningWorker('statistics');
            if (w) {
                w.send({ monitorRecord: mrObj}, null, (err) => {
                    if (err) {
                        debug.warn('sending monitor record to statistics process fails\n%e', err);
                    }
                });
            }
            this.saveTemp(mr);
            this._history.push(mr);
            if (this._history.length > 60) {
                this._history.splice(0, 1);
            }

            OldStatistics.getInstance().handleMonitorRecord(mr);

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
                pvSouthEnergy: this._pvSouthEnergy.toObject(),
                pvSouthEnergyDaily:    this._pvSouthEnergyDaily.toObject(),
                pvEastWestEnergyDaily: this._pvEastWestEnergyDaily.toObject(),
                eInDaily: this._eInDaily.toObject(),
                eOutDaily: this._eOutDaily.toObject(),
                eHeatPumpDaily: this._eHeatPumpDaily.toObject(),
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
                } else if (debug.finer.enabled) {
                    debug.finer('temp file ' + fn + ' written');
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

interface PvsBugSpyRecord {
    dcst_1: { at: Date, value: number };
    dcw_1: { at: Date, value: number };
}
