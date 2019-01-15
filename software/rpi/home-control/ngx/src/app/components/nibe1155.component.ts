// https://ng-bootstrap.github.io/#/components/accordion/api
// https://ng-bootstrap.github.io/#/components/accordion/examples

import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { NgbPanelChangeEvent, NgbAccordion } from '@ng-bootstrap/ng-bootstrap';
import { DataService } from '../services/data.service';
import { ConfigService } from '../services/config.service';
import { Subscription } from 'rxjs';
import { sprintf } from 'sprintf-js';
import { MonitorRecord } from '../data/common/home-control/monitor-record';
import { access } from 'fs';
import { INibe1155ControllerComponentConfig } from './nibe1155-controller.component';
import { HeatpumpControllerMode } from '../data/common/nibe1155/nibe1155-controller';

@Component({
    selector: 'app-nibe1155',
    templateUrl: 'nibe1155.component.html',
    styles: [ `
        .form-group {
            margin-bottom: 0.5rem;
        }
        .input-group {
            margin-bottom: 1rem;
        }
        .input-group input {
            background-color: white;
        }
        .filter {
            min-width: 1rem;
            text-align: center;
        }
        .table-sm {
            font-size: 0.75rem;
        }
    `]
})
export class Nibe1155Component implements OnInit, OnDestroy {

    public accordion: IAccordion;
    @ViewChild('acc') accComponent: NgbAccordion;

    public controllerConfig: INibe1155ControllerComponentConfig;

    private _accordionData: {
        activeIds:  string | string [];
        panel:      IAccordionPanel;
        overview:   IAccordionPanel;
        logsetRegs: IAccordionPanel;
        modbusRegs: IAccordionPanel;
    };

    private _timer: any;
    private _subsciption: Subscription;
    private _monitorValuesSubsciption: Subscription;
    private _lastMonitorRecord: MonitorRecord;


    public constructor (private _dataService: DataService, private _configService: ConfigService) {
        // console.log('constructor');
        this.controllerConfig = {
            mode: HeatpumpControllerMode.frequency,
            fSetpoint: 30
        };

        const x = this._configService.pop('nibe1155:__accordionData');
        if (x) {
            this._accordionData = x;
        } else {
            this._accordionData = {
                activeIds: [],
                panel: {
                    id: 'nibe1155-controller',
                    title: 'Heizung Steuerung',
                    infos: [],
                    showComponent: [ { name: 'Nibe1155ControllerComponent', config: 'controllerConfig', data: null } ]
                },
                overview: {
                    id: 'nibe1155-overview',
                    title: 'Heizung Überblick',
                    infos: []
                },
                logsetRegs: {
                    id: 'nibe1155-logsetRegs',
                    title: 'Logset Register',
                    infos: []
                },
                modbusRegs: {
                    id: 'nibe1155-modbusRegs',
                    title: 'Modbus Register',
                    infos: []
                },

            };
        }
    }

    public ngOnInit () {
        console.log('Nibe1155Component:onInit()');
        this.accordion = {
            activeIds: this._accordionData.activeIds,
            panels:    [ this._accordionData.panel, this._accordionData.overview, this._accordionData.logsetRegs, this._accordionData.modbusRegs ]
        };
        if (!Array.isArray(this._accordionData.activeIds) || this._accordionData.activeIds.length === 0) {
            this._accordionData.activeIds = [ 'nibe1155-overview' ];
            this.accordion.activeIds = this._accordionData.activeIds;
        }
        this._monitorValuesSubsciption =
            this._dataService.monitorObservable.subscribe((value) => this.handleMonitorValues(value));

    }

    public ngOnDestroy() {
        console.log('Nibe1155Component:onDestroy()');
        if (this._timer) {
            clearInterval(this._timer);
            this._timer = null;
        }
        if (this._subsciption) {
            this._subsciption.unsubscribe();
            this._subsciption = null;
        }
        this._configService.push('nibe1155:__accordionData', this._accordionData);
        this._monitorValuesSubsciption.unsubscribe();
        this._monitorValuesSubsciption = null;
    }

    public onAccordionChange (event: NgbPanelChangeEvent) {
        console.log(event);
        if (event && event.panelId === 'nibe1155-controller' && event.nextState === true) {
            if (this._lastMonitorRecord && this._lastMonitorRecord.nibe1155) {
                const mode = this._lastMonitorRecord.nibe1155.getControllerMode();
                if (mode) {
                    this.controllerConfig.mode = HeatpumpControllerMode.frequency;
                }
                const fSetpoint = this._lastMonitorRecord.nibe1155.getControllerFSetpoint();
                if (fSetpoint) {
                    this.controllerConfig.fSetpoint = fSetpoint.value;
                }
            }
        }
        setTimeout(() => {
            this._accordionData.activeIds = this.accComponent.activeIds;
        }, 0);
    }

    // public onAccordionOpenChanged (acc: IAccordion, open: boolean) {
    //     console.log(acc, open);
    // }


    private handleMonitorValues (v: MonitorRecord) {
        // console.log(v.hwcMonitorRecord);
        this._lastMonitorRecord = v;
        this.handleOverview(v);
    }


