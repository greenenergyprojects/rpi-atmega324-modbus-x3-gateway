// add "node_modules/chart.js/dist/Chart.bundle.min.js" in angular.json (architect->build->options->scripts)

// https://www.npmjs.com/package/ng4-charts
// https://www.chartjs.org/
// https://github.com/valor-software/ng2-charts/blob/development/src/charts/charts.ts
// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/chart.js/index.d.ts

import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { BaseChartDirective } from 'ng4-charts';
import * as ngCharts from 'ng4-charts';
import * as Charts from 'chart.js';
import { DataService } from '../services/data.service';
import { Subscription } from 'rxjs';
import { MonitorRecord } from '../data/common/home-control/monitor-record';
import { sprintf } from 'sprintf-js';
import { HistoryService } from '../services/history.service';
import { IArchiveRequest, ArchiveRequest } from '../data/common/home-control/archive-request';
import { StatisticAttribute, Statistics } from '../data/common/home-control/statistics';
import { timeStampAsString } from '../utils/util';
import { ValidatorElement } from '../directives/validator.directive';
import { ISyncButtonConfig } from './sync-button.component';
import { CommonLogger } from '../data/common-logger';

@Component({
    selector: 'app-archive-chart',
    templateUrl: './archive-chart.component.html',
})
export class ArchiveChartComponent implements OnInit, OnDestroy {

    private static defaultPowerAttributes: StatisticAttribute [] = [ 'pGrid', 'pPv',  'pBat', 'pLoad', 'pBoiler', 'pHeatPump' ];

    private static monthNames = [
        'Jänner', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli',
        'August', 'September', 'Oktober', 'November', 'Dezember'
    ];

    private static dayNames = [ 'Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag' ];


    private static chartTypNames: { [ key in TChartTyp ]: string } = {
        power: 'Leistung',
        energy: 'Energie'
    };

    private static chartAverageNames: { [ key in TChartAverage ]: string } = {
        minute: 'Minutenmittel',
        min10:  '10-Minutenmittel',
        hour:   'Stundenmittel',
        day:    'Tagesmittel',
        week:   'Wochenmittel',
        month:  'Monatsmittel',
        year:   'Jahresmittel'
    };

    private static defaultColors: { [ key in StatisticAttribute ]?: ngCharts.Color } = {
        pBoiler:   { borderColor: 'blue', pointRadius: 0 },
        pGrid:     { borderColor: 'black', pointRadius: 0 },
        pBat:      { borderColor: 'orange', pointRadius: 0 },
        pHeatPump: { borderColor: 'saddlebrown', pointRadius: 0 },
        pLoad:     { borderColor: 'red', pointRadius: 0 },
        pPv:       { borderColor: 'green', pointRadius: 3 },
        pPvEW:     { borderColor: 'lightgreen', pointRadius: 0 },
        pPvS:      { borderColor: 'darkgreen', pointRadius: 0 }
    };

    @ViewChild(BaseChartDirective)
    public childChart: ngCharts.BaseChartDirective;

    public chart: INg4Chart;
    public showInputs: IInputConfig<any> [] = [];
    public buttonConfigRefreshNow: ISyncButtonConfig;
    public buttonConfigXDayBack: ISyncButtonConfig;
    public buttonConfigXZoomIn: ISyncButtonConfig;
    public buttonConfigXZoomOut: ISyncButtonConfig;
    public buttonConfigXLeft: ISyncButtonConfig;
    public buttonConfigXRight: ISyncButtonConfig;
    public buttonConfigXPageLeft: ISyncButtonConfig;
    public buttonConfigXPageRight: ISyncButtonConfig;
    public buttonConfigXDayNext: ISyncButtonConfig;

    private _locked: IChartParams = null;
    private _requestCnt: number;
    private _inputTyp: IInputConfig<string>;
    private _inputDay: IInputConfig<string>;
    private _inputMonth: IInputConfig<string>;
    private _inputYear: IInputConfig<string>;
    private _inputHour: IInputConfig<string>;

    private _zoomOptions = [ 0.75, 1.5, 3, 6, 12, 24, 3 * 24, 14 * 24, '1m', '3m', '6m', '1y', '2y', '5y', '10y' ];
    private _currentZoomIndex = 0;
    private _currentTimeResolutionMillis = 5 * 60 * 1000;

