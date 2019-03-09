// https://ng-bootstrap.github.io/#/components/modal/examples

// https://www.npmjs.com/package/@fortawesome/angular-fontawesome
// npm install @fortawesome/fontawesome-svg-core @fortawesome/free-solid-svg-icons @fortawesome/angular-fontawesome

import { Component, Input, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgbModalConfig, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { IArchiveChartConfig, IVariable } from '../components/archive-chart.component';
import { ValidatorElement } from '../directives/validator.directive';

export interface IModalArchiveChartConfig {
    title?: string;
    existingNames: string [];
    chartConfig: IArchiveChartConfig;
}

@Component({
    selector: 'app-modal-archive-chart',
    exportAs: 'ModalArchiveChartComponent',
    templateUrl: 'modal-archive-chart.component.html',
    styles: [ `
        .ng-valid[required], .ng-valid.required  {
            border-left: 5px solid green
        }
        .ng-invalid:not(form) {
            border-left: 5px solid red
        }
        .variable-enabled.active {
            font-weight: bold;
            color: green;
        }
        .variable-enabled {
            font-weight: bold;
            background-color: rgb(204,255,204);
        }
    `]
})
export class ModalArchiveChartComponent {

    @ViewChild('content') content: ElementRef;

    public title: string;
    public focusName: EventEmitter<boolean> = new EventEmitter();

    public isNameEditable: boolean;
    public nameValidator: ValidatorElement<string>;
    public deleteButtonVisible: boolean;
    public copyButtonVisible: boolean;
    public variables: IVariableExt [] = [];
    public formGroup: FormGroup;
    public archiveConfig: IModalArchiveChartConfig;

    private _modalReference: NgbModalRef;
    private _waiting: { res: (result: IModalArchiveChartConfig) => void, rej: (error: Error | 'cancel' | 'delete') => void };
    private _recentChartConfig: IModalArchiveChartConfig;

    constructor (config: NgbModalConfig, private modalService: NgbModal) {
        // customize default values of modals used by this component tree
        console.log('ModalArchiveChartConfigComponent constructor');
        config.backdrop = 'static';
        config.keyboard = false;
        this.nameValidator =  new ValidatorElement<string>('', (e, n, v) => this.handleConfigNameChange(e, n, v), (e, n, v) => this.isConfigNameValid(e, n, v));
        this.deleteButtonVisible = true;
        this.formGroup = new FormGroup({});

    }


    public open (content) {
        this._modalReference = this.modalService.open(content, { size: 'lg' });
    }


    public async show (config?: IModalArchiveChartConfig): Promise<IModalArchiveChartConfig> {
        if (this._modalReference) {
            return Promise.resolve(null); // null -> authorization in progress
        }
        if (!config || !config.chartConfig.name) {
            return Promise.reject(new Error('invalid config'));
        }
        this._recentChartConfig = config;
        this.archiveConfig = {
            existingNames: config.existingNames,
            chartConfig: {
                name: config.chartConfig.name,
                variables: []
            }
        };
        for (const v of config.chartConfig.variables) {
            const ve: IVariableExt = Object.assign({}, v);
            this.archiveConfig.chartConfig.variables.push(ve);
        }

        this.title = config.title || 'Konfiguration';
        this.nameValidator.value = this.archiveConfig.chartConfig.name;
        this.isNameEditable = config.chartConfig.name !== 'Default';
        this.deleteButtonVisible = config.chartConfig.name !== 'Default';
        this.copyButtonVisible = true;
        this.variables = this.archiveConfig.chartConfig.variables;
        const fgItems: { [ key: string ]: FormControl } = {
            configName: new FormControl(this.archiveConfig.chartConfig.name)
        };
        for (const v of this.variables) {
            fgItems[v.id] = new FormControl(v.label);
        }
        this.formGroup = new FormGroup(fgItems);

        return new Promise<IModalArchiveChartConfig> ( (res, rej) => {
            this._waiting = { res: res, rej: rej };
            this._modalReference = this.modalService.open(this.content);
        });
    }


    public onCancel () {
        this._modalReference = null;
        if (!this._waiting) {
            console.log('Error - missing promise...');
        } else {
            const rej = this._waiting.rej;
            this._waiting = null;
            rej('cancel');
        }

    }


    public onOk () {
        if (!this.nameValidator.value) {
            console.log('illegal value');
            return;
        }
        this._modalReference = null;
        if (!this._waiting) {
            console.log('Error - missing promise...');
            return;
        }
        const res = this._waiting.res;
        this._waiting = null;
        this.archiveConfig.chartConfig.name = this.nameValidator.value;
        for (const v of this.archiveConfig.chartConfig.variables) {
            const label = this.formGroup.value[v.id];
            if (label) {
                v.label = label;
            } else {
                delete v.label;
            }
        }

        if (this.nameValidator.value !== this._recentChartConfig.chartConfig.name) {
            if (this.copyButtonVisible) {
                const index = this.archiveConfig.existingNames.findIndex( (c) => c === this._recentChartConfig.chartConfig.name);
                if (index >= 0) {
                    this.archiveConfig.existingNames[index] = this.nameValidator.value;
                }
            } else {
                this.archiveConfig.existingNames.push(this.nameValidator.value);
            }
        }

        res(this.archiveConfig);
    }

    public onDeleteConfig () {
        this._modalReference = null;
        if (!this._waiting) {
            console.log('Error - missing promise...');
        } else {
            const res = this._waiting.res;
            const rej = this._waiting.rej;
            this._waiting = null;
            rej('delete');
        }
    }

    public onCopyConfig () {
        this.archiveConfig.chartConfig.name = '';
        this.nameValidator.value = '';
        this.isNameEditable = true;
        this.copyButtonVisible = false;
        setTimeout(() => {
            this.focusName.emit(true);
        }, 10);
    }

    public keyDown (event) {
        // check enter on keyboard
        if (event.keyCode === 13) {
            if (!this.formGroup.invalid) {
                setTimeout( () => {
                    this._modalReference.close('enter');
                    this.onOk();
                }, 1);

            }
        }
    }

    public onClickVariable (selected: IVariableExt) {
        // for (const v of this.variables) {
        //     if (v === selected) {
        //         selected.active = true;
        //     } else {
        //         selected.active = false;
        //     }
        // }
    }

    public onClickVariableConfig (v: IVariableExt) {
        console.log('config ' + v.id);
    }

    public onCheckboxChange (v: IVariableExt) {
        console.log(v);
    }


    private handleConfigNameChange (el: ValidatorElement<string>, name: string, newValue: string) {
        // console.log(newValue);
    }

    private isConfigNameValid (el: ValidatorElement<string>, name: string, newValue: string): boolean {
        if (newValue === 'Default' || newValue === '') {
            return false;
        }
        if (newValue === this._recentChartConfig.chartConfig.name) {
            return true;
        }
        for (const n of this.archiveConfig.existingNames) {
            if (n === newValue) {
                return false;
            }
        }
        return true;
    }

}

interface IVariableExt extends IVariable {
    active?: boolean;
}
