
export interface IStatisticDefinition {
    pPv:               IStatisticItemDefinition;
    pPvS:              IStatisticItemDefinition;
    pPvEW:             IStatisticItemDefinition;
    pBat:              IStatisticItemDefinition;
    pGrid:             IStatisticItemDefinition;
    pBoiler:           IStatisticItemDefinition;
    pHeatPump:         IStatisticItemDefinition;
    pLoad:             IStatisticItemDefinition;
    eOut:              IStatisticItemDefinition;
    eIn:               IStatisticItemDefinition;
    eOutDaily:         IStatisticItemDefinition;
    eInDaily:          IStatisticItemDefinition;
    eBoilerDaily:      IStatisticItemDefinition;
    eHeatPumpDaily:    IStatisticItemDefinition;
    ePvDaily:          IStatisticItemDefinition;
    ePvSDaily:         IStatisticItemDefinition;
    ePvEWDaily:        IStatisticItemDefinition;
    eBatOutDaily:      IStatisticItemDefinition;
    eBatInDaily:       IStatisticItemDefinition;
    capBatPercent:     IStatisticItemDefinition;
    tOutdoor:          IStatisticItemDefinition;
    tHeatSupply:       IStatisticItemDefinition;
    tHeatBuffer:       IStatisticItemDefinition;
    tHeatSupplyReturn: IStatisticItemDefinition;
    tHeatBrineIn:      IStatisticItemDefinition;
    tHeatBrineOut:     IStatisticItemDefinition;
    fHeatCompressor:   IStatisticItemDefinition;

}

export type StatisticAttribute = keyof IStatisticDefinition;
export type Languages = 'en' | 'de';
export type ValueType = 'value' | 'avg' | 'min' | 'max' | 'twa' | 'ewa';
export type StatisticsType = 'second' | 'minute' | 'min10' | 'hour' | 'day' | 'month' | 'week' | 'year' | 'total';

export interface IStatisticsFormat {
    format?: string;
    unit?: string;
    func?: (value: number) => number;
}

export interface StatisticsOptions {
    format?: IStatisticsFormat;
    ewaTau?: number;
}


export interface IStatisticItemDefinition {
    id:         string;
    shortLabel: string;
    label:      { [ key1 in Languages ]?: string };
    format:     IStatisticsFormat;
    type:       { [ key2 in StatisticsType ]?: { [ key3 in ValueType ]?: boolean | StatisticsOptions }};
}

export class Statistics {

    static defaultEnergyType: { [ key2 in StatisticsType ]: { [ key3 in ValueType ]?: boolean | StatisticsOptions }} = {
        second: { value: { format: { format: '%.02f', unit: 'Wh',  func: (e) => Math.round(e * 10) / 10 } } } ,
        minute: {
            min: { format: { format: '%.02f', unit: 'Wh',  func: (e) => Math.round(e * 10) / 10 } },
            max: { format: { format: '%.02f', unit: 'Wh',  func: (e) => Math.round(e * 10) / 10 } }
        },
        min10: {
            min: { format: { format: '%.02f', unit: 'Wh',  func: (e) => Math.round(e * 10) / 10 } },
            max: { format: { format: '%.02f', unit: 'Wh',  func: (e) => Math.round(e * 10) / 10 } }
        },
        hour: {
            min: { format: { format: '%.02f', unit: 'kWh', func: (e) => Math.round(e / 10) / 100 } },
            max: { format: { format: '%.02f', unit: 'kWh', func: (e) => Math.round(e / 10) / 100 } }
        },
        day: {
            min: { format: { format: '%.02f', unit: 'kWh', func: (e) => Math.round(e / 10) / 100 } },
            max: { format: { format: '%.02f', unit: 'kWh', func: (e) => Math.round(e / 10) / 100 } }
        },
        month: {
            min: { format: { format: '%.01f', unit: 'kWh', func: (e) => Math.round(e / 100) / 10 } },
            max: { format: { format: '%.01f', unit: 'kWh', func: (e) => Math.round(e / 100) / 10 } }
        },
        week: {
            min: { format: { format: '%.01f', unit: 'kWh', func: (e) => Math.round(e / 100) / 10 } },
            max: { format: { format: '%.01f', unit: 'kWh', func: (e) => Math.round(e / 100) / 10 } }
        },
        year: {
            min: { format: { format: '%.0f',  unit: 'kWh', func: (e) => Math.round(e / 1000) } },
            max: { format: { format: '%.0f',  unit: 'kWh', func: (e) => Math.round(e / 1000) } }
        },
        total: {
            min: { format: { format: '%.0f',  unit: 'kWh', func: (e) => Math.round(e / 1000) } },
            max: { format: { format: '%.0f',  unit: 'kWh', func: (e) => Math.round(e / 1000) } }
        }
    };

