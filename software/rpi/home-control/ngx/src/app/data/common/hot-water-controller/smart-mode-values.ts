
import { DataRecord } from '../data-record';

export interface ISmartModeValues {
    createdAt: Date | number | string;
    eBatPercent: number | null;
    pBatWatt: number | null;
    pGridWatt: number | null;
}

export class SmartModeValues extends DataRecord<ISmartModeValues> implements ISmartModeValues {

    private _createdAt: Date;
    private _eBatPercent: number | null;
    private _pBatWatt: number;
    private _pGridWatt: number;

    constructor (data: ISmartModeValues) {
        super(data);
        try {
            const missing = DataRecord.getMissingAttributes( data, [
                'createdAt', 'eBatPercent', 'pBatWatt', 'pGridWatt'
            ]);
            if (missing) {
                throw new Error('missing attribute ' + missing);
            }
            let attCnt = 0;
            for (const a of Object.getOwnPropertyNames(data)) {
                if ( [ 'createdAt' ].indexOf(a) >= 0 ) {
                    (<any>this)['_' + a] = DataRecord.parseDate(data, { attribute: a, validate: true } );
                } else if ( [ 'eBatPercent' ].indexOf(a) >= 0 ) {
                    (<any>this)['_' + a] =
                        DataRecord.parseNumber(data, { attribute: a, validate: true, min: 0, max: 100, allowString: true, allowNull: true } );
                } else if ( [ 'pGridWatt', 'pBatWatt' ].indexOf(a) >= 0 ) {
                    (<any>this)['_' + a] = DataRecord.parseNumber(data, { attribute: a, validate: true, allowString: true, allowNull: true } );
                } else {
                    throw new Error('attribute ' + a + ' not found in data:ISmartModeParameter');
                }
                attCnt++;
            }
            if (attCnt !== Object.getOwnPropertyNames(this).length) {
                throw new Error('attribute count mismatch');
            }

        } catch (err) {
            throw new SmartModeValuesError(data, 'parsing ISmartModeParameter fails', err);
        }
    }

    public toObject (convertDate = false): ISmartModeValues {
        const rv: ISmartModeValues = {
            createdAt:      convertDate ? this._createdAt.getTime() : this._createdAt,
            eBatPercent:    this._eBatPercent,
            pBatWatt:       this._pBatWatt,
            pGridWatt:      this._pGridWatt
        };
        return rv;
    }

    public get createdAt  (): Date {
        return this._createdAt;
    }

    public get eBatPercent (): number {
        return this._eBatPercent;
    }

    public get pBatWatt (): number {
        return this._pBatWatt;
    }

    public get pGridWatt (): number {
        return this._pGridWatt;
    }

}

export class SmartModeValuesError extends Error {
    constructor (public data: ISmartModeValues, msg: string, public cause?: Error) { super(msg); }
}
