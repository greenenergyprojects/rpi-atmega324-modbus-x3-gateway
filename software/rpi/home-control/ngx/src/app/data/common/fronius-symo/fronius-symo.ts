

import { sprintf } from 'sprintf-js';

import { CommonLogger } from '../../common-logger';
import { DataRecord } from '../data-record';
import { FroniusSymoModelRegister, IFroniusSymoModelRegister } from './fronius-symo-model-register';
import { FroniusSymoModelCommon, IFroniusSymoModelCommon } from './fronius-symo-model-common';

export interface IFroniusSymo {
    register: IFroniusSymoModelRegister;
    common:   IFroniusSymoModelCommon;
}

export class FroniusSymo extends DataRecord<IFroniusSymo> implements IFroniusSymo {

    public static createInstance (): FroniusSymo {
        const data: IFroniusSymo = {
            register: FroniusSymoModelRegister.createInstance().toObject(),
            common:   FroniusSymoModelCommon.createInstance().toObject()
        };
        return new FroniusSymo(data);
    }

    private _register: FroniusSymoModelRegister;
    private _common:   FroniusSymoModelCommon;

    public constructor (data: IFroniusSymo) {
        super(data);
        try {
            const missing = DataRecord.getMissingAttributes( data, [ 'id' ]);
            if (missing) {
                throw new Error('missing attribute ' + missing);
            }
            let attCnt = 0;
            for (const a of Object.getOwnPropertyNames(data)) {
                switch (a) {
                    case 'register': this._register = new FroniusSymoModelRegister(data.register); break;
                    case 'common':   this._common   = new FroniusSymoModelCommon(data.common); break;
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
            register: this._register.toObject(preserveDate),
            common:   this._common.toObject(preserveDate)
        };
        return rv;
    }

    public get register (): FroniusSymoModelRegister {
        return this._register;
    }

    public get common (): FroniusSymoModelCommon {
        return this._common;
    }

}

export class FroniusSymoError extends Error {
    constructor (public data: IFroniusSymo, msg: string, public cause?: Error) { super(msg); }
}


