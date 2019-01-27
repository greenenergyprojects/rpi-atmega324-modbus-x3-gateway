import { Injectable } from '@angular/core';
import { Subject, Observable, Subscriber, TeardownLogic } from 'rxjs';

import { ServerService } from './server.service';
import * as serverHttp from '../data/common/home-control/server-http';
import { IFroniusMeter } from '../data/common/fronius-meter/fronius-meter';
import { IMonitorRecord, MonitorRecord } from '../data/common/home-control/monitor-record';
import { IFroniusSymo } from '../data/common/fronius-symo/fronius-symo';
import { Nibe1155Value } from '../data/common/nibe1155/nibe1155-value';
import { INibe1155Controller, Nibe1155Controller } from '../data/common/nibe1155/nibe1155-controller';
import { ControllerParameter } from '../data/common/hot-water-controller/controller-parameter';
import { IMonitorRecord as IBoilerMonitorRecord } from '../data/common/hot-water-controller/monitor-record';
import { IControllerStatus } from '../data/common/hot-water-controller/controller-status';
import { HistoryService } from './history.service';


@Injectable({ providedIn: 'root' })
export class DataService {

    public froniusMeterObservable: Observable<IFroniusMeter>;
    public monitorObservable: Observable<MonitorRecord>;

    private _froniusMeterSubject: Subject<IFroniusMeter>;
    private _froniusMeterObservers: Subscriber<IFroniusMeter> [] = [];
    private _froniusMeterTimer: any;
    private _froniusMeterValues: IFroniusMeter [] = [];

    private _monitorSubject: Subject<MonitorRecord>;
    private _monitorObservers: Subscriber<MonitorRecord> [] = [];
    private _monitorTimer: any;

    private _nibe1155: IHeatpumpData;


    constructor (private _serverService: ServerService, private _historyService: HistoryService) {
        this.froniusMeterObservable = new Observable((s) => this.froniusMeterSubscriber(s));
        this.monitorObservable = new Observable((s) => this.monitorSubscriber(s));
        this._nibe1155 = null;
    }

    public getFroniusMeterValues (): IFroniusMeter [] {
        return this._froniusMeterValues;
    }

    public getFroniusSymoValues ( query?: {
                                    all?:               boolean,
                                    froniusregister?:   boolean,
                                    common?:            boolean,
                                    inverter?:          boolean,
                                    nameplate?:         boolean,
                                    setting?:           boolean,
                                    status?:            boolean,
                                    control?:           boolean,
                                    storage?:           boolean,
                                    inverterExtension?: boolean,
                                    stringCombiner?:    boolean,
                                    meter?:             boolean
                                }): Promise<IFroniusSymo> {
        let uri = '/data/froniussymo';
        let first = true;
        for (const att in query) {
            if (!query.hasOwnProperty(att)) { continue; }
            uri += first ? '?' + att : '&' + att;
            first = false;
        }
        // return this.http.get<froniusSymo.IFroniusSymoValues>(uri);
        return this._serverService.httpGetJson(uri);
    }

    public getNibe1155Values ( query?: serverHttp.IHttpGetDataNibe1155Query): Promise<serverHttp.IHttpGetDataNibe1155Response> {
        let uri = '/data/nibe1155';
        query = query || { logsetIds: true, controller: true, valueIds: 'all' };
        let queryString = '';
        if (query.logsetIds)  { queryString += (queryString !== '' ? '&' : '') + 'logsetIds=true'; }
        if (query.controller) { queryString += (queryString !== '' ? '&' : '') + 'controller=true'; }
        if (query.valueIds) {
            if (query.valueIds === '*' || query.valueIds === 'all') {
                queryString += (queryString !== '' ? '&' : '') + 'valueIds=all';
            } else if (query.valueIds === 'none') {
                queryString += (queryString !== '' ? '&' : '') + 'valueIds=none';
            } else if (Array.isArray(query.valueIds)) {
                for (const id of query.valueIds) {
                    queryString += (queryString !== '' ? '&' : '') + 'valueIds=' + id;
                }
            } else {
                queryString += (queryString !== '' ? '&' : '') + 'valueIds=' + query.valueIds;
            }
        }
        if (queryString !== '') {
            uri += '?' + queryString;
        }

        console.log(uri);
        return this._serverService.httpGetJson(uri);
    }


    public getMonitorData ( query?: { latest?: boolean }): Promise<IMonitorRecord []> {
        let uri = '/data/monitor';
        let first = true;
        for (const att in query) {
            if (!query.hasOwnProperty(att)) { continue; }
            uri += first ? '?' + att : '&' + att;
            first = false;
        }
        return this._serverService.httpGetJson(uri);
    }

    public get nibe1155 (): IHeatpumpData {
        return this._nibe1155;
    }

