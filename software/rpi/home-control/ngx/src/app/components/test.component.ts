import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { DataService } from '../services/data.service';
import { Subscription } from 'rxjs';
import { MonitorRecord } from '../data/common/home-control/monitor-record';
import { ControllerMode } from '../data/common/hot-water-controller/boiler-mode';

@Component({
    selector: 'app-test',
    templateUrl: './test.component.html',
    styles: [`
        .bgred { background-color: #ffcccc; }
        .bggreen { background-color: #ccffcc; }
    `]
})
export class TestComponent implements OnInit, OnDestroy {

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
        let v1: IValue;
        let v2: IValue;
        let v3: IValue;

        {
            const pv: IDataBlock = {
                values: []
            };

            x1 = v.getLoadActivePower();
            if (x1 === null || x2 === null) {
                console.log('getLoadActivePower', x1);
                v1 = { value: '?' };
            } else {
                v1 = { value: Math.round(x1) + 'W' };
            }
            pv.values.push({ key: 'Verbrauch', values: [ v1 ] });

            x1 = v.getPvActivePower();
            if (x1 === null) {
                console.log('getPvSouthActivePower', x1);
                v1 = { value: '?' };
            } else {
                v1 = { value: Math.round(x1) + 'W' };
            }
            x2 = v.getPvEnergyDaily ();
            if (x2 === null) {
                console.log('getPvSouthEnergyDaily', x2);
                v2 = { value: '?' };
            } else {
                v2 = { value: Math.round(x2 / 10) / 100 + 'kWh' };
            }
            pv.values.push({ key: 'PV', values: [ v1, v2 ]});

            x1 = v.getPvSouthActivePower();
            if (x1 === null) {
                console.log('getPvSouthActivePower', x1);
                v1 = { value: '?' };
            } else {
                v1 = { value: Math.round(x1) + 'W' };
            }
            x2 = v.getPvSouthEnergyDaily ();
            if (x2 === null) {
                console.log('getPvSouthEnergyDaily', x2);
                v2 = { value: '?' };
            } else {
                v2 = { value: Math.round(x2 / 10) / 100 + 'kWh' };
            }
            pv.values.push({ key: 'PV-S', values: [ v1, v2 ] });

            x1 = v.getPvEastWestActivePower();
            if (x1 === null) {
                console.log('getPvEastWestActivePower', x1);
                v1 = { value: '?' };
            } else {
                v1 = { value: Math.round(x1) + 'W' };
            }
            x2 = v.getPvEastWestEnergyDaily ();
            if (x2 === null) {
                console.log('getPvEastWestEnergyDaily', x2);
                v2 = { value: '?' };
            } else {
                v2 = { value: Math.round(x2 / 10) / 100 + 'kWh' };
            }
            pv.values.push({ key: 'PV-E/W', values: [ v1, v2 ] });

            x1 = v.getBatteryPower ();
            if (x1 === null) {
                console.log('getBatteryPowerx1');
                v1 = { value: '?' };
                v3 = { value: '?' };
            } else {
                v1 = { value: Math.round(x1) + 'W', classes: { bgred: x1 > 0, bggreen: x1 < 0 }  };
                v3 = { value: x1 >= 0 ? 'Entladet' : 'Ladet' };
            }
            x2 = v.getBatteryEnergyInPercent ();
            if (x2 === null) {
                console.log('getBatteryEnergyInPercent', x2);
                v2 = { value: '?' };
            } else {
                v2 = { value: x2 + '%' };
            }
            pv.values.push({ key: 'Batterie', values: [ v1, v2, v3 ]});

            x1 = v.getGridActivePower ();
            if (x1 === null) {
                console.log('getGridActivePower', x1);
                v1 = { value: '?' };
                v2 = { value: '?' };
            } else {
                v1 = { value: Math.round(x1) + 'W', classes: { bgred: x1 > 0, bggreen: x1 < 0} };
                v2 = { value: x1 > 0 ? 'Bezug' : 'Lieferung' };
            }
            pv.values.push({ key: 'Netz', values: [ v1, v2 ]});

            x2 = v.getEInDaily();
            if (x2 === null) {
                console.log('getEInDaily', x2);
                v2 = { value: '?' };
            } else {
                v2 = { value: (Math.round(x2 / 10) / 100) + 'kWh' };
            }
            x3 = v.getEOutDaily();
            if (x3 === null) {
                console.log('getEOutDaily', x3);
                v3 = { value: '?' };
            } else {
                v3 = { value: (Math.round(x3 / 10) / 100) + 'kWh' };
            }
            pv.values.push({ key: 'E-in / E-out', values: [ v2, v3 ]});

            this.show.push(pv);
        }

