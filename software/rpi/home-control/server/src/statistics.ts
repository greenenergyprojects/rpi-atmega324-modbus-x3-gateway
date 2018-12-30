
import * as debugsx from 'debug-sx';
const debug: debugsx.IFullLogger = debugsx.createFullLogger('statistics');

import * as fs from 'fs';

import { sprintf } from 'sprintf-js';
import * as nconf from 'nconf';
import { MonitorRecord } from './data/common/home-control/monitor-record';

interface IStatisticsConfig {
    disabled?: boolean;
    timeslotSeconds: number;
    tmpFile: string;
    dbtyp: 'csvfile';
    csvfile?: {
        filename: string;
        writeDate?: boolean;
    };
}


export class Statistics {

    public static CSVHEADER: IHeaderItem [] = [
        { id: 'cnt', label: 'Messwertanzahl', isRecordItem: true },
        { id: 'first-time', label: 'von', isRecordItem: true },
        { id: 'last-time', label: 'bis', isRecordItem: true },
        { id: 'p-grid', unit: 'W', label: 'P-Netz/W' },
        { id: 'p-load', unit: 'W', label: 'P-Verbraucher/W' },
        { id: 'storage-percent', unit: '%', label: 'Speicher/%' },
        { id: 'p-storage', unit: 'W', label: 'P-Speicher/W' },
        { id: 'p-pv', unit: 'W', label: 'P-PV/W' },
        { id: 'p-pv-s', unit: 'W', label: 'P-PV_Süd/W' },
        { id: 'p-pv-ew', unit: 'W', label: 'P-PV_Ost_West/W' },
        { id: 'e-pv-daily', unit: 'Wh', label: 'E(tag)-PV/Wh', hideMin: true, hideAvg: true },
        { id: 'e-pv-s-daily', unit: 'Wh', label: 'E(tag)-PV_Süd/Wh', hideMin: true, hideAvg: true },
        { id: 'e-pv-ew-daily', unit: 'Wh', label: 'E(tag)-PV_Ost_West/Wh', hideMin: true, hideAvg: true },
        { id: 'e-out', unit: 'Wh', label: 'E-out/Wh', hideMin: true, hideAvg: true },
        { id: 'e-in', unit: 'Wh', label: 'E-in/Wh', hideMin: true, hideAvg: true },
        { id: 'e-pv-s', unit: 'Wh', label: 'E-PV_Süd/Wh', hideMin: true, hideAvg: true },
        { id: 'e-pv-ew', unit: 'Wh', label: 'E-PV_Ost_West/Wh', hideMin: true, hideAvg: true },
        { id: 'e-site', unit: 'Wh', label: 'E-Fronius-Site/Wh', hideMin: true, hideAvg: true },
        { id: 'e-site-daily', unit: 'Wh', label: 'E(tag)-Fronius-Site/Wh', hideMin: true, hideAvg: true },
        { id: 'e-in-daily', unit: 'Wh', label: 'E-in(tag)/Wh', hideMin: true, hideAvg: true },
        { id: 'e-out-daily', unit: 'Wh', label: 'E-out(tag)/Wh', hideMin: true, hideAvg: true }

    ];

    public static getInstance (): Statistics {
        if (!this._instance) { throw new Error('instance not created'); }
        return this._instance;
    }

    public static async createInstance (config: IStatisticsConfig): Promise<Statistics> {
        if (this._instance) { throw new Error('instance already created'); }
        const rv = new Statistics(config);
        await rv.init();
        this._instance = rv;
        return rv;
    }

    private static _instance: Statistics;

    // ***********************************************

    private _config: IStatisticsConfig;
    private _timer: NodeJS.Timer;
    private _handleMonitorRecordCount = 0;
    private _history: StatisticsRecord [] = [];
    private _current: StatisticsRecordFactory;
    private _writeFileLines: IWriteFileLine [] = [];

    private constructor (config: IStatisticsConfig) {
        if (!config) { throw new Error('missing config'); }
        if (!config.disabled) {
            if (typeof config.timeslotSeconds !== 'number' || config.timeslotSeconds < 1) {
                throw new Error('invalid/missing value for timeslotSeconds');
            }
            if (typeof config.tmpFile !== 'string' || !config.tmpFile) {
                throw new Error('invalid/missing value for tmpFile');
            }
            if (typeof config.dbtyp !== 'string' || !config.dbtyp) {
                throw new Error('invalid/missing value for dbtyp');
            }
            switch (config.dbtyp) {
                case 'csvfile': {
                    if (typeof config.csvfile !== 'object' || !config.csvfile) {
                        throw new Error('invalid/missing object for csvfile');
                    }
                    if (typeof config.csvfile.filename !== 'string' || !config.csvfile.filename) {
                        throw new Error('invalid/missing value for csvfile.filename');
                    }
                    break;
                }
                default: {
                    throw new Error('invalid value for dbtyp');
                }
            }
        }
        this._config = config;
        if (!this._config.disabled) {
            setInterval( () => this.handleTimer(), this._config.timeslotSeconds * 1000);
        }
    }

