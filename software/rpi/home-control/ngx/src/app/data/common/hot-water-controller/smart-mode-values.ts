
import { DataRecord } from '../data-record';

export type BatStateType = 'FULL' | 'CHARGING | DISCHARGING' | 'HOLDING' | 'UNKNOWN';
export const batStateTypeValues = [ 'FULL', 'CHARGING, DISCHARGING', 'HOLDING', 'UNKNOWN' ];

export interface ISmartModeValues {
    createdAt: Date | number | string;
    eBatPercent: number | null;
    pBatWatt: number | null;
    pGridWatt: number | null;
    pPvSouthWatt: number | null;
    pPvEastWestWatt: number | null;
    pHeatSystemWatt: number | null;
    pOthersWatt: number | null;
    batState: null | BatStateType;
}

export class SmartModeValues extends DataRecord<ISmartModeValues> implements ISmartModeValues {

    private _createdAt: Date;
    private _eBatPercent: number | null;
    private _pBatWatt: number;
    private _pGridWatt: number;
    private _pPvSouthWatt: number;
    private _pPvEastWestWatt: number;
    private _pHeatSystemWatt: number;
    private _pOthersWatt: number;
    private _batState: BatStateType;

    constructor (data: ISmartModeValues) {
        super(data);
        try {
            const missing = DataRecord.getMissingAttributes( data, [
                'createdAt', 'eBatPercent', 'pBatWatt', 'pGridWatt', 'pPvSouthWatt', 'pPvEastWestWatt',
                'pHeatSystemWatt', 'pOthersWatt', 'batState'
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
                } else if ( [ 'pGridWatt', 'pBatWatt', 'pPvSouthWatt', 'pPvEastWestWatt', 'pHeatSystemWatt', 'pOthersWatt' ].indexOf(a) >= 0 ) {
                    (<any>this)['_' + a] = DataRecord.parseNumber(data, { attribute: a, validate: true, allowString: true, allowNull: true } );
                } else if ( [ 'batState' ].indexOf(a) >= 0 ) {
                    (this as any)['_' + a] =
                        DataRecord.parseString(data, {
                            attribute: a,
                            allowed: { values: batStateTypeValues, default: 'UNKNOWN' }
                        });
                } else {
                    throw new Error('attribute ' + a + ' not found in data:ISmartModeParameter');
                }
                attCnt++;
            }
            if (attCnt !== Object.getOwnPropertyNames(this).length) {
                throw new Error('attribute count mismatch');
            }
            if (!this._batState) {
                this._batState = 'UNKNOWN';
            }

        } catch (err) {
            throw new SmartModeValuesError(data, 'parsing ISmartModeParameter fails', err);
        }
    }

    public toObject (convertDate = false): ISmartModeValues {
        const rv: ISmartModeValues = {
            createdAt:       convertDate ? this._createdAt.getTime() : this._createdAt,
            eBatPercent:     this._eBatPercent,
            pBatWatt:        this._pBatWatt,
            pGridWatt:       this._pGridWatt,
            pPvSouthWatt:    this._pPvSouthWatt,
            pPvEastWestWatt: this._pPvEastWestWatt,
            pHeatSystemWatt: this._pHeatSystemWatt,
            pOthersWatt:     this._pOthersWatt,
            batState:        this._batState
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

    public get pPvSouthWatt (): number {
        return this._pPvSouthWatt;
    }

    public get pPvEastWestWatt (): number {
        return this._pPvEastWestWatt;
    }

    public get pHeatSystemWatt (): number {
        return this._pHeatSystemWatt;
    }

    public get pOthersWatt (): number {
        return this._pOthersWatt;
    }

    public get batState (): BatStateType {
        return this._batState;
    }
}

export class SmartModeValuesError extends Error {
    constructor (public data: ISmartModeValues, msg: string, public cause?: Error) { super(msg); }
}
