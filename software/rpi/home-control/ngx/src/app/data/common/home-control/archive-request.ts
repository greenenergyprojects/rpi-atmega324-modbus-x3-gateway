
import { CommonLogger } from '../../common-logger';
import { DataRecord } from '../data-record';

import { StatisticsType, Statistics } from './statistics';

export interface IArchiveRequest {
    id:      number;
    type:    StatisticsType;
    dataIds: string [];
    from:    Date | number | string;
    to:      Date | number | string;
}

export class ArchiveRequest extends DataRecord<IArchiveRequest> implements IArchiveRequest {

    public static ATTRIBUTES = [
        'id', 'type', 'dataIds', 'from', 'to'
    ];

    private _id:      number;
    private _dataIds: string [];
    private _type:    StatisticsType;
    private _from:    Date;
    private _to:      Date;

    constructor (data: IArchiveRequest) {
        super(data);
        try {
            const missing = DataRecord.getMissingAttributes( data, ArchiveRequest.ATTRIBUTES);
            if (missing) {
                throw new Error('missing attribute ' + missing);
            }
            let attCnt = 0;
            for (const a of Object.getOwnPropertyNames(data)) {
                if ( [ 'id' ].indexOf(a) >= 0 ) {
                    (<any>this)['_' + a] = DataRecord.parseNumber(data, { attribute: a, validate: true } );
                } else if ( [ 'type' ].indexOf(a) >= 0 ) {
                    (<any>this)['_' + a] = Statistics.toStatisticsType(DataRecord.parseString(data, { attribute: a, validate: false } ));
                } else if ( [ 'from', 'to' ].indexOf(a) >= 0 ) {
                    (<any>this)['_' + a] = DataRecord.parseDate(data, { attribute: a, validate: true } );
                } else if ( [ 'dataIds' ].indexOf(a) >= 0 ) {
                    (<any>this)['_' + a] = DataRecord.parseStringArray(data, { attribute: a, validate: true, allowSingleString: true } );
                } else {
                    throw new Error('attribute ' + a + ' not found in data:ICalculated');
                }
                attCnt++;
            }
            if (attCnt !== Object.getOwnPropertyNames(this).length) {
                throw new Error('attribute count mismatch');
            }
        } catch (err) {
            throw new ArchiveRequestError(data, 'parsing IArchiveRequest fails', err);
        }
    }

    public toObject (preserveDate = true): IArchiveRequest {
        const rv: IArchiveRequest = {
            id:      this._id,
            type:    this._type,
            dataIds: this._dataIds,
            from:    preserveDate ? this._from : this._from.getTime(),
            to:      preserveDate ? this._to : this._to.getTime()
        };
        return rv;
    }

    public get id (): number {
        return this._id;
    }

    public get type (): StatisticsType {
        return this._type;
    }

    public get dataIds (): string [] {
        return this._dataIds;
    }

    public get from (): Date {
        return this._from;
    }

    public get to (): Date {
        return this._to;
    }

}

export class ArchiveRequestError extends Error {
    constructor (public data: IArchiveRequest, msg: string, public cause?: Error) { super(msg); }
}