    // tslint:disable:max-line-length
    static defById: { [ id in StatisticAttribute ]: IStatisticItemDefinition } =  {
        pPv: {
            id: 'pPv',
            shortLabel: 'pv-p',
            label: { en: 'active power from photovoltaik', de: 'Wirkleistung Photovoltaik' },
            format: { format: '%.0f', unit: 'W', func: (v) => Math.round(v) },
            type: {
                second: { value: true },
                minute: { min: true, max: true, twa: true },
                min10:  { min: true, max: true, twa: true },
                hour:   { min: true, max: true, twa: true },
                day:    { min: true, max: true, twa: true },
                month:  { min: true, max: true, twa: true },
                week:   { min: true, max: true, twa: true },
                year:   { min: true, max: true, twa: true }
            }
        },
        pPvS: {
            id: 'pPvS',
            shortLabel: 'pv-s-p',
            label: { en: 'active power from photovoltaik south', de: 'Wirkleistung Photovoltaik Süd' },
            format: { format: '%.0f', unit: 'W', func: (v) => Math.round(v) },
            type: {
                second: { value: true },
                minute: { min: true, max: true, twa: true },
                min10:  { min: true, max: true, twa: true },
                hour:   { min: true, max: true, twa: true },
                day:    { min: true, max: true, twa: true },
                month:  { min: true, max: true, twa: true },
                week:  { min: true, max: true, twa: true },
                year:   { min: true, max: true, twa: true }
            }
        },
        pPvEW: {
            id: 'pPvEW',
            shortLabel: 'pv-ew-p',
            label: { en: 'active power from photovoltaik east/west', de: 'Wirkleistung Photovoltaik Ost/West' },
            format: { format: '%.0f', unit: 'W', func: (v) => Math.round(v) },
            type: {
                second: { value: true },
                minute: { min: true, max: true, twa: true },
                min10:  { min: true, max: true, twa: true },
                hour:   { min: true, max: true, twa: true },
                day:    { min: true, max: true, twa: true },
                month:  { min: true, max: true, twa: true },
                week:   { min: true, max: true, twa: true },
                year:   { min: true, max: true, twa: true }
            }
        },
        pBat: {
            id: 'pBat',
            shortLabel: 'bat-p',
            label: { en: 'active power from battery', de: 'Wirkleistung von Battery (Lieferung P>0)' },
            format: { format: '%.0f', unit: 'W', func: (v) => Math.round(v) },
            type: {
                second: { value: true },
                minute: { min: true, max: true, twa: true },
                min10:  { min: true, max: true, twa: true },
                hour:   { min: true, max: true, twa: true },
                day:    { min: true, max: true, twa: true }
            }
        },
        pGrid: {
            id: 'pGrid',
            shortLabel: 'grid-p',
            label: { en: 'active power on grid', de: 'Netz Wirkleistung (Bezug P>0)' },
            format: { format: '%.0f', unit: 'W', func: (v) => Math.round(v) },
            type: {
                second: { value: true },
                minute: { min: true, max: true, twa: true },
                min10:  { min: true, max: true, twa: true },
                hour:   { min: true, max: true, twa: true },
                day:    { min: true, max: true, twa: true },
                week:   { min: true, max: true, twa: true },
                month:  { min: true, max: true, twa: true },
                year:   { twa: true },
                total:  { twa: true }
            }
        },
        pBoiler: {
            id: 'pBoiler',
            shortLabel: 'boiler-p',
            label: { en: 'active power to boiler', de: 'Boiler Wirkleistung' },
            format: { format: '%.0f', unit: 'W', func: (v) => Math.round(v) },
            type: {
                second: { value: true },
                minute: { min: true, max: true, twa: true },
                min10:  { min: true, max: true, twa: true },
                hour:   { min: true, max: true, twa: true },
                day:    { min: true, max: true, twa: true },
                week:   { min: true, max: true, twa: true },
                month:  { min: true, max: true, twa: true },
                year:   { twa: true },
                total:  { twa: true }
            }
        },
        pLoad: {
            id: 'pLoad',
            shortLabel: 'load-p',
            label: { en: 'active power to loads', de: 'Verbraucher Wirkleistung' },
            format: { format: '%.0f', unit: 'W', func: (v) => Math.round(v) },
            type: {
                second: { value: true },
                minute: { min: true, max: true, twa: true },
                min10:  { min: true, max: true, twa: true },
                hour:   { min: true, max: true, twa: true },
                day:    { min: true, max: true, twa: true },
                week:   { min: true, max: true, twa: true },
                month:  { min: true, max: true, twa: true },
                year:   { twa: true },
                total:  { twa: true }
            }
        },
        pHeatPump: {
            id: 'pHeatPump',
            shortLabel: 'heatPump-p',
            label: { en: 'active power to heat-pump', de: 'Wärmepumpe Wirkleistung' },
            format: { format: '%.0f', unit: 'W', func: (v) => Math.round(v) },
            type: {
                second: { value: true },
                minute: { min: true, max: true, twa: true },
                min10:  { min: true, max: true, twa: true },
                hour:   { min: true, max: true, twa: true },
                day:    { min: true, max: true, twa: true },
                week:   { min: true, max: true, twa: true },
                month:  { min: true, max: true, twa: true },
                year:   { twa: true },
                total:  { twa: true }
            }
        },
        eOut: {
            id: 'eOut',
            shortLabel: 'grid-e-out',
            label: { en: 'active energy to grid', de: 'Wirkenergie Lieferung an Netz' },
            format: { format: '%.0f', unit: 'kWh', func: (v) => Math.round(v / 1000) },
            type: Statistics.defaultEnergyType
        },
        eIn: {
            id: 'eIn',
            shortLabel: 'grid-e-in',
            label: { en: 'active energy from grid', de: 'Wirkenergie Bezug vom Netz' },
            format: { format: '%.0f', unit: 'kWh', func: (v) => Math.round(v / 1000) },
            type: Statistics.defaultEnergyType
        },
        eOutDaily: {
            id: 'eOutDaily',
            shortLabel: 'grid-e-out',
            label: { en: 'active dayily energy to grid', de: 'Wirkenergie Tageslieferung an Netz' },
            format: { format: '%.01f', unit: 'kWh', func: (v) => Math.round(v / 100) / 10 },
            type: Statistics.defaultEnergyType
        },
        eInDaily: {
            id: 'eInDaily',
            shortLabel: 'grid-e-in',
            label: { en: 'active daily energy from grid', de: 'Wirkenergie Tagesbezug vom Netz' },
            format: { format: '%.01f', unit: 'kWh', func: (v) => Math.round(v / 100) / 10 },
            type: Statistics.defaultEnergyType
        },
        eBoilerDaily: {
            id: 'eBoilerDaily',
            shortLabel: 'boiler-e-daily',
            label: { en: 'active daily energy to boiler', de: 'Boiler Wirkenergie Tagesbezug' },
            format: { format: '%.01f', unit: 'kWh', func: (v) => Math.round(v / 100) / 10 },
            type: Statistics.defaultEnergyType
        },
        eHeatPumpDaily: {
            id: 'eHeatPumpDaily',
            shortLabel: 'heatpump-e-daily',
            label: { en: 'active daily energy to heatpump', de: 'Wärmepumpe Wirkenergie Tagesbezug' },
            format: { format: '%.01f', unit: 'kWh', func: (v) => Math.round(v / 100) / 10 },
            type: Statistics.defaultEnergyType
        },
        ePvDaily: {
            id: 'ePvDaily',
            shortLabel: 'pv-e-daily',
            label: { en: 'active daily energy from photovoltaik', de: 'Tages-Wirkenergie von Photovoltaik' },
            format: { format: '%.01f', unit: 'kWh', func: (v) => Math.round(v / 100) / 10 },
            type: Statistics.defaultEnergyType
        },
        ePvSDaily: {
            id: 'ePvSDaily',
            shortLabel: 'pv-s-e-daily',
            label: { en: 'active daily energy from photovoltaik south', de: 'Tages-Wirkenergie von Photovoltaik Süd' },
            format: { format: '%.01f', unit: 'kWh', func: (v) => Math.round(v / 100) / 10 },
            type: Statistics.defaultEnergyType
        },
        ePvEWDaily: {
            id: 'ePvEWDaily',
            shortLabel: 'pv-ew-e-daily',
            label: { en: 'active daily energy from photovoltaik east/west', de: 'Tages-Wirkenergie von Photovoltaik Ost/West' },
            format: { format: '%.01f', unit: 'kWh', func: (v) => Math.round(v / 100) / 10 },
            type: Statistics.defaultEnergyType
        },
        eBatOutDaily: {
            id: 'eBatOutDaily',
            shortLabel: 'bat-out-e-daily',
            label: { en: 'active daily energy from battery', de: 'Tages-Wirkenergie von Batterie' },
            format: { format: '%.02f', unit: 'kWh', func: (v) => Math.round(v / 100) / 10 },
            type: Statistics.defaultEnergyType
        },
        eBatInDaily: {
            id: 'eBatInDaily',
            shortLabel: 'bat-in-e-daily',
            label: { en: 'active daily energy to battery', de: 'Tages-Wirkenergie zur Batterie' },
            format: { format: '%.02f', unit: 'kWh', func: (v) => Math.round(v / 100) / 10 },
            type: Statistics.defaultEnergyType
        },
        capBatPercent: {
            id: 'capBatPercent',
            shortLabel: 'bat-cap-percent',
            label: { en: 'battery load as percent of nominal capacity', de: 'Batterieladezustand in % (von Nominalkapazität)' },
            format: { format: '%.0f', unit: '%', func: (v) => Math.round(v) },
            type: {
                second: { value: true },
                minute: { min: true, twa: true, max: true},
                min10:  { min: true, twa: true, max: true },
                hour:   { min: true, twa: true, max: true },
                day:    { min: true, twa: true, max: true },
            }
        },
        tOutdoor: {
            id: 'tOutdoor',
            shortLabel: 'outdoor-t',
            label: { en: 'outdoor temperature in °C', de: 'Außentemperatur in °C' },
            format: { format: '%.01f', unit: '°C', func: (v) => Math.round(v * 10) / 10 },
            type: {
                second: { value: true },
                minute: { min: true, twa: true, max: true},
                min10:  { min: true, twa: true, max: true },
                hour:   { min: true, twa: true, max: true },
                day:    { min: true, twa: true, max: true },
                week:   { min: true, twa: true, max: true },
                month:  { min: true, twa: true, max: true },
                year:   { min: true, twa: true, max: true },
                total:  { min: true, twa: true, max: true }
            }
        },
        tHeatSupply: {
            id: 'tHeatSupply',
            shortLabel: 'heatpump-temp-supply-fwd',
            label: { en: 'Heatpump supply temperature forward', de: 'Heizung Vorlauf zu Puffer' },
            format: { format: '%.01f', unit: '°C', func: (v) => Math.round(v * 10) / 10 },
            type: {
                second: { value: true },
                minute: { min: true, twa: true, max: true},
                min10:  { min: true, twa: true, max: true },
                hour:   { min: true, twa: true, max: true },
                day:    { min: true, twa: true, max: true },
            }
        },
        tHeatBuffer: {
            id: 'tHeatBuffer',
            shortLabel: 'heatpump-temp-buffer',
            label: { en: 'Heatpump buffer temperature', de: 'Heizung Puffer Temperatur' },
            format: { format: '%.01f', unit: '°C', func: (v) => Math.round(v * 10) / 10 },
            type: {
                second: { value: true },
                minute: { min: true, twa: true, max: true},
                min10:  { min: true, twa: true, max: true },
                hour:   { min: true, twa: true, max: true },
                day:    { min: true, twa: true, max: true },
            }
        },
        tHeatSupplyReturn: {
            id: 'tHeatSupplyReturn',
            shortLabel: 'heatpump-temp-supply return',
            label: { en: 'Heatpump supply temperature return', de: 'Heizung Rücklauf zu Puffer' },
            format: { format: '%.01f', unit: '°C', func: (v) => Math.round(v * 10) / 10 },
            type: {
                second: { value: true },
                minute: { min: true, twa: true, max: true},
                min10:  { min: true, twa: true, max: true },
                hour:   { min: true, twa: true, max: true },
                day:    { min: true, twa: true, max: true }
            }
        },
        tHeatBrineIn: {
            id: 'tHeatBrineIn',
            shortLabel: 'heatpump-brine-in',
            label: { en: 'Heatpump brine in temperature', de: 'Heizung Sole (von Erde) Temperatur' },
            format: { format: '%.01f', unit: '°C', func: (v) => Math.round(v * 10) / 10 },
            type: {
                second: { value: true },
                minute: { min: true, twa: true, max: true},
                min10:  { min: true, twa: true, max: true },
                hour:   { min: true, twa: true, max: true },
                day:    { min: true, twa: true, max: true },
                week:   { min: true, twa: true, max: true },
                month:  { min: true, twa: true, max: true }
            }
        },
        tHeatBrineOut: {
            id: 'tHeatBrineOut',
            shortLabel: 'heatpump-brine-out',
            label: { en: 'Heatpump brine out temperature', de: 'Heizung Sole (zu Erde) Temperatur' },
            format: { format: '%.01f', unit: '°C', func: (v) => Math.round(v * 10) / 10 },
            type: {
                second: { value: true },
                minute: { min: true, twa: true, max: true},
                min10:  { min: true, twa: true, max: true },
                hour:   { min: true, twa: true, max: true },
                day:    { min: true, twa: true, max: true },
                week:   { min: true, twa: true, max: true },
                month:  { min: true, twa: true, max: true }
            }
        },
        fHeatCompressor: {
            id: 'fHeatCompressor',
            shortLabel: 'heatpump-compressor-frequency',
            label: { en: 'Heatpump frequency compressor', de: 'Heizung Kompressorfrequenz' },
            format: { format: '%.01f', unit: '°C', func: (v) => Math.round(v * 10) / 10 },
            type: {
                second: { value: true },
                minute: { min: true, twa: true, max: true},
                min10:  { min: true, twa: true, max: true },
                hour:   { min: true, twa: true, max: true },
                day:    { min: true, twa: true, max: true },
                week:   { min: true, twa: true, max: true },
                month:  { min: true, twa: true, max: true },
                year:   { twa: true }
            }
        }
    };
    // tslint:enable:max-line-length

    public static toStatisticsType (type: string): StatisticsType {
        for (const t of Object.getOwnPropertyNames(Statistics.defaultEnergyType)) {
            if (type === t) {
                return <StatisticsType>t;
            }
        }
        throw new Error('invalid value');
    }

    public static toStatisticAttribute (attribute: string): StatisticAttribute {
        for (const a of Object.getOwnPropertyNames(Statistics.defById)) {
            if (attribute === a) {
                return <StatisticAttribute>a;
            }
        }
        throw new Error('invalid value');
    }


}
