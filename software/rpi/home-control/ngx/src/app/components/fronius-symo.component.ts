// https://ng-bootstrap.github.io/#/components/accordion/api
// https://ng-bootstrap.github.io/#/components/accordion/examples

import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { NgbPanelChangeEvent, NgbAccordion } from '@ng-bootstrap/ng-bootstrap';
import { DataService } from '../services/data.service';
import { ConfigService } from '../services/config.service';
import { Subscription } from 'rxjs';
import { sprintf } from 'sprintf-js';
import { MonitorRecord } from '../data/common/home-control/monitor-record';
import { ageToString, timeStampAsString } from '../utils/util';
import { FroniusSymo } from '../data/common/fronius-symo/fronius-symo';
import { FroniusSymoModbusRegisters } from '../data/common/fronius-symo/fronius-symo-modbus-registers';
import { IRegisterDefinition, RegisterDefinition } from '../data/common/modbus/register-definition';
import { FroniusSymoModel } from '../data/common/fronius-symo/fronius-symo-model';

@Component({
    selector: 'app-fronius-symo',
    templateUrl: 'fronius-symo.component.html',
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
export class FroniusSymoComponent implements OnInit, OnDestroy {

    @ViewChild('acc') accComponent: NgbAccordion;
    public accordion: IAccordion;
    public showWarning = false;

    private _accordionData: {
        activeIds:         string | string [];
        overview:          IAccordionPanel;
        register:          IAccordionPanel;
        inverter:          IAccordionPanel;
        inverterExt:       IAccordionPanel;
        common:            IAccordionPanel;
        settings:          IAccordionPanel;
        status:            IAccordionPanel;
        control:           IAccordionPanel;
        storage:           IAccordionPanel;
        modbusRegister:    IAccordionPanel;
        modbusInverter:    IAccordionPanel;
        modbusInverterExt: IAccordionPanel;
        modbusCommon:      IAccordionPanel;
        modbusSettings:    IAccordionPanel;
        modbusStatus:      IAccordionPanel;
        modbusControl:     IAccordionPanel;
        modbusStorage:     IAccordionPanel;
    };


    private _timer: any;
    private _subsciption: Subscription;
    private _monitorValuesSubsciption: Subscription;

    public constructor (private _dataService: DataService, private _configService: ConfigService) {
        // console.log('constructor');
        const x = this._configService.pop('fronius-symo:__accordionData');
        if (x) {
            this._accordionData = x;
        } else {
            this._accordionData = {
                activeIds: [],
                overview:    { id: 'fronius-symo-overview', title: 'Symo Überblick', infos: [] },
                register:    { id: 'register', title: 'Register', infos: [] },
                inverter:    { id: 'inverter', title: 'Inverter', infos: [] },
                inverterExt: { id: 'inverter-ext', title: 'Inverter Extension', infos: [] },
                common:      { id: 'common', title: 'Common', infos: [] },
                settings:    { id: 'settings', title: 'Settings', infos: [] },
                status:      { id: 'status', title: 'Status', infos: [] },
                control:     { id: 'control', title: 'Control', infos: [] },
                storage:     { id: 'storage', title: 'Storage', infos: [] },
                modbusRegister:    { id: 'modbus-register', title: 'Modbus Register', infos: [] },
                modbusInverter:    { id: 'modbus-inverter', title: 'Modbus Inverter', infos: [] },
                modbusInverterExt: { id: 'modbus-inverter-ext', title: 'Modbus Inverter Extension', infos: [] },
                modbusCommon:      { id: 'modbus-common', title: 'Modbus Common', infos: [] },
                modbusSettings:    { id: 'modbus-settings', title: 'Modbus Settings', infos: [] },
                modbusStatus:      { id: 'modbus-status', title: 'Modbus Status', infos: [] },
                modbusControl:     { id: 'modbus-control', title: 'Modbus Control', infos: [] },
                modbusStorage:     { id: 'modbus-storage', title: 'Modbus Storage', infos: [] }
            };
        }
    }

    public ngOnInit () {
        console.log('BoilerComponent:onInit()');
        this.accordion = {
            activeIds: this._accordionData.activeIds,
            panels: [
                this._accordionData.overview,
                this._accordionData.register,
                this._accordionData.inverter,
                this._accordionData.inverterExt,
                this._accordionData.common,
                this._accordionData.settings,
                this._accordionData.status,
                this._accordionData.control,
                this._accordionData.storage,
                this._accordionData.modbusRegister,
                this._accordionData.modbusInverter,
                this._accordionData.modbusInverterExt,
                this._accordionData.modbusCommon,
                this._accordionData.modbusSettings,
                this._accordionData.modbusStatus,
                this._accordionData.modbusControl,
                this._accordionData.modbusStorage
            ]
        };
        if (!Array.isArray(this._accordionData.activeIds) || this._accordionData.activeIds.length === 0) {
            this._accordionData.activeIds = [ 'fronius-symo-overview' ];
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
        this._configService.push('fronius-symo:__accordionData', this._accordionData);
        this._monitorValuesSubsciption.unsubscribe();
        this._monitorValuesSubsciption = null;
    }

    public onAccordionChange (event: NgbPanelChangeEvent) {
        setTimeout(() => {
            this._accordionData.activeIds = this.accComponent.activeIds;
        }, 0);
    }



    private handleMonitorValues (v: MonitorRecord) {
        // console.log(v.hwcMonitorRecord);
        this.showWarning = false;
        for (const p of this.accordion.panels) {
            if (this.accComponent.activeIds.indexOf(p.id) >= 0) {
                switch (p.id) {
                    case 'fronius-symo-overview': this.handleOverview(v); break;
                    // case 'inverter': this.handleInverter(v.froniussymo);
                    case 'register': {
                        const def = FroniusSymoModbusRegisters.regDefByLabel.register;
                        this.handleModel(this._accordionData.register, def, v.froniussymo.register);
                        break;
                    }
                    case 'inverter': {
                        const def = FroniusSymoModbusRegisters.regDefByLabel.inverter;
                        this.handleModel(this._accordionData.inverter, def, v.froniussymo.inverter);
                        break;
                    }
                    case 'inverter-ext': {
                        const def = FroniusSymoModbusRegisters.regDefByLabel.inverterExtension;
                        this.handleModel(this._accordionData.inverterExt, def, v.froniussymo.inverterExtension);
                        break;
                    }
                    case 'common': {
                        const def = FroniusSymoModbusRegisters.regDefByLabel.common;
                        this.handleModel(this._accordionData.common, def, v.froniussymo.common);
                        break;
                    }
                    case 'settings': {
                        const def = FroniusSymoModbusRegisters.regDefByLabel.settings;
                        this.handleModel(this._accordionData.settings, def, v.froniussymo.settings);
                        break;
                    }
                    case 'status': {
                        const def = FroniusSymoModbusRegisters.regDefByLabel.status;
                        this.handleModel(this._accordionData.status, def, v.froniussymo.status);
                        break;
                    }
                    case 'control': {
                        const def = FroniusSymoModbusRegisters.regDefByLabel.control;
                        this.handleModel(this._accordionData.control, def, v.froniussymo.control);
                        break;
                    }
                    case 'storage': {
                        const def = FroniusSymoModbusRegisters.regDefByLabel.storage;
                        this.handleModel(this._accordionData.storage, def, v.froniussymo.storage);
                        break;
                    }
                    case 'modbus-register': {
                        const def = FroniusSymoModbusRegisters.regDefByLabel.register;
                        this.handleModbusRegister(this._accordionData.modbusRegister, def, v.froniussymo.register);
                        break;
                    }
                    case 'modbus-inverter': {
                        const def = FroniusSymoModbusRegisters.regDefByLabel.inverter;
                        this.handleModbusRegister(this._accordionData.modbusInverter, def, v.froniussymo.inverter);
                        break;
                    }
                    case 'modbus-inverter-ext': {
                        const def = FroniusSymoModbusRegisters.regDefByLabel.inverterExtension;
                        this.handleModbusRegister(this._accordionData.modbusInverterExt, def, v.froniussymo.inverterExtension);
                        break;
                    }
                    case 'modbus-common': {
                        const def = FroniusSymoModbusRegisters.regDefByLabel.common;
                        this.handleModbusRegister(this._accordionData.modbusCommon, def, v.froniussymo.common);
                        break;
                    }
                    case 'modbus-settings': {
                        const def = FroniusSymoModbusRegisters.regDefByLabel.settings;
                        this.handleModbusRegister(this._accordionData.modbusSettings, def, v.froniussymo.settings);
                        break;
                    }
                    case 'modbus-status': {
                        const def = FroniusSymoModbusRegisters.regDefByLabel.status;
                        this.handleModbusRegister(this._accordionData.modbusStatus, def, v.froniussymo.status);
                        break;
                    }
                    case 'modbus-control': {
                        const def = FroniusSymoModbusRegisters.regDefByLabel.control;
                        this.handleModbusRegister(this._accordionData.modbusControl, def, v.froniussymo.control);
                        break;
                    }
                    case 'modbus-storage': {
                        const def = FroniusSymoModbusRegisters.regDefByLabel.storage;
                        this.handleModbusRegister(this._accordionData.modbusStorage, def, v.froniussymo.storage);
                        break;
                    }

                    default: {
                        console.log(new Error('unknown p.id ' + p.id));
                        this.showWarning = true;
                    }
                }
            }

        }
    }


    private handleOverview (v?: MonitorRecord) {
        const a = this._accordionData.overview;
        const symo = v ? v.froniussymo : null;
        const items: { key: string, value: string } [] = [];
        items.push({ key: 'SiteEnergyDay', value: '?' });

        if (symo) {
            for (const o of items) {
                let val = '?';
                try {
                    switch (o.key) {
                        case 'SiteEnergyDay': {
                            const x = symo.register ? symo.register.f_site_energy_day : null;
                            if (x && x.at instanceof Date && x.value >= 0) {
                                val = x.value + 'Wh (' + ageToString(x.at) + ')';
                            }
                            break;
                        }
                        default: {
                            console.log(new Error('unsupported attribute ' + o.key));
                            this.showWarning = true;
                            break;
                        }
                    }
                } catch (err) {
                    console.log(err);
                }
                o.value = val;
            }
        }
        a.infos = this.createAccordionInfo(items);
    }

    private handleInverter (symo?: FroniusSymo) {
        const a = this._accordionData.inverter;
        try {
            const items: { key: string, value: string } [] = [];
            const def = FroniusSymoModbusRegisters.regDefByLabel.inverter;

            const at = symo.inverter.registerValues.regBlocks[0].at;
            items.push({ key: 'Datum/Zeit', value: timeStampAsString(at) } );

            if (symo) {
                for (const att of Object.getOwnPropertyNames(def)) {
                    const d = <IRegisterDefinition>def[att];
                    const ids =  RegisterDefinition.getIds([d]);
                    const v = <{ at: Date, value: number }>(symo.inverter ? symo.inverter[att] : null);
                    if (!v || ids.length <= 0) { continue; }
                    const id = ids.length === 1 ? ids[0].toString() : ids[0] + '..' + ids[ids.length - 1];
                    items.push({
                        key: att + ' (' + id + ')',
                        value: sprintf(d.format, v.value) + (d.unit ? d.unit : '')
                    });
                }
            }
            a.infos = this.createAccordionInfo(items);
        } catch (err) {
            a.infos = [];
            console.log(err);
            this.showWarning = true;
        }
    }

    private handleModbusRegister (acc: IAccordionPanel, def: { [ label: string]: IRegisterDefinition }, model: FroniusSymoModel<any, any>) {
        try {
            const items: { key: string, value: string } [] = [];

            const at = model.registerValues.regBlocks[0].at;
            items.push({ key: 'Datum/Zeit', value: timeStampAsString(at) } );

            for (const att of Object.getOwnPropertyNames(def)) {
                const d = <IRegisterDefinition>def[att];
                const ids =  RegisterDefinition.getIds([d]);

                for (const id of ids) {
                    const x = model.registerValues.getValue(id);
                    items.push({
                        key: att + ' (' + id + ')',
                        value: sprintf('%d', x.value)
                    });
                }
            }
            acc.infos = this.createAccordionInfo(items);

        } catch (err) {
            acc.infos = [];
            console.log(err);
            this.showWarning = true;
        }
    }

    private handleModel (acc: IAccordionPanel, def: { [ label: string]: IRegisterDefinition }, model: FroniusSymoModel<any, any>) {
        try {
            const items: { key: string, value: string } [] = [];

            const at = model.registerValues.regBlocks[0].at;
            items.push({ key: 'Datum/Zeit', value: timeStampAsString(at) } );

            for (const att of Object.getOwnPropertyNames(def)) {
                const d = <IRegisterDefinition>def[att];
                const ids =  RegisterDefinition.getIds([d]);
                const v = <{ at: Date, value: number }>(model ? model[att] : null);
                if (!v || ids.length <= 0) { continue; }
                const id = ids.length === 1 ? ids[0].toString() : ids[0] + '..' + ids[ids.length - 1];
                items.push({
                    key: att + ' (' + id + ')',
                    value: sprintf(d.format, v.value) + (d.unit ? d.unit : '')
                });

            }
            acc.infos = this.createAccordionInfo(items);

        } catch (err) {
            acc.infos = [];
            console.log(err);
            this.showWarning = true;
        }
    }

    private handleModbusInverter (symo?: FroniusSymo) {
        const a = this._accordionData.inverter;
        const items: { key: string, value: string } [] = [];
        const def = FroniusSymoModbusRegisters.regDefByLabel.inverter;

        if (symo) {
            for (const att of Object.getOwnPropertyNames(def)) {
                const d = <IRegisterDefinition>def[att];
                const ids =  RegisterDefinition.getIds([d]);

                for (const id of ids) {
                    const x = symo.inverter.registerValues.getValue(id);
                    items.push({
                        key: att + ' (' + id + ')',
                        value: sprintf('%d', x.value)
                    });
                }
            }
        }
        a.infos = this.createAccordionInfo(items);
    }

    private isValueOk (v: { valueAt: Date }, timeoutMillis: number) {
        if (!v || !v.valueAt) { return false; }
        return (Date.now() - v.valueAt.getTime()) < timeoutMillis;
    }


    private createAccordionInfo (data: any, width?: string): { key: string, value: string, width: string } [] {
        const rv: { key: string, value: string, width: string } [] = [];
        let kLength = 0;
        if (Array.isArray(data)) {
            for (const item of data) {
                rv.push( { key: item.key, value: item.value, width: width } );
                kLength = Math.max(kLength, item.key.length);
            }

        } else {
            for (const k in data) {
                if (!data.hasOwnProperty(k)) { continue; }
                let v = data[k];
                if (v instanceof Date) {
                    v = v.toLocaleString();
                }
                rv.push( { key: k, value: v, width: width } );
                kLength = Math.max(kLength, k.length);
            }
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
