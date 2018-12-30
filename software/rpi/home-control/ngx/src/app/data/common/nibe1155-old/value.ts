// import { DataRecord } from '../data-record';

// export interface IValue {
//     id: number;
//     value?: number;
//     valueAt?: Date | number | string;
// }

// export abstract class Value extends DataRecord<IValue> implements IValue {
//     protected _id: number;
//     protected _value: number;
//     protected _valueAt: Date;

//     public constructor (data: IValue) {
//         super(data);
//         try {
//             const missing = DataRecord.getMissingAttributes( data, [ 'label', 'format', 'description' ]);
//             if (missing) {
//                 throw new Error('missing attribute ' + missing);
//             }
//             let attCnt = 0;
//             for (const a of Object.getOwnPropertyNames(data)) {
//                 if ( [ 'valueAt' ].indexOf(a) >= 0 ) {
//                     (<any>this)['_' + a] = DataRecord.parseDate(data, { attribute: a, validate: true } );
//                 } else if ( [ 'value' ].indexOf(a) >= 0 ) {
//                     (<any>this)['_' + a] = DataRecord.parseNumber(data, { attribute: a, validate: true, min: 0 } );
//                 } else if ( [ 'label', 'format', 'description', 'unit', 'help' ].indexOf(a) >= 0 ) {
//                     (<any>this)['_' + a] = DataRecord.parseString(data, { attribute: a, validate: true } );
//                 } else {
//                     throw new Error('attribute ' + a + ' not found in data:IValue');
//                 }
//                 attCnt++;
//             }
//             if (attCnt !== Object.getOwnPropertyNames(this).length) {
//                 throw new Error('attribute count mismatch');
//             }
//             if (this._value === undefined) { this._value = null; }
//             if (this._valueAt === undefined) { this._valueAt = null; }
//         } catch (err) {
//             throw new ValueError(data, 'parsing IValue fails', err);
//         }
//     }

//     public toObject (convertDateToNumber = false): IValue {
//         const rv: IValue = {
//             label:       this._label,
//             format:      this._format,
//             description: this._description
//         };
//         if (this._help) { rv.help = this._help; }
//         if (this._unit) { rv.unit = this._unit; }
//         if (this._value !== null) { rv.value = this._value; }
//         if (this._valueAt !== null) { rv.valueAt = convertDateToNumber ?  this.valueAt.getTime() : this.valueAt; }
//         return rv;
//     }

//     public get label (): string {
//         return this._label;
//     }

//     public get format (): string {
//         return this._format;
//     }

//     public get description (): string {
//         return this._description;
//     }

//     public get unit (): string {
//         return this._unit ? this._label : '';
//     }

//     public get help (): string {
//         return this._help ? this._label : '';
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

// export class ValueError extends Error {
//     constructor (public data: IValue, msg: string, public cause?: Error) { super(msg); }
// }
