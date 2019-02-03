
export interface IStatisticDefinition {
    pGrid:  IStatisticItemDefinition;
    eOut:   IStatisticItemDefinition;
    eIn:    IStatisticItemDefinition;
}

export type StatisticAttribute = keyof IStatisticDefinition;
export type Languages = 'en' | 'de';
export type ValueType = 'value' | 'avg' | 'min' | 'max' | 'twa' | 'ewa';
export type StatisticsType = 'second' | 'minute' | 'hour' | 'day' | 'month' | 'year' | 'total';

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

    // tslint:disable:max-line-length
    static defById: { [ id in StatisticAttribute ]: IStatisticItemDefinition } =  {
        pGrid: {
            id: 'pGrid',
            shortLabel: 'grid-p',
            label: { en: 'active power on grid', de: 'Netz Wirkleistung (Bezug P>0)' },
            format: { format: '%.0f', unit: 'W', func: (v) => Math.round(v) },
            type: {
                second: { value: true },
                minute: { min: true, avg: true, max: true},
                hour:   { min: true, max: true },
                day:    { min: true, max: true },
                month:  { min: true, max: true },
                year:   { min: true, max: true }
            }
        },
        eOut: {
            id: 'eOut',
            shortLabel: 'grid-e-out',
            label: { en: 'active energy to grid', de: 'Wirkenergie Lieferung an Netz' },
            type: {
                second: { value: { format: { format: '%.02f', unit: 'Wh',  func: (e) => Math.round(e * 10) / 10 } } } ,
                minute: { max:   { format: { format: '%.02f', unit: 'Wh',  func: (e) => Math.round(e * 10) / 10 } } },
                hour:   { max:   { format: { format: '%.02f', unit: 'kWh', func: (e) => Math.round(e / 10) / 100 } } },
                day:    { max:   { format: { format: '%.02f', unit: 'kWh', func: (e) => Math.round(e / 10) / 100 } } },
                month:  { max:   { format: { format: '%.01f', unit: 'kWh', func: (e) => Math.round(e / 100) / 10 } } },
                year:   { max:   { format: { format: '%.0f',  unit: 'kWh', func: (e) => Math.round(e / 1000) } } },
                total:  { max:   { format: { format: '%.0f',  unit: 'kWh', func: (e) => Math.round(e / 1000) } } }
            }
        },
        eIn: {
            id: 'eIn',
            shortLabel: 'grid-e-in',
            label: { en: 'active energy from grid', de: 'Wirkenergie Bezug vom Netz' },
            type: {
                second: { value: { format: { format: '%.02f', unit: 'Wh',  func: (e) => Math.round(e * 10) / 10 } } } ,
                minute: { max:   { format: { format: '%.02f', unit: 'Wh',  func: (e) => Math.round(e * 10) / 10 } } },
                hour:   { max:   { format: { format: '%.02f', unit: 'kWh', func: (e) => Math.round(e / 10) / 100 } } },
                day:    { max:   { format: { format: '%.02f', unit: 'kWh', func: (e) => Math.round(e / 10) / 100 } } },
                month:  { max:   { format: { format: '%.01f', unit: 'kWh', func: (e) => Math.round(e / 100) / 10 } } },
                year:   { max:   { format: { format: '%.0f',  unit: 'kWh', func: (e) => Math.round(e / 1000) } } },
                total:  { max:   { format: { format: '%.0f',  unit: 'kWh', func: (e) => Math.round(e / 1000) } } }
            }
        }


    };
    // tslint:enable:max-line-length

}
