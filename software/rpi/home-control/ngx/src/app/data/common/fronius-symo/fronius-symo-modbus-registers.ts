import { IRegisterDefinition, Type } from '../modbus/register-definition';
import { ModbusNumber } from '../modbus/modbus-number';
import { ModbusString } from '../modbus/modbus-string';


// export interface IFroniusSymoModbusRegisterDefinition {
//     id:           number;
//     label:        string;
//     classname:    'FroniusSymoNumber' | 'FroniusSymoString';
//     type:         'R' | 'R/W';
//     unit:         '' | '°C' | 'h' | 'Wh' | 'W' | 'VA' | 'VAr' | 'A' | 'V' | 'Hz' | '%';
//     size:         'u8' | 's8' | 'u16' | 's16' | 'u32' | 's32' |'u64' | 's64' | 'str16' | 'str32';
//     factor?:      number;
//     scalefactor?: string;
//     format:       string;
//     range?:       { min?: number, max?: number, values?: number [] };
//     description:  string;
//     help:         string;

// }

export type FroniusSymoModbusIds =

    // Fronius Register Model
    212 | 213 | 214 | 215 | 216 | 500 | 502 | 506 | 510 |

    // Common Block Register
    40001 | 40003 | 40004 | 40005 | 40021 | 40037 | 40045 | 40053 | 40069 |

    // Inverter Model: int+SF
    40070 | 40071 | 40072 | 40073 | 40074 | 40075 | 40076 | 40077 | 40078 | 40079 |
    40080 | 40081 | 40082 | 40083 | 40084 | 40085 | 40086 | 40087 | 40088 | 40089 |
    40090 | 40091 | 40092 | 40093 | 40094 |         40096 | 40097 | 40098 | 40099 |
    40100 | 40101 | 40102 | 40103 | 40104 | 40105 | 40106 | 40107 | 40108 | 40109 |
    40110 |         40112 |         40114 |         40116 |         40118 |
    40120 |

    // Nameplate Model: int+SF
    40122 | 40123 | 40124 | 40125 | 40126 |

    // Settings Model: int+SF
    40150 | 40151 | 40152 | 40153 |

    // Extended Measurment and Status Model: int+SF
    40182 | 40183 | 40184 |

    // Immediate Controls Model: int+SF
    40228 | 40229 | 40230 |

    // Basic Storage Control Model: int+SF
    40304 | 40305 | 40306 |

    // Multiple MPPT Inverter Extension Model: int+SF
    40254 | 40255 | 40256

    ;

export interface IFroniusRegisterDefinition {
    f_delete_data:           IRegisterDefinition;
    f_store_data:            IRegisterDefinition;
    f_active_state_code:     IRegisterDefinition;
    f_reset_all_event_flags: IRegisterDefinition;
    f_model_type:            IRegisterDefinition;
    f_site_power:            IRegisterDefinition;
    f_site_energy_day:       IRegisterDefinition;
    f_site_energy_year:      IRegisterDefinition;
    f_site_energy_total:     IRegisterDefinition;
}

export interface ICommonDefinition {
    sid: IRegisterDefinition;
    id:  IRegisterDefinition;
    l:   IRegisterDefinition;
    mn:  IRegisterDefinition;
    md:  IRegisterDefinition;
    opt: IRegisterDefinition;
    vr:  IRegisterDefinition;
    sn:  IRegisterDefinition;
    da:  IRegisterDefinition;
}

