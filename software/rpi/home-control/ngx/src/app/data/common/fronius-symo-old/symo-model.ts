

// abstract class SymoModel<T> {

//     // https://stackoverflow.com/questions/11887934
//     public static isDaylightSavingTime (t: Date) {
//         const jan = new Date(t.getFullYear(), 0, 1);
//         const jul = new Date(t.getFullYear(), 6, 1);
//         return t.getTimezoneOffset() < Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
//     }

//     /* tslint:disable */
//     protected _regs: T;
//     private _createdAt: Date;
//     /* tslint:enable */

//     public constructor (createdAt: number | Date | string, regs: T) {
//         if (typeof(createdAt) === 'number') {
//             this._createdAt = new Date(createdAt);
//             // this._timeStamp.setTime(timeStamp);
//         } else if (typeof(createdAt) === 'string') {
//             this._createdAt = new Date(createdAt);
//         } else if (createdAt instanceof Date) {
//             this._createdAt = createdAt;
//         } else {
//             throw new Error('invalid createdAt');
//         }

//         this._regs = regs;
//     }

//     public get regs (): T {
//         return this._regs;
//     }

//     public get createdAt (): Date {
//         return this._createdAt;
//     }

//     public toObject (): Object {
//         return {
//             regs: this._regs
//         };
//     }

//     public toHumanReadableObject (): Object {
//         return this.toObject();
//     }

//     protected scale (x: number, sf: number): number {
//         switch (sf) {
//             case  3: return x * 1000;
//             case  2: return x * 100;
//             case  1: return x * 10;
//             case  0: return x;
//             case -1: return x / 10;
//             case -2: return x / 100;
//             case -3: return x / 1000;
//             default: {
//                 while (sf > 0) { x = x * 10; sf--; }
//                 while (sf < 0) { x = x / 10; sf++; }
//                 return x;
//             }
//         }
//     }

//     protected normaliseUnit (x: number, digits = 2, unit?: string): string {
//         let k: number;
//         switch (digits) {
//             case 3: k = 1000; break;
//             case 2: k = 100; break;
//             case 1: k = 10; break;
//             case 0:  k = 1; break;
//             default: {
//                 k = 1;
//                 while (digits > 0) {
//                     k *= 10;
//                     digits--;
//                 }
//             }
//         }
//         if (!unit)                   { return (Math.round(x * k) / k).toString(); }
//         if (Math.abs(x) >   1000000) { return Math.round(x * k / 1000000) / k + 'M' + unit; }
//         if (Math.abs(x) >      1000) { return Math.round(x * k / 1000) / k + 'k' + unit; }
//         if (Math.abs(x) >=      0.1) { return Math.round(x * k) / k + unit; }
//         if (Math.abs(x) >=    0.001) { return Math.round(x * k * 1000) / k + 'm' + unit; }
//         if (Math.abs(x) >= 0.000001) { return Math.round(x * k * 1000000) / k + 'µ' + unit; }
//         return x + unit;
//     }

// }