    constructor (private dataService: DataService, private historyService: HistoryService) {
        this._requestCnt = 0;

        this.buttonConfigRefreshNow = {
            text: 'Jetzt',
            classes: { default: 'btn-sm btn-primary', onSuccess: 'btn-sm btn-success', onError: 'btn-sm btn-danger' },
            onSuccessTimeoutMillis: 2000,
            onErrorTimeoutMillis: 2000,
            handler: {
                onClick: (cfg) => this.onButtonClick(cfg),
                onCancel: (cfg) => this.onButtonCancel(cfg)
            }
        };

        this.buttonConfigXDayBack = {
            text: 'Tag ',
            icon: 'hand-point-left',
            classes: { default: 'btn-sm btn-primary', onSuccess: 'btn-sm btn-success', onError: 'btn-sm btn-danger' },
            hideSyncIcon: true,
            onSuccessTimeoutMillis: 2000,
            onErrorTimeoutMillis: 2000,
            handler: {
                onClick: (cfg) => this.onButtonClick(cfg),
                onCancel: (cfg) => this.onButtonCancel(cfg)
            }
        };

        this.buttonConfigXPageLeft = {
            icon: 'angle-double-left',
            classes: { default: 'btn-sm btn-primary', onSuccess: 'btn-sm btn-success', onError: 'btn-sm btn-danger' },
            hideSyncIcon: true,
            onSuccessTimeoutMillis: 2000,
            onErrorTimeoutMillis: 2000,
            handler: {
                onClick: (cfg) => this.onButtonClick(cfg),
                onCancel: (cfg) => this.onButtonCancel(cfg)
            }
        };

        this.buttonConfigXLeft = {
            icon: 'angle-left',
            classes: { default: 'btn-sm btn-primary', onSuccess: 'btn-sm btn-success', onError: 'btn-sm btn-danger' },
            hideSyncIcon: true,
            onSuccessTimeoutMillis: 2000,
            onErrorTimeoutMillis: 2000,
            handler: {
                onClick: (cfg) => this.onButtonClick(cfg),
                onCancel: (cfg) => this.onButtonCancel(cfg)
            }
        };


        this.buttonConfigXRight = {
            icon: 'angle-right',
            classes: { default: 'btn-sm btn-primary', onSuccess: 'btn-sm btn-success', onError: 'btn-sm btn-danger' },
            onSuccessTimeoutMillis: 2000,
            onErrorTimeoutMillis: 2000,
            hideSyncIcon: true,
            handler: {
                onClick: (cfg) => this.onButtonClick(cfg),
                onCancel: (cfg) => this.onButtonCancel(cfg)
            }
        };

        this.buttonConfigXPageRight = {
            icon: 'angle-double-right',
            classes: { default: 'btn-sm btn-primary', onSuccess: 'btn-sm btn-success', onError: 'btn-sm btn-danger' },
            onSuccessTimeoutMillis: 2000,
            onErrorTimeoutMillis: 2000,
            hideSyncIcon: true,
            handler: {
                onClick: (cfg) => this.onButtonClick(cfg),
                onCancel: (cfg) => this.onButtonCancel(cfg)
            }
        };

        this.buttonConfigXZoomIn = {
            icon: 'search-plus',
            classes: { default: 'btn-sm btn-primary', onSuccess: 'btn-sm btn-success', onError: 'btn-sm btn-danger' },
            onSuccessTimeoutMillis: 2000,
            onErrorTimeoutMillis: 2000,
            hideSyncIcon: true,
            handler: {
                onClick: (cfg) => this.onButtonClick(cfg),
                onCancel: (cfg) => this.onButtonCancel(cfg)
            }
        };


        this.buttonConfigXZoomOut = {
            icon: 'search-minus',
            classes: { default: 'btn-sm btn-primary', onSuccess: 'btn-sm btn-success', onError: 'btn-sm btn-danger' },
            onSuccessTimeoutMillis: 2000,
            onErrorTimeoutMillis: 2000,
            hideSyncIcon: true,
            handler: {
                onClick: (cfg) => this.onButtonClick(cfg),
                onCancel: (cfg) => this.onButtonCancel(cfg)
            }
        };

        this.buttonConfigXDayNext = {
            text: 'Tag ',
            icon: 'hand-point-right',
            classes: { default: 'btn-sm btn-primary', onSuccess: 'btn-sm btn-success', onError: 'btn-sm btn-danger' },
            hideSyncIcon: true,
            onSuccessTimeoutMillis: 2000,
            onErrorTimeoutMillis: 2000,
            handler: {
                onClick: (cfg) => this.onButtonClick(cfg),
                onCancel: (cfg) => this.onButtonCancel(cfg)
            }
        };



        const typOptions: string [] = [];
        for (const t of Object.getOwnPropertyNames(ArchiveChartComponent.chartTypNames)) {
            typOptions.push(ArchiveChartComponent.chartTypNames[t]);
        }
        this._inputTyp = {
            id: 'typ',
            disabled: false,
            firstLine: null,
            options: typOptions,
            validator: new ValidatorElement<string>('Leistung', (e, n, v) => this.handleInputChange(e, n, v))
        };

        const averageOptions: string [] = [];
        for (const a of Object.getOwnPropertyNames(ArchiveChartComponent.chartAverageNames)) {
            averageOptions.push(ArchiveChartComponent.chartAverageNames[a]);
        }

        this._inputDay = {
            id: 'day',
            disabled: false,
            firstLine: 'Tag...',
            options: [ '1.', '31.' ],
            validator: new ValidatorElement<string>('1.', (e, n, v) => this.handleInputChange(e, n, v))
        };

        this._inputMonth = {
            id: 'month',
            disabled: false,
            firstLine: 'Monat...',
            options: ArchiveChartComponent.monthNames,
            validator: new ValidatorElement<string>('Jänner', (e, n, v) => this.handleInputChange(e, n, v))
        };

        this._inputYear = {
            id: 'year',
            disabled: false,
            firstLine: 'Jahr...',
            options: [ '2019'],
            validator: new ValidatorElement<string>('2019', (e, n, v) => this.handleInputChange(e, n, v))
        };

        const hourOptions: string [] = [];
        for (let h = 0; h < 24; h++) { hourOptions.push(h + ':00'); }
        this._inputHour = {
            id: 'hour',
            disabled: false,
            firstLine: 'Stunde...',
            options: hourOptions,
            validator: new ValidatorElement<string>('12:00', (e, n, v) => this.handleInputChange(e, n, v))
        };

        this.showInputs.push(this._inputTyp);
        this.showInputs.push(this._inputDay);
        this.showInputs.push(this._inputMonth);
        this.showInputs.push(this._inputYear);
        this.showInputs.push(this._inputHour);

    }

    public async ngOnInit () {
        const now = new Date(Date.now() + 5 * 60 * 1000);
        this.updateValidators(now);
        // await this.refreshChart({ typ: 'power', options: { start: new Date(now.getTime() - this._zoomOptions[0] * 60 * 60 * 1000), end: now }});
        await this.refreshChart(this.createChartParameter('power', new Date(), this._zoomOptions[this._currentZoomIndex]));
    }

    public ngOnDestroy() {

    }

    public async onButtonCancel (cfg: ISyncButtonConfig) {
        console.log('cancel', cfg);
    }

    public async onButtonClick(cfg: ISyncButtonConfig): Promise<void> {
        if (this.chart) {
            if (cfg === this.buttonConfigRefreshNow) {
                this._currentZoomIndex = 0;
                this.refresh(+this._zoomOptions[this._currentZoomIndex]);

            } else if (cfg === this.buttonConfigXDayBack) {
                const p = Object.assign({}, this.chart.params);
                p.options.start = new Date(p.options.start.getTime() - 24 * 60 * 60 * 1000);
                p.options.end = new Date(p.options.end.getTime() - 24 * 60 * 60 * 1000);
                this.updateValidators(p.options.end);
                this.refreshChart(p);


            } else if (cfg === this.buttonConfigXPageLeft) {
                const p = Object.assign({}, this.chart.params);
                const dt = p.options.end.getTime() - p.options.start.getTime();
                p.options.start = new Date(p.options.start.getTime() - dt);
                p.options.end = new Date(p.options.end.getTime() - dt);
                this.updateValidators(p.options.end);
                this.refreshChart(p);

            } else if (cfg === this.buttonConfigXLeft) {
                const p = Object.assign({}, this.chart.params);
                const dt = p.options.end.getTime() - p.options.start.getTime();
                p.options.start = new Date(p.options.start.getTime() - this._currentTimeResolutionMillis);
                p.options.end = new Date(p.options.end.getTime() - this._currentTimeResolutionMillis);
                this.updateValidators(p.options.end);
                this.refreshChart(p);

            } else if (cfg === this.buttonConfigXRight) {
                const p = Object.assign({}, this.chart.params);
                const dt = p.options.end.getTime() - p.options.start.getTime();
                p.options.start = new Date(p.options.start.getTime() + this._currentTimeResolutionMillis);
                p.options.end = new Date(p.options.end.getTime() + this._currentTimeResolutionMillis);
                this.updateValidators(p.options.end);
                this.refreshChart(p);

            } else if (cfg === this.buttonConfigXPageRight) {
                const p = Object.assign({}, this.chart.params);
                const dt = p.options.end.getTime() - p.options.start.getTime();
                p.options.start = new Date(p.options.start.getTime() + dt);
                p.options.end = new Date(p.options.end.getTime() + dt);
                console.log('---> ===> ', p.options);
                this.updateValidators(p.options.end);
                this.refreshChart(p);

            } else if (cfg === this.buttonConfigXZoomIn) {
                this._currentZoomIndex = Math.max(0, this._currentZoomIndex - 1);
                console.log('_currentZoomIndex=' + this._currentZoomIndex);
                const nextParams = this.createChartParameter(this.chart.params.typ, this.chart.params.options.end, this._zoomOptions[this._currentZoomIndex]);
                this.updateValidators(nextParams.options.end);
                this.refreshChart(nextParams);

            } else if (cfg === this.buttonConfigXZoomOut) {
                this._currentZoomIndex = Math.min(this._zoomOptions.length - 1, this._currentZoomIndex + 1);
                console.log('_currentZoomIndex=' + this._currentZoomIndex);
                const nextParams = this.createChartParameter(this.chart.params.typ, this.chart.params.options.end, this._zoomOptions[this._currentZoomIndex]);
                this.updateValidators(nextParams.options.end);
                this.refreshChart(nextParams);

            } else if (cfg === this.buttonConfigXDayNext) {
                const p = Object.assign({}, this.chart.params);
                p.options.start = new Date(p.options.start.getTime() + 24 * 60 * 60 * 1000);
                p.options.end = new Date(p.options.end.getTime() + 24 * 60 * 60 * 1000);
                this.updateValidators(p.options.end);
                this.refreshChart(p);
            }


        }
    }

