import { DataRecord } from '../data-record';

export interface IValue {
    createdAt: Date | number | string;
    createdFrom?: string;
    value: number;
    unit: string;
}

export class Value extends DataRecord<IValue> implements IValue {

    private _createdAt: Date;
    private _createdFrom?: string;
    private _value: number;
    private _unit: string;

    constructor (data: IValue) {
        super(data);
        try {
            let attCnt = 0;
            for (const a of Object.getOwnPropertyNames(data)) {
                if ( [ 'createdAt' ].indexOf(a) >= 0 ) {
                    (<any>this)['_' + a] = DataRecord.parseDate(data, { attribute: a, validate: true } );
                } else if ( [ 'value' ].indexOf(a) >= 0 ) {
                    (<any>this)['_' + a] = DataRecord.parseNumber(data, { attribute: a, validate: true, min: 0 } );
                } else if ( [ 'unit', 'createdFrom' ].indexOf(a) >= 0 ) {
                        (<any>this)['_' + a] = DataRecord.parseString(data, { attribute: a, validate: true, notEmpty: false } );
                } else {
                    throw new Error('attribute ' + a + ' not found in data:IValue');
                }
                attCnt++;
            }
            if (attCnt !== Object.getOwnPropertyNames(this).length) {
                throw new Error('attribute count mismatch');
            }
        } catch (err) {
            throw new ValueError(data, 'parsing IValue fails', err);
        }
    }

    public toObject (convertData = false): IValue {
        const rv: IValue = {
            createdAt:  convertData ? this._createdAt.getTime() : this._createdAt,
            value:      this._value,
            unit:       this._unit
        };
        if (this._createdFrom) {
            rv.createdFrom = this._createdFrom;
        }
        return rv;
    }

    public get createdAt (): Date {
        return this._createdAt;
    }

    public get createdFrom (): string {
        return this._createdFrom;
    }

    public get value (): number {
        return this._value;
    }

    public get unit (): string {
        return this._unit;
    }

}

export class ValueError extends Error {
    constructor (public data: IValue, msg: string, public cause?: Error) { super(msg); }
}