export interface IInverterDefinition {
    id:      IRegisterDefinition;
    l:       IRegisterDefinition;
    a:       IRegisterDefinition;
    apha:    IRegisterDefinition;
    aphb:    IRegisterDefinition;
    aphc:    IRegisterDefinition;
    a_sf:    IRegisterDefinition;
    ppvphab: IRegisterDefinition;
    ppvphbc: IRegisterDefinition;
    ppvphca: IRegisterDefinition;
    phvpha:  IRegisterDefinition;
    phvphb:  IRegisterDefinition;
    phvphc:  IRegisterDefinition;
    v_sf:    IRegisterDefinition;
    w:       IRegisterDefinition;
    w_sf:    IRegisterDefinition;
    hz:      IRegisterDefinition;
    hz_sf:   IRegisterDefinition;
    va:      IRegisterDefinition;
    va_sf:   IRegisterDefinition;
    var:     IRegisterDefinition;
    var_sf:  IRegisterDefinition;
    pf:      IRegisterDefinition;
    pf_sf:   IRegisterDefinition;
    wh:      IRegisterDefinition;
    wh_sf:   IRegisterDefinition;
    dca:     IRegisterDefinition;
    dca_sf:  IRegisterDefinition;
    dcv:     IRegisterDefinition;
    dcv_sf:  IRegisterDefinition;
    dcw:     IRegisterDefinition;
    dcw_sf:  IRegisterDefinition;
    tmpcab:  IRegisterDefinition;
    tmpsnk:  IRegisterDefinition;
    tmptms:  IRegisterDefinition;
    tmpot:   IRegisterDefinition;
    tmp_sf:  IRegisterDefinition;
    st:      IRegisterDefinition;
    stvnd:   IRegisterDefinition;
    evt1:    IRegisterDefinition;
    evt2:    IRegisterDefinition;
    evtvnd1: IRegisterDefinition;
    evtvnf2: IRegisterDefinition;
    evtvnd3: IRegisterDefinition;
    evtvnd4: IRegisterDefinition;
}

export interface INameplateDefinition {
    id:      IRegisterDefinition;
    l:       IRegisterDefinition;
    dertyp:  IRegisterDefinition;
    wrtg:    IRegisterDefinition;
    wrtg_sf: IRegisterDefinition;
}

export interface ISettingsDefinition {
    id:      IRegisterDefinition;
    l:       IRegisterDefinition;
    wmax:    IRegisterDefinition;
    vref:    IRegisterDefinition;
}

export interface IStatusDefinition {
    id:      IRegisterDefinition;
    l:       IRegisterDefinition;
    pvConn:  IRegisterDefinition;
}

export interface IControlDefinition {
    id:          IRegisterDefinition;
    l:           IRegisterDefinition;
    conn_wintms: IRegisterDefinition;
}

export interface IStorageDefinition {
    id:      IRegisterDefinition;
    l:       IRegisterDefinition;
    wchamax: IRegisterDefinition;
}

export interface IInverterExtensionDefinition {
    id:     IRegisterDefinition;
    l:      IRegisterDefinition;
    dca_sf: IRegisterDefinition;
}


export type FroniusRegisterAttributes = keyof IFroniusRegisterDefinition;
export type CommonAttributes = keyof ICommonDefinition;
export type InverterAttributes = keyof IInverterDefinition;
export type NameplateAttributes = keyof INameplateDefinition;
export type SettingsAttributes = keyof ISettingsDefinition;
export type StatusAttributes = keyof IStatusDefinition;
export type ControlAttributes = keyof IControlDefinition;
export type StorageAttributes = keyof IStorageDefinition;
export type InverterExtensionAttributes = keyof IInverterExtensionDefinition;

export class FroniusSymoModbusRegisters {