    private createChartParameter (typ: TChartTyp, end: Date, zoom: number | string): IChartParams {
        let start: Date;
        console.log('createChartParameter zoom=' + zoom);
        if (zoom >= 0.5) {
            const dHrs = +zoom;
            start = new Date(end.getTime() - dHrs * 60 * 60 * 1000);

        } else if (typeof zoom === 'string') {
            let dMonth: number = null;
            let dYear: number = null;
            if (zoom.endsWith('m')) {
                dMonth = +zoom.substr(0, zoom.length - 1);
                dYear = 0;
                if (dMonth >= 12) {
                    dYear = Math.floor(dMonth / 12);
                    dMonth = dMonth % 12;
                } else if (typeof dMonth !== 'number' || dMonth < 1) {
                    dMonth = null;
                }

            } else if (zoom.endsWith('y')) {
                dYear = +zoom.substr(0, zoom.length - 1);
                if (typeof dYear !== 'number' ||  dYear <= 0) {
                    dYear = null;
                }
                dMonth = 12 * (dYear - Math.floor(dYear));
                dYear = Math.floor(dYear);
                let year = end.getFullYear() - dYear;
                let month = end.getMonth() - dMonth;
                while (month < 0) {
                    month += 12;
                    year--;
                }
                start = new Date(year, month, 1);
            }

        }
        if (start === undefined) {
            console.log('Warning: zoom not supported ', zoom);
            start = new Date(end.getTime() - 45 * 60 * 1000);
        }

        // return { typ: typ, options: { start: new Date(end.getTime() - 45 * 60 * 1000), end: end } };
        return { typ: typ, options: { start: start, end: end } };
    }


    private updateValidators (ts: Date) {
        this._inputYear.validator.value = sprintf('%04d', ts.getFullYear());
        this._inputMonth.validator.value = ArchiveChartComponent.monthNames[ts.getMonth()];
        const start = new Date(ts.getFullYear(), ts.getMonth(), 1);
        let end = ts.getMonth() <= 10 ? new Date(ts.getFullYear(), ts.getMonth() + 1, 1) : new Date(ts.getFullYear() + 1, 0, 1);
        end = new Date(end.getTime() - 1);
        this._inputDay.options = [];
        for (let d = start.getDate(); d <= end.getDate(); d++) {
            this._inputDay.options.push(d + '.');
        }
        this._inputDay.validator.value = sprintf('%d.', ts.getDate());
        this._inputHour.validator.value = sprintf('%d:00', ts.getHours());
    }

    private refresh (dHours?: number) {
        try {
            console.log('--> refresh');
            if (this.chart) {
                const p = Object.assign({}, this.chart.params);
                const now = new Date(Date.now() + 5 * 60 * 1000);
                let dt: number;
                if (dHours >= 0.5) {
                    dt = dHours * 3600 * 1000;
                } else {
                    dt = p.options ? p.options.end.getTime() - p.options.start.getTime() : 60000000;
                }

                this.updateValidators(now);
                p.options = { start: new Date(now.getTime() - dt), end: now };
                this.refreshChart(p);
            }
        } catch (err) {
            console.log('refresh() fails', err);
            throw err;
        }
    }

    private getType (name: string): TChartTyp {
        if (name === null) { return 'power'; }
        const attributes = Object.getOwnPropertyNames(ArchiveChartComponent.chartTypNames);
        let rv: TChartTyp = <TChartTyp>attributes.find( (item) => name === ArchiveChartComponent.chartTypNames[item]);
        if (!rv) {
            CommonLogger.warn('cannot find chart type for ' + name);
            rv = 'power';
        }
        return rv;
    }

    private getAverage (name: string): TChartAverage {
        if (name === null) { return 'minute'; }
        const attributes = Object.getOwnPropertyNames(ArchiveChartComponent.chartAverageNames);
        let rv: TChartAverage = <TChartAverage>attributes.find( (item) => name === ArchiveChartComponent.chartAverageNames[item]);
        if (!rv) {
            CommonLogger.warn('cannot find chart average for ' + name);
            rv = 'minute';
        }
        return rv;
    }

    private handleInputChange (el: ValidatorElement<string>, name: string, newValue: string) {
        // console.log(el, name, newValue);
        const p = this.chart ? this.chart.params : null;
        let t: TChartTyp;
        // let a: TChartAverage;
        let dStr: string;
        let mStr: string;
        let yStr: string;
        let hStr: string;

        t = this.getType(this._inputTyp.validator.value);
        // a = this.getAverage(this._inputAverage.validator.value);
        dStr = this._inputDay.validator.value;
        mStr = this._inputMonth.validator.value;
        yStr = this._inputYear.validator.value;
        hStr = this._inputHour.validator.value;

        if (el === this._inputTyp.validator) {
            t = this.getType(newValue);
        // } else if (el === this._inputAverage.validator) {
        //     a = this.getAverage(newValue);
        } else if (el === this._inputDay.validator) {
            dStr = newValue;
        } else if (el === this._inputMonth.validator) {
            mStr = newValue;
        } else if (el === this._inputYear.validator) {
            yStr = newValue;
        }  else if (el === this._inputHour.validator) {
            hStr = newValue;
        } else {
            console.log('not supported');
            return;
        }

        const d = dStr ? +dStr.substr(0, dStr.length - 1) : null;
        const m = ArchiveChartComponent.monthNames.findIndex( (item) => item === mStr);
        const y = yStr ? +yStr : null;
        const h = hStr ? +hStr.substr(0, hStr.length - 3) : null;
        // console.log(d, m, y, h);

        if (t === 'power') {
            const dt = p && p.options ? p.options.end.getTime() - p.options.start.getTime() : 60 * 60 * 1000;
            const now = new Date(y, m, d, h);
            this.refreshChart({ typ: t, options: { start: new Date(now.getTime() - dt), end: now} });
        }

    }


