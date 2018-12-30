// import { DataRecord } from '../data-record';

// export enum NibeState { off = 'off', power = 'frequency', test = 'test' }

// export interface INibe1155Controller {
//     createdAt: Date | string | number;
//     state: NibeState;
//     desiredState?: NibeState;
//     running: boolean;
//     inProgressSince?: Date | string | number;
//     setPointTemp?: number;
//     fSetpoint?: number;
// }

// export class Nibe1155Controller extends DataRecord<INibe1155Controller> implements INibe1155Controller {

//     private _createdAt: Date;
//     private _state: NibeState;
//     private _desiredState?: NibeState;
//     private _running: boolean;
//     private _inProgressSince?: Date;
//     private _setPointTemp?: number;
//     private _fSetpoint?: number;

//     constructor (data: INibe1155Controller) {
//         super(data);
//         try {
//             const missing = DataRecord.getMissingAttributes( data, [ 'createdAt', 'state', 'running' ]);
//             if (missing) {
//                 throw new Error('missing attribute ' + missing);
//             }
//             let attCnt = 0;
//             for (const a of Object.getOwnPropertyNames(data)) {
//                 if ( [ 'createdAt', 'inProgressSince' ].indexOf(a) >= 0 ) {
//                     (<any>this)['_' + a] = DataRecord.parseDate(data, { attribute: a, validate: true } );
//                 } else if ( [ 'setPointTemp', 'fSetpoint' ].indexOf(a) >= 0 ) {
//                     (<any>this)['_' + a] = DataRecord.parseNumber(data, { attribute: a, validate: true, min: 0 } );
//                 } else if ( [ 'running' ].indexOf(a) >= 0 ) {
//                     (<any>this)['_' + a] = DataRecord.parseBoolean(data, { attribute: a, validate: true } );
//                 } else if ( [ 'state', 'desiredState' ].indexOf(a) >= 0 ) {
//                     (<any>this)['_' + a] = DataRecord.parseEnum<NibeState>(
//                         data, {attribute: a, validate: true, validValues: DataRecord.enumToStringValues(NibeState) }
//                     );
//                 } else {
//                     throw new Error('attribute ' + a + ' not found in data:INibe1155Controller');
//                 }
//                 attCnt++;
//             }
//             if (attCnt !== Object.getOwnPropertyNames(this).length) {
//                 throw new Error('attribute count mismatch');
//             }
//         } catch (err) {
//             throw new Nibe1155ControllerError(data, 'parsing INibe1155Controller fails', err);
//         }
//     }

//     public toObject (convertData = false): INibe1155Controller {
//         const rv: INibe1155Controller = {
//             createdAt: convertData ? this._createdAt.getTime() : this._createdAt,
//             state:     this._state,
//             running:   this._running
//         };
//         if (this._desiredState)    { rv.desiredState = this._desiredState; }
//         if (this._inProgressSince) { rv.inProgressSince = convertData ? this._inProgressSince.getTime() : this._inProgressSince; }
//         if (this._setPointTemp)    { rv.setPointTemp = this._setPointTemp; }
//         if (this._fSetpoint)       { rv.fSetpoint = this._fSetpoint; }
//         return rv;
//     }

//     public get createdAt (): Date {
//         return this._createdAt;
//     }

//     public get state (): NibeState {
//         return this._state;
//     }

//     public get desiredState (): NibeState {
//         return this._desiredState !== undefined ? this._desiredState : this._state;
//     }

//     public get running (): boolean {
//         return this._running;
//     }

//     public get inProgressSince (): Date {
//         return this._inProgressSince;
//     }

//     public get setPointTemp (): number {
//         return this._setPointTemp;
//     }

//     public get fSetpoint (): number {
//         return this._fSetpoint;
//     }

// }

// export class Nibe1155ControllerError extends Error {
//     constructor (public data: INibe1155Controller, msg: string, public cause?: Error) { super(msg); }
// }