    public handleMonitorRecord (d: MonitorRecord) {
        // debug.info('handleMonitorRecord %o', d);
        this._handleMonitorRecordCount++;
        if (!this._current) {
            this._current = new StatisticsRecordFactory(Statistics.CSVHEADER);
        }
        this._current.addMonitorRecord(d);
    }

    private async init () {
        if (this._config.disabled) { return; }
    }

    private handleTimer () {
        if (this._config.disabled) { return; }
        if (this._handleMonitorRecordCount === 0) {
            debug.warn('no monitor records received, cannot continue statistics!');
        } else {
            debug.fine('%d monitor records processed, history-size=%d', this._handleMonitorRecordCount, this._history.length);
            this._handleMonitorRecordCount = 0;
            if (this._current) {
                this._history.push(this._current);
                if (this._config.dbtyp) {
                    switch (this._config.dbtyp) {
                        case 'csvfile': this.writeToCsvFile(this._config.csvfile, this._current); break;
                        default: debug.warn('invalid config/dbtyp'); break;
                    }
                }
                this._current = null;
            }
        }
    }

    private writeToCsvFile (config: { filename: string, writeDate?: boolean }, x: StatisticsRecordFactory) {
        let filename = config.filename;
        let i = filename.indexOf('%Y');
        if (i >= 0) {
            filename = filename.substr(0, i) + sprintf('%02d', x.firstAt.getFullYear()) + filename.substr(i + 2);
        }
        i = filename.indexOf('%M');
        if (i >= 0) {
            filename = filename.substr(0, i) + sprintf('%02d', x.firstAt.getMonth() + 1) + filename.substr(i + 2);
        }
        i = filename.indexOf('%D');
        if (i >= 0) {
            filename = filename.substr(0, i) + sprintf('%02d', x.firstAt.getDate()) + filename.substr(i + 2);
        }
        i = filename.indexOf('%m');
        if (i >= 0) {
            filename = filename.substr(0, i) + sprintf('%02d', x.firstAt.getMilliseconds()) + filename.substr(i + 2);
        }
        i = filename.indexOf('%d');
        if (i >= 0) {
            const wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ];
            filename = filename.substr(0, i) + sprintf('%02d%s', wd[x.firstAt.getDay()], filename.substr(i + 2));
        }

        this._writeFileLines.push({ filename: filename, line: x.toLine(), header: x.toHeader()});
        if (this._writeFileLines.length === 1) {
            this.writeToFile();
        }
    }

    private writeToFile () {
        if (this._writeFileLines.length === 0) { return; }
        const x = (this._writeFileLines.splice(0, 1))[0];
        const s = (fs.existsSync(x.filename) ? x.line : x.header + '\n' + x.line) + '\n';
        const thiz = this;
        fs.appendFile(x.filename, s, (err) => {
            if (err) {
                debug.warn('writing to file %s fails\n%s', x.filename, s);
            } else if (debug.finer.enabled) {
                debug.finer('append record to file %s\n%s', x.filename, s);
            }
            thiz.writeToFile();
        });
    }
}

export interface IWriteFileLine {
    filename: string;
    line: string;
    header: string;
}

export interface IStatisticsRecord {
    valueCount: number;
    firstAt: Date | number;
    lastAt: Date | number;
    values: IValue [];
}

export interface IHeaderItem {
    id: string;
    unit?: string;
    isRecordItem?: boolean;
    hideMin?: boolean;
    hideAvg?: boolean;
    hideMax?: boolean;
    label?: string;
}

export interface IValue {
    id: string;
    min: number;
    avg: number;
    max: number;
}

export class StatisticsRecord implements IStatisticsRecord  {
    protected _valueCount: number;
    protected _firstAt: Date;
    protected _lastAt: Date;
    protected _values: IValue [];