    // tslint:disable:max-line-length
    static regDefById: { [ id in FroniusSymoModbusIds ]: IRegisterDefinition } =  {

        // Fronius Register Model
        212: { uid: '212', label: 'f_delete_data',           class: ModbusNumber, id: 212,                         code: 'u16', access: 'R/W', format: '%d', description: 'Delete stored data of the current inverter by writing 0xFFFF' },
        213: { uid: '213', label: 'f_store_data',            class: ModbusNumber, id: 213,                         code: 'u16', access: 'R/W', format: '%d', description: 'Rating data of all inverters connectetd to the Fronius Datamanager are persistently stored by writing 0xFFFF' },
        214: { uid: '214', label: 'f_active_state_code',     class: ModbusNumber, id: 214,                         code: 'u16', access: 'R/W', format: '%d', description: 'Current active state code of inverter - Description can be found in inverter manual' },
        215: { uid: '215', label: 'f_reset_all_event_flags', class: ModbusNumber, id: 215,                         code: 'u16', access: 'R/W', format: '%d', description: 'Write 0xFFFF to reset all 0xFFFF event flags and active state code' },
        216: { uid: '216', label: 'f_model_type',            class: ModbusNumber, id: 216,                         code: 'u16', access: 'R/W', format: '%d', description: 'Model type', range: { values: [ 1, 2, 6 ] } },
        500: { uid: '500', label: 'f_site_power',            class: ModbusNumber, id: [{ first: 500, last: 501 }], code: 'u32', access: 'R',   format: '%d', description: 'Site power', unit: 'W' },
        502: { uid: '502', label: 'f_site_energy_day',       class: ModbusNumber, id: [{ first: 502, last: 505 }], code: 'u64', access: 'R',   format: '%d', description: 'Site energy day', unit: 'Wh' },
        506: { uid: '506', label: 'f_site_energy_year',      class: ModbusNumber, id: [{ first: 506, last: 509 }], code: 'u64', access: 'R',   format: '%d', description: 'Site energy year', unit: 'Wh' },
        510: { uid: '510', label: 'f_site_energy_total',     class: ModbusNumber, id: [{ first: 510, last: 513 }], code: 'u64', access: 'R',   format: '%d', description: 'Site energy total', unit: 'Wh' },

        // Common Model
        40001: { uid: '40001', label: 'sid', class: ModbusNumber, id: [{ first: 40001, last: 40002 }], code: 'u32',    access: 'R', format: '%d', description: 'Well-known value. Uniquely identifies this as a SunSpec Modbus Map', range: { values: [ 0x53756e53 ] } },
        40003: { uid: '40003', label: 'id',  class: ModbusNumber, id: 40003,                           code: 'u16',    access: 'R', format: '%d', description: 'Well-known value. Uniquely identifies this as a SunSpec Common Model block', range: { values: [ 1 ] } },
        40004: { uid: '40004', label: 'l',   class: ModbusNumber, id: 40004,                           code: 'u16',    access: 'R', format: '%s', description: 'Length of Common Model block', range: { values: [ 65 ] } },
        40005: { uid: '40005', label: 'mn',  class: ModbusString, id: [{ first: 40005, last: 40020 }], code: 'string', access: 'R', format: '%s', description: 'Manufacturer' },
        40021: { uid: '40021', label: 'md',  class: ModbusString, id: [{ first: 40021, last: 40036 }], code: 'string', access: 'R', format: '%s', description: 'Device model' },
        40037: { uid: '40037', label: 'opt', class: ModbusString, id: [{ first: 40037, last: 40044 }], code: 'string', access: 'R', format: '%s', description: 'SW version of datamanager' },
        40045: { uid: '40045', label: 'vr',  class: ModbusString, id: [{ first: 40045, last: 40052 }], code: 'string', access: 'R', format: '%s', description: 'SW version of inverter' },
        40053: { uid: '40053', label: 'sn',  class: ModbusString, id: [{ first: 40053, last: 40068 }], code: 'string', access: 'R', format: '%s', description: 'Serialnumber of inverter, string control or energy meter' },
        40069: { uid: '40069', label: 'da',  class: ModbusNumber, id: 40069,                           code: 'u16',    access: 'R', format: '%d', description: 'Modbus device address', range: { min: 1, max: 247 } },

        // Inverter Model
        40070: { uid: '40070', label: 'id',      class: ModbusNumber, id: 40070,                           code: 'u16', access: 'R', format: '%d',                                               range: { values: [ 101, 102, 103 ]}, description: 'Uniquely identifies this as a SunSpec Inverter Modbus Map; 101 (single phase), 102 (split phase), 103 (three phase)' },
        40071: { uid: '40071', label: 'l',       class: ModbusNumber, id: 40071,                           code: 'u16', access: 'R', format: '%d',                                               range: { values: [ 50 ] },           description: 'Length of inverter model block' },
        40072: { uid: '40072', label: 'a',       class: ModbusNumber, id: 40072,                           code: 'u16', access: 'R', format: '%f', type: { int: { scale: '40076' }}, unit: 'A',                                       description: 'AC Total Current value' },
        40073: { uid: '40073', label: 'apha',    class: ModbusNumber, id: 40073,                           code: 'u16', access: 'R', format: '%f', type: { int: { scale: '40076' }}, unit: 'A',                                       description: 'AC Phase-A Current value' },
        40074: { uid: '40074', label: 'aphb',    class: ModbusNumber, id: 40074,                           code: 'u16', access: 'R', format: '%f', type: { int: { scale: '40076' }}, unit: 'A',                                       description: 'AC Phase-B Current value' },
        40075: { uid: '40075', label: 'aphc',    class: ModbusNumber, id: 40075,                           code: 'u16', access: 'R', format: '%f', type: { int: { scale: '40076' }}, unit: 'A',                                       description: 'AC Phase-C Current value' },
        40076: { uid: '40076', label: 'a_sf',    class: ModbusNumber, id: 40076,                           code: 's16', access: 'R', format: '%f',                                                                                    description: 'AC Current scale factor' },
        40077: { uid: '40077', label: 'ppvphab', class: ModbusNumber, id: 40077,                           code: 'u16', access: 'R', format: '%f', type: { int: { scale: '40083' }}, unit: 'V',                                       description: 'AC Voltage Phase-AB value' },
        40078: { uid: '40078', label: 'ppvphbc', class: ModbusNumber, id: 40078,                           code: 'u16', access: 'R', format: '%f', type: { int: { scale: '40083' }}, unit: 'V',                                       description: 'AC Voltage Phase-BC value' },
        40079: { uid: '40079', label: 'ppvphca', class: ModbusNumber, id: 40079,                           code: 'u16', access: 'R', format: '%f', type: { int: { scale: '40083' }}, unit: 'V',                                       description: 'AC Voltage Phase-CA value' },
        40080: { uid: '40080', label: 'phvpha',  class: ModbusNumber, id: 40080,                           code: 'u16', access: 'R', format: '%f', type: { int: { scale: '40083' }}, unit: 'V',                                       description: 'AC Voltage Phase-A-to-neutral value' },
        40081: { uid: '40081', label: 'phvphb',  class: ModbusNumber, id: 40081,                           code: 'u16', access: 'R', format: '%f', type: { int: { scale: '40083' }}, unit: 'V',                                       description: 'AC Voltage Phase-B-to-neutral value' },
        40082: { uid: '40082', label: 'phvphc',  class: ModbusNumber, id: 40082,                           code: 'u16', access: 'R', format: '%f', type: { int: { scale: '40083' }}, unit: 'V',                                       description: 'AC Voltage Phase-C-to-neutral value' },
        40083: { uid: '40083', label: 'v_sf',    class: ModbusNumber, id: 40083,                           code: 's16', access: 'R', format: '%f',                                                                                    description: 'AC Voltage scale factor' },
        40084: { uid: '40084', label: 'w',       class: ModbusNumber, id: 40084,                           code: 's16', access: 'R', format: '%f', type: { int: { scale: '40085' }}, unit: 'W',                                       description: 'AC Power value' },
        40085: { uid: '40085', label: 'w_sf',    class: ModbusNumber, id: 40085,                           code: 's16', access: 'R', format: '%f',                                                                                    description: 'AC Power scale factor' },
        40086: { uid: '40086', label: 'hz',      class: ModbusNumber, id: 40086,                           code: 'u16', access: 'R', format: '%f', type: { int: { scale: '40087' }}, unit: 'Hz',                                      description: 'AC Frequency value' },
        40087: { uid: '40087', label: 'hz_sf',   class: ModbusNumber, id: 40087,                           code: 's16', access: 'R', format: '%f',                                                                                    description: 'AC Frequency scale factor' },
        40088: { uid: '40088', label: 'va',      class: ModbusNumber, id: 40088,                           code: 's16', access: 'R', format: '%f', type: { int: { scale: '40089' }}, unit: 'VA',                                      description: 'Apparent Power' },
        40089: { uid: '40089', label: 'va_sf',   class: ModbusNumber, id: 40089,                           code: 's16', access: 'R', format: '%f',                                                                                    description: 'Apparent Power scale factor' },
        40090: { uid: '40090', label: 'var',     class: ModbusNumber, id: 40090,                           code: 's16', access: 'R', format: '%f', type: { int: { scale: '40091' }}, unit: 'var',                                     description: 'Reactive Power' },
        40091: { uid: '40091', label: 'var_sf',  class: ModbusNumber, id: 40091,                           code: 's16', access: 'R', format: '%f',                                                                                    description: 'Reactive Power scale factor' },
        40092: { uid: '40092', label: 'pf',      class: ModbusNumber, id: 40092,                           code: 's16', access: 'R', format: '%f', type: { int: { scale: '40093' }}, unit: '%',                                       description: 'Power Factor' },
        40093: { uid: '40093', label: 'pf_sf',   class: ModbusNumber, id: 40093,                           code: 's16', access: 'R', format: '%f',                                                                                    description: 'Power Factor scale factor' },
        40094: { uid: '40094', label: 'wh',      class: ModbusNumber, id: [{ first: 40094, last: 40095 }], code: 'u32', access: 'R', format: '%f', type: { int: { scale: '40096' }}, unit: 'Wh',                                      description: 'AC Lifetime Energy production' },
        40096: { uid: '40096', label: 'wh_sf',   class: ModbusNumber, id: 40096,                           code: 's16', access: 'R', format: '%f',                                                                                    description: 'AC Lifetime Energy production scale factor' },
        40097: { uid: '40097', label: 'dca',     class: ModbusNumber, id: 40097,                           code: 'u16', access: 'R', format: '%f', type: { int: { scale: '40098' }}, unit: 'A',                                       description: 'DC Current value' },
        40098: { uid: '40098', label: 'dca_sf',  class: ModbusNumber, id: 40098,                           code: 's16', access: 'R', format: '%f',                                                                                    description: 'DC Current value scale factor' },
        40099: { uid: '40099', label: 'dcv',     class: ModbusNumber, id: 40099,                           code: 'u16', access: 'R', format: '%f', type: { int: { scale: '40100' }}, unit: 'V',                                       description: 'DC Voltage value' },
        40100: { uid: '40100', label: 'dcv_sf',  class: ModbusNumber, id: 40100,                           code: 's16', access: 'R', format: '%f',                                                                                    description: 'DC Voltage value scale factor' },
        40101: { uid: '40101', label: 'dcw',     class: ModbusNumber, id: 40101,                           code: 's16', access: 'R', format: '%f', type: { int: { scale: '40102' }}, unit: 'W',                                       description: 'DC Power value' },
        40102: { uid: '40102', label: 'dcw_sf',  class: ModbusNumber, id: 40102,                           code: 's16', access: 'R', format: '%f',                                                                                    description: 'DC Power value scale factor' },
        40103: { uid: '40103', label: 'tmpcab',  class: ModbusNumber, id: 40103,                           code: 's16', access: 'R', format: '%f', type: { int: { scale: '40107' }}, unit: '°C',                                      description: 'Cabinet Temperature' },
        40104: { uid: '40104', label: 'tmpsnk',  class: ModbusNumber, id: 40104,                           code: 's16', access: 'R', format: '%f', type: { int: { scale: '40107' }}, unit: '°C',                                      description: 'Heat Sink temperature (not supported)' },
        40105: { uid: '40105', label: 'tmptms',  class: ModbusNumber, id: 40105,                           code: 's16', access: 'R', format: '%f', type: { int: { scale: '40107' }}, unit: '°C',                                      description: 'Transformer temperature (not supported)' },
        40106: { uid: '40106', label: 'tmpot',   class: ModbusNumber, id: 40106,                           code: 's16', access: 'R', format: '%f', type: { int: { scale: '40107' }}, unit: '°C',                                      description: 'Other Temperatur (not supported)' },
        40107: { uid: '40107', label: 'tmp_sf',  class: ModbusNumber, id: 40107,                           code: 's16', access: 'R', format: '%f',                                                                                    description: 'Temperature scale factor' },
        40108: { uid: '40108', label: 'st',      class: ModbusNumber, id: 40108,                           code: 'u16', access: 'R', format: '%d',                                                                                    description: 'Operating State'  },
        40109: { uid: '40109', label: 'stvnd',   class: ModbusNumber, id: 40109,                           code: 'u16', access: 'R', format: '%d',                                                                                    description: 'Vendor Defined Operating State' },
        40110: { uid: '40110', label: 'evt1',    class: ModbusNumber, id: [{ first: 40110, last: 40111 }], code: 'u32', access: 'R', format: '%d',                                                                                    description: 'Event Flags (bits 0-31)' },
        40112: { uid: '40112', label: 'evt2',    class: ModbusNumber, id: [{ first: 40112, last: 40113 }], code: 'u32', access: 'R', format: '%d',                                                                                    description: 'Event Flags (bits 32-63)' },
        40114: { uid: '40114', label: 'evtvnd1', class: ModbusNumber, id: [{ first: 40114, last: 40115 }], code: 'u32', access: 'R', format: '%d',                                                                                    description: 'Vendor Defined Event Flags (bits 0-31)' },
        40116: { uid: '40116', label: 'evtvnf2', class: ModbusNumber, id: [{ first: 40116, last: 40117 }], code: 'u32', access: 'R', format: '%d',                                                                                    description: 'Vendor Defined Event Flags (bits 32-63)' },
        40118: { uid: '40118', label: 'evtvnd3', class: ModbusNumber, id: [{ first: 40118, last: 40119 }], code: 'u32', access: 'R', format: '%d',                                                                                    description: 'Vendor Defined Event Flags (bits 64-95)' },
        40120: { uid: '40120', label: 'evtvnd4', class: ModbusNumber, id: [{ first: 40120, last: 40120 }], code: 'u32', access: 'R', format: '%d',                                                                                    description: 'Vendor Defined Event Flags (bits 96-127)' },

        // Nameplate Model: int+SF
        40122: { uid: '40122', label: 'id',      class: ModbusNumber, id: 40122,                           code: 'u16', access: 'R', format: '%d',                                              range: { values: [ 120 ] },           description: 'Fixed value 120 as identifier for a SunSpec Nameplate Model' },
        40123: { uid: '40123', label: 'l',       class: ModbusNumber, id: 40123,                           code: 'u16', access: 'R', format: '%d',                                              range: { values: [ 26 ] },            description: 'Length of Nameplate Model' },
        40124: { uid: '40124', label: 'dertyp',  class: ModbusNumber, id: 40124,                           code: 'u16', access: 'R', format: '%d',                                              range: { values: [ 4 ] },             description: 'Fixed value 4 indicate PV device.' },
        40125: { uid: '40125', label: 'wrtg',    class: ModbusNumber, id: 40125,                           code: 'u16', access: 'R', format: '%d', type: { int: { scale: '40126' }}, unit: 'W',                                       description: 'Continuous power output capability of the inverter.' },
        40126: { uid: '40126', label: 'wrtg_sf', class: ModbusNumber, id: 40126,                           code: 's16', access: 'R', format: '%d',                                                                                    description: 'Power output scale factor' },

        // Settings Model
        40150: { uid: '40150', label: 'id',      class: ModbusNumber, id: 40150,                              code: 'u16', access: 'R', format: '%d',                                           range: { values: [ 121 ] },           description: 'Fixed value 121 as identifier for a SunSpec Nameplate Model' },
        40151: { uid: '40151', label: 'l',       class: ModbusNumber, id: 40151,                              code: 'u16', access: 'R', format: '%d',                                           range: { values: [ 30 ] },            description: 'Length of Settings Model' },
        40152: { uid: '40152', label: 'wmax',    class: ModbusNumber, id: 40152,                              code: 'u16', access: 'R', format: '%d',                                                                                 description: 'Setting for maximum power output. Default to wrtg.' },
        40153: { uid: '40153', label: 'vref',    class: ModbusNumber, id: 40153,                              code: 's16', access: 'R', format: '%d',                                                                                 description: 'Voltage at the PCC.' },

        // Extended Measurment and Status Model: int+SF
        40182: { uid: '40182', label: 'id',     class: ModbusNumber, id: 40182,                              code: 'u16', access: 'R', format: '%d',                                              range: { values: [ 122 ] },           description: 'Fixed value 122 as identifier for a SunSpec Measurements_Status Model' },
        40183: { uid: '40183', label: 'l',      class: ModbusNumber, id: 40183,                              code: 'u16', access: 'R', format: '%d',                                              range: { values: [ 44 ] },            description: 'Length of Status Model' },
        40184: { uid: '40184', label: 'pvConn', class: ModbusNumber, id: 40184,                              code: 'u16', access: 'R', format: '%d',                                                                                    description: 'PV inverter present/available status' },

        // Immediate Controls Model: int+SF
        40228: { uid: '40228', label: 'id',          class: ModbusNumber, id: 40228,                         code: 'u16', access: 'R', format: '%d',                                              range: { values: [ 123 ] },           description: 'Fixed value 123 as identifier for a SunSpec Immediate Controls Model' },
        40229: { uid: '40229', label: 'l',           class: ModbusNumber, id: 40229,                         code: 'u16', access: 'R', format: '%d',                                              range: { values: [ 24 ] },            description: 'Length of Immediate Controls Model' },
        40230: { uid: '40230', label: 'conn_wintms', class: ModbusNumber, id: 40230,                         code: 'u16', access: 'R', format: '%d',                                                                                    description: 'Time window for connect/disconnect.' },

        // Basic Storage Control Model: int+SF
        40304: { uid: '40304', label: 'id',      class: ModbusNumber, id: 40304,                              code: 'u16', access: 'R', format: '%d',                                             range: { values: [ 124 ] },           description: 'Fixed value 124 as identifier for a SunSpec Storage Controls' },
        40305: { uid: '40305', label: 'l',       class: ModbusNumber, id: 40305,                              code: 'u16', access: 'R', format: '%d',                                             range: { values: [ 24 ] },            description: 'Length of Storage Controls Model' },
        40306: { uid: '40306', label: 'wchamax', class: ModbusNumber, id: 40306,                              code: 'u16', access: 'R', format: '%d',                                                                                    description: 'Setpoint for maximum charge' },

        // Multiple MPPT Inverter Extension Model: int+SF
        40254: { uid: '40254', label: 'id',     class: ModbusNumber, id: 40254,                              code: 'u16', access: 'R', format: '%d',                                              range: { values: [ 160 ] },           description: 'Fixed value 160 as identifier for a SunSpec Inverter Extendsion Model' },
        40255: { uid: '40255', label: 'l',      class: ModbusNumber, id: 40255,                              code: 'u16', access: 'R', format: '%d',                                              range: { values: [ 48 ] },            description: 'Length of Inverter Extendsion Model' },
        40256: { uid: '40256', label: 'dca_sf', class: ModbusNumber, id: 40256,                              code: 's16', access: 'R', format: '%d',                                                                                    description: 'Current Scale Factor' },

    };

