import { DataRecord } from '../data-record';
import { IRegisterBlock, RegisterBlock } from './register-block';

export interface IRegisterValues {
    regBlocks: IRegisterBlock [];
}

export class RegisterValues extends DataRecord<IRegisterValues> {

    private _regBlocks:      RegisterBlock [];
    private _cachedIds:      number [];
    private _cachedBlockIds: number [][];

    public constructor (data: IRegisterValues) {
        super(data);
        try {
            const missing = DataRecord.getMissingAttributes( data, [ 'regBlocks' ]);
            if (missing) {
                throw new Error('missing attribute ' + missing);
            }
            let attCnt = 0;
            for (const a of Object.getOwnPropertyNames(data)) {
                if (a === 'regBlocks') {
                    if (!Array.isArray(data.regBlocks)) { throw new Error('regBlocks is not an array'); }
                    if (data.regBlocks.length < 1) { throw new Error('empty regblock array not allowed'); }
                    this._regBlocks = [];
                    for (let i = 0; i < data.regBlocks.length; i++) {
                        const x = data.regBlocks[i];
                        try {
                            this._regBlocks.push(new RegisterBlock(x));
                        } catch (err) {
                            throw new ErrorWithCause('invalid regBlocks[' + i + ']', err);
                        }
                    }
                } else {
                    throw new Error('attribute ' + a + ' not found in data:IRegisterValues');
                }
                attCnt++;
            }
            if (attCnt !== Object.getOwnPropertyNames(this).length) {
                throw new Error('attribute count mismatch');
            }
        } catch (err) {
            throw new RegisterValuesError(data, 'parsing IRegisterValues fails', err);
        }
    }

    public toObject (preserveDate = true): IRegisterValues {
        const rv: IRegisterValues = {
            regBlocks: []
        };
        this._regBlocks.forEach( (v) => rv.regBlocks.push(v.toObject(preserveDate)));
        return rv;
    }

    public get regBlocks (): RegisterBlock [] {
        return this._regBlocks;
    }

    public get ids (): number [] {
        if (!this._cachedIds) {
            this._cachedIds = [];
            this._regBlocks.forEach( (v) => this._cachedIds = this._cachedIds.concat(v.ids));
        }
        return this._cachedIds;
    }

    public getBlockIds (): number [] [] {
        if (!this._cachedBlockIds) {
            this._cachedBlockIds = [];
            this._regBlocks.forEach( (v) => { this._cachedBlockIds.push(v.ids); } );
        }
        return this._cachedBlockIds;
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

    public isIdMatching (firstId: number, lastId: number): boolean {
        for (const b of this._regBlocks) {
            if (!(firstId > b.lastId || lastId < b.firstId)) {
                return true;
            }
        }
        return false;
    }

    // public areValuesEqual (o: IRegisterValues) {
    //     if (!o || !Array.isArray(o.regBlocks)) { return false; }
    //     const ids = Object.getOwnPropertyNames(o.values);
    //     if (ids.length !== this.ids.length) { return false; }
    //     for (const idStr of ids) {
    //         const v1 = this._values[+idStr];
    //         const v2 = this._values[+idStr];
    //         if (v1 !== v2) { return false; }
    //     }
    //     return true;
    // }

    public getValue (id: number): { at: Date, value: number | null } | null | undefined {
        for (const rb of this._regBlocks) {
            const v = rb.getValue(id);
            if (v !== undefined) {
                return v;
            }
        }
        return undefined;
    }

    public updateValues (firstId: number, values: number [], valuesAt: Date): boolean {
        for (const rb of this._regBlocks) {
            if (rb.firstId === firstId) {
                return rb.updateValues(values, valuesAt);
            }
        }
        throw new Error('id mismatch, register block with firstId=' + firstId + ' not found');
    }

}

export class RegisterValuesError extends Error {
    constructor (public data: IRegisterValues, msg: string, public cause?: Error) { super(msg); }
}

class ErrorWithCause extends Error {
    constructor (msg: string, public cause?: Error) { super(msg); }
}