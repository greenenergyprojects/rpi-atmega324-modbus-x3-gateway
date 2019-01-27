import { Injectable } from '@angular/core';
import { MonitorRecord } from '../data/common/home-control/monitor-record';
import { Subject, Observable, Subscriber, TeardownLogic } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class HistoryService {

    public historyObservable: Observable<IHistoryRecord>;

    private _observables: { [ id: string ]: { observable: Observable<any>, observers: Subscriber<any> [] }} = {};
    private _historyObservers: Subscriber<IHistoryRecord> [] = [];
    private _monitorValues: MonitorRecord [] = [];
    private _timer: any;
    private _lastMonitorRecord: { at: Date, data: MonitorRecord };


    constructor () {
        this._timer = setInterval( () => this.handleTimer(), 1000);
    }

    public fromEvent (id: 'pgrid'): Observable<{ at: Date, value: number}> {
        let o = this._observables[id];
        if (!o) {
            o = { observable: null, observers: [] };
            o.observable = new Observable((s) => {
                o.observers.push(s);
                return { unsubscribe () {
                    o.observers.splice(o.observers.indexOf(s), 1);
                }};
            });
            this._observables[id] = o;
        }
        return o.observable;
    }


    public refresh (mr: MonitorRecord) {
        this._lastMonitorRecord = { at: new Date(), data: mr };
    }

    private handleTimer () {
        const mr = this._lastMonitorRecord;
        if (!this._lastMonitorRecord) {
            this._monitorValues.push(null);

        } else {
            this._monitorValues.push(this._lastMonitorRecord.data);
            this._lastMonitorRecord = null;
        }
        if (this._monitorValues.length > 60) {
            this._monitorValues.splice(0, 1);
        }

        const o = this._observables.pgrid;
        if (o && o.observers.length > 0) {
            let pgrid: number;
            try {
                pgrid = mr.data.getGridActivePowerAsNumber();
            } catch (err) {
                pgrid = null;
            }
            o.observers.forEach( (observer) => observer.next(pgrid));
        }
    }
}

export interface IHistoryRecord {
    at: Date;
    id: string;
    value: number;
    unit: string;
}
