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

@Component({
    selector: 'app-chart',
    templateUrl: './chart.component.html',
})
export class ChartComponent implements OnInit, OnDestroy {

    @ViewChild(BaseChartDirective)
    public chart: ngCharts.BaseChartDirective;

    public charts: INg4Chart [] = [];

    private _monitorValuesSubsciption: Subscription;

    constructor (private dataService: DataService, private historyService: HistoryService) {
        const chart1Options: Charts.ChartOptions = {
            responsive: true,
            tooltips: {
                mode: 'index',
                intersect: false,
            }

        };
        const xLabels: string [] = [];
        for (let i = 0; i <= 24; i++) {
            xLabels.push(sprintf('%02d:00', i));
        }
        const chart1: INg4Chart = {
            data: null,
            labels: xLabels,
            datasets: [ { data: [ 1, 2, 3, 4, 5 ], label: 'test'} ],
            options: chart1Options,
            legend: true,
            type: 'line',
            colors: [ { backgroundColor: 'black', borderColor: 'red', pointRadius: 0 } ],
            hovered: (ev) => this.hovered(ev),
            clicked: (ev) => this.clicked(ev)
        };
        this.charts.push(chart1);
    }

    public ngOnInit () {
        this._monitorValuesSubsciption =
            this.dataService.monitorObservable.subscribe((value) => this.handleMonitorValues(value));
        // this.historyService.fromEvent('pgrid').subscribe( (pgrid) => {
        //     console.log(pgrid);
        // });
    }

    public ngOnDestroy() {
        this._monitorValuesSubsciption.unsubscribe();
    }


    private handleMonitorValues (v: MonitorRecord) {
    }

    private hovered (event: any) {
        console.log('hovered', event);
    }

    private clicked (event: any) {
        console.log('clicked', event);
    }

}

interface INg4Chart {
    data?:    number[] | any [],
    datasets: { data: number [], label: string } [];
    labels:   string [];
    options:  Charts.ChartOptions; // { scaleShowVerticalLines: boolean, responsive: boolean};
    legend:   boolean;
    type:     Charts.ChartType;
    colors:   ngCharts.Color [];
    hovered:  (event) => void;
    clicked:  (event) => void;
}