    static regDefByUid = FroniusSymoModbusRegisters.regDefById;

    static regDefByLabel: {
        register:          { [ id1 in FroniusRegisterAttributes ]:   IRegisterDefinition },
        common:            { [ id2 in CommonAttributes ]:            IRegisterDefinition },
        inverter:          { [ id3 in InverterAttributes ]:          IRegisterDefinition },
        nameplate:         { [ id3 in NameplateAttributes ]:         IRegisterDefinition },
        settings:          { [ id4 in SettingsAttributes ]:          IRegisterDefinition },
        status:            { [ id5 in StatusAttributes ]:            IRegisterDefinition },
        control:           { [ id6 in ControlAttributes ]:           IRegisterDefinition },
        storage:           { [ id7 in StorageAttributes ]:           IRegisterDefinition },
        inverterExtension: { [ id8 in InverterExtensionAttributes ]: IRegisterDefinition },
    } = {
        register: {
            f_delete_data:           FroniusSymoModbusRegisters.regDefById[212],
            f_store_data:            FroniusSymoModbusRegisters.regDefById[213],
            f_active_state_code:     FroniusSymoModbusRegisters.regDefById[214],
            f_reset_all_event_flags: FroniusSymoModbusRegisters.regDefById[215],
            f_model_type:            FroniusSymoModbusRegisters.regDefById[216],
            f_site_power:            FroniusSymoModbusRegisters.regDefById[500],
            f_site_energy_day:       FroniusSymoModbusRegisters.regDefById[502],
            f_site_energy_year:      FroniusSymoModbusRegisters.regDefById[506],
            f_site_energy_total:     FroniusSymoModbusRegisters.regDefById[510]
        },
        common: {
            sid: FroniusSymoModbusRegisters.regDefById[40001],
            id:  FroniusSymoModbusRegisters.regDefById[40003],
            l:   FroniusSymoModbusRegisters.regDefById[40004],
            mn:  FroniusSymoModbusRegisters.regDefById[40005],
            md:  FroniusSymoModbusRegisters.regDefById[40021],
            opt: FroniusSymoModbusRegisters.regDefById[40037],
            vr:  FroniusSymoModbusRegisters.regDefById[40045],
            sn:  FroniusSymoModbusRegisters.regDefById[40053],
            da:  FroniusSymoModbusRegisters.regDefById[40069]
        },
        inverter: {
            id:      FroniusSymoModbusRegisters.regDefById[40070],
            l:       FroniusSymoModbusRegisters.regDefById[40071],
            a:       FroniusSymoModbusRegisters.regDefById[40072],
            apha:    FroniusSymoModbusRegisters.regDefById[40073],
            aphb:    FroniusSymoModbusRegisters.regDefById[40074],
            aphc:    FroniusSymoModbusRegisters.regDefById[40075],
            a_sf:    FroniusSymoModbusRegisters.regDefById[40076],
            ppvphab: FroniusSymoModbusRegisters.regDefById[40077],
            ppvphbc: FroniusSymoModbusRegisters.regDefById[40078],
            ppvphca: FroniusSymoModbusRegisters.regDefById[40079],
            phvpha:  FroniusSymoModbusRegisters.regDefById[40080],
            phvphb:  FroniusSymoModbusRegisters.regDefById[40081],
            phvphc:  FroniusSymoModbusRegisters.regDefById[40082],
            v_sf:    FroniusSymoModbusRegisters.regDefById[40083],
            w:       FroniusSymoModbusRegisters.regDefById[40084],
            w_sf:    FroniusSymoModbusRegisters.regDefById[40085],
            hz:      FroniusSymoModbusRegisters.regDefById[40086],
            hz_sf:   FroniusSymoModbusRegisters.regDefById[40087],
            va:      FroniusSymoModbusRegisters.regDefById[40088],
            va_sf:   FroniusSymoModbusRegisters.regDefById[40089],
            var:     FroniusSymoModbusRegisters.regDefById[40090],
            var_sf:  FroniusSymoModbusRegisters.regDefById[40091],
            pf:      FroniusSymoModbusRegisters.regDefById[40092],
            pf_sf:   FroniusSymoModbusRegisters.regDefById[40093],
            wh:      FroniusSymoModbusRegisters.regDefById[40094],
            wh_sf:   FroniusSymoModbusRegisters.regDefById[40096],
            dca:     FroniusSymoModbusRegisters.regDefById[40097],
            dca_sf:  FroniusSymoModbusRegisters.regDefById[40098],
            dcv:     FroniusSymoModbusRegisters.regDefById[40099],
            dcv_sf:  FroniusSymoModbusRegisters.regDefById[40100],
            dcw:     FroniusSymoModbusRegisters.regDefById[40101],
            dcw_sf:  FroniusSymoModbusRegisters.regDefById[40102],
            tmpcab:  FroniusSymoModbusRegisters.regDefById[40103],
            tmpsnk:  FroniusSymoModbusRegisters.regDefById[40104],
            tmptms:  FroniusSymoModbusRegisters.regDefById[40105],
            tmpot:   FroniusSymoModbusRegisters.regDefById[40106],
            tmp_sf:  FroniusSymoModbusRegisters.regDefById[40107],
            st:      FroniusSymoModbusRegisters.regDefById[40108],
            stvnd:   FroniusSymoModbusRegisters.regDefById[40109],
            evt1:    FroniusSymoModbusRegisters.regDefById[40110],
            evt2:    FroniusSymoModbusRegisters.regDefById[40112],
            evtvnd1: FroniusSymoModbusRegisters.regDefById[40114],
            evtvnf2: FroniusSymoModbusRegisters.regDefById[40116],
            evtvnd3: FroniusSymoModbusRegisters.regDefById[40118],
            evtvnd4: FroniusSymoModbusRegisters.regDefById[40120]
        },
        nameplate: {
            id:      FroniusSymoModbusRegisters.regDefById[40122],
            l:       FroniusSymoModbusRegisters.regDefById[40123],
            dertyp:  FroniusSymoModbusRegisters.regDefById[40124],
            wrtg:    FroniusSymoModbusRegisters.regDefById[40125],
            wrtg_sf: FroniusSymoModbusRegisters.regDefById[40126]
        },
        settings: {
            id:   FroniusSymoModbusRegisters.regDefById[40150],
            l:    FroniusSymoModbusRegisters.regDefById[40151],
            wmax: FroniusSymoModbusRegisters.regDefById[40152],
            vref: FroniusSymoModbusRegisters.regDefById[40153]
        },
        status: {
            id:     FroniusSymoModbusRegisters.regDefById[40182],
            l:      FroniusSymoModbusRegisters.regDefById[40183],
            pvConn: FroniusSymoModbusRegisters.regDefById[40184]
        },
        control: {
            id:          FroniusSymoModbusRegisters.regDefById[40228],
            l:           FroniusSymoModbusRegisters.regDefById[40229],
            conn_wintms: FroniusSymoModbusRegisters.regDefById[40230]
        },
        storage: {
            id:          FroniusSymoModbusRegisters.regDefById[40304],
            l:           FroniusSymoModbusRegisters.regDefById[40305],
            wchamax:     FroniusSymoModbusRegisters.regDefById[40306]
        },
        inverterExtension: {
            id:          FroniusSymoModbusRegisters.regDefById[40254],
            l:           FroniusSymoModbusRegisters.regDefById[40255],
            dca_sf:      FroniusSymoModbusRegisters.regDefById[40256]
        }
    };
}