    private async refreshChart (p?: IChartParams) {
        // console.log('1---> refreshChart()', p.typ, p.options);
        if (this._locked) {
            this._locked = p;
            return;
        }

        this._locked = p;
        try {
            let average: TChartAverage;

            this._inputTyp.validator.value = ArchiveChartComponent.chartTypNames[p.typ];
            if (!this._inputTyp.validator.value) {
                console.log('unsupported typ value ' + p.typ);
                this._inputTyp.validator.value = ArchiveChartComponent.chartTypNames.power;
            }

            const dHrs = (p.options.end.getTime() - p.options.start.getTime()) / 60 / 60 / 1000;
            if (dHrs <= 2) {
                average = 'minute';
            } else if (dHrs <= 12) {
                average = 'min10';
            } else if (dHrs <= 96) {
                average = 'hour';
            } else if (dHrs <= 24 * 90) {
                average = 'day';
            } else if (dHrs <= 24 * 7 * 90) {
                average = 'week';
            } else {
                average = 'month';
            }
            console.log('2---> refreshChart(): avr=' + average + ', hrs=' + dHrs);

            switch (average) {
                case 'minute': {
                    this._inputYear.disabled = false;
                    this._inputMonth.disabled = false;
                    this._inputDay.disabled = false;
                    this._inputHour.disabled = false;
                    break;
                }
                case 'min10': {
                    this._inputYear.disabled = false;
                    this._inputMonth.disabled = false;
                    this._inputDay.disabled = false;
                    this._inputHour.disabled = false;
                    break;
                }

                case 'hour': {
                    this._inputYear.disabled = false;
                    this._inputMonth.disabled = false;
                    this._inputDay.disabled = false;
                    this._inputHour.disabled = true;
                    break;
                }
                case 'day': {
                    this._inputYear.disabled = false;
                    this._inputMonth.disabled = false;
                    this._inputDay.disabled = true;
                    this._inputHour.disabled = true;
                    break;
                }

                case 'week': {
                    this._inputYear.disabled = false;
                    this._inputMonth.disabled = true;
                    this._inputDay.disabled = true;
                    this._inputHour.disabled = true;
                    break;
                }

                case 'month': {
                    this._inputYear.disabled = false;
                    this._inputMonth.disabled = true;
                    this._inputDay.disabled = true;
                    this._inputHour.disabled = true;
                    break;
                }

                default: {
                    this._inputYear.disabled = true;
                    this._inputMonth.disabled = true;
                    this._inputDay.disabled = true;
                    this._inputHour.disabled = true;
                    break;
                }
            }

            if (p.typ !== null && average !== null) {
                console.log('2--->', this.chart, p);
                this._locked = p;
                if (p.typ === 'power') {
                    switch (average) {
                        case 'minute': {
                            const cpMin = await this.createChartPowerMinute(p);
                            this.chart = cpMin;
                            break;
                        }
                        case 'min10': {
                            const cpMin10 = await this.createChartPowerMin10(p);
                            this.chart = cpMin10;
                            break;
                        }
                        case 'hour': {
                            const cpHour = await this.createChartPowerHour(p);
                            this.chart = cpHour;
                            break;
                        }
                        case 'day': {
                            const cpDay = await this.createChartPowerDay(p);
                            this.chart = cpDay;
                            break;
                        }

                        default: {
                            console.log('unsupported average + ' + average);
                        }
                    }

                } else {
                    console.log('unsupported typ + ' + p.typ);
                }
            }
            this._locked = null;
        } catch (err) {
            CommonLogger.warn('refreshChart() fails\n%e', err);
            if (this._locked !== p) {
                const nextParams = this._locked;
                this._locked = null;
                setTimeout( () => { this.refreshChart(nextParams); }, 0);
            }
            this._locked = null;
        }
        // const cpd = await this.createChartPowerDay([ 'pGrid', 'pPv',  'pBat', 'pLoad', 'pBoiler', 'pHeatPump' ]);
        // const cpm = await this.createChartPowerMonth([ 'pGrid', 'pPv',  'pBat', 'pLoad', 'pBoiler', 'pHeatPump' ]);
        // this.charts.push(cpd);
        // this.charts.push(cpm);
    }

    private async createChartPowerMinute (p: IChartParams, ids?: (StatisticAttribute) []): Promise<INg4Chart> {
        ids = ids || ArchiveChartComponent.defaultPowerAttributes;
        const dm = Math.max( Math.round((p.options.end.getTime() - p.options.start.getTime()) / 1000 / 60), 45);
        const res = dm <= 60 ? 5 : 15;
        this._currentTimeResolutionMillis = res * 60 * 1000;
        const tx = (Math.floor(p.options.end.getTime() / (1000 * 60 * res))) * res;
        const to = new Date(tx * 1000 * 60);
        const from = new Date(to.getTime() - dm * 60 * 1000);
        console.log('createChartPowerMinute()\n from=' + from.toISOString() + '\n   to=' + to.toISOString());

        const x: IArchiveRequest = {
            id:      this._requestCnt++,
            type:    'minute',
            dataIds: ids,
            from:    from,
            to:      to
        };
        const r = await this.dataService.getArchiv(new ArchiveRequest(x));
        const values: { [ key in StatisticAttribute | 'pLoad' ]?: { x: string | Date, y: number}  [] } = {};
        for (let m = -dm; m <= 0; m++) {
            for (const id of ids) {
                const sign = (id === 'pBoiler' || id === 'pHeatPump' || id === 'pLoad') ? -1 : 1;
                const t = new Date(to.getTime() + m * 60 * 1000);
                const coll = Array.isArray(r.result[id]) ? r.result[id].find(
                    (item) => item.start.getMinutes() === t.getMinutes() && item.start.getHours() === t.getHours()) : null;
                if (!Array.isArray(values[id])) {
                    values[id] = [];
                }
                // console.log(m, coll);
                if (coll) {
                    values[id].push({ x: t.toISOString(), y: sign * coll.twa });
                } else {
                    values[id].push({ x: t.toISOString(), y: null });
                }
            }
        }

        const chart1Options: Charts.ChartOptions = {
            responsive: true,
            title: {
                display: true,
                text: 'Leistungen (min) ' + ArchiveChartComponent.dayNames[from.getDay()] + ', ' +
                       from.getDate() + '. ' + ArchiveChartComponent.monthNames[from.getMonth()] + ' ' + from.getFullYear()
            },
            scales: {
                xAxes: [{
                    type: 'time',
                    time: {
                        unit: 'minute',
                        stepSize: 5,
                        displayFormats: {
                            minute: 'x'
                        }
                    },
                    gridLines: {
                        offsetGridLines: false,
                        drawTicks: true
                    },
                    ticks: {
                        callback: (value: string) => {
                            const t = new Date(+value);
                            if (from.getDate() !== to.getDate()) {
                                return sprintf('%d.%d. %d:%02d', t.getDate(), t.getMonth() + 1, t.getHours(), t.getMinutes());
                            } else if ((t.getMinutes() % res) === 0) {
                                return sprintf('%d:%02d', t.getHours(), t.getMinutes());
                            } else {
                                return '';
                            }
                        }
                    }
                }],
                yAxes: [{
                    ticks: {
                        callback: (value) => Math.abs(value) < 1000 ? value + 'W' : Math.round(value / 10) / 100 + 'kW'
                    }
                }]
            }
        };
        const xLabels: string [] = [];
        for (let m = -dm; m <= 0; m++) {
            const t = new Date(to.getTime() + m * 60 * 1000);
            xLabels.push(sprintf('%d:%02d', t.getHours(), t.getMinutes()));
        }

        const chart: INg4Chart = {
            params: p,
            data: null,
            labels: null, // xLabels,
            datasets: [ ],
            options: chart1Options,
            legend: true,
            type: 'line',
            colors: [],
            hovered: (ev) => this.hovered(ev),
            clicked: (ev) => this.clicked(ev)
        };
        for (const id of ids) {
            chart.datasets.push({ data: values[id], label: id});
            const col = ArchiveChartComponent.defaultColors[id];
            if (col) {
                chart.colors.push(col);
            } else {
                chart.colors.push({ borderColor: 'lightgrey', pointRadius: 0 });
            }
        }

        return chart;
    }

