import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { DataService } from '../services/data.service';
import { Subscription } from 'rxjs';
import { MonitorRecord } from '../data/common/home-control/monitor-record';
import { MonitorRecord as BoilerMonitorRecord } from '../data/common/hot-water-controller/monitor-record';
import { ControllerParameter, IControllerParameter } from '../data/common/hot-water-controller/controller-parameter';
import { ControllerStatus } from '../data/common/hot-water-controller/controller-status';
import { ValidatorElement } from '../directives/validator.directive';
import { ageToString } from '../utils/util';
import { ISyncButtonConfig } from './sync-button.component';
import { INibe1155ControllerComponentConfig } from './nibe1155-controller.component';
import { ControllerMode } from '../data/common/hot-water-controller/controller-mode';

@Component({
    selector: 'app-boiler-controller',
    templateUrl: 'boiler-controller.component.html',
    styles: [`
    .ng-valid[required], .ng-valid.required  {
        border-left: 5px solid #00ff00; /* green */
      }
      .ng-invalid:not(form)  {
        border-left: 5px solid #ff0000; /* red */
      }
    `]

})
export class BoilerControllerComponent implements OnInit, OnDestroy {

    @Input() config: INibe1155ControllerComponentConfig;
    @Input() data: any;

    public validatorMode: ValidatorElement<string>;
    public validatorPin: ValidatorElement<string>;
    public currentMode: string;
    public inputs: IInput [] = [];
    public buttonConfig: ISyncButtonConfig;

    private _monitorValuesSubsciption: Subscription;
    private _inputPower: IInput;
    private _eBatMin: IInput;
    private _minWatts: IInput;
    private _maxWatts: IInput;

    private _lastMonitorRecord: BoilerMonitorRecord;


    constructor (private dataService: DataService) {
        this.currentMode = '?';

        this.buttonConfig = {
            text: 'Senden',
            classes: { default: 'btn btn-primary', onSuccess: 'btn btn-success', onError: 'btn btn-danger' },
            handler: {
                onClick: (cfg) => this.onSubmit(cfg),
                onCancel: (cfg) => this.onCancel(cfg)
            }
        };

        this.validatorMode = new ValidatorElement<string>(
            'off', (e, n, v) => {
                switch (v) {
                    case 'off': {
                        this._eBatMin.hidden = true;
                        this._inputPower.hidden = true;
                        this._minWatts.hidden = true;
                        this._maxWatts.hidden = true;
                        break;
                    }

                    case 'power': {
                        this._eBatMin.hidden = true;
                        this._minWatts.hidden = true;
                        this._maxWatts.hidden = true;
                        if (this._lastMonitorRecord) {
                            const p = this._lastMonitorRecord.getActivePowerAsNumber();
                            if (p > 0) {
                                this._inputPower.validator.value = Math.round(p / 100) * 100;
                            } else {
                                this._inputPower.validator.value = 2000;
                            }
                        }
                        this._inputPower.hidden = false;
                        break;
                    }

                    case 'smart': {
                        this._inputPower.hidden = true;
                        this._eBatMin.hidden = false;
                        this._minWatts.hidden = false;
                        this._maxWatts.hidden = false;
                        if (this._lastMonitorRecord) {
                            this._inputPower.validator.value = 2000;
                        }
                        break;
                    }

                }
            });


        this._inputPower = {
            id: 'idPower', type: 'number', key: 'Leistung/W', name: 'power',
            min: 0, max: 2000, hidden: true, validator: null, pattern: '[0-9]*', mode: ''
        };
        this._inputPower.validator = new ValidatorElement<number>(2000, null, (e, n, v) => {
            if (Number.isNaN(+v)) { return false; }
            if (+v < 0) { return false; }
            if (+v > 2000) { return false; }
            return true;
        });

        this._eBatMin = {
            id: 'idEBatMin', type: 'number', key: 'E-Batt / %', name: 'ebatmin',
            min: 0, max: 100, hidden: true, validator: null, pattern: '[0-9]*', mode: ''
        };
        this._eBatMin.validator = new ValidatorElement<number>(90, null, (e, n, v) => {
            if (Number.isNaN(+v)) { return false; }
            if (+v < 0) { return false; }
            if (+v > 100) { return false; }
            return true;
        });

        this._minWatts = {
            id: 'idMinWatts', type: 'number', key: 'P-Min / W', name: 'minwatts',
            min: 0, max: 2000, hidden: true, validator: null, pattern: '[0-9]*', mode: ''
        };
        this._minWatts.validator = new ValidatorElement<number>(0, null, (e, n, v) => {
            if (Number.isNaN(+v)) { return false; }
            if (+v < 0) { return false; }
            if (+v > 2000) { return false; }
            return true;
        });

        this._maxWatts = {
            id: 'idMinWatts', type: 'number', key: 'P-Max / W', name: 'maxwatts',
            min: 0, max: 2000, hidden: true, validator: null, pattern: '[0-9]*', mode: ''
        };
        this._maxWatts.validator = new ValidatorElement<number>(2000, null, (e, n, v) => {
            if (Number.isNaN(+v)) { return false; }
            if (+v < 0) { return false; }
            if (+v > 2000) { return false; }
            return true;
        });


        this.inputs = [
            this._inputPower, this._eBatMin, this._minWatts, this._maxWatts
        ];

    }

    public ngOnInit () {
        this._monitorValuesSubsciption =
            this.dataService.monitorObservable.subscribe((value) => this.handleMonitorValues(value));
    }

    public ngOnDestroy() {
        this._monitorValuesSubsciption.unsubscribe();
        this._monitorValuesSubsciption = null;
    }

    public async onCancel (cfg: ISyncButtonConfig) {
        console.log('cancel', cfg);
    }

    public async onSubmit(cfg: ISyncButtonConfig): Promise<void> {
        try {
            console.log('--> onSubmit --> setBoilerMode');
            const pData: IControllerParameter = {
                createdAt:        new Date(),
                from:             'BoilerControllerComponent',
                mode:             <ControllerMode>this.validatorMode.value,
                desiredWatts:     this._inputPower.validator.value,
                smart: {
                    minEBatPercent: this._eBatMin.validator.value,
                    minWatts:       this._minWatts.validator.value,
                    maxWatts:       this._maxWatts.validator.value
                }
            };
            if (pData.mode === ControllerMode.off) {
                pData.desiredWatts = 0;
            }

            const p = new ControllerParameter(pData);
            const rv = await this.dataService.setBoilerControllerParameter(p);
            console.log(rv);
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    private handleMonitorValues (v: MonitorRecord) {
        const m = v.boiler;
        const mode = m ? m.getModeAsString(10000) : null;
        // console.log(mode);
        if (!m) {
            this.currentMode = '?';
        } else {
            this.currentMode = mode;
            // if (m) {
            //     this.currentMode += ' (' + ageToString(m.createdAt) + ')';
            // }

            // if (!this._lastMonitorRecord) {
            //     this._inputPower.validator.value = m.setpointPower.value;
            // }
            this._lastMonitorRecord = m;
        }
    }

}

interface IInput {
    id: string;
    key: string;
    type: string;
    name: string;
    min: string | number;
    max: string | number;
    hidden: boolean;
    pattern: string;
    mode: string;
    validator: ValidatorElement<any>;
}

