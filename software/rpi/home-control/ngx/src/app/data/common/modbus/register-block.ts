import { DataRecord } from '../data-record';

export interface IRegisterBlock {
    at?:     Date | number | string | null;
    firstId: number;
    lastId:  number;
    values?: number [];
}

export class RegisterBlock extends DataRecord<IRegisterBlock> {

    private _at?:       Date;
    private _firstId:   number;
    private _lastId:    number;
    private _values?:   number [];
    private _cachedIds?: number [];

    public constructor (data: IRegisterBlock) {
        super(data);
        try {
            const missing = DataRecord.getMissingAttributes( data, [ 'firstId', 'lastId' ]);
            if (missing) {
                throw new Error('missing attribute ' + missing);
            }
            let attCnt = 0;
            for (const a of Object.getOwnPropertyNames(data)) {
                switch (a) {
                    case 'at':      this._at = DataRecord.parseDate(data, { attribute: a, validate: true } ); break;
                    case 'firstId': this._firstId = DataRecord.parseNumber(data, { attribute: a, validate: true, min: 0, max: 0xffff } ); break;
                    case 'lastId':  this._lastId = DataRecord.parseNumber(data, { attribute: a, validate: true, min: 0, max: 0xffff } ); break;
                    case 'values': {
                        if (!Array.isArray(data.values)) { throw new Error('values not an array'); }
                        this._values = [];
                        for (let i = 0; i < data.values.length; i++) {
                            const v = data.values[i];
                            if (!(v >= 0 && v <= 0xffff)) { throw new Error('invalid value ' + v + ' on data.values[' + i + ']'); }
                            this._values.push(v);
                        }
                        break;
                    }
                    default: throw new Error('attribute ' + a + ' not found in data:IRegisterBlock');
                }
                attCnt++;
            }
            if (attCnt !== Object.getOwnPropertyNames(this).length) {
                throw new Error('attribute count mismatch');
            }
            if (this._firstId > this._lastId) {
                throw new Error('invalid id range (' + this._firstId + '..' + this._lastId);
            }
            if (data.values && data.values.length !== (this._lastId - this._firstId + 1)) {
                throw new Error('values array has wrong length');
            }
        } catch (err) {
            throw new RegisterBlockError(data, 'parsing IRegisterValues fails', err);
        }
    }

    public toObject (preserveDate = true): IRegisterBlock {
        const rv: IRegisterBlock = {
            firstId: this._firstId,
            lastId:  this._lastId,
        };
        if (this._at)     { rv.at = preserveDate ? this._at : this._at.getTime(); }
        if (this._values) { rv.values = [].concat(this._values); }
        return rv;
    }

    public get at (): Date | null {
        return this._at ? this._at : null;
    }

    public get firstId (): number {
        return this._firstId;
    }

    public get lastId ():  number {
        return this._lastId;
    }

    public get values (): number [] {
        return this._values;
    }

    public get ids (): number [] {
        if (!this._cachedIds) {
            this._cachedIds = [];
            for (let id = this._firstId; id <= this._lastId; id++) {
                this._cachedIds.push(id);
            }
        }
        return this._cachedIds;
    }

    public areIdsEqual (ids: number []) {
        if (!Array.isArray(ids)) { return false; }
        if (ids.length !== this.ids.length) { return false; }
        for (let i = 0; i < ids.length; i++) {
            if (this.ids[i] !== ids[i]) {
                return false;
            }
        }
        return true;
    }

    public areValuesEqual (o: IRegisterBlock) {
        if (!o || !this._values || !Array.isArray(o.values) || o.firstId !== this._firstId || o.lastId !== this._lastId) { return false; }
        for (let i = 0; i < this._values.length; i++) {
            if (this._values[i] !== o.values[i]) { return false; }
        }
        return true;
    }

    public getValue (id: number): { at: Date, value: number | null } | null | undefined {
        if (!(id >= this._firstId && id <= this._lastId)) { return undefined; }
        if (!this._values) { return null; } // no value available yet
        return { at: this._at, value: this._values[id - this._firstId] };
    }

    public updateValues (values: number [], valuesAt: Date): boolean {
        let rv = false;
        if (!Array.isArray(values) || (this._lastId - this._firstId + 1) !== values.length) {
            throw new Error('invalid/wrong array values');
        }
        if (!Array.isArray(this._values)) {
            this._values = [];
            for (let i = 0; i < values.length; i++) {
                const v = values[i];
                if (!(v >= 0 && v <= 0xffff)) { throw new Error('illegal value on values[' + i + ']'); }
                this._values.push(v);
            }
            rv = true;
        } else {
            const newValues: number [] = [];
            for (let i = 0; i < values.length; i++) {
                const v = values[i];
                if (!(v >= 0 && v <= 0xffff)) { throw new Error('illegal value on values[' + i + ']'); }
                if (v !== this._values[i]) {
                    rv = true;
                }
                newValues.push(v);
            }
            if (rv) {
                this._values = newValues;
            }
        }
        this._at = valuesAt;
        return rv;
    }

}

export class RegisterBlockError extends Error {
    constructor (public data: IRegisterBlock, msg: string, public cause?: Error) { super(msg); }
}
