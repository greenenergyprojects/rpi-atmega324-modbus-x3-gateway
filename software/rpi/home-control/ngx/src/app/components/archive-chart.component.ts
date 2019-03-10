// add "node_modules/chart.js/dist/Chart.bundle.min.js" in angular.json (architect->build->options->scripts)

// https://www.npmjs.com/package/ng4-charts
// https://www.chartjs.org/
// https://github.com/valor-software/ng2-charts/blob/development/src/charts/charts.ts
// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/chart.js/index.d.ts

import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { BaseChartDirective } from 'ng4-charts';
import * as ngCharts from 'ng4-charts';
import * as Charts from 'chart.js';
import { DataService } from '../services/data.service';
import { sprintf } from 'sprintf-js';
import { HistoryService } from '../services/history.service';
import { IArchiveRequest, ArchiveRequest } from '../data/common/home-control/archive-request';
import { StatisticAttribute, Statistics, StatisticsType, IStatisticsFormat } from '../data/common/home-control/statistics';
import { ValidatorElement } from '../directives/validator.directive';
import { ISyncButtonConfig } from './sync-button.component';
import { CommonLogger } from '../data/common-logger';
import { ConfigService } from '../services/config.service';
import { ModalArchiveChartComponent, IModalArchiveChartConfig } from '../modals/modal-archive-chart.component';
import { IStatisticItemDefinition } from '../data/common/home-control/statistics';
import { ArchiveResponse } from '../data/common/home-control/archive-response';

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
        pBoiler:   { borderColor: 'blue',        backgroundColor: 'blue',        pointRadius: 0 },
        pGrid:     { borderColor: 'black',       backgroundColor: 'black',       pointRadius: 0 },
        pBat:      { borderColor: 'orange',      backgroundColor: 'orange',      pointRadius: 0 },
        pHeatPump: { borderColor: 'saddlebrown', backgroundColor: 'saddlebrown', pointRadius: 0 },
        pLoad:     { borderColor: 'red',         backgroundColor: 'red',         pointRadius: 0 },
        pPv:       { borderColor: 'green',       backgroundColor: 'green',       pointRadius: 3 },
        pPvEW:     { borderColor: 'lightgreen',  backgroundColor: 'lightgreen',  pointRadius: 0 },
        pPvS:      { borderColor: 'darkgreen',   backgroundColor: 'darkgreen',   pointRadius: 0 }
    };


    // ******************************************************************************************

    @ViewChild('modalArchiveChart')
    public modalArchiveChart: ModalArchiveChartComponent;

    @ViewChild(BaseChartDirective)
    public childChart: ngCharts.BaseChartDirective;

    @ViewChild('yauto') checkboxYAuto: ElementRef<HTMLInputElement>;

    public chart: INg4Chart;
    public configSelection: IInputConfig<string>;
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

    private _configs: IArchiveChartConfig [] = [];
    private _activeConfig: IArchiveChartConfig;
    private _initDone;
    private _locked: IChartParams = null;
    private _requestCnt: number;
    private _inputDay: IInputConfig<string>;
    private _inputMonth: IInputConfig<string>;
    private _inputYear: IInputConfig<string>;
    private _inputHour: IInputConfig<string>;

    private _zoomOptions = [ 0.75, 1.5, 3, 6, 12, 24, 3 * 24, 14 * 24, '1m', '3m', '6m', '1y', '2y', '5y', '10y' ];
    private _currentZoomIndex = 0;
    private _currentTimeResolutionMillis = 5 * 60 * 1000;

    constructor (private dataService: DataService, private historyService: HistoryService, private configService: ConfigService) {
        this._requestCnt = 0;

        const variables: IVariable [] = [];
        const yAxes: IYAxis [] = [];
        for (const id of Object.getOwnPropertyNames(Statistics.defById)) {
            const def = Statistics.defById[id];
            let yAxis: IYAxis;
            if (def && def.format && def.format.unit) {
                yAxis = yAxes.find( (a) => a.unit === def.format.unit);
                if (!yAxis) {
                    yAxis = { id: yAxes.length, unit: def.format.unit };
                    yAxes.push(yAxis);
                }
            }
            const v: IVariable = {
                id: id,
                label: '',
                def: def,
                yAxis: yAxis,
                enabled: ArchiveChartComponent.defaultPowerAttributes.findIndex( (item) => item === id ) >= 0
            };
            variables.push(v);
        }

        this._activeConfig = {
            name: 'Default',
            variables: variables
        };
        this._configs = [this._activeConfig];

        this.configSelection = {
            id: 'config',
            disabled: false,
            firstLine: null,
            value: this._activeConfig.name,
            options: [ this._activeConfig.name ],
            validator: new ValidatorElement<string>('Default', (e, n, v) => this.handleInputChange(e, n, v))

        };

        this.buttonConfigRefreshNow = {
            text: 'Reset',
            classes: { default: 'btn-sm btn-primary', onSuccess: 'btn-sm btn-success', onError: 'btn-sm btn-danger' },
            hideSyncIcon: true,
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

        const averageOptions: string [] = [];
        for (const a of Object.getOwnPropertyNames(ArchiveChartComponent.chartAverageNames)) {
            averageOptions.push(ArchiveChartComponent.chartAverageNames[a]);
        }

        this._inputDay = {
            id: 'day',
            disabled: false,
            firstLine: 'Tag',
            options: [ '1.', '31.' ],
            validator: new ValidatorElement<string>('1.', (e, n, v) => this.handleInputChange(e, n, v))
        };

        this._inputMonth = {
            id: 'month',
            disabled: false,
            firstLine: 'Monat',
            options: ArchiveChartComponent.monthNames,
            validator: new ValidatorElement<string>('Jänner', (e, n, v) => this.handleInputChange(e, n, v))
        };

        this._inputYear = {
            id: 'year',
            disabled: false,
            firstLine: 'Jahr',
            options: [ '2019'],
            validator: new ValidatorElement<string>('2019', (e, n, v) => this.handleInputChange(e, n, v))
        };

        const hourOptions: string [] = [];
        for (let h = 0; h < 24; h++) { hourOptions.push(h + ':00'); }
        this._inputHour = {
            id: 'hour',
            disabled: false,
            firstLine: 'Stunde',
            options: hourOptions,
            validator: new ValidatorElement<string>('12:00', (e, n, v) => this.handleInputChange(e, n, v))
        };

        this.showInputs.push(this._inputDay);
        this.showInputs.push(this._inputMonth);
        this.showInputs.push(this._inputYear);
        this.showInputs.push(this._inputHour);

    }

    public async ngOnInit () {
        const x = this.configService.pop('archive-chart:__chart');
        if (x) {
            console.log('restore config from... ', x);
            const now = new Date(x.params.options.end);
            this.updateValidators(now);
            this.chart = x;

        } else {
            const now = new Date(Date.now() + 5 * 60 * 1000);
            this.updateValidators(now);
            // console.log(this._activeConfig);
            await this.refreshChart(this.createChartParameter('power', new Date(), this._zoomOptions[this._currentZoomIndex]));
        }
        this._initDone = true;
    }


    public ngOnDestroy() {
        console.log('save config archive-chart:__chart', this.chart);
        // this.configService.push('archive-chart:__chart', this.cloneNg4Chart(this.chart));
        this.configService.push('archive-chart:__chart', this.chart);
    }

    public async onConfigMenu () {
        console.log('onConfigMenu', this.modalArchiveChart);
        const selectedConfig = this.configSelection.validator.value;
        try {
            // const ids = Object.getOwnPropertyNames(Statistics.defById);
            // const variables: IVariable [] = [];
            // for (const id of ids) {
            //     const def = Statistics.defById[id];
            //     const v: IVariable = {
            //         id: id,
            //         label: '',
            //         def: def
            //     };
            //     if (ArchiveChartComponent.defaultPowerAttributes.findIndex( (item) => item === id ) >= 0) {
            //         v.enabled = true;
            //     }
            //     variables.push(v);
            // }

            const config = this._configs.find( (c) => c.name === selectedConfig );
            const existingNames: string [] = [];
            this._configs.forEach( (c) => existingNames.push(c.name));
            const result = await this.modalArchiveChart.show({
                title: 'Konfiguration',
                existingNames: existingNames,
                chartConfig: config
            });

            const newConfig = result.chartConfig;
            if (newConfig.name === 'Default') {
                return;
            }
            const index1 = this._configs.findIndex( (c) => c.name === newConfig.name );
            if (index1 >= 0) {
                this._configs[index1] = newConfig;
            } else {
                this._configs.push(newConfig);
            }
            for (let i = 0; i < this._configs.length; i++) {
                const c = this._configs[i];
                if (result.existingNames.findIndex( (n) => n === c.name) < 0) {
                    this._configs.splice(i, 1);
                    i--;
                }
            }

            this.configSelection.value = newConfig.name;
            this.configSelection.validator.value = newConfig.name;
            this._activeConfig = newConfig;
            // console.log(result);

        } catch (err) {
            if (err === 'delete' && selectedConfig && selectedConfig !== 'Default') {
                const index = this._configs.findIndex( (c) => c.name === selectedConfig);
                if (index >= 0) {
                    this._configs.splice(index, 1);
                }
                this.configSelection.value = this._configs[0].name;
                this.configSelection.validator.value = this.configSelection.value;
                this._activeConfig = this._configs[0];
            } else {
                console.log(err);
            }

        } finally {
            const newExistingNames: string [] = [];
            this._configs.forEach( (c) => newExistingNames.push(c.name));
            this.configSelection.options = newExistingNames;
        }
    }

    public async onButtonCancel (cfg: ISyncButtonConfig) {
        console.log('cancel', cfg);
    }

    public async onButtonClick(cfg: ISyncButtonConfig): Promise<void> {
        // console.log(this.checkboxYAuto.nativeElement.checked);
        let params: IChartParams;
        if (this.chart && this.chart.params) {
            params = Object.assign({}, this.chart.params);
        } else  {
            const now = new Date();
            params = {
                config: 'Default',
                options: {
                    start: new Date(now.getTime() - 90 * 60 * 1000),
                    end: now
                }
            };
        }
        if (cfg === this.buttonConfigRefreshNow) {
            this._currentZoomIndex = 0;
            this.refresh(+this._zoomOptions[this._currentZoomIndex]);

        } else if (cfg === this.buttonConfigXDayBack) {
            params.options.start = new Date(params.options.start.getTime() - 24 * 60 * 60 * 1000);
            params.options.end = new Date(params.options.end.getTime() - 24 * 60 * 60 * 1000);
            this.updateValidators(params.options.end);
            this.refreshChart(params);

        } else if (cfg === this.buttonConfigXPageLeft) {
            const dt = params.options.end.getTime() - params.options.start.getTime();
            params.options.start = new Date(params.options.start.getTime() - dt);
            params.options.end = new Date(params.options.end.getTime() - dt);
            this.updateValidators(params.options.end);
            this.refreshChart(params);

        } else if (cfg === this.buttonConfigXLeft) {
            params.options.start = new Date(params.options.start.getTime() - this._currentTimeResolutionMillis);
            params.options.end = new Date(params.options.end.getTime() - this._currentTimeResolutionMillis);
            this.updateValidators(params.options.end);
            this.refreshChart(params);

        } else if (cfg === this.buttonConfigXRight) {
            params.options.start = new Date(params.options.start.getTime() + this._currentTimeResolutionMillis);
            params.options.end = new Date(params.options.end.getTime() + this._currentTimeResolutionMillis);
            this.updateValidators(params.options.end);
            this.refreshChart(params);

        } else if (cfg === this.buttonConfigXPageRight) {
            const dt = params.options.end.getTime() - params.options.start.getTime();
            params.options.start = new Date(params.options.start.getTime() + dt);
            params.options.end = new Date(params.options.end.getTime() + dt);
            this.updateValidators(params.options.end);
            this.refreshChart(params);

        } else if (cfg === this.buttonConfigXZoomIn) {
            this._currentZoomIndex = Math.max(0, this._currentZoomIndex - 1);
            console.log('_currentZoomIndex=' + this._currentZoomIndex);
            const nextParams = this.createChartParameter(params.config, params.options.end, this._zoomOptions[this._currentZoomIndex]);
            this.updateValidators(nextParams.options.end);
            this.refreshChart(nextParams);

        } else if (cfg === this.buttonConfigXZoomOut) {
            this._currentZoomIndex = Math.min(this._zoomOptions.length - 1, this._currentZoomIndex + 1);
            console.log('_currentZoomIndex=' + this._currentZoomIndex);
            const nextParams = this.createChartParameter(params.config, params.options.end, this._zoomOptions[this._currentZoomIndex]);
            this.updateValidators(nextParams.options.end);
            this.refreshChart(nextParams);

        } else if (cfg === this.buttonConfigXDayNext) {
            params.options.start = new Date(params.options.start.getTime() + 24 * 60 * 60 * 1000);
            params.options.end = new Date(params.options.end.getTime() + 24 * 60 * 60 * 1000);
            this.updateValidators(params.options.end);
            this.refreshChart(params);
        }

    }

    private createChartParameter (config: string, end: Date, zoom: number | string): IChartParams {
        let start: Date;
        // console.log('createChartParameter zoom=' + zoom);

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
                let year = end.getFullYear() - dYear;
                let month = end.getMonth() - dMonth;
                while (month < 0) {
                    month += 12;
                    year--;
                }
                start = new Date(year, month, 1);

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
        return { config: config, options: { start: start, end: end } };
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

    // private getType (name: string): TChartTyp {
    //     if (name === null) { return 'power'; }
    //     const attributes = Object.getOwnPropertyNames(ArchiveChartComponent.chartTypNames);
    //     let rv: TChartTyp = <TChartTyp>attributes.find( (item) => name === ArchiveChartComponent.chartTypNames[item]);
    //     if (!rv) {
    //         CommonLogger.warn('cannot find chart type for ' + name);
    //         rv = 'power';
    //     }
    //     return rv;
    // }

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
        if (!this._initDone) { return; }
        const p = this.chart ? this.chart.params : null;
        let cfg: string;
        // let a: TChartAverage;
        let dStr: string;
        let mStr: string;
        let yStr: string;
        let hStr: string;

        cfg = this.configSelection.validator.value;
        dStr = this._inputDay.validator.value;
        mStr = this._inputMonth.validator.value;
        yStr = this._inputYear.validator.value;
        hStr = this._inputHour.validator.value;

        if (el === this.configSelection.validator) {

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

        if (!dStr || !mStr || !yStr || !hStr) {
            // initialization in progress
            return;
        }


        const d = dStr ? +dStr.substr(0, dStr.length - 1) : null;
        const m = ArchiveChartComponent.monthNames.findIndex( (item) => item === mStr);
        const y = yStr ? +yStr : null;
        const h = hStr ? +hStr.substr(0, hStr.length - 3) : null;
        // console.log(d, m, y, h);

        let refresh = false;
        try {
            if (this.chart.params.config !== cfg) { refresh = true; }
            if (!refresh && y !== this.chart.params.options.end.getFullYear() ) {  refresh = true; }
            if (!refresh && m !== this.chart.params.options.end.getMonth() ) {  refresh = true; }
            if (!refresh && d !== this.chart.params.options.end.getDate() ) {  refresh = true; }
            if (!refresh && h !== this.chart.params.options.end.getHours() ) {  refresh = true; }
        } catch (err) {
            refresh = true;
        }
        if (refresh) {
            if (cfg === 'Default') {
                const dt = p && p.options ? p.options.end.getTime() - p.options.start.getTime() : 60 * 60 * 1000;
                const now = new Date(y, m, d, h);
                this.refreshChart({ config: cfg, options: { start: new Date(now.getTime() - dt), end: now} });
            }
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
            // console.log('2---> refreshChart(): avr=' + average + ', hrs=' + dHrs);

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

            if (p.config !== null && average !== null) {
                // console.log('2--->', this.chart, p);
                this._locked = p;
                let newChart: INg4Chart;
                switch (average) {
                    case 'minute': {
                        const cpMin = await this.createChartPowerMinute(p);
                        newChart = cpMin;
                        break;
                    }
                    case 'min10': {
                        const cpMin10 = await this.createChartPowerMin10(p);
                        newChart = cpMin10;
                        break;
                    }
                    case 'hour': {
                        const cpHour = await this.createChartPowerHour(p);
                        newChart = cpHour;
                        break;
                    }
                    case 'day': {
                        const cpDay = await this.createChartPowerDay(p);
                        newChart = cpDay;
                        break;
                    }

                    default: {
                        console.log('unsupported average + ' + average);
                    }
                }


                if (newChart && this.childChart && Array.isArray(this.childChart.datasets)) {
                    for (let i = 0; i < this.childChart.datasets.length; i++) {
                        const ds = this.childChart.datasets[i];
                        if (ds.hidden === true) {
                            newChart.datasets[i].hidden = true;
                        }
                    }
                }
                this.chart = newChart;

            }
            this._locked = null;
        } catch (err) {
            CommonLogger.warn('refreshChart() fails\n%e', err);
            if (this._locked !== p) {
                const nextParams = this._locked;
                this._locked = null;
                setTimeout( () => { this.refreshChart(nextParams); }, 0);
            }
            this.chart = null;
            this._locked = null;
        }
        // console.log('refresh done -> chart = ...\n', this.chart);
        // const cpd = await this.createChartPowerDay([ 'pGrid', 'pPv',  'pBat', 'pLoad', 'pBoiler', 'pHeatPump' ]);
        // const cpm = await this.createChartPowerMonth([ 'pGrid', 'pPv',  'pBat', 'pLoad', 'pBoiler', 'pHeatPump' ]);
        // this.charts.push(cpd);
        // this.charts.push(cpm);
    }

    // private async createChartPowerMinute (p: IChartParams, ids?: (StatisticAttribute) []): Promise<INg4Chart> {
    //     ids = ids || ArchiveChartComponent.defaultPowerAttributes;
    //     const dm = Math.max( Math.round((p.options.end.getTime() - p.options.start.getTime()) / 1000 / 60), 45);
    //     const res = dm <= 60 ? 5 : 15;
    //     this._currentTimeResolutionMillis = res * 60 * 1000;
    //     const tx = (Math.floor(p.options.end.getTime() / (1000 * 60 * res))) * res;
    //     const to = new Date(tx * 1000 * 60);
    //     const from = new Date(to.getTime() - dm * 60 * 1000);
    //     // console.log('createChartPowerMinute()\n from=' + from.toISOString() + '\n   to=' + to.toISOString());

    //     const archiveRequest: IArchiveRequest = {
    //         id:      this._requestCnt++,
    //         type:    'minute',
    //         dataIds: ids,
    //         from:    from,
    //         to:      to
    //     };
    //     const r = await this.dataService.getArchiv(new ArchiveRequest(archiveRequest));
    //     const values: { [ key in StatisticAttribute | 'pLoad' ]?: { x: string | Date, y: number}  [] } = {};
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
    //                 values[id].push({ x: t.toISOString(), y: sign * coll.twa });
    //             } else {
    //                 values[id].push({ x: t.toISOString(), y: null });
    //             }
    //         }
    //     }

    //     const chart1Options: Charts.ChartOptions = {
    //         responsive: true,
    //         title: {
    //             display: true,
    //             text: 'Leistungen (min) ' + ArchiveChartComponent.dayNames[from.getDay()] + ', ' +
    //                    from.getDate() + '. ' + ArchiveChartComponent.monthNames[from.getMonth()] + ' ' + from.getFullYear()
    //         },
    //         animation: {
    //             duration: 1,
    //             easing: 'easeOutQuad',
    //             onComplete: () => {
    //                 const ctx = <CanvasRenderingContext2D>this.childChart.ctx;
    //                 // console.log(ctx);
    //                 // ctx.fillStyle = 'black';
    //                 // ctx.fillRect(10, 10, 20, 20);

    //             }
    //         },
    //         scales: {
    //             xAxes: [{
    //                 type: 'time',
    //                 time: {
    //                     unit: 'minute',
    //                     stepSize: 5,
    //                     displayFormats: {
    //                         minute: 'x'
    //                     }
    //                 },
    //                 gridLines: {
    //                     offsetGridLines: false,
    //                     drawTicks: true
    //                 },
    //                 ticks: {
    //                     callback: (value: string) => {
    //                         const t = new Date(+value);
    //                         if (from.getDate() !== to.getDate()) {
    //                             return sprintf('%d.%d. %d:%02d', t.getDate(), t.getMonth() + 1, t.getHours(), t.getMinutes());
    //                         } else if ((t.getMinutes() % res) === 0) {
    //                             return sprintf('%d:%02d', t.getHours(), t.getMinutes());
    //                         } else {
    //                             return '';
    //                         }
    //                     }
    //                 }
    //             }],
    //             yAxes: [{
    //                 ticks: {
    //                     callback: (value) => Math.abs(value) < 1000 ? value + 'W' : Math.round(value / 10) / 100 + 'kW',
    //                 }
    //             }]
    //         }
    //     };

    //     try {
    //         const x = <any>this.childChart;
    //         if (x && x.chart && x.chart.scales && x.chart.scales) {
    //             // console.log(x.chart.scales);
    //             const y = x.chart.scales['y-axis-0'];
    //             if (y) {
    //                 const min = y.min;
    //                 const max = y.max;
    //                 if (typeof min === 'number' && typeof max === 'number') {}
    //                     if (this.checkboxYAuto && this.checkboxYAuto.nativeElement && !this.checkboxYAuto.nativeElement.checked) {
    //                         chart1Options.scales.yAxes[0].ticks.min = min;
    //                         chart1Options.scales.yAxes[0].ticks.max = max;
    //                 }
    //             }
    //         }
    //     } catch (err) {
    //         console.log(err);
    //     }

    //     const chart: INg4Chart = {
    //         params: p,
    //         datasets: [ ],
    //         options: chart1Options,
    //         legend: true,
    //         colors: [],
    //     };
    //     for (const id of ids) {
    //         const dataset: Charts.ChartDataSets = {
    //             label: id,
    //             data: values[id],
    //             hidden: false,
    //             type: 'line'
    //         };
    //         // if (id === 'pBat') {
    //         //     dataset.hidden = true;
    //         // }
    //         chart.datasets.push(dataset);
    //         const col = Object.assign({}, ArchiveChartComponent.defaultColors[id]);
    //         if (col) {
    //             delete col.backgroundColor;
    //             chart.colors.push(col);
    //         } else {
    //             chart.colors.push({ borderColor: 'lightgrey', pointRadius: 0 });
    //         }
    //     }

    //     return chart;
    // }

    private async  getArchiveData (config: IArchiveChartConfig, type: StatisticsType, from: Date, to: Date ): Promise<ArchiveResponse> {
        const ids: StatisticAttribute [] = [];
        for (const v of config.variables) {
            if (!v.enabled) { continue; }
            ids.push(Statistics.toStatisticAttribute(v.id));
        }
        const archiveRequest: IArchiveRequest = {
            id:      this._requestCnt++,
            type:    type,
            dataIds: ids,
            from:    from,
            to:      to
        };
        return await this.dataService.getArchiv(new ArchiveRequest(archiveRequest));
    }

    private prepareChartData (config: IArchiveChartConfig, r: ArchiveResponse ): { [ key in StatisticAttribute ]?: IChartData } {
        const rv: { [ key in StatisticAttribute ]?: IChartData } = {};

        for (const v of config.variables) {
            if (!v.enabled) { continue; }
            const d: IChartData = {
                yAxis: v.yAxis,
                pointStyle: v.pointStyle ? v.pointStyle : { pointRadius: 0 },
                label: v.label ? v.label : v.id,
                values: []
            };
            rv[v.id] = d;
        }

        return rv;
    }


    private async createChartPowerMinute (p: IChartParams): Promise<INg4Chart> {
        const dm = Math.max( Math.round((p.options.end.getTime() - p.options.start.getTime()) / 1000 / 60), 45);
        const res = dm <= 60 ? 5 : 15;
        this._currentTimeResolutionMillis = res * 60 * 1000;
        const tx = (Math.floor(p.options.end.getTime() / (1000 * 60 * res))) * res;
        const to = new Date(tx * 1000 * 60);
        const from = new Date(to.getTime() - dm * 60 * 1000);
        // console.log('createChartPowerMinute()\n from=' + from.toISOString() + '\n   to=' + to.toISOString());

        const r = await this.getArchiveData(this._activeConfig, 'minute', from, to);
        const chartData = this.prepareChartData(this._activeConfig, r);

        // const values: { [ key in StatisticAttribute | 'pLoad' ]?: { x: string | Date, y: number}  [] } = {};
        for (let m = -dm; m <= 0; m++) {
            for (const id of Object.getOwnPropertyNames(chartData)) {
                const x = <IChartData>chartData[id];
                const sign = (id === 'pBoiler' || id === 'pHeatPump' || id === 'pLoad') ? -1 : 1;
                const t = new Date(to.getTime() + m * 60 * 1000);
                const coll = Array.isArray(r.result[id]) ? r.result[id].find(
                    (item) => item.start.getMinutes() === t.getMinutes() && item.start.getHours() === t.getHours()) : null;
                if (!x || !Array.isArray(x.values)) {
                    console.log('Error: mising array values for ' + id);
                } else if (coll) {
                    x.values.push({ x: t.toISOString(), y: sign * coll.twa });
                } else {
                    x.values.push({ x: t.toISOString(), y: null });
                }
            }
        }
        console.log(chartData);

        const chart1Options: Charts.ChartOptions = {
            responsive: true,
            title: {
                display: true,
                text: 'Leistungen (min) ' + ArchiveChartComponent.dayNames[from.getDay()] + ', ' +
                       from.getDate() + '. ' + ArchiveChartComponent.monthNames[from.getMonth()] + ' ' + from.getFullYear()
            },
            animation: {
                duration: 1,
                easing: 'easeOutQuad',
                onComplete: () => {
                    const ctx = <CanvasRenderingContext2D>this.childChart.ctx;
                    // console.log(ctx);
                    // ctx.fillStyle = 'black';
                    // ctx.fillRect(10, 10, 20, 20);

                }
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
                        callback: (value) => Math.abs(value) < 1000 ? value + 'W' : Math.round(value / 10) / 100 + 'kW',
                    }
                }]
            }
        };

        try {
            const x = <any>this.childChart;
            if (x && x.chart && x.chart.scales && x.chart.scales) {
                // console.log(x.chart.scales);
                const y = x.chart.scales['y-axis-0'];
                if (y) {
                    const min = y.min;
                    const max = y.max;
                    if (typeof min === 'number' && typeof max === 'number') {}
                        if (this.checkboxYAuto && this.checkboxYAuto.nativeElement && !this.checkboxYAuto.nativeElement.checked) {
                            chart1Options.scales.yAxes[0].ticks.min = min;
                            chart1Options.scales.yAxes[0].ticks.max = max;
                    }
                }
            }
        } catch (err) {
            console.log(err);
        }

        const chart: INg4Chart = {
            params: p,
            datasets: [ ],
            options: chart1Options,
            legend: true,
            colors: [],
        };
        for (const id of Object.getOwnPropertyNames(chartData)) {
            const dataset: Charts.ChartDataSets = {
                label: id,
                data: chartData[id].values,
                hidden: false,
                type: 'line'
            };
            // if (id === 'pBat') {
            //     dataset.hidden = true;
            // }
            chart.datasets.push(dataset);
            const col = Object.assign({}, ArchiveChartComponent.defaultColors[id]);
            if (col) {
                delete col.backgroundColor;
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

        const archiveRequest: IArchiveRequest = {
            id:      this._requestCnt++,
            type:    'min10',
            dataIds: ids,
            from:    from,
            to:      to
        };
        const r = await this.dataService.getArchiv(new ArchiveRequest(archiveRequest));
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
            animation: {
                duration: 1
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

        try {
            const x = <any>this.childChart;
            if (x && x.chart && x.chart.scales && x.chart.scales) {
                // console.log(x.chart.scales);
                const y = x.chart.scales['y-axis-0'];
                if (y) {
                    const min = y.min;
                    const max = y.max;
                    if (typeof min === 'number' && typeof max === 'number') {}
                        if (this.checkboxYAuto && this.checkboxYAuto.nativeElement && !this.checkboxYAuto.nativeElement.checked) {
                            chart1Options.scales.yAxes[0].ticks.min = min;
                            chart1Options.scales.yAxes[0].ticks.max = max;
                    }
                }
            }
        } catch (err) {
            console.log(err);
        }

        const chart: INg4Chart = {
            params: p,
            datasets: [ ],
            options: chart1Options,
            legend: true,
            colors: [],
        };
        for (const id of ids) {
            const dataset: Charts.ChartDataSets = {
                label: id,
                data: values[id],
                hidden: false,
                type: 'line'
            };
            chart.datasets.push(dataset);
            const col = Object.assign({}, ArchiveChartComponent.defaultColors[id]);
            if (col) {
                delete col.backgroundColor;
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

        const archiveRequest: IArchiveRequest = {
            id:      this._requestCnt++,
            type:    'hour',
            dataIds: ids,
            from:    from,
            to:      to
        };
        const r = await this.dataService.getArchiv(new ArchiveRequest(archiveRequest));
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
            animation: {
                duration: 1
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

        try {
            const x = <any>this.childChart;
            if (x && x.chart && x.chart.scales && x.chart.scales) {
                // console.log(x.chart.scales);
                const y = x.chart.scales['y-axis-0'];
                if (y) {
                    const min = y.min;
                    const max = y.max;
                    if (typeof min === 'number' && typeof max === 'number') {}
                        if (this.checkboxYAuto && this.checkboxYAuto.nativeElement && !this.checkboxYAuto.nativeElement.checked) {
                            chart1Options.scales.yAxes[0].ticks.min = min;
                            chart1Options.scales.yAxes[0].ticks.max = max;
                    }
                }
            }
        } catch (err) {
            console.log(err);
        }

        const chart: INg4Chart = {
            params: p,
            datasets: [ ],
            options: chart1Options,
            legend: true,
            colors: [],
        };
        for (const id of ids) {
            const dataset: Charts.ChartDataSets = {
                label: id,
                data: values[id],
                hidden: false,
                type: 'line'
            };
            chart.datasets.push(dataset);
            const col = Object.assign({}, ArchiveChartComponent.defaultColors[id]);
            if (col) {
                delete col.backgroundColor;
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
            animation: {
                duration: 1
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
                    categoryPercentage: 0.8,
                    barPercentage: 1,
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

        const chart: INg4Chart = {
            params: p,
            datasets: [ ],
            options: chart1Options,
            legend: true,
            colors: [],
        };
        for (const id of ids) {
            const dataset: Charts.ChartDataSets = {
                label: id,
                data: values[id],
                hidden: false,
                type: 'bar',
                fill: true,
                // backgroundColor: 'black',
            };

            chart.datasets.push(dataset);
            const col = ArchiveChartComponent.defaultColors[id];
            if (col) {
                chart.colors.push(col);
            } else {
                chart.colors.push({ borderColor: 'lightgrey', pointRadius: 0 });
            }
        }

        return chart;
    }

    // private cloneNg4Chart (src: INg4Chart): INg4Chart {
    //     const rv: INg4Chart = {
    //         params:   null,
    //         legend:   src.legend === true,
    //         datasets: [],
    //         colors:   [],
    //         options:  {}
    //     };

    //     rv.params = {
    //         typ: src.params.typ,
    //         options: {
    //             start: new Date(src.params.options.start),
    //             end: new Date(src.params.options.end),
    //         }
    //     };

    //     if (Array.isArray(src.datasets)) {
    //         for (const ds of src.datasets) {
    //             const x: Charts.ChartDataSets = { data: [] };
    //             if (ds.label) { x.label = ds.label; }
    //             if (ds.hidden === true || ds.hidden === false) { x.hidden = ds.hidden; }
    //             if (ds.type) { x.type = ds.type; }
    //             if (Array.isArray(ds.data)) {
    //                 for (const d of ds.data) {
    //                     if (typeof d === 'number') {
    //                         x.data.push(d);
    //                     } else {
    //                         x.data.push(<any>Object.assign({}, d));
    //                     }
    //                 }
    //             }
    //             rv.datasets.push(x);
    //         }
    //     }

    //     if (Array.isArray(src.colors)) {
    //         for (const c of src.colors) {
    //             rv.colors.push(Object.assign({}, c));
    //         }
    //     }

    //     rv.options = src.options;

    //     return rv;
    // }


    private hovered (event: any) {
        console.log('hovered', event);
    }

    private clicked (event: any) {
        console.log('clicked', event);

        setTimeout( () => {
            try {
                for (let i = 0; i < this.chart.datasets.length; i++) {
                    const c = this.childChart.chart.getDatasetMeta(i);
                    this.childChart.datasets[i].hidden = (c.hidden === true);
                    // console.log(this.childChart.datasets[i].label, c.hidden === true);
                }

            } catch (err) {
                console.log(err);
            }
        }, 0);
    }

}



type TChartTyp = 'power' | 'energy';
type TChartAverage = 'minute' | 'min10' | 'hour' | 'day' | 'week' | 'month' | 'year';

interface IChartOptions {
    start: Date;
    end: Date;
}

interface IChartParams {
    config: string;
    options: IChartOptions;
}

interface IInputConfig<T> {
    id: string;
    disabled: boolean;
    firstLine: string;
    options: string [];
    value?: string;
    validator: ValidatorElement<T>;
}

interface INg4Chart {
    params:   IChartParams;
    legend:   boolean;
    datasets: Charts.ChartDataSets [];
    colors:   ngCharts.Color [];
    options:  Charts.ChartOptions;
}

interface IChartData {
    yAxis: {
        unit: string
    };
    label: string;
    pointStyle: { pointRadius?: number };
    values: {
        x: Date | string;
        y: number;
    } [];
}

export interface IYAxis {
    id?: number;  // used to combine axes with same id
    unit: string;
}

export interface IPointStyle {
    pointRadius?: number;
}

export interface IVariable {
    id: string;
    label: string;
    enabled?: boolean;
    def: IStatisticItemDefinition;
    yAxis: IYAxis;
    pointStyle?: IPointStyle;
}


export interface IArchiveChartConfig {
    name: string;
    variables: IVariable [];
}