    private async createChartPowerMin10 (p: IChartParams, ids?: (StatisticAttribute) []): Promise<INg4Chart> {
        ids = ids || ArchiveChartComponent.defaultPowerAttributes;
        const dm10 = Math.round((p.options.end.getTime() - p.options.start.getTime()) / 60000 / 10);
        let res: number;
        console.log(dm10);
        if (dm10 < 25) {
            res = 10;
        } else if (dm10 < 50) {
            res = 30;
        } else {
            res = 60;
        }
        this._currentTimeResolutionMillis = res * 60 * 1000;

        const tx = (Math.floor(p.options.end.getTime() / (1000 * 60 * res))) * res; // + res;
        const to = new Date(tx * 1000 * 60);
        const from = new Date(to.getTime() - dm10 * 10 * 60 * 1000);
        console.log('createChartPowerMinute()\n from=' + from.toISOString() + '\n   to=' + to.toISOString());

        const x: IArchiveRequest = {
            id:      this._requestCnt++,
            type:    'min10',
            dataIds: ids,
            from:    from,
            to:      to
        };
        const r = await this.dataService.getArchiv(new ArchiveRequest(x));
        const values: { [ key in StatisticAttribute | 'pLoad' ]?: { x: string | Date, y: number}  [] } = {};
        for (let m10 = -dm10; m10 <= 0; m10++) {
            for (const id of ids) {
                const sign = (id === 'pBoiler' || id === 'pHeatPump' || id === 'pLoad') ? -1 : 1;
                const t = new Date(to.getTime() + m10 * 10 * 60 * 1000);
                const coll = Array.isArray(r.result[id]) ? r.result[id].find(
                    (item) => item.start.getMinutes() === t.getMinutes() && item.start.getHours() === t.getHours()) : null;
                if (!Array.isArray(values[id])) {
                    values[id] = [];
                }
                // console.log(m, coll);
                if (coll) {
                    values[id].push({ x: t.toISOString(), y: sign * coll.twa });
                } else {
                    values[id].push({ x: t.toISOString(), y: null });
                }
            }
        }

        const chart1Options: Charts.ChartOptions = {
            responsive: true,
            title: {
                display: true,
                text: 'Leistungen (10min) ' + ArchiveChartComponent.dayNames[from.getDay()] + ', ' +
                       from.getDate() + '. ' + ArchiveChartComponent.monthNames[from.getMonth()] + ' ' + from.getFullYear()
            },
            scales: {
                xAxes: [{
                    type: 'time',
                    time: {
                        unit: 'minute',
                        stepSize: res,
                        displayFormats: {
                            minute: 'x'
                        }
                    }
                    ,
                    gridLines: {
                        offsetGridLines: false,
                        drawTicks: true
                    },
                    ticks: {
                        callback: (value: string) => {
                            const t = new Date(+value);
                            let rv: string;
                            if ((t.getMinutes() % 30) === 0) {
                                rv =  sprintf('%d:%02d', t.getHours(), t.getMinutes());
                            } else {
                                rv = '';
                            }
                            if (from.getDate() !== to.getDate() && t.getHours() === 0 && t.getMinutes() === 0) {
                                rv = sprintf('%d.%d./%s', t.getDate(), t.getMonth() + 1, rv);
                            }
                            return rv;
                        }
                    }
                }],
                yAxes: [{
                    ticks: {
                        callback: (value) => Math.abs(value) < 1000 ? value + 'W' : Math.round(value / 10) / 100 + 'kW'
                    }
                }]
            }
        };
        const xLabels: string [] = [];
        for (let m10 = -dm10; m10 <= 0; m10++) {
            const t = new Date(to.getTime() + m10 * 10 * 60 * 1000);
            xLabels.push(sprintf('%d:%02d', t.getHours(), t.getMinutes()));
        }

        const chart: INg4Chart = {
            params: p,
            data: null,
            labels: null, // xLabels,
            datasets: [ ],
            options: chart1Options,
            legend: true,
            type: 'line',
            colors: [],
            hovered: (ev) => this.hovered(ev),
            clicked: (ev) => this.clicked(ev)
        };
        for (const id of ids) {
            chart.datasets.push({ data: values[id], label: id});
            const col = ArchiveChartComponent.defaultColors[id];
            if (col) {
                chart.colors.push(col);
            } else {
                chart.colors.push({ borderColor: 'lightgrey', pointRadius: 0 });
            }
        }

        return chart;
    }


