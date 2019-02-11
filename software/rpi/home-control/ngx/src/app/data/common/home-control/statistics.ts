
export interface IStatisticDefinition {
    pPv:               IStatisticItemDefinition;
    pPvS:              IStatisticItemDefinition;
    pPvEW:             IStatisticItemDefinition;
    pBat:              IStatisticItemDefinition;
    pGrid:             IStatisticItemDefinition;
    pBoiler:           IStatisticItemDefinition;
    pHeatPump:         IStatisticItemDefinition;
    eOut:              IStatisticItemDefinition;
    eIn:               IStatisticItemDefinition;
    eOutDaily:         IStatisticItemDefinition;
    eInDaily:          IStatisticItemDefinition;
    eBoilerDaily:      IStatisticItemDefinition;
    eHeatPumpDaily:    IStatisticItemDefinition;
    ePvDaily:          IStatisticItemDefinition;
    ePvSDaily:         IStatisticItemDefinition;
    ePvEWDaily:        IStatisticItemDefinition;
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
export type StatisticsType = 'second' | 'minute' | 'hour' | 'day' | 'month' | 'week' | 'year' | 'total';

export interface StatisticsFormat {
    format?: string;
    unit?: string;
    func?: (value: number) => number;
}

export interface StatisticsOptions {
    format?: StatisticsFormat;
    ewaTau?: number;
}


export interface IStatisticItemDefinition {
    id:         string;
    shortLabel: string;
    label:      { [ key1 in Languages ]?: string };
    format?:    StatisticsFormat;
    type:       { [ key2 in StatisticsType ]?: { [ key3 in ValueType ]?: boolean | StatisticsOptions }};
}

export class Statistics {

    static defaultEnergyType: { [ key2 in StatisticsType ]?: { [ key3 in ValueType ]?: boolean | StatisticsOptions }} = {
        second: { value: { format: { format: '%.02f', unit: 'Wh',  func: (e) => Math.round(e * 10) / 10 } } } ,
        minute: { max:   { format: { format: '%.02f', unit: 'Wh',  func: (e) => Math.round(e * 10) / 10 } } },
        hour:   { max:   { format: { format: '%.02f', unit: 'kWh', func: (e) => Math.round(e / 10) / 100 } } },
        day:    { max:   { format: { format: '%.02f', unit: 'kWh', func: (e) => Math.round(e / 10) / 100 } } },
        month:  { max:   { format: { format: '%.01f', unit: 'kWh', func: (e) => Math.round(e / 100) / 10 } } },
        week:   { max:   { format: { format: '%.01f', unit: 'kWh', func: (e) => Math.round(e / 100) / 10 } } },
        year:   { max:   { format: { format: '%.0f',  unit: 'kWh', func: (e) => Math.round(e / 1000) } } },
        total:  { max:   { format: { format: '%.0f',  unit: 'kWh', func: (e) => Math.round(e / 1000) } } }
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
            type: Statistics.defaultEnergyType
        },
        eIn: {
            id: 'eIn',
            shortLabel: 'grid-e-in',
            label: { en: 'active energy from grid', de: 'Wirkenergie Bezug vom Netz' },
            type: Statistics.defaultEnergyType
        },
        eOutDaily: {
            id: 'eOutDaily',
            shortLabel: 'grid-e-out',
            label: { en: 'active dayily energy to grid', de: 'Wirkenergie Tageslieferung an Netz' },
            type: Statistics.defaultEnergyType
        },
        eInDaily: {
            id: 'eInDaily',
            shortLabel: 'grid-e-in',
            label: { en: 'active daily energy from grid', de: 'Wirkenergie Tagesbezug vom Netz' },
            type: Statistics.defaultEnergyType
        },
        eBoilerDaily: {
            id: 'eBoilerDaily',
            shortLabel: 'boiler-e-daily',
            label: { en: 'active daily energy to boiler', de: 'Boiler Wirkenergie Tagesbezug' },
            type: Statistics.defaultEnergyType
        },
        eHeatPumpDaily: {
            id: 'eHeatPumpDaily',
            shortLabel: 'heatpump-e-daily',
            label: { en: 'active daily energy to heatpump', de: 'Wärmepumpe Wirkenergie Tagesbezug' },
            type: Statistics.defaultEnergyType
        },
        ePvDaily: {
            id: 'ePvDaily',
            shortLabel: 'pv-e-daily',
            label: { en: 'active daily energy from photovoltaik', de: 'Tages-Wirkenergie von Photovoltaik' },
            type: Statistics.defaultEnergyType
        },
        ePvSDaily: {
            id: 'ePvSDaily',
            shortLabel: 'pv-s-e-daily',
            label: { en: 'active daily energy from photovoltaik south', de: 'Tages-Wirkenergie von Photovoltaik Süd' },
            type: Statistics.defaultEnergyType
        },
        ePvEWDaily: {
            id: 'ePvEWDaily',
            shortLabel: 'pv-ew-e-daily',
            label: { en: 'active daily energy from photovoltaik east/west', de: 'Tages-Wirkenergie von Photovoltaik Ost/West' },
            type: Statistics.defaultEnergyType
        },
        capBatPercent: {
            id: 'capBatPercent',
            shortLabel: 'bat-cap-percent',
            label: { en: 'battery load as percent of nominal capacity', de: 'Batterieladezustand in % (von Nominalkapazität)' },
            type: {
                second: { value: true },
                minute: { min: true, twa: true, max: true},
                hour:   { min: true, twa: true, max: true },
                day:    { min: true, twa: true, max: true },
            }
        },
        tOutdoor: {
            id: 'tOutdoor',
            shortLabel: 'outdoor-t',
            label: { en: 'outdoor temperature in °C', de: 'Außentemperatur in °C' },
            type: {
                second: { value: true },
                minute: { min: true, twa: true, max: true},
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
            type: {
                second: { value: true },
                minute: { min: true, twa: true, max: true},
                hour:   { min: true, twa: true, max: true },
                day:    { min: true, twa: true, max: true },
            }
        },
        tHeatBuffer: {
            id: 'tHeatBuffer',
            shortLabel: 'heatpump-temp-buffer',
            label: { en: 'Heatpump buffer temperature', de: 'Heizung Puffer Temperatur' },
            type: {
                second: { value: true },
                minute: { min: true, twa: true, max: true},
                hour:   { min: true, twa: true, max: true },
                day:    { min: true, twa: true, max: true },
            }
        },
        tHeatSupplyReturn: {
            id: 'tHeatSupplyReturn',
            shortLabel: 'heatpump-temp-supply return',
            label: { en: 'Heatpump supply temperature return', de: 'Heizung Rücklauf zu Puffer' },
            type: {
                second: { value: true },
                minute: { min: true, twa: true, max: true},
                hour:   { min: true, twa: true, max: true },
                day:    { min: true, twa: true, max: true }
            }
        },
        tHeatBrineIn: {
            id: 'tHeatBrineIn',
            shortLabel: 'heatpump-brine-in',
            label: { en: 'Heatpump brine in temperature', de: 'Heizung Sole (von Erde) Temperatur' },
            type: {
                second: { value: true },
                minute: { min: true, twa: true, max: true},
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
            type: {
                second: { value: true },
                minute: { min: true, twa: true, max: true},
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
            type: {
                second: { value: true },
                minute: { min: true, twa: true, max: true},
                hour:   { min: true, twa: true, max: true },
                day:    { min: true, twa: true, max: true },
                week:   { min: true, twa: true, max: true },
                month:  { min: true, twa: true, max: true },
                year:   { twa: true }
            }
        }
    };
    // tslint:enable:max-line-length

}
