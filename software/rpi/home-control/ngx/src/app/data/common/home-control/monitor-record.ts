import { CommonLogger } from '../../common-logger';
import { DataRecord } from '../data-record';

import { sprintf } from 'sprintf-js';
import { IFroniusSymo, FroniusSymo } from '../fronius-symo/fronius-symo';
import { IEnergyMeter, EnergyMeter } from './energy-meter';
// import { IMonitorRecordNibe1155, MonitorRecordNibe1155 } from './monitor-record-nibe1155';
import { IMonitorRecord as IMonitorRecordBoiler , MonitorRecord as MonitorRecordBoiler } from '../hot-water-controller/monitor-record';
import { ICalculated, Calculated } from './calculated';
import { INibe1155MonitorRecord, Nibe1155MonitorRecord } from '../nibe1155/nibe1155-monitor-record';
import { FroniusSymoModel } from '../fronius-symo/fronius-symo-model';
import { FroniusSymoModelInverter } from '../fronius-symo/fronius-symo-model-inverter';
import { Nibe1155Value } from '../nibe1155/nibe1155-value';

export interface IMonitorRecord {
    createdAt:    Date | number | string;
    froniussymo?: IFroniusSymo;
    gridmeter?:   IEnergyMeter;
    nibe1155?:    INibe1155MonitorRecord;
    calculated?:  ICalculated;
    boiler?:      IMonitorRecordBoiler;
    extPvMeter?:  { [ name: string ]: IEnergyMeter };
}

export class MonitorRecord extends DataRecord<IMonitorRecord> implements IMonitorRecord {

    private _createdAt:    Date;
    private _froniussymo?: FroniusSymo;
    private _gridmeter?:   EnergyMeter;
    private _nibe1155?:    Nibe1155MonitorRecord;
    private _boiler?:      MonitorRecordBoiler;
    private _calculated?:  Calculated;
    private _extPvMeter?:  { [ name: string ]: EnergyMeter };


    constructor (data: IMonitorRecord) {
        super(data);
        try {
            const missing = DataRecord.getMissingAttributes( data, [ 'createdAt' ]);
            if (missing) {
                throw new Error('missing attribute ' + missing);
            }
            let attCnt = 0;
            for (const a of Object.getOwnPropertyNames(data)) {
                switch (a) {
                    case 'createdAt':   this._createdAt = DataRecord.parseDate(data, { attribute: a, validate: true } ); break;
                    case 'froniussymo': this._froniussymo = new FroniusSymo(data[a]); break;
                    case 'gridmeter':   this._gridmeter = new EnergyMeter(data[a]); break;
                    case 'nibe1155':    this._nibe1155 = new Nibe1155MonitorRecord(data[a]); break;
                    case 'boiler':      this._boiler = new MonitorRecordBoiler(data[a]); break;
                    case 'calculated':  this._calculated = new Calculated(data[a]); break;
                    case 'extPvMeter': {
                        this._extPvMeter = {};
                        for (const name of Object.getOwnPropertyNames(data.extPvMeter)) {
                            this._extPvMeter[name] = new EnergyMeter(data.extPvMeter[name]);
                        }
                        break;
                    }
                    default: throw new Error('attribute ' + a + ' not found in data:IMonitorRecord');
                }
                attCnt++;
            }
            if (attCnt !== Object.getOwnPropertyNames(this).length) {
                throw new Error('attribute count mismatch');
            }
        } catch (err) {
            throw new MonitorRecordError(data, 'parsing IMonitorRecord fails', err);
        }
    }

    public toObject (preserveDate = true): IMonitorRecord {
        const rv: IMonitorRecord = {
            createdAt: preserveDate ? this._createdAt : this._createdAt.getTime()
        };
        if (this._froniussymo) { rv.froniussymo = this._froniussymo.toObject(preserveDate); }
        if (this._gridmeter)   { rv.gridmeter   = this._gridmeter.toObject(preserveDate); }
        if (this._nibe1155)    { rv.nibe1155    = this._nibe1155.toObject(preserveDate); }
        if (this._boiler)      { rv.boiler      = this._boiler.toObject(preserveDate); }
        if (this._calculated)  { rv.calculated  = this._calculated.toObject(preserveDate); }
        if (this._extPvMeter) {
            rv.extPvMeter = {};
            for (const name of Object.getOwnPropertyNames(this._extPvMeter)) {
                rv.extPvMeter[name] = this._extPvMeter[name].toObject(preserveDate);
            }
        }
        return rv;
    }

