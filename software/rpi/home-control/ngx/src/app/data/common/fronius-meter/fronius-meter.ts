

import { sprintf } from 'sprintf-js';

import { CommonLogger } from '../../common-logger';
import { DataRecord } from '../data-record';

export interface IFroniusMeter {
    createdAt: Date | number | string;
}

export class FroniusMeter extends DataRecord<IFroniusMeter> implements IFroniusMeter {

    public static createInstance (): FroniusMeter {
        const data: IFroniusMeter = {
            createdAt: new Date()
        };
        return new FroniusMeter(data);
    }

    private _createdAt: Date;

    public constructor (data: IFroniusMeter) {
        super(data);
        try {
            const missing = DataRecord.getMissingAttributes( data, [ 'createdAt'  ]);
            if (missing) {
                throw new Error('missing attribute ' + missing);
            }
            let attCnt = 0;
            for (const a of Object.getOwnPropertyNames(data)) {
                switch (a) {
                    case 'createdAt': this._createdAt = DataRecord.parseDate(data, { attribute: 'createdAt', validate: true }); break;
                    default: throw new Error('attribute ' + a + ' not found in data:IFroniusMeter');
                }
                attCnt++;
            }
            if (attCnt !== Object.getOwnPropertyNames(this).length) {
                throw new Error('attribute count mismatch');
            }
        } catch (err) {
            throw new FroniusMeterError(data, 'parsing IFroniusMeter fails', err);
        }
    }

    public toObject (preserveDate = true): IFroniusMeter {
        const rv: IFroniusMeter = {
            createdAt: preserveDate ? this._createdAt : this._createdAt.getTime()
        };
        return rv;
    }

    public get createdAt (): Date {
        return this._createdAt;
    }

}

export class FroniusMeterError extends Error {
    constructor (public data: IFroniusMeter, msg: string, public cause?: Error) { super(msg); }
}


