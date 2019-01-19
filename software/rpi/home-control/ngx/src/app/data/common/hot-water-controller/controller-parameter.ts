
import { DataRecord } from '../data-record';
import { ControllerMode } from './controller-mode';

export interface IControllerParameter {
    createdAt: Date | number | string;
    from: string;
    mode: ControllerMode;
    desiredWatts: number;
    minWatts?: number;
    maxWatts?: number;
}

// export type IBoilerControllerAttributes = keyof IBoilerController;

export class ControllerParameter extends DataRecord<IControllerParameter> implements IControllerParameter {

    private _createdAt: Date;
    private _from: string;
    private _mode: ControllerMode;
    private _desiredWatts: number;
    private _minWatts: number;
    private _maxWatts: number;

    constructor (data: IControllerParameter) {
        super(data);
        try {
            const missing = DataRecord.getMissingAttributes( data, [
                'createdAt', 'from', 'mode', 'desiredWatts'
            ]);
            if (missing) {
                throw new Error('missing attribute ' + missing);
            }
            let attCnt = 0;
            for (const a of Object.getOwnPropertyNames(data)) {
                if ( [ 'createdAt' ].indexOf(a) >= 0 ) {
                    (<any>this)['_' + a] = DataRecord.parseDate(data, { attribute: a, validate: true } );
                } else if ( [ 'from' ].indexOf(a) >= 0 ) {
                    (<any>this)['_' + a] = DataRecord.parseString(data, { attribute: a, validate: true } );
                } else if ( [ 'mode' ].indexOf(a) >= 0 ) {
                    (<any>this)['_' + a] = DataRecord.parseEnum<ControllerMode>(
                        data, {attribute: a, validate: true, validValues: DataRecord.enumToStringValues(ControllerMode) }
                    );
                } else if ( [ 'minWatts', 'maxWatts', 'desiredWatts' ].indexOf(a) >= 0 ) {
                    (<any>this)['_' + a] = DataRecord.parseNumber(data, { attribute: a, validate: true, min: 0, allowString: true } );
                } else {
                    throw new Error('attribute ' + a + ' not found in data:IControllerParameter');
                }
                attCnt++;
            }
            if (attCnt !== Object.getOwnPropertyNames(this).length) {
                throw new Error('attribute count mismatch');
            }
            if (!(this._minWatts >= 0 && this._minWatts <= 2000)) {
                this._minWatts = 0;
            }
            if (!(this._maxWatts >= 0 && this._maxWatts <= 2500)) {
                this._maxWatts = 2500;
            }

        } catch (err) {
            throw new ControllerParameterError(data, 'parsing IControllerParameter fails', err);
        }
    }

    public toObject (convertDate = false): IControllerParameter {
        const rv: IControllerParameter = {
            createdAt:    convertDate ? this._createdAt.getTime() : this._createdAt,
            from:         this._from,
            mode:         this._mode,
            desiredWatts: this._desiredWatts,
            minWatts:     this._minWatts,
            maxWatts:     this._maxWatts
        };
        return rv;
    }

    public get createdAt  (): Date {
        return this._createdAt;
    }

    public get from (): string {
        return this._from;
    }
    public get mode (): ControllerMode {
        return this._mode;
    }

    public get desiredWatts (): number {
        return this._desiredWatts;
    }

    public get minWatts (): number {
        return this._minWatts;
    }

    public get maxWatts (): number {
        return this._maxWatts;
    }

}

export class ControllerParameterError extends Error {
    constructor (public data: IControllerParameter, msg: string, public cause?: Error) { super(msg); }
}