    private async createChartPowerHour (p: IChartParams, ids?: (StatisticAttribute) []): Promise<INg4Chart> {
        ids = ids || ArchiveChartComponent.defaultPowerAttributes;
        const kms = 1000 * 60 * 60; // factor between hour and milliseconds
        const dHrs = Math.round((p.options.end.getTime() - p.options.start.getTime()) / kms);
        let res: number;
        if (dHrs < 36) {
            res = 3;
        } else if (dHrs < 72) {
            res = 6;
        } else {
            res = 12;
        }
        this._currentTimeResolutionMillis = res * 60 * 60 * 1000;

        const tx = (Math.floor(p.options.end.getTime() / (kms * res))) * res;
        let to = new Date(tx * kms);
        while (to.getHours() % res !== 0) {
            to = new Date(to.getTime() + kms);
        }
        const from = new Date(to.getTime() - dHrs * kms);
        console.log('createChartPowerHour()\n from=' + from.toISOString() + '\n   to=' + to.toISOString());

        const x: IArchiveRequest = {
            id:      this._requestCnt++,
            type:    'hour',
            dataIds: ids,
            from:    from,
            to:      to
        };
        const r = await this.dataService.getArchiv(new ArchiveRequest(x));
        const values: { [ key in StatisticAttribute | 'pLoad' ]?: { x: string | Date, y: number}  [] } = {};
        for (let t = -dHrs; t <= 0; t++) {
            for (const id of ids) {
                const sign = (id === 'pBoiler' || id === 'pHeatPump' || id === 'pLoad') ? -1 : 1;
                const tp = new Date(to.getTime() + t * kms + 0.5 * kms);
                const coll = Array.isArray(r.result[id]) ? r.result[id].find(
                    (item) => Math.floor(item.start.getTime() / kms) === Math.floor(tp.getTime() / kms)) : null;
                if (!Array.isArray(values[id])) {
                    values[id] = [];
                }
                // console.log(m, coll);
                if (coll) {
                    values[id].push({ x: tp.toISOString(), y: sign * coll.twa });
                } else {
                    values[id].push({ x: tp.toISOString(), y: null });
                }
            }
        }

        const chart1Options: Charts.ChartOptions = {
            responsive: true,
            title: {
                display: true,
                text: 'Leistungen (1Std) ' + ArchiveChartComponent.dayNames[from.getDay()] + ', ' +
                       from.getDate() + '. ' + ArchiveChartComponent.monthNames[from.getMonth()] + ' ' + from.getFullYear()
            },
            scales: {
                xAxes: [{
                    type: 'time',
                    time: {
                        unit: 'hour',
                        stepSize: res,
                        displayFormats: {
                            hour: 'x'
                        },

                    },
                    gridLines: {
                        offsetGridLines: false,
                        drawTicks: true
                    },
                    ticks: {
                        callback: (value: string) => {
                            const t = new Date(+value);
                            const tPrev = new Date(+value - res * kms);
                            let rv: string;

                            if (t.getDate() !== tPrev.getDate()) {
                                rv = sprintf('%d.%d./%d:%02d', t.getDate(), t.getMonth() + 1, t.getHours(), t.getMinutes());
                            } else if (t.getHours() === 12 && t.getMinutes() === 0) {
                                rv =  sprintf('%s,%d:%02d', ArchiveChartComponent.dayNames[t.getDay()].substr(0, 2), t.getHours(), t.getMinutes());
                            } else {
                                rv =  sprintf('%d:%02d', t.getHours(), t.getMinutes());
                            }
                            return rv;
                        }
                    }
                }],
                yAxes: [{
                    ticks: {
                        callback: (value) => Math.abs(value) < 1000 ? value + 'W' : Math.round(value / 10) / 100 + 'kW'
                    }
                }]
            }
        };
        const xLabels: string [] = [];
        for (let t = -dHrs; t <= 0; t++) {
            const tp = new Date(to.getTime() + t * kms);
            // xLabels.push(sprintf('%d:%02d', tp.getHours(), tp.getMinutes()));
            xLabels.push(tp.getTime().toString());
        }

        const chart: INg4Chart = {
            params: p,
            data: null,
            labels: null, // xLabels,
            datasets: [ ],
            options: chart1Options,
            legend: true,
            type: 'line',
            colors: [],
            hovered: (ev) => this.hovered(ev),
            clicked: (ev) => this.clicked(ev)
        };
        for (const id of ids) {
            chart.datasets.push({ data: values[id], label: id});
            const col = ArchiveChartComponent.defaultColors[id];
            if (col) {
                chart.colors.push(col);
            } else {
                chart.colors.push({ borderColor: 'lightgrey', pointRadius: 0 });
            }
        }

        return chart;
    }


    private async createChartPowerDay (p: IChartParams, ids?: (StatisticAttribute) []): Promise<INg4Chart> {
        ids = ids || ArchiveChartComponent.defaultPowerAttributes;
        const kms = 1000 * 60 * 60 * 24; // factor between day and milliseconds
        const dDays = Math.round((p.options.end.getTime() - p.options.start.getTime()) / kms);
        console.log(dDays);
        let res: number;
        if (dDays < 14) {
            res = 1;
        } else if (dDays < 60) {
            res = 7;
        } else {
            res = 14;
        }

        const tx = (Math.floor(p.options.end.getTime() / (kms * res))) * res;
        let to = new Date(tx * kms);
        while (to.getDay() !== 3) { // show every Monday
            to = new Date(to.getTime() + kms);
        }
        const from = new Date(to.getTime() - dDays * kms);
        console.log('createChartPowerDay()\n from=' + from.toISOString() + '\n   to=' + to.toISOString());

        const x: IArchiveRequest = {
            id:      this._requestCnt++,
            type:    'day',
            dataIds: ids,
            from:    from,
            to:      to
        };
        const r = await this.dataService.getArchiv(new ArchiveRequest(x));
        const values: { [ key in StatisticAttribute | 'pLoad' ]?: { x: string | Date, y: number}  [] } = {};
        for (let t = -dDays; t <= 0; t++) {
            for (const id of ids) {
                const sign = (id === 'pBoiler' || id === 'pHeatPump' || id === 'pLoad') ? -1 : 1;
                const tp = new Date(to.getTime() + t * kms + 0.0 * kms);
                const coll = Array.isArray(r.result[id]) ? r.result[id].find(
                    (item) => Math.floor(item.start.getTime() / kms) === Math.floor(tp.getTime() / kms)) : null;
                if (!Array.isArray(values[id])) {
                    values[id] = [];
                }
                // console.log(m, coll);
                if (coll) {
                    values[id].push({ x: tp.toISOString(), y: sign * coll.twa });
                } else {
                    values[id].push({ x: tp.toISOString(), y: null });
                }
            }
        }

        const chart1Options: Charts.ChartOptions = {
            responsive: true,
            title: {
                display: true,
                text: 'Leistungen (Tagesmittel) ' + ArchiveChartComponent.dayNames[from.getDay()] + ', ' +
                       from.getDate() + '. ' + ArchiveChartComponent.monthNames[from.getMonth()] + ' ' + from.getFullYear()
            },
            scales: {
                xAxes: [{
                    type: 'time',
                    time: {
                        unit: 'day',
                        stepSize: res,
                        displayFormats: {
                            day: 'x'
                        },

                    },
                    gridLines: {
                        offsetGridLines: true,
                        drawTicks: true
                    },
                    ticks: {
                        callback: (value: string) => {
                            const t = new Date(+value + 4 * kms);
                            const tPrev = new Date(+value - 3 * kms);
                            let rv: string;
                            rv =  sprintf('%d.%d. - %d.%d.', tPrev.getDate(), tPrev.getMonth() + 1, t.getDate(), t.getMonth() + 1);
                            return rv;
                        }
                    }
                }],
                yAxes: [{
                    ticks: {
                        callback: (value) => Math.abs(value) < 1000 ? value + 'W' : Math.round(value / 10) / 100 + 'kW'
                    }
                }]
            }
        };
        const xLabels: string [] = [];
        for (let t = -dDays; t <= 0; t++) {
            const tp = new Date(to.getTime() + t * kms);
            // xLabels.push(sprintf('%d:%02d', tp.getHours(), tp.getMinutes()));
            xLabels.push(tp.getTime().toString());
        }

        const chart: INg4Chart = {
            params: p,
            data: null,
            labels: null, // xLabels,
            datasets: [ ],
            options: chart1Options,
            legend: true,
            type: 'line',
            colors: [],
            hovered: (ev) => this.hovered(ev),
            clicked: (ev) => this.clicked(ev)
        };
        for (const id of ids) {
            chart.datasets.push({ data: values[id], label: id});
            const col = ArchiveChartComponent.defaultColors[id];
            if (col) {
                chart.colors.push(col);
            } else {
                chart.colors.push({ borderColor: 'lightgrey', pointRadius: 0 });
            }
        }

        return chart;
    }