        {
            const nibe: IDataBlock = {
                values: []
            };
            const n = v.nibe1155;

            x1 = n ? n.getOutdoorTempAsNumber() : null;
            if (x1 === null) {
                console.log('getOutdoorTempAsNumber', x1);
                v1 = { value: '?' };
            } else {
                v1 = { value: (Math.round(x1 * 10) / 10) + '°C' };
            }
            nibe.values.push({ key: 't-Außen', values: [ v1 ] });

            x1 = n && n.controller ? n.controller.fSetpoint : null;
            if (x1 === null) {
                console.log('getOutdoorTempAsNumber', x1);
                v1 = { value: '?' };
            } else {
                v1 = { value: (Math.round(x1 * 10) / 10) + 'Hz' };
            }
            nibe.values.push({ key: 'f-Sollwert', values: [ v1 ] });

            x1 = n ? n.getCompressorFrequencyAsNumber() : null;
            if (x1 === null) {
                console.log('getCompressorFrequencyAsNumber', x1);
                v1 = { value: '?' };
            } else {
                v1 = { value: (Math.round(x1 * 10) / 10) + 'Hz' };
            }
            x2 = n ? n.getCompressorInPowerAsNumber() : null;
            if (x2 === null) {
                console.log('getCompressorInPowerAsNumber', x2);
                v2 = { value: '?' };
            } else {
                v2 = { value: (Math.round(x2 * 10) / 10) + 'W' };
            }

            nibe.values.push({ key: 'Kompressor', values: [ v1, v2 ]});

            x1 = n ? n.getSupplyS1TempAsNumber() : null;
            if (x1 === null) {
                console.log('getSupplyS1TempAsNumber', x1);
                v1 = { value: '?' };
            } else {
                v1 = { value: Math.round(x1 * 10) / 10 + '°C' };
            }
            x2 = n ? n.getSupplyS1ReturnTempAsNumber() : null;
            if (x2 === null) {
                console.log('getSupplyS1ReturnTempAsNumber', x2);
                v2 = { value: '?' };
            } else {
                v2 = { value: (Math.round(x2 * 10) / 10) + '°C' };
            }
            nibe.values.push({ key: 'Vor/Rücklauf', values: [ v1, v2 ]});

            x1 = n ? n.getBrineInTempAsNumber() : null;
            if (x1 === null) {
                console.log('getBrineInTempAsNumber', x1);
                v1 = { value: '?' };
            } else {
                v1 = { value: (Math.round(x1 * 10) / 10) + '°C' };
            }
            x2 = n ? n.getBrineOutTempAsNumber() : null;
            if (x2 === null) {
                console.log('getBrineOutTempAsNumber', x2);
                v2 = { value: '?' };
            } else {
                v2 = { value: (Math.round(x2 * 10) / 10) + '°C' };
            }
            x3 = n ? n.getBrinePumpSpeedAsNumber() : null;
            if (x3 === null) {
                console.log('getBrinePumpSpeedAsNumber', x3);
                v3 = { value: '?' };
            } else {
                v3 = { value: Math.round(x2) + '%' };
            }
            nibe.values.push({ key: 'Sole', values: [ v1, v2, v3 ]});


            x1 = n ? n.getSupplyTempAsNumber() : null;
            if (x1 === null) {
                console.log('getSupplyTempAsNumber', x1);
                v1 = { value: '?' };
            } else {
                v1 = { value: Math.round(x1 * 10) / 10 + '°C' };
            }
            x2 = n ? n.getSupplyPumpSpeedAsNumber() : null;
            if (x2 === null) {
                console.log('getSupplyPumpSpeedAsNumber', x2);
                v2 = { value: '?' };
            } else {
                v2 = { value: Math.round(x2 * 10) / 10 + '%' };
            }
            nibe.values.push({ key: 'Puffer', values: [ v1, v2 ]});

            x1 = n ? n.getEnergyCompAndElHeaterAsNumber() : null;
            if (x1 === null) {
                console.log('getEnergyCompAndElHeaterAsNumber', x1);
                v1 = { value: '?' };
            } else {
                v1 = { value: Math.round(x1 * 10000) / 10 + 'kWh' };
            }
            nibe.values.push({ key: 'E-Wärme', values: [ v1 ]});

            this.show.push(nibe);

        }

        {
            const boiler: IDataBlock = {
                values: []
            };
            const b = v.boiler;

            const m = b && b.monitorRecord ? b.monitorRecord : null;
            if (m === null) {
                console.log('boiler.monitorRecord', b);
                v1 = { value: '?' };
                v2 = { value: '?' };
            } else {
                v1 = { value: Math.round(m.activePower.value) + m.activePower.unit };
                v2 = { value: m.mode };
            }
            boiler.values.push({ key: 'Boiler', values: [ v1, v2 ]});

            this.show.push(boiler);
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
