// add "node_modules/chart.js/dist/Chart.bundle.min.js" in angular.json (architect->build->options->scripts)

// https://www.npmjs.com/package/ng4-charts
// https://www.chartjs.org/
// https://github.com/valor-software/ng2-charts/blob/development/src/charts/charts.ts
// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/chart.js/index.d.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataService } from '../services/data.service';
import { sprintf } from 'sprintf-js';
import { HistoryService } from '../services/history.service';

@Component({
    selector: 'app-archive',
    templateUrl: './archive.component.html',
})
export class ArchiveComponent implements OnInit, OnDestroy {

    public charts: boolean [] = [ true ];

    constructor (private dataService: DataService, private historyService: HistoryService) {
    }

    public async ngOnInit () {
    }

    public ngOnDestroy() {
    }
}



