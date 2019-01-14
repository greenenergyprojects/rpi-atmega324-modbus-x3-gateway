// https://ng-bootstrap.github.io/#/components/accordion/api
// https://ng-bootstrap.github.io/#/components/accordion/examples

import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { NgbPanelChangeEvent, NgbAccordion } from '@ng-bootstrap/ng-bootstrap';
import { DataService } from '../services/data.service';
import { ConfigService } from '../services/config.service';
import { Subscription } from 'rxjs';
import { sprintf } from 'sprintf-js';
import { MonitorRecord } from '../data/common/home-control/monitor-record';
import { stringify } from 'querystring';

@Component({
    selector: 'app-boiler',
    templateUrl: 'boiler.component.html',
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
export class BoilerComponent implements OnInit, OnDestroy {

    @ViewChild('acc') accComponent: NgbAccordion;
    public accordion: IAccordion;

    private _accordionData: {
        activeIds:  string | string [];
        panel:      IAccordionPanel;
        overview:   IAccordionPanel;
    };

    private _timer: any;
    private _subsciption: Subscription;
    private _monitorValuesSubsciption: Subscription;

    public constructor (private _dataService: DataService, private _configService: ConfigService) {
        // console.log('constructor');
        const x = this._configService.pop('boiler:__accordionData');
        if (x) {
            this._accordionData = x;
        } else {
            this._accordionData = {
                activeIds: [],
                panel: {
                    id: 'boiler-controller',
                    title: 'Boiler Steuerung',
                    // type: 'success',
                    infos: [],
                    showComponent: [ { name: 'BoilerControllerComponent', config: null, data: null } ]
                },
                overview: {
                    id: 'boiler-overview',
                    title: 'Boiler Überblick',
                    infos: []
                }
            };
        }
    }

    public ngOnInit () {
        console.log('BoilerComponent:onInit()');
        this.accordion = {
            activeIds: this._accordionData.activeIds,
            panels:    [ this._accordionData.panel, this._accordionData.overview ]
        };
        if (!Array.isArray(this._accordionData.activeIds) || this._accordionData.activeIds.length === 0) {
            this._accordionData.activeIds = [ 'boiler-overview' ];
            this.accordion.activeIds = this._accordionData.activeIds;
        }
        this._monitorValuesSubsciption =
            this._dataService.monitorObservable.subscribe((value) => this.handleMonitorValues(value));

    }

    public ngOnDestroy() {
        console.log('BoilerComponent:onDestroy()');
        if (this._timer) {
            clearInterval(this._timer);
            this._timer = null;
        }
        if (this._subsciption) {
            this._subsciption.unsubscribe();
            this._subsciption = null;
        }
        this._configService.push('boiler:__accordionData', this._accordionData);
        this._monitorValuesSubsciption.unsubscribe();
        this._monitorValuesSubsciption = null;
    }

    public onAccordionChange (event: NgbPanelChangeEvent) {
        setTimeout(() => {
            this._accordionData.activeIds = this.accComponent.activeIds;
        }, 0);
    }

    public onAccordionOpenChanged (acc: IAccordion, open: boolean) {
        console.log(acc, open);
    }

    private isExpired (d: Date | string | number, milliSeconds, defaultValue = true): boolean {
        try {
            if (d instanceof Date) {
                return (Date.now() - d.getTime()) > milliSeconds;
            }
            if (typeof d === 'number' && d > 0) {
                return (Date.now() - d) > milliSeconds;
            }
            if (typeof d === 'string') {
                d = new Date(d);
                return (Date.now() - d.getTime()) > milliSeconds;
            }
            throw new Error('not a Date');
        } catch (err) {
            console.log('ERROR: not a valid date/time', d, err);
            return defaultValue;
        }
    }

    private timeStampAsString (d: Date | string | number): string {
        try {
            const x = d instanceof Date ? d : new Date(<any>d);
            return sprintf('%02d:%02d:%02d', x.getHours(), x.getMinutes(), x.getSeconds());
        } catch (err) {
            console.log('ERROR: not a valid date/time', d, err);
            return '?';
        }
    }

    private handleMonitorValues (v: MonitorRecord) {
        // console.log(v.hwcMonitorRecord);
        this.handleOverview(v);
    }


    private ageToString (at: Date): string {
        if (!(at instanceof Date)) {
            return 'time ?';
        }
        let dt = Date.now() - at.getTime();
        let sign = 1;
        if (dt < 0) {
            dt = -dt;
            sign = -1;
        }
        // console.log(dt);
        const h = Math.floor(dt / 1000 / 60 / 60); dt = dt - h * 60 * 60 * 1000;
        const m = Math.floor(dt / 1000 / 60); dt = dt - m * 60 * 1000;
        const s = Math.floor(dt / 1000); dt = dt - s * 1000;
        const ms = dt;
        // console.log(h, m, s, ms);

        let rv: string;
        if (h !== 0) {
            rv = sprintf('%dhrs %dmin', h, m);
        } else if (m !== 0) {
            rv = sprintf('%dmin %ds', m, s);
        } else if (s !== 0) {
            rv = sprintf('%.01fs', s + ms / 1000);
        } else {
            rv = sprintf('%dms', ms);
        }
        if (sign === -1) {
            rv = '-' + rv;
        }
        return rv;
    }

    private handleOverview (v?: MonitorRecord) {
        const a = this._accordionData.overview;
        const x: { [ key: string ]: string } = {};
        x['Leistung'] = '?';
        x['Modus'] = '?';
        x['Energie(Tag)'] = '?';
        x['4..20mA Soll'] = '?';
        x['4..20mA Ist'] = '?';

        // console.log(v.boiler);

        for (const att of Object.getOwnPropertyNames(x)) {
            let val = '?';
            try {
                switch (att) {
                    case 'Leistung': {
                        const o = v.boiler.monitorRecord;
                        if (o && o.activePower) {
                            const dt = Date.now() - o.activePower.createdAt.getTime();
                            if (dt < 10000) {
                                val = '' + Math.round(o.activePower.value) + 'W (' + this.ageToString(o.createdAt) + ')';
                                break;
                            }
                        }
                        val = '?';
                        break;
                    }
                    case 'Modus': {
                        const m = v.boiler.monitorRecord;
                        val = m.mode + ' (' + this.ageToString(m.createdAt) + ')';
                        break;
                        break;
                    }
                    case 'Energie(Tag)': {
                        const o = v.boiler.monitorRecord.energyDaily;
                        val = '' + Math.round(o.value) + o.unit + ' (' + this.ageToString(o.createdAt) + ')';
                        break;
                    }
                    case '4..20mA Soll': {
                        const o = v.boiler.monitorRecord.current4to20mA;
                        val = '' + o.setpoint.value + o.setpoint.unit + ' (' + this.ageToString(o.setpoint.createdAt) + ')';
                        break;
                    }
                    case '4..20mA Ist': {
                        const o = v.boiler.monitorRecord.current4to20mA;
                        val = '' + o.current.value + o.current.unit + ' (' + this.ageToString(o.current.createdAt) + ')';
                        break;
                    }
                    default: console.log('unsupported attribute ' + att); break;
                }
            } catch (err) {
                console.log(err);
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