    public get createdAt (): Date {
        return this._createdAt;
    }

    public get froniussymo (): FroniusSymo | undefined {
        return this._froniussymo;
    }

    public get gridmeter (): EnergyMeter  | undefined {
        return this._gridmeter;
    }

    public get nibe1155 ():  Nibe1155MonitorRecord | undefined {
        return this._nibe1155;
    }

    public get boiler (): MonitorRecordBoiler | undefined {
        return this._boiler;
    }

    public get calculated (): Calculated | undefined {
        return this._calculated;
    }

    public get extPvMeter (): { [ name: string ]: EnergyMeter } | undefined {
        return this._extPvMeter;
    }

    // *****************************************************

    public getGridActivePhaseVoltageAsNumber (phase: 1 | 2 | 3, maxAgeSeconds = 20): number | null {
        if (!this.gridmeter) { return null; }
        const tMin = Date.now() - maxAgeSeconds * 1000;
        const ts = this._gridmeter.createdAt;
        if (!(ts instanceof Date)  || ts.getTime() < tMin) { return null; }
        return this._gridmeter.voltagePxToN[phase - 1];
    }


    public getGridActivePowerAsNumber (maxAgeSeconds = 20): number | null {
        if (!this.gridmeter) { return null; }
        const tMin = Date.now() - maxAgeSeconds * 1000;
        const ts = this._gridmeter.createdAt;
        if (!(ts instanceof Date)  || ts.getTime() < tMin) { return null; }
        return this._gridmeter.activePower; // >0 ==> get power from grid, <0 -> feed power to grid
    }

    public getGridApparentPowerAsNumber (maxAgeSeconds = 20): number | null {
        if (!this.gridmeter) { return null; }
        const tMin = Date.now() - maxAgeSeconds * 1000;
        const ts = this._gridmeter.createdAt;
        if (!(ts instanceof Date)  || ts.getTime() < tMin) { return null; }
        return this._gridmeter.apparentPower; // >0 ==> get power from grid, <0 -> feed power to grid
    }

    public getGridActivePhasePowerAsNumber (phase: 1 | 2 | 3, maxAgeSeconds = 20): number | null {
        if (!this.gridmeter) { return null; }
        const tMin = Date.now() - maxAgeSeconds * 1000;
        const ts = this._gridmeter.createdAt;
        if (!(ts instanceof Date)  || ts.getTime() < tMin) { return null; }
        return this._gridmeter.activePxPower[phase - 1]; // >0 ==> get power from grid, <0 -> feed power to grid
    }

    public getPvEastWestActivePowerAsNumber (maxAgeSeconds = 20): number | null {
        if (!this._extPvMeter) { return null; }
        const x = <EnergyMeter>this._extPvMeter['pveastwest'];
        if (!x) { return null; }
        const tMin = Date.now() - maxAgeSeconds * 1000;
        const ts = x.createdAt;
        if (!(ts instanceof Date)  || ts.getTime() < tMin) { return null; }
        return x.activePower; // >0 ==> get power from photovoltaik
    }

    public getPvSouthActivePower (): { at: Date, value: number} | null {
        const ie = this.froniussymo ? this.froniussymo.inverterExtension : null;
        if (!ie || !ie.dcw_1 || !(ie.dcw_1.at instanceof Date)) { return null; }
        return ie.dcw_1;
    }

    public getPvSouthActivePowerAsNumber (maxAgeSeconds = 20): number | null {
        if (this._calculated && this._calculated.pPvSouth >= 0) {
            return this._calculated.pPvSouth;
        }
        if (!this.froniussymo || !this.froniussymo.inverterExtension) { return null; }
        const tMin = Date.now() - maxAgeSeconds * 1000;
        const ts = this.froniussymo.inverterExtension.dcw_1.at;
        if (!(ts instanceof Date)  || ts.getTime() < tMin) { return null; }
        if (this.froniussymo.inverterExtension.dcst_1.value !== 4) { return 0; }
        return this.froniussymo.inverterExtension.dcw_1.value;
    }

