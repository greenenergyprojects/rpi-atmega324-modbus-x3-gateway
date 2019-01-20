
import * as debugsx from 'debug-sx';
const debug: debugsx.IFullLogger = debugsx.createFullLogger('statistics');

const debugSpy: debugsx.IFullLogger = debugsx.createFullLogger('spy');


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
        { id: 'cnt', label: 'Homecontrol - Anzahl', isRecordItem: true },
        { id: 'first-time', label: 'von (%Y-%M-%D)', isRecordItem: true },
        { id: 'last-time', label: 'bis (%Y-%M-%D)', isRecordItem: true },
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
        { id: 'e-out-daily', unit: 'Wh', label: 'E-out(tag)/Wh', hideMin: true, hideAvg: true },
        { id: 'boiler-p', unit: 'W', label: 'Boiler-P/W' },
        { id: 'boiler-e-daily', unit: 'Wh', label: 'Boiler-Etag)/Wh', hideMin: true, hideAvg: true },
        { id: 'boiler-e', unit: 'Wh', label: 'Boiler-E/Wh', hideMin: true, hideAvg: true }
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
    // private _pvsPBugSpy: PvsBugSpyRecord [] = [];

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
            debug.finer('%d monitor records processed, history-size=%d', this._handleMonitorRecordCount, this._history.length);
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
    minMaxValues: IMinMaxValue [];
    singleValues: { [id: string]: ISingleValue };
}



export interface IHeaderItem {
    id: string;
    unit?: string;
    isRecordItem?: boolean;
    hideMin?: boolean;
    hideAvg?: boolean;
    hideMax?: boolean;
    isSingleValue?: boolean;
    label?: string;
}

export interface ISingleValue {
    id: string;
    at: Date | number;
    value: number;
}

export interface IMinMaxValue {
    id: string;
    min: number;
    avg: number;
    max: number;
}

export class StatisticsRecord implements IStatisticsRecord  {
    protected _valueCount: number;
    protected _firstAt: Date;
    protected _lastAt: Date;
    protected _minMaxValues: IMinMaxValue [];
    protected _singleValues: { [id: string]: ISingleValue };

