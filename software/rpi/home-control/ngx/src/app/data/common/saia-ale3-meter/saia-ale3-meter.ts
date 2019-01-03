
import { DataRecord } from '../data-record';
import { IEnergyMeter } from '../home-control/energy-meter';

export interface ISaiaAle3Meter {
    createdAt:     Date | number | string;
    typ:           string;
    sn:            string;
    name:          string;
    modbusAddress: number;
    p:             number;
    q:             number;
    lamda:         number;
    e1:            number;
    e2:            number;
    de1:           number;
    de2:           number;
    u1:            number;
    u2:            number;
    u3:            number;
    i1:            number;
    i2:            number;
    i3:            number;
    p1:            number;
    p2:            number;
    p3:            number;
    q1:            number;
    q2:            number;
    q3:            number;
    lamda1:        number;
    lamda2:        number;
    lamda3:        number;
}

export class SaiaAle3Meter extends DataRecord<ISaiaAle3Meter> implements ISaiaAle3Meter {

    public static MODELATTRIBUTES = [
        'createdAt', 'typ', 'sn', 'name', 'modbusAddress', 'p', 'q', 'lamda',
        'e1', 'e2', 'de1', 'de2', 'u1', 'u2', 'u3', 'i1', 'i2', 'i3', 'p1', 'p2', 'p3',
        'q1', 'q2', 'q3', 'lamda1', 'lamda2', 'lamda3'
    ];

    private _createdAt:     Date;
    private _typ:           string;
    private _sn:            string;
    private _name:          string;
    private _modbusAddress: number;
    private _p:             number;
    private _q:             number;
    private _lamda:         number;
    private _e1:            number;
    private _e2:            number;
    private _de1:           number;
    private _de2:           number;
    private _u1:            number;
    private _u2:            number;
    private _u3:            number;
    private _i1:            number;
    private _i2:            number;
    private _i3:            number;
    private _p1:            number;
    private _p2:            number;
    private _p3:            number;
    private _q1:            number;
    private _q2:            number;
    private _q3:            number;
    private _lamda1:        number;
    private _lamda2:        number;
    private _lamda3:        number;

    constructor (data: ISaiaAle3Meter) {
        super(data);
        try {
            let attCnt = 0;
            for (const a of Object.getOwnPropertyNames(data)) {
                if ( a === 'createdAt' || a === 'at' ) {
                    this._createdAt = DataRecord.parseDate(data, { attribute: a, validate: true } );
                } else if ( [ 'typ', 'sn', 'name'  ].indexOf(a) >= 0 ) {
                    (<any>this)['_' + a] = DataRecord.parseString(data, { attribute: a, validate: true });
                } else if (SaiaAle3Meter.MODELATTRIBUTES.findIndex( (v) => a === v) >= 0) {
                    (<any>this)['_' + a] = DataRecord.parseNumber(data, { attribute: a, validate: true } );
                } else {
                    throw new Error('attribute ' + a + ' not found in data:ISaiaAle3Meter');
                }
                attCnt++;
            }
            if (attCnt !== Object.getOwnPropertyNames(this).length) {
                throw new Error('attribute count mismatch');
            }
        } catch (err) {
            throw new SaiaAle3MeterError(data, 'parsing ISaiaAle3Meter fails', err);
        }
    }

    public toObject (convertData = false): ISaiaAle3Meter {
        const rv: ISaiaAle3Meter = {
            createdAt:    convertData ? this._createdAt.getTime() : this._createdAt,
            typ:           this._typ,
            sn:            this._sn,
            name:          this._name,
            modbusAddress: this._modbusAddress,
            p:             this._p,
            q:             this._q,
            lamda:         this._lamda,
            e1:            this._e1,
            e2:            this._e2,
            de1:           this._de1,
            de2:           this._de2,
            u1:            this._u1,
            u2:            this._u2,
            u3:            this._u3,
            i1:            this._i1,
            i2:            this._i2,
            i3:            this._i3,
            p1:            this._p1,
            p2:            this._p2,
            p3:            this._p3,
            q1:            this._q1,
            q2:            this._q2,
            q3:            this._q3,
            lamda1:        this._lamda1,
            lamda2:        this._lamda2,
            lamda3:        this._lamda3
        };
        return rv;
    }

    public toEnergyMeter (preserveDate = true): IEnergyMeter {
        const s = Math.sqrt(this._q * this.q + this._p * this._p);
        const rv: IEnergyMeter = {
            createdAt:      preserveDate ? this._createdAt : this._createdAt.getTime(),
            manufacturer:   'Saia',
            type:           'ALE3D5FD10C3A00',
            serial:         this._sn,
            numberOfPhases: 3,
            voltagePxToN:   [ this._u1, this._u2, this._u3 ],
            activePower:    this._p,
            activePxPower:  [ this._p1, this._p2, this._p3 ],
            apparentPower:  Math.round(Math.sqrt(this._q * this.q + this._p * this._p) * 100) / 100,
            apparentPxPower: [
                Math.round(Math.sqrt(this._q1 * this.q1 + this._p1 * this._p1) * 100) / 100,
                Math.round(Math.sqrt(this._q2 * this.q2 + this._p2 * this._p2) * 100) / 100,
                Math.round(Math.sqrt(this._q3 * this.q3 + this._p3 * this._p3) * 100) / 100,
            ],
            energyTotal:     this.e1,
            energyPartitial: [ this.de1, this.de2 ]
            // voltagePxToPx: [],
            // energyTotalExported: Number.NaN,
            // energyTotalImported: Number.Nan
        };
        return rv;
    }

    public get createdAt (): Date {
        return this._createdAt;
    }

    public get typ (): string {
        return this._typ;
    }

    public get sn (): string {
        return this._sn;
    }

    public get name (): string {
        return this._name;
    }

    public get modbusAddress (): number {
        return this._modbusAddress;
    }

    public get p (): number {
        return this._p;
    }

    public get q (): number {
        return this._q;
    }

    public get lamda (): number {
        return this._lamda;
    }

    public get e1 (): number {
        return this._e1;
    }

    public get e2 (): number {
        return this._e2;
    }

    public get de1 (): number {
        return this._de1;
    }

    public get de2 (): number {
        return this._de2;
    }

    public get u1 (): number {
        return this._u1;
    }

    public get u2 (): number {
        return this._u2;
    }

    public get u3 (): number {
        return this._u3;
    }

    public get i1 (): number {
        return this._i1;
    }

    public get i2 (): number {
        return this._i2;
    }

    public get i3 (): number {
        return this._i3;
    }

    public get p1 (): number {
        return this._p1;
    }

    public get p2 (): number {
        return this._p2;
    }

    public get p3 (): number {
        return this._p3;
    }

    public get q1 (): number {
        return this._q1;
    }

    public get q2 (): number {
        return this._q2;
    }

    public get q3 (): number {
        return this._q3;
    }

    public get lamda1 (): number {
        return this._lamda1;
    }

    public get lamda2 (): number {
        return this._lamda2;
    }

    public get lamda3 (): number {
        return this._lamda3;
    }


}

export class SaiaAle3MeterError extends Error {
    constructor (public data: ISaiaAle3Meter, msg: string, public cause?: Error) { super(msg); }
}

