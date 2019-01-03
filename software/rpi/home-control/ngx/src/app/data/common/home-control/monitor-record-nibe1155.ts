// import { CommonLogger } from '../../common-logger';
// import { DataRecord } from '../data-record';

// import { INibe1155Controller, Nibe1155Controller } from '../nibe1155/nibe1155-controller';
// import { INibe1155MonitorRecord, Nibe1155MonitorRecord } from '../nibe1155/nibe1155-monitor-record';

// export interface IMonitorRecordNibe1155 {
//     createdAt:      Date | number | string;
//     controller?:    INibe1155Controller;
//     monitorRecord?: INibe1155MonitorRecord;
// }

// export class MonitorRecordNibe1155 extends DataRecord<IMonitorRecordNibe1155> implements IMonitorRecordNibe1155 {

//     private _createdAt?:     Date;
//     private _controller?:    Nibe1155Controller;
//     private _monitorRecord?: Nibe1155MonitorRecord;

//     constructor (data: IMonitorRecordNibe1155) {
//         super(data);
//         try {
//             const missing = DataRecord.getMissingAttributes( data, [ 'createdAt' ]);
//             if (missing) {
//                 throw new Error('missing attribute ' + missing);
//             }
//             let attCnt = 0;
//             for (const a of Object.getOwnPropertyNames(data)) {
//                 switch (a) {
//                     case 'createdAt':     this._createdAt = DataRecord.parseDate(data, { attribute: a, validate: true } ); break;
//                     case 'controller':    this._controller = new Nibe1155Controller(data[a]); break;
//                     case 'monitorRecord':  this._monitorRecord = new Nibe1155MonitorRecord(data[a]); break;
//                     default: throw new Error('attribute ' + a + ' not found in data:IMonitorRecordNibe1155');
//                 }
//                 attCnt++;
//             }
//             if (attCnt !== Object.getOwnPropertyNames(this).length) {
//                 throw new Error('attribute count mismatch');
//             }
//         } catch (err) {
//             throw new MonitorRecordNibe1155Error(data, 'parsing IMonitorRecordNibe1155 fails', err);
//         }
//     }

//     public toObject (preserveDate = true): IMonitorRecordNibe1155 {
//         const rv: IMonitorRecordNibe1155 = {
//             createdAt:  preserveDate ? this._createdAt : this._createdAt.getTime()
//         };
//         if (this._controller)    { rv.controller    = this._controller.toObject(preserveDate); }
//         if (this._monitorRecord) { rv.monitorRecord = this._monitorRecord.toObject(preserveDate); }
//         return rv;
//     }

//     public get createdAt (): Date {
//         return this._createdAt;
//     }

//     public get controller (): Nibe1155Controller {
//         return this._controller;
//     }

//     public get monitorRecord (): Nibe1155MonitorRecord {
//         return this._monitorRecord;
//     }

// }

// export class MonitorRecordNibe1155Error extends Error {
//     constructor (public data: IMonitorRecordNibe1155, msg: string, public cause?: Error) { super(msg); }
// }
