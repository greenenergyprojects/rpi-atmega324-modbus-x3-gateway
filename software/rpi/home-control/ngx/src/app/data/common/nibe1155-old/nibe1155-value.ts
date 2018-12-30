// import { DataRecord } from '../data-record';

// export interface INibe1155Value {
//     id: number;
//     value?: number;
//     valueAt?: Date | number | string;
// }

// export abstract class Nibe1155Value extends DataRecord<INibe1155Value> implements INibe1155Value {
//     protected _id: number;
//     protected _value: number;
//     protected _valueAt: Date;

//     public constructor (data: INibe1155Value) {
//         super(data);
//         try {
//             const missing = DataRecord.getMissingAttributes( data, [ 'id' ]);
//             if (missing) {
//                 throw new Error('missing attribute ' + missing);
//             }
//             let attCnt = 0;
//             for (const a of Object.getOwnPropertyNames(data)) {
//                 if ( [ 'valueAt' ].indexOf(a) >= 0 ) {
//                     (<any>this)['_' + a] = DataRecord.parseDate(data, { attribute: a, validate: true } );
//                 } else if ( [ 'value' ].indexOf(a) >= 0 ) {
//                     (<any>this)['_' + a] = DataRecord.parseNumber(data, { attribute: a, validate: true, min: 0 } );
//                 } else if ( [ 'id' ].indexOf(a) >= 0 ) {
//                     (<any>this)['_' + a] = DataRecord.parseNumber(data, { attribute: a, validate: true, min: 0, max: 65535 } );
//                 } else {
//                     throw new Error('attribute ' + a + ' not found in data:INibe1155Value');
//                 }
//                 attCnt++;
//             }
//             if (attCnt !== Object.getOwnPropertyNames(this).length) {
//                 throw new Error('attribute count mismatch');
//             }
//             if (this._value === undefined) { this._value = null; }
//             if (this._valueAt === undefined) { this._valueAt = null; }
//         } catch (err) {
//             throw new Nibe1155ValueError(data, 'parsing INibe1155Value fails', err);
//         }
//     }

//     public toObject (convertDateToNumber = false): INibe1155Value {
//         const rv: INibe1155Value = {
//             id: this._id,
//         };
//         if (this._value !== null) { rv.value = this._value; }
//         if (this._valueAt !== null) { rv.valueAt = convertDateToNumber ?  this.valueAt.getTime() : this.valueAt; }
//         return rv;
//     }

//     public get id (): number {
//         return this._id;
//     }

//     public get value (): number {
//         return this._value ? this._value : Number.NaN;
//     }

//     public get valueAt (): Date {
//         return this._valueAt ? this._valueAt : new Date();
//     }

//     protected setValue (value: number, at: Date) {
//         if (!(at instanceof Date)) {
//             throw new Error('invalid argument at');
//         }
//         if (!value && value !== 0 && !Number.isNaN(value)) {
//             throw new Error('invalid argument value');
//         }
//         this._value = value;
//         this._valueAt = at;
//     }

// }

// export class Nibe1155ValueError extends Error {
//     constructor (public data: INibe1155Value, msg: string, public cause?: Error) { super(msg); }
// }
