
import { DataRecord } from '../data-record';

export interface ISmartModeParameter {
    minEBatPercent: number;
    minWatts: number;
    maxWatts: number;
}

export class SmartModeParameter extends DataRecord<ISmartModeParameter> implements ISmartModeParameter {

    private _minEBatPercent: number;
    private _minWatts: number;
    private _maxWatts: number;

    constructor (data: ISmartModeParameter) {
        super(data);
        try {
            const missing = DataRecord.getMissingAttributes( data, [
                'minEBatPercent', 'minWatts', 'maxWatts'
            ]);
            if (missing) {
                throw new Error('missing attribute ' + missing);
            }
            let attCnt = 0;
            for (const a of Object.getOwnPropertyNames(data)) {
                if ( [ 'minEBatPercent', 'eBatPercent' ].indexOf(a) >= 0 ) {
                    (<any>this)['_' + a] = DataRecord.parseNumber(data, { attribute: a, validate: true, min: 0, max: 100, allowString: true } );
                } else if ( [ 'minWatts', 'maxWatts' ].indexOf(a) >= 0 ) {
                    (<any>this)['_' + a] = DataRecord.parseNumber(data, { attribute: a, validate: true, min: 0, max: 2500, allowString: true } );
                } else {
                    throw new Error('attribute ' + a + ' not found in data:ISmartModeParameter');
                }
                attCnt++;
            }
            if (attCnt !== Object.getOwnPropertyNames(this).length) {
                throw new Error('attribute count mismatch');
            }

        } catch (err) {
            throw new SmartModeParameterError(data, 'parsing ISmartModeParameter fails', err);
        }
    }

    public toObject (convertDate = false): ISmartModeParameter {
        const rv: ISmartModeParameter = {
            minEBatPercent: this._minEBatPercent,
            minWatts:       this._minWatts,
            maxWatts:       this._maxWatts
        };
        return rv;
    }

    public get minEBatPercent (): number {
        return this._minEBatPercent;
    }

    public get minWatts (): number {
        return this._minWatts;
    }

    public get maxWatts (): number {
        return this._maxWatts;
    }

}

export class SmartModeParameterError extends Error {
    constructor (public data: ISmartModeParameter, msg: string, public cause?: Error) { super(msg); }
}
