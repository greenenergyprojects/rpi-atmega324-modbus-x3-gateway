
import { CommonLogger } from '../../common-logger';
import { DataRecord } from '../data-record';

import { StatisticsType, Statistics, StatisticAttribute } from './statistics';
import { IArchiveRequest, ArchiveRequest } from './archive-request';
import { IStatisticsDataCollection, StatisticsDataCollection } from './statistics-data-collection';

export interface IArchiveResponse {
    request: IArchiveRequest;
    result: { [ key in StatisticAttribute ]?: IStatisticsDataCollection [] };
}

export class ArchiveResponse extends DataRecord<IArchiveResponse> implements IArchiveResponse {

    public static ATTRIBUTES = [
        'request', 'result'
    ];

    private _request: ArchiveRequest;
    private _result: { [ key in StatisticAttribute ]?: StatisticsDataCollection [] };


    constructor (data: IArchiveResponse) {
        super(data);
        try {
            const missing = DataRecord.getMissingAttributes( data, ArchiveResponse.ATTRIBUTES);
            if (missing) {
                throw new Error('missing attribute ' + missing);
            }
            let attCnt = 0;
            for (const a of Object.getOwnPropertyNames(data)) {
                if ( [ 'request' ].indexOf(a) >= 0 ) {
                    this._request = new ArchiveRequest(data.request);
                } else if (a === 'result') {
                    this._result = {};
                    for (const x1 of Object.getOwnPropertyNames(data.result)) {
                        const sa = Statistics.toStatisticAttribute(x1);
                        const valuesArray: StatisticsDataCollection [] = [];
                        const values = data.result[sa];
                        if (!Array.isArray(values)) { throw new Error('invalid valid in result attribute ' + sa); }
                        for (const x2 of values) {
                            valuesArray.push(StatisticsDataCollection.createInstance(x2));
                        }
                        this._result[sa] = valuesArray;
                    }
                } else {
                    throw new Error('attribute ' + a + ' not found in data:ICalculated');
                }
                attCnt++;
            }
            if (attCnt !== Object.getOwnPropertyNames(this).length) {
                throw new Error('attribute count mismatch');
            }
        } catch (err) {
            throw new ArchiveResultError(data, 'parsing IArchiveResponse fails', err);
        }
    }

    public toObject (preserveDate = true): IArchiveResponse {
        const rv: IArchiveResponse = {
            request: this._request.toObject(preserveDate),
            result: {}
        };
        for (const a of Object.getOwnPropertyNames(this._result)) {
            const valueArray: IStatisticsDataCollection [] = [];
            for (const x of this._result[<StatisticAttribute>a]) {
                valueArray.push(x.toObject(preserveDate));
            }
            rv.result[<StatisticAttribute>a] = valueArray;
        }
        return rv;
    }

    public get request (): ArchiveRequest {
        return this._request;
    }

    public get result (): { [ key in StatisticAttribute ]?: StatisticsDataCollection [] } {
        return this._result;
    }

}

export class ArchiveResultError extends Error {
    constructor (public data: IArchiveResponse, msg: string, public cause?: Error) { super(msg); }
}
