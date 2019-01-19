import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { DataService } from '../services/data.service';
import { Subscription } from 'rxjs';
import { MonitorRecord } from '../data/common/home-control/monitor-record';
import { ControllerMode } from '../data/common/hot-water-controller/controller-mode';
import { HeatpumpControllerMode } from '../data/common/nibe1155/nibe1155-controller';

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

            x1 = v.getLoadActivePowerAsNumber();
            if (x1 === null || x2 === null) {
                console.log('getLoadActivePower', x1);
                v1 = { value: '?' };
            } else {
                v1 = { value: Math.round(x1) + 'W' };
            }
            pv.values.push({ key: 'Verbrauch', values: [ v1 ] });

            x1 = v.getPvActivePowerAsNumber();
            if (x1 === null) {
                console.log('getPvSouthActivePower', x1);
                v1 = { value: '?' };
            } else {
                v1 = { value: Math.round(x1) + 'W' };
            }
            x2 = v.getPvEnergyDailyAsNumber();
            if (x2 === null) {
                console.log('getPvSouthEnergyDaily', x2);
                v2 = { value: '?' };
            } else {
                v2 = { value: Math.round(x2 / 10) / 100 + 'kWh' };
            }
            pv.values.push({ key: 'PV', values: [ v1, v2 ]});

            x1 = v.getPvSouthActivePowerAsNumber();
            if (x1 === null) {
                console.log('getPvSouthActivePower', x1);
                v1 = { value: '?' };
            } else {
                v1 = { value: Math.round(x1) + 'W' };
            }
            x2 = v.getPvSouthEnergyDailyAsNumber();
            if (x2 === null) {
                console.log('getPvSouthEnergyDaily', x2);
                v2 = { value: '?' };
            } else {
                v2 = { value: Math.round(x2 / 10) / 100 + 'kWh' };
            }
            pv.values.push({ key: 'PV-S', values: [ v1, v2 ] });

            x1 = v.getPvEastWestActivePowerAsNumber();
            if (x1 === null) {
                console.log('getPvEastWestActivePower', x1);
                v1 = { value: '?' };
            } else {
                v1 = { value: Math.round(x1) + 'W' };
            }
            x2 = v.getPvEastWestEnergyDailyAsNumber();
            if (x2 === null) {
                console.log('getPvEastWestEnergyDaily', x2);
                v2 = { value: '?' };
            } else {
                v2 = { value: Math.round(x2 / 10) / 100 + 'kWh' };
            }
            pv.values.push({ key: 'PV-E/W', values: [ v1, v2 ] });

            x1 = v.getBatteryPowerAsNumber();
            if (x1 === null) {
                console.log('getBatteryPower', x1);
                v1 = { value: '?' };
                v2 = { value: '?' };
            } else {
                v1 = { value: Math.round(x1) + 'W', classes: { bgred: x1 > 0, bggreen: x1 < 0 }  };
                v2 = { value: x1 > 0 ? 'Entladet' : (x1 < 0 ? 'Ladet' : 'Hold') };
            }
            // const s = v.getBatteryStateAsString();
            // if (s === 'CALIBRATING's)
            pv.values.push({ key: 'Bat-P', values: [ v1, v2 ]});

            x1 = v.getBatteryEnergyInPercentAsNumber();
            if (x1 === null) {
                console.log('getBatteryEnergyInPercent', x1);
                v1 = { value: '?' };
            } else {
                v1 = { value: x1 + '%' };
            }
            x2 = v.getBatteryNominalEnergyAsNumber();
            if (x2 === null) {
                console.log('getBatteryNominalEnergy', x2);
                v2 = { value: '?' };
            } else {
                v2 = { value: x2 / 1000 + 'kWh' };
            }

            v3 = { value: v.getBatteryStateAsString() };
            // if (s === 'CALIBRATING's)
            pv.values.push({ key: 'Bat-E', values: [ v1, v2, v3 ]});

            x1 = v.getGridActivePowerAsNumber();
            if (x1 === null) {
                console.log('getGridActivePower', x1);
                v1 = { value: '?' };
                v2 = { value: '?' };
            } else {
                v1 = { value: Math.round(x1) + 'W', classes: { bgred: x1 > 0, bggreen: x1 < 0} };
                v2 = { value: x1 > 0 ? 'Bezug' : 'Lieferung' };
            }
            pv.values.push({ key: 'Netz', values: [ v1, v2 ]});

            x2 = v.getEInDailyAsNumber();
            if (x2 === null) {
                console.log('getEInDaily', x2);
                v2 = { value: '?' };
            } else {
                v2 = { value: (Math.round(x2 / 10) / 100) + 'kWh' };
            }
            x3 = v.getEOutDailyAsNumber();
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

            const mode = n.controller ? n.controller.currentMode : null;
            if (mode === HeatpumpControllerMode.off) {
                nibe.values.push({ key: 'Wärmepumpe', values: [ { value: 'Aus' } ] });

            } else {

                x1 = n ? n.getFSetpointAsNumber() : null;
                if (x1 === null) {
                    console.log('nibe1155.controller.fSetpoint', n.controller);
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
            }

            x1 = n ? n.getBrineInTempAsNumber() : null;
            x2 = n ? n.getBrineOutTempAsNumber() : null;
            x3 = n ? n.getBrinePumpSpeedAsNumber() : null;
            if (x3 > 0) {
            if (x1 === null) {
                    console.log('getBrineInTempAsNumber', x1);
                    v1 = { value: '?' };
                } else {
                    v1 = { value: (Math.round(x1 * 10) / 10) + '°C' };
                }

                if (x2 === null) {
                    console.log('getBrineOutTempAsNumber', x2);
                    v2 = { value: '?' };
                } else {
                    v2 = { value: (Math.round(x2 * 10) / 10) + '°C' };
                }
                if (x3 === null) {
                    console.log('getBrinePumpSpeedAsNumber', x3);
                    v3 = { value: '?' };
                } else {
                    v3 = { value: Math.round(x3) + '%' };
                }
                nibe.values.push({ key: 'Sole', values: [ v1, v2, v3 ]});
            }

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

            x1 = b ? b.getActivePowerAsNumber(20) : null;
            if (x1 === null) {
                console.log('getActivePowerAsNumber', b);
                v1 = { value: '?' };
            } else {
                v1 = { value: Math.round(x1) + 'W' };
            }
            x2 = b ? b.getEnergyDailyAsNumber(20) : null;
            if (x2 === null) {
                console.log('getEnergyDailyAsNumber', b);
                v2 = { value: '?' };
            } else {
                v2 = { value: Math.round(x2 / 10) / 100 + 'kWh' };
            }
            const s1 = b ? b.getModeAsString(20) : null;
            if (s1 === null) {
                v3 = { value: '?' };
            } else {
                v3 = { value: s1 };
            }


            boiler.values.push({ key: 'Boiler', values: [ v1, v2, v3 ]});

            // if (m === null) {
            //     console.log('boiler.monitorRecord', b);
            //     v1 = { value: '?' };
            //     v2 = { value: '?' };
            // } else {
            //     v1 = { value: Math.round(m.activePower.value) + m.activePower.unit };
            //     v2 = { value: m.mode };
            // }


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