    public handleNibe1155Values (v: serverHttp.IHttpGetDataNibe1155Response, clear?: boolean) {
        if (!v) { return; }
        if (clear) {
            this._nibe1155 = {
                lastRefreshAt: null,
                controller: null,
                values: {},
                logsetIds: [],
                nonLogsetIds: []
            };

            if (Array.isArray(v.logsetIds)) {
                this._nibe1155.logsetIds = [].concat(v.logsetIds);
            } else {
                console.log(new Error('unexpected response, missing logsetIds'));
            }
            if (v.values) {
                for (const id of Object.getOwnPropertyNames(v.values)) {
                    if (!this._nibe1155.logsetIds.find( (i) => i === +id)) {
                        this._nibe1155.nonLogsetIds.push(+id);
                    }
                }
            }
            // console.log(this._nibe1155.logsetIds);
            // console.log(this._nibe1155.nonLogsetIds);
        }

        this._nibe1155.lastRefreshAt = new Date();
        if (v.controller) {
            try {
                this._nibe1155.controller = new Nibe1155Controller(v.controller);
            } catch (err) {
                console.log('ERROR: cannot create Nibe1155Controller', err);
            }
        }
        let cnt = 0;
        if (v.values) {
            for (const id of Object.getOwnPropertyNames(v.values)) {
                const x = v.values[id];
                if (!this._nibe1155.values[id]) {
                    try {
                        this._nibe1155.values[id] = new Nibe1155Value(x);
                    } catch (err) {
                        console.log('ERROR: cannot create Nibe1155Value id ' + id, err);
                    }
                } else {
                    this._nibe1155.values[id].setRawValue(x.rawValue, new Date(x.rawValueAt));
                    cnt++;
                }
            }
        }
        // console.log(cnt + ' values updated');
    }


    public setHeatPumpMode (mode: INibe1155Controller): Promise<INibe1155Controller> {
        console.log(mode);
        const uri = '/control/nibe1155-controller';
        return this._serverService.httpPostAndGetJson(uri, mode);
    }

    public setBoilerControllerParameter (p: ControllerParameter): Promise<IControllerStatus> {
        console.log(p);
        const uri = '/control/boiler/controller/parameter';
        return this._serverService.httpPostAndGetJson(uri, p.toObject());
    }


    private froniusMeterSubscriber (subscriber: Subscriber<IFroniusMeter>): TeardownLogic {
        const thiz = this;

        this._froniusMeterObservers.push(subscriber);
        if (this._froniusMeterObservers.length === 1) {
            this._froniusMeterTimer = setInterval( () => this.refreshFroniusMeterValues(), 1000);
        }
        return { unsubscribe() {
            thiz._froniusMeterObservers.splice(thiz._froniusMeterObservers.indexOf(subscriber), 1);
            if (thiz._froniusMeterObservers.length === 0) {
                clearInterval(thiz._froniusMeterTimer);
                thiz._froniusMeterTimer = null;
                thiz._froniusMeterValues = [];
            }
        } };
    }


    private refreshFroniusMeterValues () {
        // console.log('refresh ... ' + this._froniusMeterObservers.length);
        if (this._serverService.isModalLoginActive) {
            return;
        }
        this._serverService.httpGetJson('/data/froniusmeter').then( (v: IFroniusMeter) => {
            this._froniusMeterObservers.forEach( (o) => o.next(v));
            this._froniusMeterValues.push(v);
            if (this._froniusMeterValues.length > 60) {
                this._froniusMeterValues.splice(0, 1);
            }
        }).catch( (error) => {
            console.log(error);
            this._froniusMeterObservers.forEach( (o) => o.next(null));
        });
    }


    private monitorSubscriber (subscriber: Subscriber<MonitorRecord>): TeardownLogic {
        const thiz = this;
        this._monitorObservers.push(subscriber);
        if (this._monitorObservers.length === 1) {
            this._monitorTimer = setInterval( () => this.refreshMonitorValues(), 1000);
            this.refreshMonitorValues();
        }
        return { unsubscribe() {
            thiz._monitorObservers.splice(thiz._monitorObservers.indexOf(subscriber), 1);
            if (thiz._monitorObservers.length === 0) {
                clearInterval(thiz._monitorTimer);
                thiz._monitorTimer = null;
            }
        } };
    }

    private refreshMonitorValues () {
        if (this._serverService.isModalLoginActive) {
            return;
        }
        // if (this._nibe1155 === null) {
        //     this.getNibe1155Values({ controller: true, completeValues: true }).then( (values) => {
        //         this.handleNibe1155Values(values, true);
        //     }, (error) => {
        //         console.log(error);
        //     });
        // }

        this._serverService.httpGetJson('/data/monitor').then( (v: IMonitorRecord []) => {
            if (!Array.isArray(v) || v.length !== 1) {
                console.log(new Error('unexpected response'));
                this._monitorObservers.forEach( (o) => o.next(null));
                this._historyService.refresh(null);
                return;
            }
            // this.handleNibe1155Values(v[0].nibe1155);
            // console.log(v[0]);
            const r = new MonitorRecord(v[0]);
            this._monitorObservers.forEach( (o) => o.next(r));
            this._historyService.refresh(r);
        }, (error) => {
            console.log(error);
            this._monitorObservers.forEach( (o) => o.next(null));
        });
    }

    private handleNibe1155LogsetIds () {
        this._nibe1155.lastRefreshAt = new Date();
        const x: { [ key: string ]: string } = {};
        if (Array.isArray(this._nibe1155.logsetIds)) {
            for (const id of this._nibe1155.logsetIds) {
                const v = this._nibe1155.values[id];
                if (!v) {
                    x['? (' + id + ')'] = '?';
                } else {
                    x[v.label + ' (' + v.id + ')'] = v.valueAsString(true);
                }
            }
        }
    }

}

export interface IHeatpumpData {
    lastRefreshAt: Date;
    controller: INibe1155Controller;
    values: { [ id: number ]: Nibe1155Value };
    logsetIds: number [];
    nonLogsetIds: number [];
}