    public getLoadActivePowerAsNumber (maxAgeSeconds = 20): number | null {
        if (!this.gridmeter) { return null; }
        if (!this.extPvMeter) { return null; }
        if (!this.froniussymo || !this.froniussymo.inverter) { return null; }
        const valueInv = this._froniussymo.inverter.w;
        if (!valueInv) { return null; }
        const tMin = Date.now() - maxAgeSeconds * 1000;

        let ts = valueInv.at;
        if (!(ts instanceof Date)  || ts.getTime() < tMin) { return null; }
        const pInv = valueInv.value;

        ts = this.gridmeter.createdAt;
        if (!(ts instanceof Date)  || ts.getTime() < tMin) { return null; }
        const pGrid = this.gridmeter.activePower;

        const pPvEastWest = this.getPvEastWestActivePowerAsNumber();
        const pBoiler = this.getBoilerActivePowerAsNumber();
        const pHeating = this.getHeatpumpPowerAsNumber();

        let rv = 0;
        let missing = '';

        if (typeof pInv === 'number') {
            rv += pInv;
        } else {
            missing += ',pInv';
        }

        if (pPvEastWest >= 0) {
            rv += pPvEastWest;
        } else {
            missing += ',pPvEastWest';
        }

        if (typeof pGrid === 'number') {
            rv += pGrid;
        } else {
            missing += ',pGrid';
        }

        if (pBoiler >= 0) {
            rv -= pBoiler;
        } else {
            missing += ',pBoiler';
        }

        if (pHeating >= 0) {
            rv -= pHeating;
        } else {
            missing += ',pHeating';
        }

        if (missing) {
            CommonLogger.warn('uncomplete value set for pLoad (missing: %s)', missing.substr(1));
        }

        if (rv < 0) {
            // CommonLogger.warn('pLoad = %s < 0W, force to 0W', rv);
            rv = 0;
        }

        // pGrid      > 0 --> get energy from net
        // pInv       > 0 --> inverter feeds power to net (from battery or pv-south)
        // pvEastWest > 0 --> pv feeds power ot net
        // const rv = pGrid + pInv + pPvEastWest;
        // CommonLogger.info(sprintf('--> load: Grid = %7.1fW  Inv=%7.1f  PV-E/W=%7.1fW   ==>  Load = %.1fW', pGrid, pInv, pPvEastWest, rv));
        return rv; // >= 0W
    }


    public getBatteryPowerAsNumber (maxAgeSeconds = 20, now?: Date): number | null {
        if (!this._froniussymo) { return null; }
        const inv = this._froniussymo.inverter;
        const invEx = this._froniussymo.inverterExtension;
        if (!inv || !inv.registerValues || !invEx || !invEx.registerValues) { return null; }

        now = now || new Date();
        const tMin = now.getTime() - maxAgeSeconds * 1000;
        const ts = inv.registerValues.getMinMaxTimeMillis(invEx.registerValues);
        if (!ts) { return null; }
        const dt = ts.tMax - ts.tMin;
        if (!(dt >= 0 && dt <= 3000) || ts.tMin < tMin) { return null; }

        // const pInv = this._inverter.regs.pf.at ? this._inverter.regs.pf.value : null;
        const pInv = inv.dcw.value;
        let pBatt = (invEx.dcst_2.value === 4) ? invEx.dcw_2.value : 0;
        const pPvSouth = invEx.dcw_1.value;
        if (pInv === null || pBatt === null || pPvSouth === null) { return null; }

        if (pPvSouth > pInv) {
            pBatt = -pBatt;
        }

        return pBatt;
    }

    public getBatteryNominalEnergyAsNumber (maxAgeSeconds = 7000): number | null {
        if (!this._froniussymo) { return null; }
        const np = this._froniussymo.nameplate;
        if (!np || !np.registerValues) { return null; }
        const x = np.whrtg;
        const tMin = Date.now() - maxAgeSeconds * 1000;
        const ts = x.at;
        if (!(ts instanceof Date)  || ts.getTime() < tMin) { return null; }
        return x.value;
    }

    public getBatteryEnergyInPercentAsNumber (maxAgeSeconds = 20): number | null {
        if (!this._froniussymo) { return null; }
        const fronStor = this._froniussymo.storage;
        if (!fronStor || !fronStor.registerValues) { return null; }
        const x = fronStor.chastate;
        const tMin = Date.now() - maxAgeSeconds * 1000;
        const ts = x.at;
        if (!(ts instanceof Date)  || ts.getTime() < tMin) { return null; }
        return x.value;
    }