    public constructor (init?: IStatisticsRecord) {
        if (!init) {
            this._valueCount = 0;
            this._firstAt = null;
            this._lastAt = null;
            this._values = [];
        } else {
            this._valueCount = init.valueCount;
            const fat = init.firstAt;
            this._firstAt = fat instanceof Date ? fat : new Date(fat);
            const lat = init.lastAt;
            this._lastAt = lat instanceof Date ? lat : new Date(lat);
            this._values = init.values;
        }
    }

    public get valueCount (): number {
        return this._valueCount;
    }

    public get firstAt (): Date {
        return this._firstAt;
    }

    public get lastAt (): Date {
        return this._lastAt;
    }

    public get values (): IValue [] {
        return this._values;
    }

    public toObject (preserveDate?: boolean): IStatisticsRecord {
        const rv: IStatisticsRecord = {
            valueCount: this._valueCount,
            firstAt:    preserveDate ? this._firstAt : this._firstAt.getTime(),
            lastAt:     preserveDate ? this._lastAt : this._lastAt.getTime(),
            values:     this._values
        };
        return rv;
    }

}

class StatisticsRecordFactory extends StatisticsRecord {

    private _header: IHeaderItem [];

    constructor (header: IHeaderItem []) {
        super();
        this._header = header;
        for (let i = 0; i < header.length; i++) {
            const h = header[i];
            if (h.isRecordItem) { continue; }
            this._values.push({ id: h.id, min: Number.NaN, avg: Number.NaN, max: Number.NaN });
        }
    }

    public addMonitorRecord (r: MonitorRecord) {
        if (this.valueCount === 0) {
            this._firstAt = r.createdAt;
        }
        this._lastAt = r.createdAt;

        for (let i = 0, offset = 0; i < this._header.length; i++) {
            const h = this._header[i];
            if (h.isRecordItem) {
                offset--;
                continue;
            }
            const v = this._values[i + offset];
            if (v.id !== h.id) {
                debug.warn('error on header-id %s / value-id %s / index %d / offset %d', h.id, v.id, i, offset);
                continue;
            }
            switch (h.id) {
                // case 'p-grid':          this.handleValue(v, this._valueCount, r.gridActivePower); break;
                // case 'p-load':          this.handleValue(v, this._valueCount, r.loadActivePower); break;
                // case 'p-storage':       this.handleValue(v, this._valueCount, r.storagePower); break;
                // case 'storage-percent': this.handleValue(v, this._valueCount, r.storageEnergyInPercent); break;
                // case 'p-pv':            this.handleValue(v, this._valueCount, r.pvActivePower); break;
                // case 'p-pv-s':          this.handleValue(v, this._valueCount, r.pvSouthActivePower); break;
                // case 'p-pv-ew':         this.handleValue(v, this._valueCount, r.pvEastWestActivePower); break;
                // case 'e-pv-daily':      this.handleValue(v, this._valueCount, r.pvEnergyDaily); break;
                // case 'e-pv-s-daily':    this.handleValue(v, this._valueCount, r.pvSouthEnergyDaily); break;
                // case 'e-pv-ew-daily':   this.handleValue(v, this._valueCount, r.pvEastWestEnergyDaily); break;
                // case 'e-pv-s':          this.handleValue(v, this._valueCount, r.froniusEnergy); break;
                // case 'e-out':           this.handleValue(v, this._valueCount, r.eOut); break;
                // case 'e-in':            this.handleValue(v, this._valueCount, r.eIn); break;
                // case 'e-pv-ew':         this.handleValue(v, this._valueCount, r.pvEastWestEnergy); break;
                // case 'e-site':          this.handleValue(v, this._valueCount, r.froniusEnergy); break;
                // case 'e-site-daily':    this.handleValue(v, this._valueCount, r.froniusEnergyDaily); break;
                // case 'e-in-daily':      this.handleValue(v, this._valueCount, r.eInDaily); break;
                // case 'e-out-daily':     this.handleValue(v, this._valueCount, r.eOutDaily); break;
                default: debug.warn('unsupported id %s', h.id); break;
            }
        }
        this._valueCount++;
    }

    public toHeader (): string {
        let s = '';
        for (let i = 0, first = true; i < this._header.length; i++) {
            const h = this._header[i];
            if (h.isRecordItem) {
                s = s + (first ? '' : ',');
                s += '"' + h.label + '"'; first = false;
            } else {
                if (!h.hideMin) {
                    s = s + (first ? '' : ',');
                    s += '"MIN(' + h.label + ')"';
                    first = false;
                }
                if (!h.hideAvg) {
                    s = s + (first ? '' : ',');
                    s += '"AVG(' + h.label + ')"';
                    first = false;
                }
                if (!h.hideMax) {
                    s = s + (first ? '' : ',');
                    s += '"MAX(' + h.label + ')"';
                    first = false;
                }
            }
        }
        return s;
    }