    // private async createChartPowerMinute2 (p: IChartParams, ids?: StatisticAttribute []): Promise<INg4Chart> {
    //     ids = ids || ArchiveChartComponent.defaultPowerAttributes;
    //     const dm = 60;
    //     const now = new Date();
    //     const from = new Date(now.getTime() - 19 * 60 * 60 * 1000);
    //     const to = new Date(from.getTime() + dm * 60 * 1000);

    //     console.log(this._requestCnt);
    //     const x: IArchiveRequest = {
    //         id:      this._requestCnt++,
    //         type:    'minute',
    //         dataIds: ids,
    //         from:    from,
    //         to:      to
    //     };
    //     const r = await this.dataService.getArchiv(new ArchiveRequest(x));
    //     const values: { [ key in StatisticAttribute | 'pLoad' ]?: number [] } = {};
    //     for (let m = -dm; m <= 0; m++) {
    //         for (const id of ids) {
    //             const sign = (id === 'pBoiler' || id === 'pHeatPump' || id === 'pLoad') ? -1 : 1;
    //             const t = new Date(to.getTime() + m * 60 * 1000);
    //             const coll = Array.isArray(r.result[id]) ? r.result[id].find(
    //                 (item) => item.start.getMinutes() === t.getMinutes() && item.start.getHours() === t.getHours()) : null;
    //             if (!Array.isArray(values[id])) {
    //                 values[id] = [];
    //             }
    //             // console.log(m, coll);
    //             if (coll) {
    //                 values[id].push(sign * coll.twa);
    //             } else {
    //                 values[id].push(null);
    //             }
    //         }
    //     }

    //     const chart1Options: Charts.ChartOptions = {
    //         responsive: true,
    //         title: {
    //             display: true,
    //             text: 'Minutenleistung ' + ArchiveChartComponent.dayNames[from.getDay()] + ', ' +
    //                    from.getDate() + '. ' + ArchiveChartComponent.monthNames[from.getMonth()] + ' ' + from.getFullYear()
    //         },
    //         scales: {
    //             yAxes: [{
    //                 ticks: {
    //                     callback: (value) => Math.abs(value) < 1000 ? value + 'W' : Math.round(value / 10) / 100 + 'kW'
    //                 }
    //             }]
    //         }
    //     };
    //     const xLabels: string [] = [];
    //     for (let m = -dm; m <= 0; m++) {
    //         const t = new Date(to.getTime() + m * 60 * 1000);
    //         xLabels.push(sprintf('%d:%02d', t.getHours(), t.getMinutes()));
    //     }

    //     const chart: INg4Chart = {
    //         params: p,
    //         data: null,
    //         labels: xLabels,
    //         datasets: [ ],
    //         options: chart1Options,
    //         legend: true,
    //         type: 'line',
    //         colors: [],
    //         hovered: (ev) => this.hovered(ev),
    //         clicked: (ev) => this.clicked(ev)
    //     };
    //     for (const id of ids) {
    //         chart.datasets.push({ data: values[id], label: id});
    //         switch (id) {
    //             case 'pGrid': chart.colors.push({ borderColor: 'black', pointRadius: 0 }); break;
    //             case 'pPv':   chart.colors.push({ borderColor: 'green', pointRadius: 0 }); break;
    //             case 'pBat':  chart.colors.push({ borderColor: 'orange', pointRadius: 0 }); break;
    //             case 'pLoad': chart.colors.push({ borderColor: 'red', pointRadius: 0 }); break;
    //             case 'pBoiler':   chart.colors.push({ borderColor: 'blue', pointRadius: 0 }); break;
    //             case 'pHeatPump': chart.colors.push({ borderColor: 'saddlebrown', pointRadius: 0 }); break;
    //         }
    //     }

    //     return chart;
    // }

    // private async createChartPowerHour2 (p: IChartParams, ids?: StatisticAttribute []): Promise<INg4Chart> {
    //     ids = ids || ArchiveChartComponent.defaultPowerAttributes;
    //     const now = p.options.start;
    //     const from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    //     let to = new Date(from.getTime() + 24 * 60 * 60 * 1000);
    //     to = new Date(to.getTime() - 1);

    //     const x: IArchiveRequest = {
    //         id: 1,
    //         type: 'hour',
    //         dataIds: ids,
    //         from: from,
    //         to: to
    //     };
    //     const r = await this.dataService.getArchiv(new ArchiveRequest(x));
    //     const values: { [ key in StatisticAttribute | 'pLoad' ]?: number [] } = {};
    //     for (let h = 0; h < 24; h++) {
    //         for (const id of ids) {
    //             const sign = (id === 'pBoiler' || id === 'pHeatPump' || id === 'pLoad') ? -1 : 1;
    //             const coll = Array.isArray(r.result[id]) ? r.result[id].find( (item) => item.start.getHours() === h ) : null;
    //             if (!Array.isArray(values[id])) {
    //                 values[id] = [];
    //             }
    //             if (coll) {
    //                 values[id].push(sign * coll.twa);
    //             } else {
    //                 values[id].push(null);
    //             }
    //         }
    //     }

    //     const chart1Options: Charts.ChartOptions = {
    //         responsive: true,
    //         title: {
    //             display: true,
    //             text: 'Tagesleistung ' + ArchiveChartComponent.dayNames[from.getDay()] + ', ' +
    //                    from.getDate() + '. ' + ArchiveChartComponent.monthNames[from.getMonth()] + ' ' + from.getFullYear()
    //         },
    //         scales: {
    //             yAxes: [{
    //                 ticks: {
    //                     callback: (value) => value + 'W'
    //                 }
    //             }]
    //         }
    //     };
    //     const xLabels: string [] = [];
    //     for (let i = 0; i <= 24; i++) {
    //         xLabels.push(sprintf('%02d:00', i));
    //     }

