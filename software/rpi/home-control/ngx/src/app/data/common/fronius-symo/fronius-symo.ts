

import { sprintf } from 'sprintf-js';

import { CommonLogger } from '../../common-logger';
import { DataRecord } from '../data-record';
import { FroniusSymoModelRegister, IFroniusSymoModelRegister } from './fronius-symo-model-register';
import { FroniusSymoModelCommon, IFroniusSymoModelCommon } from './fronius-symo-model-common';
import { FroniusSymoModelInverter, IFroniusSymoModelInverter } from './fronius-symo-model-inverter';
import { FroniusSymoModelNameplate, IFroniusSymoModelNameplate } from './fronius-symo-model-nameplate';
import { FroniusSymoModelSettings, IFroniusSymoModelSettings } from './fronius-symo-model-settings';
import { FroniusSymoModelStatus, IFroniusSymoModelStatus } from './fronius-symo-model-status';
import { FroniusSymoModelControl, IFroniusSymoModelControl } from './fronius-symo-model-control';
import { FroniusSymoModelStorage, IFroniusSymoModelStorage } from './fronius-symo-model-storage';
import { FroniusSymoModelInverterExtension, IFroniusSymoModelInverterExtension } from './fronius-symo-model-inverter-extension';

export interface IFroniusSymo {
    createdAt:          Date | number | string;
    register?:          IFroniusSymoModelRegister;
    common?:            IFroniusSymoModelCommon;
    inverter?:          IFroniusSymoModelInverter;
    nameplate?:         IFroniusSymoModelNameplate;
    settings?:          IFroniusSymoModelSettings;
    status?:            IFroniusSymoModelStatus;
    control?:           IFroniusSymoModelControl;
    storage?:           IFroniusSymoModelStorage;
    inverterExtension?: IFroniusSymoModelInverterExtension;
}

export class FroniusSymo extends DataRecord<IFroniusSymo> implements IFroniusSymo {

    public static createInstance (): FroniusSymo {
        const data: IFroniusSymo = {
            createdAt:         new Date(),
            register:          FroniusSymoModelRegister.createInstance().toObject(),
            common:            FroniusSymoModelCommon.createInstance().toObject(),
            inverter:          FroniusSymoModelInverter.createInstance().toObject(),
            nameplate:         FroniusSymoModelNameplate.createInstance().toObject(),
            settings:          FroniusSymoModelSettings.createInstance().toObject(),
            status:            FroniusSymoModelStatus.createInstance().toObject(),
            control:           FroniusSymoModelControl.createInstance().toObject(),
            storage:           FroniusSymoModelStorage.createInstance().toObject(),
            inverterExtension: FroniusSymoModelInverterExtension.createInstance().toObject()
        };
        return new FroniusSymo(data);
    }

    private _createdAt: Date;
    private _register:  FroniusSymoModelRegister;
    private _common:    FroniusSymoModelCommon;
    private _inverter:  FroniusSymoModelInverter;
    private _nameplate: FroniusSymoModelNameplate;
    private _settings: FroniusSymoModelSettings;
    private _status: FroniusSymoModelStatus;
    private _control: FroniusSymoModelControl;
    private _storage: FroniusSymoModelStorage;
    private _inverterExtension: FroniusSymoModelInverterExtension;

    public constructor (data: IFroniusSymo) {
        super(data);
        try {
            const missing = DataRecord.getMissingAttributes( data, [ 'createdAt'  ]);
            if (missing) {
                throw new Error('missing attribute ' + missing);
            }
            let attCnt = 0;
            for (const a of Object.getOwnPropertyNames(data)) {
                switch (a) {
                    case 'createdAt':         this._createdAt         = DataRecord.parseDate(data, { attribute: 'createdAt', validate: true }); break;
                    case 'register':          this._register          = new FroniusSymoModelRegister(data.register); break;
                    case 'common':            this._common            = new FroniusSymoModelCommon(data.common); break;
                    case 'inverter':          this._inverter          = new FroniusSymoModelInverter(data.inverter); break;
                    case 'nameplate':         this._nameplate         = new FroniusSymoModelNameplate(data.nameplate); break;
                    case 'settings':          this._settings          = new FroniusSymoModelSettings(data.settings); break;
                    case 'status':            this._status            = new FroniusSymoModelStatus(data.status); break;
                    case 'control':           this._control           = new FroniusSymoModelControl(data.control); break;
                    case 'storage':           this._storage           = new FroniusSymoModelStorage(data.storage); break;
                    case 'inverterExtension': this._inverterExtension = new FroniusSymoModelInverterExtension(data.inverterExtension); break;
                    default: throw new Error('attribute ' + a + ' not found in data:IFroniusSymo');
                }
                attCnt++;
            }
            if (attCnt !== Object.getOwnPropertyNames(this).length) {
                throw new Error('attribute count mismatch');
            }
        } catch (err) {
            throw new FroniusSymoError(data, 'parsing IFroniusSymo fails', err);
        }
    }

    public toObject (preserveDate = true): IFroniusSymo {
        const rv: IFroniusSymo = {
            createdAt: preserveDate ? this._createdAt : this._createdAt.getTime(),
        };
        if (this._register) { rv.register = this._register.toObject(preserveDate); }
        if (this._common) { rv.common = this._common.toObject(preserveDate); }
        if (this._inverter) { rv.inverter = this._inverter.toObject(preserveDate); }
        if (this._nameplate) { rv.nameplate = this._nameplate.toObject(preserveDate); }
        if (this._settings) { rv.settings = this._settings.toObject(preserveDate); }
        if (this._status) { rv.status = this._status.toObject(preserveDate); }
        if (this._control) { rv.control = this._control.toObject(preserveDate); }
        if (this._storage) { rv.storage = this._storage.toObject(preserveDate); }
        if (this._inverterExtension) { rv.inverterExtension = this._inverterExtension.toObject(preserveDate); }

        return rv;
    }

    public get createdAt (): Date {
        return this._createdAt;
    }

    public get register (): FroniusSymoModelRegister {
        return this._register;
    }

    public get common (): FroniusSymoModelCommon {
        return this._common;
    }

    public get inverter (): FroniusSymoModelInverter {
        return this._inverter;
    }

    public get nameplate (): FroniusSymoModelNameplate {
        return this._nameplate;
    }

    public get settings (): FroniusSymoModelSettings {
        return this._settings;
    }

    public get status (): FroniusSymoModelStatus {
        return this._status;
    }

    public get control (): FroniusSymoModelControl {
        return this._control;
    }

    public get storage (): FroniusSymoModelStorage {
        return this._storage;
    }

    public get inverterExtension (): FroniusSymoModelInverterExtension {
        return this._inverterExtension;
    }

}

export class FroniusSymoError extends Error {
    constructor (public data: IFroniusSymo, msg: string, public cause?: Error) { super(msg); }
}