    public toLine (): string {
        let s = '', offset = 0;
        for (let i = 0, first = true; i < this._header.length; i++, first = false) {
            const h = this._header[i];
            let v: IValue;
            if (h.isRecordItem) {
                offset--;
            } else {
                v = this.values[i + offset];
            }
            s = s + (first ? '' : ',');

            if (v && v.id !== h.id) {
                debug.warn('error on header-id %s / value-id %s / index %d / offset %d', h.id, v.id, i, offset);
                s += '"ERR","ERR","ERR"';
            } else {
                switch (h.id) {
                    case 'cnt': {
                        s += this.valueCount.toString();
                        break;
                    }
                    case 'first-date': {
                        s += sprintf('"%04d-%02d-%02d"', this.firstAt.getFullYear(), this.firstAt.getMonth() + 1, this.firstAt.getDay());
                        break;
                    }
                    case 'last-date': {
                        s += sprintf('"%04d-%02d-%02d"', this.lastAt.getFullYear(), this.lastAt.getMonth() + 1, this.lastAt.getDay());
                        break;
                    }
                    case 'first-time': {
                        s += sprintf('"%02d:%02d:%02d"', this.firstAt.getHours(), this.firstAt.getMinutes(), this.firstAt.getSeconds());
                        break;
                    }
                    case 'last-time': {
                        s += sprintf('"%02d:%02d:%02d"', this.lastAt.getHours(), this.lastAt.getMinutes(), this.lastAt.getSeconds());
                        break;
                    }
                    case 'p-grid': case 'p-storage': case 'p-load': {
                        s += this.formatLineFragment(h, 0, v);
                        break;
                    }
                    case 'storage-percent': {
                        s += this.formatLineFragment(h, 0, v);
                        break;
                    }
                    case 'p-pv': case 'p-pv-s': case 'p-pv-ew': {
                        s += this.formatLineFragment(h, 0, v);
                        break;
                    }
                    case 'e-pv-daily': case 'e-pv-s-daily': case 'e-pv-ew-daily': {
                        s += this.formatLineFragment(h, 1, v);
                        break;
                    }
                    case 'e-pv': case 'e-pv-s': case 'e-pv-ew': case 'e-site': case 'e-site-daily': {
                        s += this.formatLineFragment(h, 0, v);
                        break;
                    }
                    case 'e-out': case 'e-in': {
                        s += this.formatLineFragment(h, 1, v);
                        break;
                    }
                    case 'e-in-daily': case 'e-out-daily': {
                        s += this.formatLineFragment(h, 0, v);
                        break;
                    }
                    default: debug.warn('unsupported id %s', h.id); break;
                }
            }

        }
        return s;
    }

    private formatLineFragment (h: IHeaderItem, digits: number, values: IValue): string {
        let s = '';
        let k = 1;
        while (digits-- > 0) {
            k *= 10;
        }
        if (!h.hideMin) {
            s += typeof values.min === 'number' ? sprintf('"%f"', Math.round(values.min * k) / k) : '""';
        }
        if (!h.hideAvg) {
            if (s) { s += ','; }
            s += typeof values.avg === 'number' ? sprintf('"%f"', Math.round(values.avg * k) / k) : '""';
        }
        if (!h.hideMax) {
            if (s) { s += ','; }
            s += typeof values.max === 'number' ? sprintf('"%f"', Math.round(values.max * k) / k) : '""';
        }
        return s.replace(/\./g, ',');
    }

    private handleValue (v: IValue, cnt: number, x: number) {
        this.calcMinimum(v, x);
        this.calcMaximum(v, x);
        this.calcAverage(v, cnt, x);
    }

    private calcMinimum (v: IValue, x: number) {
        if (Number.isNaN(v.min)) {
            v.min = x;
        } else {
            v.min = x < v.min ? x : v.min;
        }
    }

    private calcMaximum (v: IValue, x: number) {
        if (Number.isNaN(v.max)) {
            v.max = x;
        } else {
            v.max = x > v.max ? x : v.max;
        }
    }

    private calcAverage (v: IValue, oldCnt: number, x: number) {
        if (Number.isNaN(v.avg)) {
            v.avg = x;
        } else {
            v.avg = (v.avg * oldCnt + x) / (oldCnt + 1);
        }
    }
}
