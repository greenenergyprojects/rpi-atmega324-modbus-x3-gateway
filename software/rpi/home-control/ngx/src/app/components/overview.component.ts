import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { DataService } from '../services/data.service';
import { Subscription } from 'rxjs';
import { MonitorRecord } from '../data/common/home-control/monitor-record';
import { ControllerMode } from '../data/common/hot-water-controller/controller-mode';
import { HeatpumpControllerMode } from '../data/common/nibe1155/nibe1155-controller';
import { sprintf } from 'sprintf-js';

@Component({
    selector: 'app-overview',
    templateUrl: './overview.component.html',
    styles: [`
        .bgred { background-color: #ffcccc; }
        .bggreen { background-color: #ccffcc; }
    `]
})
export class OverviewComponent implements OnInit, OnDestroy {

    public show: IDataBlock [] = [];

    private _monitorValuesSubsciption: Subscription;

    constructor (private dataService: DataService) {
    }

    public ngOnInit () {
        this._monitorValuesSubsciption =
            this.dataService.monitorObservable.subscribe((value) => this.handleMonitorValues(value));
    }

    public ngOnDestroy() {
        this._monitorValuesSubsciption.unsubscribe();
        this._monitorValuesSubsciption = null;
    }


    private handleMonitorValues (v: MonitorRecord) {
        this.show = [];
        if (!v) { return; }

        let x1: number;
        let x2: number;
        let x3: number;
        let x4: number;
        let v1: IValue;
        let v2: IValue;
        let v3: IValue;
        let v4: IValue;

        {
            const pv: IDataBlock = {
                values: []
            };

            x1 = v.getLoadActivePowerAsNumber();
            v1 = typeof x1 !== 'number' ? { value: '?' } : { value: Math.round(x1) + 'W' };
            pv.values.push({ key: 'Verbrauch', values: [ v1 ] });

            x1 = v.getPvActivePowerAsNumber();
            x2 = v.getPvEnergyDailyAsNumber();
            v1 = typeof x1 !== 'number' ? { value: '?' } : { value: Math.round(x1) + 'W' };
            v2 = typeof x2 !== 'number' ? { value: '?' } : { value: sprintf('%.2fkWh', x2 / 1000) };
            pv.values.push({ key: 'PV', values: [ v1, v2 ]});

            x1 = v.getPvSouthActivePowerAsNumber();
            x2 = v.getPvSouthEnergyDailyAsNumber();
            v1 = typeof x1 !== 'number' ? { value: '?' } : { value: Math.round(x1) + 'W' };
            v2 = typeof x2 !== 'number' ? { value: '?' } : { value: sprintf('%.2fkWh', x2 / 1000) };
            pv.values.push({ key: 'PV-S', values: [ v1, v2 ] });

            x1 = v.getPvEastWestActivePowerAsNumber();
            x2 = v.getPvEastWestEnergyDailyAsNumber();
            v1 = typeof x1 !== 'number' ? { value: '?' } : { value: Math.round(x1) + 'W' };
            v2 = typeof x2 !== 'number' ? { value: '?' } : { value: sprintf('%.2fkWh', x2 / 1000) };
            pv.values.push({ key: 'PV-E/W', values: [ v1, v2 ] });

            this.show.push(pv);
        }

        {
            const pv: IDataBlock = { values: [] };

            x1 = v.getBatteryEnergyInPercentAsNumber();
            x2 = v.getBatteryNominalEnergyAsNumber();
            v1 = typeof x1 !== 'number' ? { value: '?' } : { value: Math.round(x1) + '%' };
            v2 = typeof x2 !== 'number' ? { value: '?' } : { value: sprintf('%.1fkWh', x2 / 1000) };
            v3 = { value: v.getBatteryStateAsString() };
            // if (s === 'CALIBRATING')
            pv.values.push({ key: 'Bat-E', values: [ v1, v2, v3 ]});

            x1 = v.getBatteryPowerAsNumber();
            x2 = v.getBatteryEnergyInDailyAsNumber();
            x3 = v.getBatteryEnergyOutDailyAsNumber();
            v1 = typeof x1 !== 'number' ? { value: '?' } : { value: Math.round(x1) + 'W', classes: { bgred: x1 > 0, bggreen: x1 < 0} };
            v2 = typeof x2 !== 'number' ? { value: '?' } : { value: sprintf('%.2fkWh', x2 / 1000) };
            v3 = typeof x3 !== 'number' ? { value: '?' } : { value: sprintf('%.2fkWh', x3 / 1000) };
            pv.values.push({ key: 'P/E(in/out)', values: [ v1, v2, v3 ]});

            this.show.push(pv);
        }

        {
            const pv: IDataBlock = {
                values: []
            };

            x1 = v.getGridActivePowerAsNumber();
            x2 = v.getGridPassivePowerAsNumber();
            x3 = v.getGridPowerFactorAsNumber();
            x4 = v.getGridFrequencyAsNumber();
            v1 = typeof x1 !== 'number' ? { value: '?' } : { value: Math.round(x1) + 'W', classes: { bgred: x1 > 0, bggreen: x1 < 0} };
            v2 = typeof x2 !== 'number' ? { value: '?' } : { value: Math.round(x2) + 'var', classes: { bgred: x2 > 0, bggreen: x2 < 0} };
            v3 = typeof x3 !== 'number' ? { value: '?' } : { value: sprintf('%0.2f', x3 >= 0 ? x3 : -x3) };
            v4 = typeof x4 !== 'number' ? { value: '?' } : { value: sprintf('%0.02fHz', x4) };
            pv.values.push({ key: 'Netz', values: [ v1, v2, v3, v4 ]});

            x1 = v.getEInDailyAsNumber();
            x2 = v.getEOutDailyAsNumber();
            v1 = typeof x1 !== 'number' ? { value: '?' } : { value: sprintf('%.2fkWh', x1 / 1000) };
            v2 = typeof x2 !== 'number' ? { value: '?' } : { value: sprintf('%.2fkWh', x2 / 1000) };
            pv.values.push({ key: 'E-in / E-out', values: [ v1, v2 ]});

            x1 = v.getGridActivePhaseVoltageAsNumber(1);
            x2 = v.getGridActivePhaseVoltageAsNumber(2);
            x3 = v.getGridActivePhaseVoltageAsNumber(3);
            v1 = typeof x1 !== 'number' ? { value: '?' } : { value: sprintf('%.1fV', x1) };
            v2 = typeof x2 !== 'number' ? { value: '?' } : { value: sprintf('%.1fV', x2) };
            v3 = typeof x3 !== 'number' ? { value: '?' } : { value: sprintf('%.1fV', x3) };
            pv.values.push({ key: 'V-Lx', values: [ v1, v2, v3 ]});

            x1 = v.getGridActivePhasePowerAsNumber(1);
            x2 = v.getGridActivePhasePowerAsNumber(2);
            x3 = v.getGridActivePhasePowerAsNumber(3);
            v1 = typeof x1 !== 'number' ? { value: '?' } : { value: Math.round(x1 * 100) / 100 + 'W', classes: { bgred: x1 > 0, bggreen: x1 < 0} };
            v2 = typeof x2 !== 'number' ? { value: '?' } : { value: Math.round(x2 * 100) / 100 + 'W', classes: { bgred: x2 > 0, bggreen: x2 < 0} };
            v3 = typeof x3 !== 'number' ? { value: '?' } : { value: Math.round(x3 * 100) / 100 + 'W', classes: { bgred: x3 > 0, bggreen: x3 < 0} };
            pv.values.push({ key: 'P-Lx', values: [ v1, v2, v3 ]});

            x1 = v.getGridPassivePhasePowerAsNumber(1);
            x2 = v.getGridPassivePhasePowerAsNumber(2);
            x3 = v.getGridPassivePhasePowerAsNumber(3);
            v1 = typeof x1 !== 'number' ? { value: '?' } : { value: Math.round(x1 * 100) / 100 + 'var' };
            v2 = typeof x1 !== 'number' ? { value: '?' } : { value: Math.round(x2 * 100) / 100 + 'var' };
            v3 = typeof x1 !== 'number' ? { value: '?' } : { value: Math.round(x3 * 100) / 100 + 'var' };
            pv.values.push({ key: 'Q-Lx', values: [ v1, v2, v3 ]});

            this.show.push(pv);
        }

        {
            const boiler: IDataBlock = {
                values: []
            };
            const b = v.boiler;

            x1 = b ? b.getActivePowerAsNumber(20) : null;
            x2 = b ? b.getEnergyDailyAsNumber(20) : null;
            const s1 = b ? b.getModeAsString(20) : null;
            const s2 = s1 !== 'smart' ? '' : ' (' + b.controller.parameter.smart.minEBatPercent + '%)';
            v1 = typeof x1 !== 'number' ? { value: '?' } : { value: Math.round(x1) + 'W' };
            v2 = typeof x2 !== 'number' ? { value: '?' } : { value: sprintf('%.2fkWh', x2 / 1000) };
            v3 = typeof s1 !== 'string' ? { value: '?' } : { value: s1 + s2 };
            boiler.values.push({ key: 'Boiler', values: [ v1, v2, v3 ]});

            this.show.push(boiler);
        }

        {
            const nibe: IDataBlock = {
                values: []
            };
            const n = v.nibe1155;
            const mode = n.controller ? n.controller.currentMode : null;

            x1 = n ? n.getCompressorFrequencyAsNumber() : null;
            x2 = n ? n.getSupplyPumpSpeedAsNumber() : null;
            x3 = n ? n.getBrinePumpSpeedAsNumber() : null;
            if (mode === HeatpumpControllerMode.off) {
                const status = x1 > 0 ? '???' : ( x2 > 0 || x3  > 0 ? 'Kalibrierung' : 'Aus');
                nibe.values.push({ key: 'Wärmepumpe', values: [ { value: status } ] });
            } else {
                x1 = n ? n.getFSetpointAsNumber() : null;
                v1 = typeof x1 !== 'number' ? { value: '?' } : { value: sprintf('%.1fHz', x1) };
                nibe.values.push({ key: 'Heizung f-Soll', values: [ v1 ] });
            }

            x1 = n ? n.getSupplyTempAsNumber() : null;
            x2 = n ? n.getOutdoorTempAsNumber() : null;
            v1 = typeof x1 !== 'number' ? { value: '?' } : { value: sprintf('%.1f°C', x1) };
            v2 = typeof x2 !== 'number' ? { value: '?' } : { value: sprintf('%.1f°C', x2) };
            nibe.values.push({ key: 'Puffer / Außen', values: [ v1, v2 ] });

            x1 = n ? n.getSupplyS1TempAsNumber() : null;
            x2 = n ? n.getSupplyS1ReturnTempAsNumber() : null;
            x3 = n ? n.getSupplyPumpSpeedAsNumber() : null;
            v1 = typeof x1 !== 'number' ? { value: '?' } : { value: sprintf('%.1f°C', x1) };
            v2 = typeof x2 !== 'number' ? { value: '?' } : { value: sprintf('%.1f°C', x2) };
            v3 = typeof x3 !== 'number' ? { value: '?' } : { value: sprintf('%.1f%%', x3) };
            if (mode !== HeatpumpControllerMode.off || x3 > 0) {
                nibe.values.push({ key: 'Vorl. / Rückl.', values: [ v1, v2, v3 ]});
            }

            x1 = n ? n.getCompressorFrequencyAsNumber() : null;
            x2 = n ? n.getCompressorInPowerAsNumber() : null;
            x3 = n ? n.getCondensorOutTempAsNumber() : null;
            v1 = typeof x1 !== 'number' ? { value: '?' } : { value: Math.round(x1) + 'Hz' };
            v2 = typeof x2 !== 'number' ? { value: '?' } : { value: Math.round(x2) + 'W' };
            v3 = typeof x3 !== 'number' ? { value: '?' } : { value: sprintf('%.01f°C', x3) };
            if (mode !== HeatpumpControllerMode.off || x1 > 0) {
                nibe.values.push({ key: 'Kompressor', values: [ v3, v1, v2 ]});
            }

            x1 = n ? n.getBrineInTempAsNumber() : null;
            x2 = n ? n.getBrineOutTempAsNumber() : null;
            x3 = n ? n.getBrinePumpSpeedAsNumber() : null;
            v1 = typeof x1 !== 'number' ? { value: '?' } : { value: sprintf('%.1f°C', x1) };
            v2 = typeof x2 !== 'number' ? { value: '?' } : { value: sprintf('%.1f°C', x2) };
            v3 = typeof x3 !== 'number' ? { value: '?' } : { value: sprintf('%.1f%%', x3) };
            if (mode !== HeatpumpControllerMode.off || x3 > 0) {
                nibe.values.push({ key: 'Sole', values: [ v1, v2, v3 ]});
            }

            x1 = v.getHeatpumpEnergyDailyAsNumber();
            x2 = n ? n.getEnergyCompAndElHeaterAsNumber() : null;
            v1 = typeof x1 !== 'number' ? { value: '?' } : { value: sprintf('%.3fkWh', x1 / 1000) };
            v2 = typeof x2 !== 'number' ? { value: '?' } : { value: sprintf('%.2fMWh', x2 / 1000) };
            nibe.values.push({ key: 'E-In / Wärme', values: [ v1, v2 ]});

            this.show.push(nibe);

        }


    }

}

interface IValue {
    value: string;
    classes?: {
        bgred?: boolean,
        bggreen?: boolean
    };
}

interface IData {
    key: string;
    values: IValue [];
}

interface IDataBlock {
    values: IData [];
}