    private ageToString (at: Date): string {
        if (!(at instanceof Date)) {
            return 'time ?';
        }
        let dt = Date.now() - at.getTime();
        // console.log(dt);
        const h = Math.floor(dt / 1000 / 60 / 60); dt = dt - h * 60 * 60 * 1000;
        const m = Math.floor(dt / 1000 / 60); dt = dt - m * 60 * 1000;
        const s = Math.floor(dt / 1000); dt = dt - s * 1000;
        const ms = dt;
        // console.log(h, m, s, ms);

        if (h !== 0) {
            return sprintf('%dhrs %dmin', h, m);
        } else if (m !== 0) {
            return sprintf('%dmin %ds', m, s);
        } else if (s !== 0) {
            return sprintf('%.01fs', s + ms / 1000);
        } else {
            return sprintf('%dms', ms);
        }
    }

    private handleOverview (v?: MonitorRecord) {
        const a = this._accordionData.overview;
        const x: { [ key: string ]: string } = {};
        x['t-Außen'] = '?';
        x['Modus'] = '?';
        x['P'] = '?';
        x['f-Soll'] = '?';
        x['f-Ist'] = '?';
        x['t-VL'] = '?';
        x['t-RL'] = '?';
        x['t-Puffer'] = '?';

        // console.log(v.boiler);

        for (const att of Object.getOwnPropertyNames(x)) {
            const n = v.nibe1155;
            const dt = Date.now() - n.createdAt.getTime();

            let val = '?';
            if (n && n.controller && dt <= 60000) {
                try {
                    switch (att) {
                        case 'Modus': {
                            const m = n.controller.currentMode;
                            val = m === null ? '?' : m + ' (' + this.ageToString(n.controller.createdAt) + ')';
                            break;
                        }
                        case 'P': {
                            const p = n.getCompressorInPowerAsNumber(60);
                            val = p === null ? '?' : Math.round(p) + 'W (' + this.ageToString(n.getCompressorInPower().valueAt) + ')';
                            break;
                        }
                        case 'f-Soll': {
                            const f = n.controller.fSetpoint;
                            val = f === null ? '?' : f + 'Hz (' + this.ageToString(n.controller.createdAt) + ')';
                            break;
                        }
                        case 'f-Ist': {
                            const f = n.getCompressorFrequencyAsNumber(60);
                            val = f === null ? '?' : Math.round(f * 10) / 10 + 'Hz (' + this.ageToString(n.getCompressorFrequency().valueAt) + ')';
                            break;
                        }
                        case 't-VL': {
                            const t = n.getSupplyS1TempAsNumber(60);
                            val = t === null ? '?' : Math.round(t * 10) / 10 + '°C (' + this.ageToString(n.getSupplyS1Temp().valueAt) + ')';
                            break;
                        }
                        case 't-RL': {
                            const t = n.getSupplyS1ReturnTempAsNumber(60);
                            val = t === null ? '?' : Math.round(t * 10) / 10 + '°C (' + this.ageToString(n.getSupplyS1ReturnTemp().valueAt) + ')';
                            break;
                        }
                        case 't-Puffer': {
                            const t = n.getSupplyTempAsNumber(60);
                            val = t === null ? '?' : Math.round(t * 10) / 10 + '°C (' + this.ageToString(n.getSupplyTemp().valueAt) + ')';
                            break;
                        }
                        case 't-Außen': {
                            const t = n.getOutdoorTempAsNumber(3600);
                            val = t === null ? '?' : Math.round(t * 10) / 10 + '°C (' + this.ageToString(n.getOutdoorTemp().valueAt) + ')';
                            break;
                        }

                        default: console.log('unsupported attribute ' + att); break;
                    }
                } catch (err) {
                    console.log(err);
                }
            }
                x[att] = val;
        }
        a.infos = this.createAccordionInfo(x);
    }

    private isValueOk (v: { valueAt: Date }, timeoutMillis: number) {
        if (!v || !v.valueAt) { return false; }
        return (Date.now() - v.valueAt.getTime()) < timeoutMillis;
    }



    private createAccordionInfo (data: any, width?: string): { key: string, value: string, width: string } [] {
        const rv: { key: string, value: string, width: string } [] = [];
        let kLength = 0;
        for (const k in data) {
            if (!data.hasOwnProperty(k)) { continue; }
            let v = data[k];
            if (v instanceof Date) {
                v = v.toLocaleString();
            }
            rv.push( { key: k, value: v, width: width } );
            kLength = Math.max(kLength, k.length);
        }
        if (!width) {
            const w = (kLength / 2 + 1) + 'rem';
            for (const d of rv) {
                d.width = w;
            }
        }
        return rv;
    }

}


interface IFilter {
    isDisabled: boolean;
    value: string;
    filter: (items: any []) => any [];
}

interface ITableRow {
    id: string;
    text: string [];
}

interface IInfo {
    key: string;
    value: string;
    width: string;
}

interface IAccordion {
    activeIds: string | string [];
    panels: IAccordionPanel [];
}

interface IAccordionPanel {
    id: string;
    title: string;
    type?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger' | 'light' | 'dark';
    infos: IInfo [];
    table?: { headers: string [], rows: ITableRow [] };
    filter?: IFilter;
    showComponent?: { name: string, config?: any, data?: any } [];
}
