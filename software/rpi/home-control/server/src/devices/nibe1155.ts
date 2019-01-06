
import * as debugsx from 'debug-sx';
const debug: debugsx.IFullLogger = debugsx.createFullLogger('devices:Nibe1155');

import * as http from 'http';

import { INibe1155Value, Nibe1155Value } from '../data/common/nibe1155/nibe1155-value';
import { IHttpGetDataMonitorQuery, IHttpGetDataMonitorResponse } from '../data/common/nibe1155/server-http';
import { Nibe1155Controller, HeatpumpControllerMode, INibe1155Controller } from '../data/common/nibe1155/nibe1155-controller';
// import { MonitorRecordNibe1155, IMonitorRecordNibe1155 } from '../data/common/home-control/monitor-record-nibe1155';
import { INibe1155MonitorRecord, Nibe1155MonitorRecord } from '../data/common/nibe1155/nibe1155-monitor-record';
import { Nibe1155ModbusIds, Nibe1155ModbusRegisters } from '../data/common/nibe1155/nibe1155-modbus-registers';


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

    public get controller (): Nibe1155Controller {
        return this._controller;
    }

    public get values ():  { [id: number]: Nibe1155Value } {
        return this._values;
    }

    // **********************************************

    public getSupplyS1Temp (): Nibe1155Value | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['supplyS1Temp'].id; // 40008
        return new Nibe1155MonitorRecord(this._values[id]).getSupplyS1Temp();
    }

    public getSupplyS1TempAsNumber (maxAgeSeconds = 10000): number | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['supplyS1Temp'].id; // 40008
        return new Nibe1155MonitorRecord(this._values[id]).getSupplyS1TempAsNumber();
    }

    public getSupplyS1ReturnTemp (): Nibe1155Value | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['supplyS1ReturnTemp'].id; // 40012
        return new Nibe1155MonitorRecord(this._values[id]).getSupplyS1ReturnTemp();
    }

    public getSupplyS1ReturnTempAsNumber (maxAgeSeconds = 10000): number | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['supplyS1ReturnTemp'].id; // 40012
        return new Nibe1155MonitorRecord(this._values[id]).getSupplyS1ReturnTempAsNumber();
    }

    public getBrineInTemp (): Nibe1155Value | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['brineInTemp'].id; // 40015
        return new Nibe1155MonitorRecord(this._values[id]).getBrineInTemp();
    }

    public getBrineInTempAsNumber (maxAgeSeconds = 10000): number | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['brineInTemp'].id; // 40015
        return new Nibe1155MonitorRecord(this._values[id]).getBrineInTempAsNumber();
    }

    public getBrineOutTemp (): Nibe1155Value | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['brineOutTemp'].id; // 40016
        return new Nibe1155MonitorRecord(this._values[id]).getBrineOutTemp();
    }

    public getBrineOutTempAsNumber (maxAgeSeconds = 10000): number | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['brineOutTemp'].id; // 40016
        return new Nibe1155MonitorRecord(this._values[id]).getBrineOutTempAsNumber();
    }

    public getCondensorOutTemp (): Nibe1155Value | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['condensorOutTemp'].id; // 40017
        return new Nibe1155MonitorRecord(this._values[id]).getCondensorOutTemp();
    }

    public getCondensorOutTempAsNumber (maxAgeSeconds = 10000): number | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['condensorOutTemp'].id; // 40017
        return new Nibe1155MonitorRecord(this._values[id]).getCondensorOutTempAsNumber();
    }

    public getHotGasTemp (): Nibe1155Value | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['hotGasTemp'].id; // 40018
        return new Nibe1155MonitorRecord(this._values[id]).getHotGasTemp();
    }

    public getHotGasTempAsNumber (maxAgeSeconds = 10000): number | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['hotGasTemp'].id; // 40018
        return new Nibe1155MonitorRecord(this._values[id]).getHotGasTempAsNumber();
    }

    public getLiquidLineTemp (): Nibe1155Value | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['liquidLineTemp'].id; // 40019
        return new Nibe1155MonitorRecord(this._values[id]).getLiquidLineTemp();
    }

    public getLiquidLineTempAsNumber (maxAgeSeconds = 10000): number | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['liquidLineTemp'].id; // 40019
        return new Nibe1155MonitorRecord(this._values[id]).getLiquidLineTempAsNumber();
    }

    public getSuctionTemp (): Nibe1155Value | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['suctionTemp'].id; // 40022
        return new Nibe1155MonitorRecord(this._values[id]).getSuctionTemp();
    }

    public getSuctionTempAsNumber (maxAgeSeconds = 10000): number | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['suctionTemp'].id; // 40022
        return new Nibe1155MonitorRecord(this._values[id]).getSuctionTempAsNumber();
    }

    public getSupplyTemp (): Nibe1155Value | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['supplyTemp'].id; // 40071
        return new Nibe1155MonitorRecord(this._values[id]).getSupplyTemp();
    }

    public getSupplyTempAsNumber (maxAgeSeconds = 10000): number | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['supplyTemp'].id; // 40071
        return new Nibe1155MonitorRecord(this._values[id]).getSupplyTempAsNumber();
    }

    public getDegreeMinutes (): Nibe1155Value | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['degreeMinutes'].id; // 43005
        return new Nibe1155MonitorRecord(this._values[id]).getDegreeMinutes();
    }

    public getDegreeMinutesAsNumber (maxAgeSeconds = 10000): number | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['degreeMinutes'].id; // 43005
        return new Nibe1155MonitorRecord(this._values[id]).getDegreeMinutesAsNumber();
    }

    public getCalcSupplyTemp (): Nibe1155Value | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['calcSupplyTemp'].id; // 43009
        return new Nibe1155MonitorRecord(this._values[id]).getCalcSupplyTemp();
    }

    public getCalcSupplyTempAsNumber (maxAgeSeconds = 10000): number | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['calcSupplyTemp'].id; // 43009
        return new Nibe1155MonitorRecord(this._values[id]).getCalcSupplyTempAsNumber();
    }

    public getElectricHeaterPower (): Nibe1155Value | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['electricHeaterPower'].id; // 43084
        return new Nibe1155MonitorRecord(this._values[id]).getElectricHeaterPower();
    }

    public getElectricHeaterPowerAsNumber (maxAgeSeconds = 10000): number | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['electricHeaterPower'].id; // 43084
        return new Nibe1155MonitorRecord(this._values[id]).getElectricHeaterPowerAsNumber();
    }

    public getCompressorFrequency (): Nibe1155Value | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['compressorFrequency'].id; // 43136
        return new Nibe1155MonitorRecord(this._values[id]).getCompressorFrequency();
    }

    public getCompressorFrequencyAsNumber (maxAgeSeconds = 10000): number | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['compressorFrequency'].id; // 43136
        return new Nibe1155MonitorRecord(this._values[id]).getCompressorFrequencyAsNumber();
    }

    public getCompressorInPower (): Nibe1155Value | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['compressorInPower'].id; // 43141
        return new Nibe1155MonitorRecord(this._values[id]).getCompressorInPower();
    }

    public getCompressorInPowerAsNumber (maxAgeSeconds = 10000): number | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['compressorInPower'].id; // 43141
        return new Nibe1155MonitorRecord(this._values[id]).getCompressorInPowerAsNumber();
    }

    public getCompressorState (): Nibe1155Value | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['compressorState'].id; // 43427
        return new Nibe1155MonitorRecord(this._values[id]).getCompressorState();
    }

    public getCompressorStateAsString (maxAgeSeconds = 10000): string | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['compressorState'].id; // 43427
        return new Nibe1155MonitorRecord(this._values[id]).getCompressorStateAsString();
    }

    public getSupplyPumpState (): Nibe1155Value | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['supplyPumpState'].id; // 43431
        return new Nibe1155MonitorRecord(this._values[id]).getSupplyPumpState();
    }

    public getSupplyPumpStateAsString (maxAgeSeconds = 10000): string | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['supplyPumpState'].id; // 43431
        return new Nibe1155MonitorRecord(this._values[id]).getSupplyPumpStateAsString();
    }

    public getBrinePumpState (): Nibe1155Value | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['brinePumpState'].id; // 43433
        return new Nibe1155MonitorRecord(this._values[id]).getBrinePumpState();
    }

    public getBrinePumpStateAsString (maxAgeSeconds = 10000): string | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['brinePumpState'].id; // 43433
        return new Nibe1155MonitorRecord(this._values[id]).getBrinePumpStateAsString();
    }

    public getSupplyPumpSpeed (): Nibe1155Value | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['supplyPumpSpeed'].id; // 40437
        return new Nibe1155MonitorRecord(this._values[id]).getSupplyPumpSpeed();
    }

    public getSupplyPumpSpeedAsNumber (maxAgeSeconds = 10000): number | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['supplyPumpSpeed'].id; // 40437
        return new Nibe1155MonitorRecord(this._values[id]).getSupplyPumpSpeedAsNumber();
    }

    public getBrinePumpSpeed (): Nibe1155Value | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['brinePumpSpeed'].id; // 40439
        return new Nibe1155MonitorRecord(this._values[id]).getBrinePumpSpeed();
    }

    public getBrinePumpSpeedAsNumber (maxAgeSeconds = 10000): number | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['brinePumpSpeed'].id; // 40439
        return new Nibe1155MonitorRecord(this._values[id]).getBrinePumpSpeedAsNumber();
    }

    // ******************************************************************

    public getOutdoorTemp (): Nibe1155Value | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['outdoorTemp'].id; // 40004
        return new Nibe1155MonitorRecord(this._values[id]).getOutdoorTemp();
    }

    public getOutdoorTempAsNumber (maxAgeSeconds = 10000): number | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['outdoorTemp'].id; // 40004
        return new Nibe1155MonitorRecord(this._values[id]).getOutdoorTempAsNumber();
    }

    public getRoomTemp (): Nibe1155Value | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['roomTemp'].id; // 40033
        return new Nibe1155MonitorRecord(this._values[id]).getRoomTemp();
    }

    public getRoomTempAsNumber (maxAgeSeconds = 10000): number | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['roomTemp'].id; // 40033
        return new Nibe1155MonitorRecord(this._values[id]).getRoomTempAsNumber();
    }

    // outdoorTempAverage:     Nibe1155ModbusRegisters.regDefById[40067]
    // currentL1:              Nibe1155ModbusRegisters.regDefById[40079]
    // currentL2:              Nibe1155ModbusRegisters.regDefById[40081]
    // currentL3:              Nibe1155ModbusRegisters.regDefById[40083]

    public getEnergyCompAndElHeater (): Nibe1155Value | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['energyCompAndElHeater'].id; // 42439
        return new Nibe1155MonitorRecord(this._values[id]).getEnergyCompAndElHeater();
    }

    public getEnergyCompAndElHeaterAsNumber (maxAgeSeconds = 10000): number | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['energyCompAndElHeater'].id; // 42439
        return new Nibe1155MonitorRecord(this._values[id]).getEnergyCompAndElHeaterAsNumber();
    }

    public getEnergyCompressor (): Nibe1155Value | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['energyCompressor'].id; // 42447
        return new Nibe1155MonitorRecord(this._values[id]).getEnergyCompressor();
    }

    public getEnergyCompressorAsNumber (maxAgeSeconds = 10000): number | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['energyCompressor'].id; // 42447
        return new Nibe1155MonitorRecord(this._values[id]).getEnergyCompressorAsNumber();
    }

    public getCompFrequTarget (): Nibe1155Value | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['compFrequTarget'].id; // 43182
        return new Nibe1155MonitorRecord(this._values[id]).getCompFrequTarget();
    }

    public getCompFrequTargetAsNumber (maxAgeSeconds = 10000): number | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['compFrequTarget'].id; // 43182
        return new Nibe1155MonitorRecord(this._values[id]).getCompFrequTargetAsNumber();
    }

    // compPower10Min:         Nibe1155ModbusRegisters.regDefById[43375]

    public getCompNumberOfStarts (): Nibe1155Value | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['compNumberOfStarts'].id; // 43416
        return new Nibe1155MonitorRecord(this._values[id]).getCompNumberOfStarts();
    }

    public getCompNumberOfStartsAsNumber (maxAgeSeconds = 10000): number | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['compNumberOfStarts'].id; // 43416
        return new Nibe1155MonitorRecord(this._values[id]).getCompNumberOfStartsAsNumber();
    }

    public getCompTotalOperationTime (): Nibe1155Value | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['compTotalOperationTime'].id; // 43420
        return new Nibe1155MonitorRecord(this._values[id]).getCompTotalOperationTime();
    }

    public getCompTotalOperationTimeAsNumber (maxAgeSeconds = 10000): number | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['compTotalOperationTime'].id; // 43420
        return new Nibe1155MonitorRecord(this._values[id]).getCompTotalOperationTimeAsNumber();
    }

    public getAlarm (): Nibe1155Value | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['alarm'].id; // 45001
        return new Nibe1155MonitorRecord(this._values[id]).getAlarm();
    }

    public getAlarmAsNumber (maxAgeSeconds = 10000): number | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['alarm'].id; // 45001
        return new Nibe1155MonitorRecord(this._values[id]).getAlarmAsNumber();
    }

    public getAlarmAsString (maxAgeSeconds = 10000): string | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['alarm'].id; // 45001
        return new Nibe1155MonitorRecord(this._values[id]).getAlarmAsString();
    }

    // alarmReset:             Nibe1155ModbusRegisters.regDefById[45171]

    public getHeatCurveS1 (): Nibe1155Value | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['heatCurveS1'].id; // 47007
        return new Nibe1155MonitorRecord(this._values[id]).getHeatCurveS1();
    }

    public getHeatCurveS1AsNumber (maxAgeSeconds = 10000): number | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['heatCurveS1'].id; // 47007
        return new Nibe1155MonitorRecord(this._values[id]).getHeatCurveS1AsNumber();
    }

    public getHeatOffsetS1 (): Nibe1155Value | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['heatOffsetS1'].id; // 47011
        return new Nibe1155MonitorRecord(this._values[id]).getHeatOffsetS1();
    }

    public getHeatOffsetS1AsNumber (maxAgeSeconds = 10000): number | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['heatOffsetS1'].id; // 47011
        return new Nibe1155MonitorRecord(this._values[id]).getHeatOffsetS1AsNumber();
    }

    public getSupplyMinS1 (): Nibe1155Value | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['supplyMinS1'].id; // 47015
        return new Nibe1155MonitorRecord(this._values[id]).getSupplyMinS1();
    }

    public getSupplyMinS1AsNumber (maxAgeSeconds = 10000): number | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['supplyMinS1'].id; // 47015
        return new Nibe1155MonitorRecord(this._values[id]).getSupplyMinS1AsNumber();
    }

    public getSupplyMaxS1 (): Nibe1155Value | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['supplyMaxS1'].id; // 47019
        return new Nibe1155MonitorRecord(this._values[id]).getSupplyMaxS1();
    }

    public getSupplyMaxS1AsNumber (maxAgeSeconds = 10000): number | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['supplyMaxS1'].id; // 47019
        return new Nibe1155MonitorRecord(this._values[id]).getSupplyMaxS1AsNumber();
    }

    // ownHeatCurveP7:         Nibe1155ModbusRegisters.regDefById[47020]
    // ownHeatCurveP6:         Nibe1155ModbusRegisters.regDefById[47021]
    // ownHeatCurveP5:         Nibe1155ModbusRegisters.regDefById[47022]
    // ownHeatCurveP4:         Nibe1155ModbusRegisters.regDefById[47023]
    // ownHeatCurveP3:         Nibe1155ModbusRegisters.regDefById[47024]
    // ownHeatCurveP2:         Nibe1155ModbusRegisters.regDefById[47025]
    // ownHeatCurveP1:         Nibe1155ModbusRegisters.regDefById[47026]

    public getRegMaxSupplyDiff (): Nibe1155Value | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['regMaxSupplyDiff'].id; // 47100
        return new Nibe1155MonitorRecord(this._values[id]).getRegMaxSupplyDiff();
    }

    public getRegMaxSupplyDiffAsNumber (maxAgeSeconds = 10000): number | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['regMaxSupplyDiff'].id; // 47100
        return new Nibe1155MonitorRecord(this._values[id]).getRegMaxSupplyDiffAsNumber();
    }

    public getRegMinCompFrequ (): Nibe1155Value | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['regMinCompFrequ'].id; // 47103
        return new Nibe1155MonitorRecord(this._values[id]).getRegMinCompFrequ();
    }

    public getRegMinCompFrequAsNumber (maxAgeSeconds = 10000): number | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['regMinCompFrequ'].id; // 47103
        return new Nibe1155MonitorRecord(this._values[id]).getRegMinCompFrequAsNumber();
    }

    public getRegMaxCompFrequ (): Nibe1155Value | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['regMaxCompFrequ'].id; // 47104
        return new Nibe1155MonitorRecord(this._values[id]).getRegMaxCompFrequ();
    }

    public getRegMaxCompFrequAsNumber (maxAgeSeconds = 10000): number | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['regMaxCompFrequ'].id; // 47104
        return new Nibe1155MonitorRecord(this._values[id]).getRegMaxCompFrequAsNumber();
    }

    public getOperationalMode (): Nibe1155Value | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['operationalMode'].id; // 47137
        return new Nibe1155MonitorRecord(this._values[id]).getOperationalMode();
    }

    public getOperationalModeAsNumber (maxAgeSeconds = 10000): number | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['operationalMode'].id; // 47137
        return new Nibe1155MonitorRecord(this._values[id]).getOperationalModeAsNumber();
    }

    public getOperationalModeAsString (maxAgeSeconds = 10000): string | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['operationalMode'].id; // 47137
        return new Nibe1155MonitorRecord(this._values[id]).getOperationalModeAsString();
    }

    public getSupplyPumpMode (): Nibe1155Value | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['supplyPumpMode'].id; // 47138
        return new Nibe1155MonitorRecord(this._values[id]).getSupplyPumpMode();
    }

    public getSupplyPumpModeAsNumber (maxAgeSeconds = 10000): number | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['supplyPumpMode'].id; // 47138
        return new Nibe1155MonitorRecord(this._values[id]).getSupplyPumpModeAsNumber();
    }

    public getSupplyPumpModeAsString (maxAgeSeconds = 10000): string | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['supplyPumpMode'].id; // 47138
        return new Nibe1155MonitorRecord(this._values[id]).getSupplyPumpModeAsString();
    }

    public getBrinePumpMode (): Nibe1155Value | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['brinePumpMode'].id; // 47139
        return new Nibe1155MonitorRecord(this._values[id]).getBrinePumpMode();
    }

    public getBrinePumpModeAsNumber (maxAgeSeconds = 10000): number | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['brinePumpMode'].id; // 47139
        return new Nibe1155MonitorRecord(this._values[id]).getBrinePumpModeAsNumber();
    }

    public getBrinePumpModeAsString (maxAgeSeconds = 10000): string | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['brinePumpMode'].id; // 47139
        return new Nibe1155MonitorRecord(this._values[id]).getBrinePumpModeAsString();
    }

    public getDmStartHeating (): Nibe1155Value | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['dmStartHeating'].id; // 47206
        return new Nibe1155MonitorRecord(this._values[id]).getDmStartHeating();
    }

    public getDmStartHeatingAsNumber (maxAgeSeconds = 10000): number | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['dmStartHeating'].id; // 47206
        return new Nibe1155MonitorRecord(this._values[id]).getDmStartHeatingAsNumber();
    }


    // addHeatingStep:         Nibe1155ModbusRegisters.regDefById[47209]
    // addHeatingMaxPower:     Nibe1155ModbusRegisters.regDefById[47212]
    // addHeatingFuse:         Nibe1155ModbusRegisters.regDefById[47214]
    // allowAdditiveHeating:   Nibe1155ModbusRegisters.regDefById[47370]
    // allowHeating:           Nibe1155ModbusRegisters.regDefById[47371]
    // stopTempHeating:        Nibe1155ModbusRegisters.regDefById[47375]
    // stopTempAddHeating:     Nibe1155ModbusRegisters.regDefById[47376]
    // dmDiffStartAddHeating:  Nibe1155ModbusRegisters.regDefById[48072]
    // autoHeatMedPumpSpeed:   Nibe1155ModbusRegisters.regDefById[48453]
    // cutOffFrequActivated2:  Nibe1155ModbusRegisters.regDefById[48659]
    // cutOffFrequActivated1:  Nibe1155ModbusRegisters.regDefById[48660]
    // cutOffFrequStart2:      Nibe1155ModbusRegisters.regDefById[48661]
    // cutOffFrequStart1:      Nibe1155ModbusRegisters.regDefById[48662]
    // cutOffFrequStop2:       Nibe1155ModbusRegisters.regDefById[48663]
    // cutOffFrequStop1:       Nibe1155ModbusRegisters.regDefById[48664]



    // *******************************************************************

    public getBrinePumpPowerAsNumber (maxAgeSeconds = 10000): number | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['brinePumpSpeed'].id; // 43439
        return new Nibe1155MonitorRecord(this._values[id]).getBrinePumpPowerAsNumber();
    }

    public getSupplyPumpPowerAsNumber (): number | null {
        const id = <Nibe1155ModbusIds>Nibe1155ModbusRegisters.regDefByLabel['supplyPumpSpeed'].id; // 43437
        return new Nibe1155MonitorRecord(this._values[id]).getSupplyPumpPowerAsNumber();
    }

    // *******************************************************************

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
                debug.finer('no values found, send request for all');
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
                debug.finer('values available, send request values');
                const rv = <INibe1155MonitorRecord>await this.getData({ controller: true, valueIds: 'all' });
                let cnt = 0;
                if (rv.controller) {
                    this._controller = new Nibe1155Controller(rv.controller);
                }
                if (rv.values) {
                    for (const id of Object.getOwnPropertyNames(rv.values)) {
                        const vNew = <INibe1155Value>(<any>rv.values)[id];
                        const v = this._values[+id];
                        if (!v) {
                            debug.warn('cannot find id %s in values, reinit values...', id);
                            await this.handleTimer(true);
                            return;
                        }
                        if (vNew && vNew.valueAt) {
                            v.setRawValue(vNew.rawValue, new Date(vNew.valueAt));
                        }
                        cnt++;
                    }
                }
                debug.finer('%s values updated', cnt);
            } catch (err) {
                this._values = {};
                debug.warn('request for simple values fails\n%e', err);
            }
        }
    }


}