    public constructor (init?: IStatisticsRecord, singleValues?: { [id: string]: ISingleValue }) {
        if (!init) {
            this._valueCount = 0;
            this._firstAt = null;
            this._lastAt = null;
            this._minMaxValues = [];
            this._singleValues = singleValues ? singleValues : {};
        } else {
            this._valueCount = init.valueCount;
            const fat = init.firstAt;
            this._firstAt = fat instanceof Date ? fat : new Date(fat);
            const lat = init.lastAt;
            this._lastAt = lat instanceof Date ? lat : new Date(lat);
            this._minMaxValues = init.minMaxValues;
            this._singleValues = {};
            for (const id in init.singleValues) {
                if (!init.singleValues.hasOwnProperty(id)) { continue; }
                const v = init.singleValues[id];
                this._singleValues[id] = {
                    id:   v.id,
                    at: v.at instanceof Date ? v.at : new Date(v.at),
                    value: v.value
                };
            }
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

    public get minMaxValues (): IMinMaxValue [] {
        return this._minMaxValues;
    }

    public get singleValues (): { [ id: string ]: ISingleValue } {
        return this._singleValues;
    }

    public toObject (preserveDate?: boolean): IStatisticsRecord {
        const rv: IStatisticsRecord = {
            valueCount:    this._valueCount,
            firstAt:       preserveDate ? this._firstAt : this._firstAt.getTime(),
            lastAt:        preserveDate ? this._lastAt : this._lastAt.getTime(),
            minMaxValues:  this._minMaxValues,
            singleValues:  {}
        };
        for (const id in this._singleValues) {
            if (!this._singleValues.hasOwnProperty(id)) { continue; }
            const v = this._singleValues[id];
            const at = v.at instanceof Date ? v.at.getTime() : v.at;
            rv.singleValues[id] = {
                id:   v.id,
                at: preserveDate ? new Date(at) : at,
                value: v.value
            };
        }
        return rv;
    }

}


class StatisticsRecordFactory extends StatisticsRecord {

    private _header: IHeaderItem [];

    constructor (header: IHeaderItem [], singleValues?: { [id: string]: ISingleValue }) {
        super(null, singleValues);
        this._header = header;
        for (let i = 0; i < header.length; i++) {
            const h = header[i];
            if (h.isRecordItem) { continue; }
            this._minMaxValues.push({ id: h.id, min: null, avg: null, max: null });
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
            if (h.isSingleValue) {
                continue;
            }
            const v = this._minMaxValues[i + offset];
            if (v.id !== h.id) {
                debug.warn('error on header-id %s / value-id %s / index %d / offset %d', h.id, v.id, i, offset);
                continue;
            }

            // const ie = r.froniussymo ? r.froniussymo.inverterExtension : null;
            // let pvsPower = null;
            // if (ie && h.id === 'p-pv-s') {
            //     pvsPower = r.getPvSouthActivePowerAsNumber();
            //     const dcw_1 = ie.registerValues.getValue(40275);
            //     const dcst_1 = ie.registerValues.getValue(40281);
            //     // const dcw_sf = ie.registerValues.getValue(40258);
            //     // const dcw_2 = ie.registerValues.getValue(40295);
            //     // const dcst_2 = ie.registerValues.getValue(40301);
            //     // if (dcw_1 && dcw_1.value === 65535) {
            //     //     if (dcst_1.value === 4) {
            //     //         debugSpy.warn('dcw_1 === 65535: dcw_sf=%o  dcw_1=%o  dcst_1=%o     dcw_2=%o dcst_2=%o', dcw_sf, dcw_1, dcst_1, dcw_2, dcst_2);

            //     //     } else {
            //     //         debugSpy.info('dcw_1 === 65535: dcw_sf=%o  dcw_1=%o  dcst_1=%o     dcw_2=%o dcst_2=%o', dcw_sf, dcw_1, dcst_1, dcw_2, dcst_2);
            //     //     }
            //     // } else {
            //     //     debugSpy.fine('dcw_1 !== 65535: dcw_sf=%o  dcw_1=%o  dcst_1=%o     dcw_2=%o dcst_2=%o', dcw_sf, dcw_1, dcst_1, dcw_2, dcst_2);
            //     // }
            //     if (Array.isArray(pvsPBugSpy) && dcst_1 && dcw_1 && dcst_1.value >= 0 && dcw_1.value >= 0) {
            //         pvsPBugSpy.push({ dcst_1: dcst_1, dcw_1: dcw_1 });
            //         while (pvsPBugSpy.length > 10) {
            //             pvsPBugSpy.splice(0, 1);
            //         }
            //         if (pvsPBugSpy.length > 6 && dcw_1.value === 65535 && dcst_1.value === 4) {
            //             const x = pvsPBugSpy[0];
            //             if (x.dcst_1.value === 3 && x.dcw_1.value === 65535) {
            //                 debug.warn('Fronius Inverter Exetension Bug, set pvs power to zero');
            //                 pvsPower = 0;
            //             }
            //         }


            //     }
            //     if (pvsPower < 10) {
            //         // Fronius Bug, Battery (string 2) leads to wrong PV power (string 1)
            //         debug.finer('bugfix pvsPower:  %d -> 0', pvsPower);
            //         pvsPower = 0;
            //     }
            // }

            switch (h.id) {
                case 'p-grid':          this.handleValue(v, this._valueCount, r.getGridActivePowerAsNumber()); break;
                case 'p-load':          this.handleValue(v, this._valueCount, r.getLoadActivePowerAsNumber()); break;
                case 'p-storage':       this.handleValue(v, this._valueCount, r.getBatteryPowerAsNumber()); break;
                case 'storage-percent': this.handleValue(v, this._valueCount, r.getBatteryEnergyInPercentAsNumber()); break;
                case 'p-pv':            this.handleValue(v, this._valueCount, r.getPvActivePowerAsNumber()); break;
                case 'p-pv-s':          this.handleValue(v, this._valueCount, r.getPvSouthActivePowerAsNumber()); break;
                case 'p-pv-ew':         this.handleValue(v, this._valueCount, r.getPvEastWestActivePowerAsNumber()); break;
                case 'e-pv-daily':      this.handleValue(v, this._valueCount, r.getPvEnergyDailyAsNumber()); break;
                case 'e-pv-s-daily':    this.handleValue(v, this._valueCount, r.getPvSouthEnergyDailyAsNumber()); break;
                case 'e-pv-ew-daily':   this.handleValue(v, this._valueCount, r.getPvEastWestEnergyDailyAsNumber()); break;
                case 'e-pv-s':          this.handleValue(v, this._valueCount, r.getPvSouthEnergyAsNumber()); break;
                case 'e-out':           this.handleValue(v, this._valueCount, r.getEOutAsNumber()); break;
                case 'e-in':            this.handleValue(v, this._valueCount, r.getEInAsNumber()); break;
                case 'e-pv-ew':         this.handleValue(v, this._valueCount, r.getPvEastWestEnergyAsNumber()); break;
                case 'e-site':          this.handleValue(v, this._valueCount, r.getFroniusSiteEnergyAsNumber()); break;
                case 'e-site-daily':    this.handleValue(v, this._valueCount, r.getFroniusSiteDailyEnergyAsNumber()); break;
                case 'e-in-daily':      this.handleValue(v, this._valueCount, r.getEInDailyAsNumber()); break;
                case 'e-out-daily':     this.handleValue(v, this._valueCount, r.getEOutDailyAsNumber()); break;
                case 'boiler-p':        this.handleValue(v, this._valueCount, r.getBoilerActivePower()); break;
                case 'boiler-e-daily':  this.handleValue(v, this._valueCount, r.getBoilerEnergyDaily()); break;
                case 'boiler-e':        this.handleValue(v, this._valueCount, r.getBoilerEnergyTotal()); break;
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
                const now = new Date();
                s = s.replace(/%Y/g, sprintf('%04d', now.getFullYear()));
                s = s.replace(/%M/g, sprintf('%02d', now.getMonth() + 1));
                s = s.replace(/%D/g, sprintf('%02d', now.getDate()));
            } else if (h.isSingleValue) {
                s = s + (first ? '' : ',');
                s += '"SVAL(' + h.label + ')","SDAT(' + h.label + ')"';
                first = false;
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
            s += s.length > 0 ? ',' : '';

            if (h.isSingleValue) {
                offset -= 2;
                const v = this._singleValues[h.id];
                if (!v) {
                    s += sprintf('"0",""'); // no value available
                } else {
                    const at = v.at instanceof Date ? v.at : new Date(v.at);
                    const d: { format: string, value: number} = null;
                    let sv: string;
                    if (d) {
                        sv = sprintf(d.format, v.value).trim();
                    } else {
                        sv = sprintf('%.3f', v.value);
                    }

                    s += sprintf('"%s","%02d:%02d:%02d"', sv.replace(/\./g, ','), at.getHours(), at.getMinutes(), at.getSeconds());
                }

            } else if (h.isRecordItem) {
                offset--;
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
                    default: debug.warn('unsupported record Item id %s', h.id); break;
                }

            } else {
                const v = this.minMaxValues[i + offset];
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
                        case 'boiler-p': {
                            s += this.formatLineFragment(h, 0, v);
                            break;
                        }
                        case 'boiler-e-daily': {
                            s += this.formatLineFragment(h, 0, v);
                            break;
                        }
                        case 'boiler-e': {
                            s += this.formatLineFragment(h, 0, v);
                            break;
                        }
                        default: debug.warn('unsupported id %s', h.id); break;
                    }
                }
            }
        }
        return s;
    }


    private formatLineFragment (h: IHeaderItem, digits: number, values: IMinMaxValue): string {
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

    private handleValue (v: IMinMaxValue, cnt: number, x: number) {
        this.calcMinimum(v, x);
        this.calcMaximum(v, x);
        this.calcAverage(v, cnt, x);
    }

    private calcMinimum (v: IMinMaxValue, x: number) {
        if (typeof x !== 'number') { return; }
        if (v.min === null) {
            v.min = x;
        } else {
            v.min = x < v.min ? x : v.min;
        }
    }

    private calcMaximum (v: IMinMaxValue, x: number) {
        if (typeof x !== 'number') { return; }
        if (v.max === null) {
            v.max = x;
        } else {
            v.max = x > v.max ? x : v.max;
        }
    }

    private calcAverage (v: IMinMaxValue, oldCnt: number, x: number) {
        if (typeof x !== 'number') { return; }
        if (v.avg  === null) {
            v.avg = x;
        } else {
            v.avg = (v.avg * oldCnt + x) / (oldCnt + 1);
        }
    }
}

// interface PvsBugSpyRecord {
//     dcst_1: { at: Date, value: number };
//     dcw_1: { at: Date, value: number };
// }