    public getBatteryStateAsString (maxAgeSeconds = 20): string | null {
        if (!this._froniussymo) { return null; }
        const fronStor = this._froniussymo.storage;
        if (!fronStor || !fronStor.registerValues) { return null; }
        return fronStor.getBatteryStateAsString(maxAgeSeconds);
    }

    public getPvActivePowerAsNumber (maxAgeSeconds = 20): number | null {
        const p1 = this.getPvSouthActivePowerAsNumber(maxAgeSeconds);
        const p2 = this.getPvEastWestActivePowerAsNumber(maxAgeSeconds);
        if (p1 === null || p2 === null) { return null; }
        return p1 + p2;
    }

    public getPvEnergyDailyAsNumber (maxAgeSeconds = 20): number | null {
        const e1 = this.getPvEastWestEnergyDailyAsNumber(maxAgeSeconds);
        const e2 = this.getPvSouthEnergyDailyAsNumber(maxAgeSeconds);
        if (e1 === null || e2 === null) { return null; }
        return e1 + e2;
    }

    public getPvSouthEnergyDailyAsNumber (maxAgeSeconds = 20): number | null {
        if (!this._calculated || typeof this._calculated.pvSouthEnergyDaily !== 'number') { return null; }
        return this._calculated.pvSouthEnergyDaily;
    }

    public getPvEastWestEnergyDailyAsNumber (maxAgeSeconds = 20): number | null {
        if (!this._calculated || typeof this._calculated.pvSouthEnergyDaily !== 'number') { return null; }
        return this._calculated.pvEastWestEnergyDaily;
    }

    public getPvSouthEnergyAsNumber (maxAgeSeconds = 20): number | null {
        if (!this._calculated || typeof this._calculated.pvSouthEnergy !== 'number') { return null; }
        return this._calculated.pvSouthEnergy;
    }

    public getEOutAsNumber (maxAgeSeconds = 20): number | null {
        if (!this.gridmeter) { return null; }
        const tMin = Date.now() - maxAgeSeconds * 1000;
        const ts = this.gridmeter.createdAt;
        if (!(ts instanceof Date)  || ts.getTime() < tMin) { return null; }
        return this.gridmeter.energyTotalExported;
    }

    public getEInAsNumber (maxAgeSeconds = 20): number | null {
        if (!this.gridmeter) { return null; }
        const tMin = Date.now() - maxAgeSeconds * 1000;
        const ts = this.gridmeter.createdAt;
        if (!(ts instanceof Date)  || ts.getTime() < tMin) { return null; }
        return this.gridmeter.energyTotalImported;

    }

    public getEOutDailyAsNumber (maxAgeSeconds = 20): number | null {
        if (!this._calculated || typeof this._calculated.eOutDaily !== 'number') { return null; }
        return this._calculated.eOutDaily;
    }

    public getEInDailyAsNumber (maxAgeSeconds = 20): number | null {
        if (!this._calculated || typeof this._calculated.eInDaily !== 'number') { return null; }
        return this._calculated.eInDaily;
    }

    public getPvEastWestEnergyAsNumber (maxAgeSeconds = 20): number | null {
        if (!this._extPvMeter) { return null; }
        const x = <EnergyMeter>this._extPvMeter['pveastwest'];
        if (!x) { return null; }
        const tMin = Date.now() - maxAgeSeconds * 1000;
        const ts = x.createdAt;
        if (!(ts instanceof Date)  || ts.getTime() < tMin) { return null; }
        return x.energyTotal;
    }

    public getFroniusSiteEnergyAsNumber (maxAgeSeconds = 20): number | null {
        const freg = this._froniussymo.register;
        if (!freg || !freg.registerValues) { return null; }

        const x = freg.f_site_energy_total;
        const tMin = Date.now() - maxAgeSeconds * 1000;
        const ts = x.at;
        if (!(ts instanceof Date)  || ts.getTime() < tMin) { return null; }
        return x.value;
    }

    public getFroniusSiteDailyEnergyAsNumber (maxAgeSeconds = 20): number | null {
        const freg = this._froniussymo.register;
        if (!freg || !freg.registerValues) { return null; }

        const x = freg.f_site_energy_day;
        const tMin = Date.now() - maxAgeSeconds * 1000;
        const ts = x.at;
        if (!(ts instanceof Date)  || ts.getTime() < tMin) { return null; }
        return x.value;
    }