    //     const chart: INg4Chart = {
    //         params: p,
    //         data: null,
    //         labels: xLabels,
    //         datasets: [ ],
    //         options: chart1Options,
    //         legend: true,
    //         type: 'bar',
    //         colors: [],
    //         hovered: (ev) => this.hovered(ev),
    //         clicked: (ev) => this.clicked(ev)
    //     };
    //     for (const id of ids) {
    //         chart.datasets.push({ data: values[id], label: id});
    //         switch (id) {
    //             case 'pGrid': chart.colors.push({ backgroundColor: 'black', borderColor: 'black', pointRadius: 0 }); break;
    //             case 'pPv':   chart.colors.push({ backgroundColor: 'green', borderColor: 'green', pointRadius: 0 }); break;
    //             case 'pBat':  chart.colors.push({ backgroundColor: 'orange', borderColor: 'orange', pointRadius: 0 }); break;
    //             case 'pLoad': chart.colors.push({ backgroundColor: 'red', borderColor: 'red', pointRadius: 0 }); break;
    //             case 'pBoiler':   chart.colors.push({ backgroundColor: 'blue', borderColor: 'blue', pointRadius: 0 }); break;
    //             case 'pHeatPump': chart.colors.push({ backgroundColor: 'saddlebrown', borderColor: 'saddlebrown', pointRadius: 0 }); break;
    //         }
    //     }

    //     return chart;
    // }



    // private async createChartPowerMonth (p: IChartParams, ids?: StatisticAttribute []): Promise<INg4Chart> {
    //     ids = ids || ArchiveChartComponent.defaultPowerAttributes;
    //     const now = new Date();
    //     const from = new Date(now.getFullYear(), now.getMonth());
    //     let to = from.getMonth() <= 10 ? new Date(from.getFullYear(), from.getMonth() + 1 ) : new Date(from.getFullYear() + 1, 0);
    //     to = new Date(to.getTime() - 1);

    //     const x: IArchiveRequest = {
    //         id: 2,
    //         type: 'day',
    //         dataIds: ids,
    //         from: from,
    //         to: to
    //     };
    //     const r = await this.dataService.getArchiv(new ArchiveRequest(x));
    //     const values: { [ key in StatisticAttribute | 'pLoad' ]?: number [] } = {};
    //     const xLabels: any [] = [];
    //     const xGridColor: string [] = [];
    //     // for (let i = 0; i <= 24; i++) {
    //     //     xLabels.push(sprintf('%02d:00', i));
    //     // }

    //     for (let d = from.getDate(); d <= to.getDate(); d++) {
    //         const day = (from.getDay() + d) % 7;
    //         xLabels.push(day === 1 ? sprintf('%d', d) : sprintf('%d', d));
    //         xGridColor.push(day === 0 || day === 2 ? 'red' : 'lightgrey' );
    //         // xLabels.push({ labelString: sprintf('%d', d) });
    //         for (const id of ids) {
    //             const sign = (id === 'pBoiler' || id === 'pHeatPump') ? -1 : 1;
    //             const coll = Array.isArray(r.result[id]) ? r.result[id].find( (item) => item.start.getDate() === d ) : null;
    //             console.log('--->', d, coll);
    //             if (!Array.isArray(values[id])) {
    //                 values[id] = [];
    //             }
    //             if (coll) {
    //                 values[id].push(sign * coll.twa);
    //             } else {
    //                 values[id].push(null);
    //             }
    //         }
    //     }

    //     const chart1Options: Charts.ChartOptions = {
    //         responsive: true,
    //         title: { display: true, text: 'Monatsleistung ' + ArchiveChartComponent.monthNames[from.getMonth()] + ' ' + from.getFullYear() },
    //         scales: {
    //             xAxes: [{
    //                 // gridLines: {
    //                 //     color: 'rgba(171,171,171,1)',
    //                 //     lineWidth: 1
    //                 // },
    //                 gridLines: {
    //                     zeroLineColor: 'black',
    //                     color: xGridColor, // [ 'lightgrey', 'grey', 'grey', 'grey', 'grey', 'grey', 'red' ],
    //                     borderDash: [1, 1]
    //                 }
    //             }]
    //         }
    //     };

    //     const chart: INg4Chart = {
    //         params: p,
    //         data: null,
    //         labels: xLabels,
    //         datasets: [ ],
    //         options: chart1Options,
    //         legend: true,
    //         type: 'bar',
    //         colors: [],
    //         hovered: (ev) => this.hovered(ev),
    //         clicked: (ev) => this.clicked(ev)
    //     };
    //     for (const id of ids) {
    //         chart.datasets.push({ data: values[id], label: id});
    //         switch (id) {
    //             case 'pGrid': chart.colors.push({ backgroundColor: 'black', borderColor: 'black', pointRadius: 0 }); break;
    //             case 'pPv':   chart.colors.push({ backgroundColor: 'green', borderColor: 'green', pointRadius: 0 }); break;
    //             case 'pBat':  chart.colors.push({ backgroundColor: 'orange', borderColor: 'orange', pointRadius: 0 }); break;
    //             case 'pLoad': chart.colors.push({ backgroundColor: 'red', borderColor: 'red', pointRadius: 0 }); break;
    //             case 'pBoiler':   chart.colors.push({ backgroundColor: 'blue', borderColor: 'blue', pointRadius: 0 }); break;
    //             case 'pHeatPump': chart.colors.push({ backgroundColor: 'saddlebrown', borderColor: 'saddlebrown', pointRadius: 0 }); break;
    //         }
    //     }

    //     return chart;
    // }


    private hovered (event: any) {
        console.log('hovered', event);
    }

    private clicked (event: any) {
        console.log('clicked', event);
    }

}

type TChartTyp = 'power' | 'energy';
type TChartAverage = 'minute' | 'min10' | 'hour' | 'day' | 'week' | 'month' | 'year';

interface IChartOptions {
    start: Date;
    end: Date;
}

interface IChartParams {
    typ: TChartTyp;
    options: IChartOptions;
}

interface IInputConfig<T> {
    id: string;
    disabled: boolean;
    firstLine: string;
    options: string [];
    validator: ValidatorElement<T>;
}

interface INg4Chart {
    params:   IChartParams;
    data?:    number[] | any [];
    datasets: { data: number [] | { x: string | Date, y: number } [], label: string } [];
    labels:   string [];
    options:  Charts.ChartOptions; // { scaleShowVerticalLines: boolean, responsive: boolean};
    legend:   boolean;
    type:     Charts.ChartType;
    colors:   ngCharts.Color [];
    hovered:  (event) => void;
    clicked:  (event) => void;
}