    public getCompresserFrequencyValueAsNumber (maxAgeSeconds = 20): number | null {
        if (!this._nibe1155) { return null; }
        return this._nibe1155.getCompressorFrequencyAsNumber(maxAgeSeconds);
    }

    public getCompresserFrequencyAsNumber (): Nibe1155Value | null {
        if (!this._nibe1155) { return null; }
        return this._nibe1155.getCompressorFrequency();
    }

    public getHeatpumpPowerAsNumber (maxAgeSeconds = 20): number | null {
        const nibe = this._nibe1155;
        if (!nibe || !nibe.values || !nibe.controller) { return null; }
        const x = nibe.getCompressorInPowerAsNumber(maxAgeSeconds);

        if (x === null || Number.isNaN(x)) {
            if (nibe.controller.currentMode === 'off') {
                return 0;
            } else {
                return null;
            }
        }
        return x;
    }

    public getHeatpumpSupplyS1TempAsNumber (maxAgeSeconds = 20): number | null {
        const nibe = this._nibe1155;
        if (!nibe || !nibe.values) { return null; }
        const x = nibe.getSupplyS1TempAsNumber(maxAgeSeconds);
        if (x === null) { return null; }
        return x;
    }

    public getHeatpumpSupplyS1ReturnTempAsNumber (maxAgeSeconds = 20): number | null {
        const nibe = this._nibe1155;
        if (!nibe || !nibe.values) { return null; }
        const x = nibe.getSupplyS1ReturnTempAsNumber(maxAgeSeconds);
        if (x === null) { return null; }
        return x;
    }

    public getHeatpumpSupplyTempAsNumber (maxAgeSeconds = 20): number | null {
        const nibe = this._nibe1155;
        if (!nibe || !nibe.values) { return null; }
        const x = nibe.getSupplyTempAsNumber(maxAgeSeconds);
        if (x === null) { return null; }
        return x;
    }

    public getBrineInTempAsNumber (maxAgeSeconds = 20): number | null {
        const nibe = this._nibe1155;
        if (!nibe || !nibe.values) { return null; }
        const x = nibe.getBrineInTempAsNumber(maxAgeSeconds);
        if (x === null) { return null; }
        return x;
    }

    public getBrineOutTempAsNumber (maxAgeSeconds = 20): number | null {
        const nibe = this._nibe1155;
        if (!nibe || !nibe.values) { return null; }
        const x = nibe.getBrineOutTempAsNumber(maxAgeSeconds);
        if (x === null) { return null; }
        return x;
    }

    public getCompressorFrequencyAsNumber (maxAgeSeconds = 20): number | null {
        const nibe = this._nibe1155;
        if (!nibe || !nibe.values) { return null; }
        const x = nibe.getCompressorFrequencyAsNumber(maxAgeSeconds);
        if (x === null) { return null; }
        return x;
    }

    public getHeatpumpEnergyDailyAsNumber (maxAgeSeconds = 20): number | null {
        if (!this._calculated || typeof this._calculated.eHeatPumpDaily !== 'number') { return null; }
        return this._calculated.eHeatPumpDaily;
    }

    public getBoilerActivePowerAsNumber (maxAgeSeconds = 20): number | null {
        const boiler = this._boiler;
        if (!boiler) { return null; }
        return boiler.getActivePowerAsNumber(maxAgeSeconds);
    }

    public getBoilerEnergyDailyAsNumber (maxAgeSeconds = 20): number | null {
        const boiler = this._boiler;
        if (!boiler) { return null; }
        return boiler.getEnergyDailyAsNumber(maxAgeSeconds);
    }

    public getBoilerEnergyTotalAsNumber (maxAgeSeconds = 20): number | null {
        const boiler = this._boiler;
        if (!boiler) { return null; }
        return boiler.getEnergyTotalAsNumber(maxAgeSeconds);
    }

    public getOutdoorTempAsNumber (maxAgeSeconds = 20): number | null {
        const nibe = this._nibe1155;
        if (!nibe || !nibe.values) { return null; }
        const x = nibe.getOutdoorTempAsNumber();
        if (x === null) { return null; }
        return x;
    }

}

export class MonitorRecordError extends Error {
    constructor (public data: IMonitorRecord, msg: string, public cause?: Error) { super(msg); }
}

interface PvsBugSpyRecord {
    dcst_1: { at: Date, value: number };
    dcw_1: { at: Date, value: number };
}
