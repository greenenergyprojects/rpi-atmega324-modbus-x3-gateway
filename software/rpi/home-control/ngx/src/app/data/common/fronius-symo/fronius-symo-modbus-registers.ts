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
    40001 | 40003 | 40004 | 40005 | 40021 | 40037 | 40045 | 40053 | 40069

    // Inverter Model: int+SF
    // 40070 | 40071 | 40072 | 40073 | 40074 | 40075 | 40076 | 40077 | 40078 | 40079 |
    // 40080 | 40081 | 40082 | 40083 | 40084 | 40085 | 40086 | 40087 | 40088 | 40089 |
    // 40090 | 40091 | 40092 | 40093 | 40094 |         40096 | 40097 | 40098 | 40099 |
    // 40100 | 40101 | 40102 | 40103 |                         40107 | 40108 | 40109 |
    // 40110 |         40112 |         40114 |         40116 |         40118 |
    // 40120
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

export interface IInverterAttributes {
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

export type FroniusRegisterAttributes = keyof IFroniusRegisterDefinition;
export type CommonAttributes = keyof ICommonDefinition;
export type InverterAttributes = keyof IInverterAttributes;


export class FroniusSymoModbusRegisters {

    // tslint:disable:max-line-length
    static regDefById: { [ id in FroniusSymoModbusIds ]: IRegisterDefinition } =  {

        // Fronius Register Model
        212: { uid: 'r212', label: 'f_delete_data',           class: ModbusNumber, id: 212,                         code: 'u16', access: 'R/W', format: '%d', description: 'Delete stored data of the current inverter by writing 0xFFFF' },
        213: { uid: 'r213', label: 'f_store_data',            class: ModbusNumber, id: 213,                         code: 'u16', access: 'R/W', format: '%d', description: 'Rating data of all inverters connectetd to the Fronius Datamanager are persistently stored by writing 0xFFFF' },
        214: { uid: 'r214', label: 'f_active_state_code',     class: ModbusNumber, id: 214,                         code: 'u16', access: 'R/W', format: '%d', description: 'Current active state code of inverter - Description can be found in inverter manual' },
        215: { uid: 'r215', label: 'f_reset_all_event_flags', class: ModbusNumber, id: 215,                         code: 'u16', access: 'R/W', format: '%d', description: 'Write 0xFFFF to reset all 0xFFFF event flags and active state code' },
        216: { uid: 'r216', label: 'f_model_type',            class: ModbusNumber, id: 216,                         code: 'u16', access: 'R/W', format: '%d', description: 'Model type', range: { values: [ 1, 2, 6 ] } },
        500: { uid: 'r500', label: 'f_site_power',            class: ModbusNumber, id: [{ first: 500, last: 501 }], code: 'u32', access: 'R',   format: '%d', description: 'Site power', unit: 'W' },
        502: { uid: 'r502', label: 'f_site_energy_day',       class: ModbusNumber, id: [{ first: 502, last: 505 }], code: 'u64', access: 'R',   format: '%d', description: 'Site energy day', unit: 'Wh' },
        506: { uid: 'r506', label: 'f_site_energy_year',      class: ModbusNumber, id: [{ first: 506, last: 509 }], code: 'u64', access: 'R',   format: '%d', description: 'Site energy year', unit: 'Wh' },
        510: { uid: 'r510', label: 'f_site_energy_total',     class: ModbusNumber, id: [{ first: 510, last: 513 }], code: 'u64', access: 'R',   format: '%d', description: 'Site energy total', unit: 'Wh' },

        // Common Model
        40001: { uid: 'r40001', label: 'sid', class: ModbusNumber, id: [{ first: 40001, last: 40002 }], code: 'u32',    access: 'R', format: '%d', description: 'Well-known value. Uniquely identifies this as a SunSpec Modbus Map', range: { values: [ 0x53756e53 ] } },
        40003: { uid: 'r40003', label: 'id',  class: ModbusNumber, id: 40003,                           code: 'u16',    access: 'R', format: '%d', description: 'Well-known value. Uniquely identifies this as a SunSpec Common Model block', range: { values: [ 1 ] } },
        40004: { uid: 'r40004', label: 'l',   class: ModbusNumber, id: 40004,                           code: 'u16',    access: 'R', format: '%s', description: 'Length of Common Model block', range: { values: [ 65 ] } },
        40005: { uid: 'r40005', label: 'mn',  class: ModbusString, id: [{ first: 40005, last: 40020 }], code: 'string', access: 'R', format: '%s', description: 'Manufacturer' },
        40021: { uid: 'r40021', label: 'md',  class: ModbusString, id: [{ first: 40021, last: 40036 }], code: 'string', access: 'R', format: '%s', description: 'Device model' },
        40037: { uid: 'r40037', label: 'opt', class: ModbusString, id: [{ first: 40037, last: 40044 }], code: 'string', access: 'R', format: '%s', description: 'SW version of datamanager' },
        40045: { uid: 'r40045', label: 'vr',  class: ModbusString, id: [{ first: 40045, last: 40052 }], code: 'string', access: 'R', format: '%s', description: 'SW version of inverter' },
        40053: { uid: 'r40053', label: 'sn',  class: ModbusString, id: [{ first: 40053, last: 40068 }], code: 'string', access: 'R', format: '%s', description: 'Serialnumber of inverter, string control or energy meter' },
        40069: { uid: 'r40069', label: 'da',  class: ModbusNumber, id: 40069,                           code: 'u16',    access: 'R', format: '%d', description: 'Modbus device address', range: { min: 1, max: 247 } }
    };


    // static regDefById: { [ id in FroniusSymoModbusIds ]: IRegisterDefinition } =  {
    //     static regDefById: { [ id: number ]: IRegisterDefinition } =  {
    //     // Fronius Register Model
    //     212: { id: 212, type: 'R/W', label: 'f_delete_data',           class: ModbusNumber,  unit: '',    size: 'u16', factor: 1, format: '%f', range: null,                    description: 'Delete stored data of the current inverter by writing 0xFFFF', help: '' },
    //     213: { id: 213, type: 'R/W', label: 'f_store_data',            classname: 'FroniusSymoNumber',  unit: '',    size: 'u16', factor: 1, format: '%f', range: null,                    description: 'Rating data of all inverters connectetd to the Fronius Datamanager are persistently stored by writing 0xFFFF', help: '' },
    //     214: { id: 214, type: 'R/W', label: 'f_active_state_code',     classname: 'FroniusSymoNumber',  unit: '',    size: 'u16', factor: 1, format: '%f', range: null,                    description: 'Current active state code of inverter - Description can be found in inverter manual', help: '' },
    //     215: { id: 215, type: 'R/W', label: 'f_reset_all_event_flags', classname: 'FroniusSymoNumber',  unit: '',    size: 'u16', factor: 1, format: '%f', range: null,                    description: 'Write 0xFFFF to reset all 0xFFFF event flags and active state code', help: '' },
    //     216: { id: 216, type: 'R/W', label: 'f_model_type',            classname: 'FroniusSymoNumber',  unit: '',    size: 'u16', factor: 1, format: '%f', range: { values: [ 1, 2, 6 ] }, description: '', help: '' },
    //     500: { id: 500, type: 'R',   label: 'f_site_power',            classname: 'FroniusSymoNumber',  unit: 'W',   size: 'u32', factor: 1, format: '%f', range: null,                    description: '', help: '' },
    //     502: { id: 502, type: 'R',   label: 'f_site_energy_day',       classname: 'FroniusSymoNumber',  unit: 'Wh',  size: 'u64', factor: 1, format: '%f', range: null,                    description: '', help: '' },
    //     506: { id: 506, type: 'R',   label: 'f_site_energy_year',      classname: 'FroniusSymoNumber',  unit: 'Wh',  size: 'u64', factor: 1, format: '%f', range: null,                    description: '', help: '' },
    //     510: { id: 510, type: 'R',   label: 'f_site_energy_total',     classname: 'FroniusSymoNumber',  unit: 'Wh',  size: 'u64', factor: 1, format: '%f', range: null,                    description: '', help: '' },

    //     // Common Model
    //     40001: { id: 40001, type: 'R', label: 'sid', classname: 'FroniusSymoNumber', unit: '',  size: 'u32',   format: '%f', range: { values: [ 0x53756e53 ] }, description: 'Well-known value. Uniquely identifies this as a SunSpec Modbus Map', help: '' },
    //     40003: { id: 40003, type: 'R', label: 'id',  classname: 'FroniusSymoNumber', unit: '',  size: 'u16',   format: '%f', range: { values: [ 1 ] },          description: 'Well-known value. Uniquely identifies this as a SunSpec Common Model block', help: '' },
    //     40004: { id: 40004, type: 'R', label: 'l',   classname: 'FroniusSymoString', unit: '',  size: 'str32', format: '%s', range: { values: [ 65 ] },         description: 'Length of Common Model block', help: '' },
    //     40005: { id: 40005, type: 'R', label: 'mn',  classname: 'FroniusSymoString', unit: '',  size: 'str32', format: '%s', range: null,                       description: 'Manufacturer', help: 'zB Fronius' },
    //     40021: { id: 40021, type: 'R', label: 'opt', classname: 'FroniusSymoString', unit: '',  size: 'str16', format: '%s', range: null,                       description: 'Device mode', help: 'zB IG+150V' },
    //     40037: { id: 40037, type: 'R', label: 'vr',  classname: 'FroniusSymoString', unit: '',  size: 'str16', format: '%s', range: null,                       description: 'SW version of datamanager', help: 'zB 3.3.6-13' },
    //     40045: { id: 40045, type: 'R', label: 'sn',  classname: 'FroniusSymoString', unit: '',  size: 'str32', format: '%s', range: null,                       description: 'Serialnumber of inverter, string control or energy meter', help: '' },
    //     40069: { id: 40069, type: 'R', label: 'da',  classname: 'FroniusSymoNumber', unit: '',  size: 'u16',   format: '%f', range: { min: 1, max: 247 },       description: 'Modbus Device Address', help: '' },

    //     // Inverter Model
    //     40070: { id: 40070, type: 'R', label: 'id',      classname: 'FroniusSymoNumber', unit: '',    size: 'u16',                        format: '%f', range: { values: [ 101, 102, 103 ]}, description: 'Uniquely identifies this as a SunSpec Inverter Modbus Map; 101 (single phase), 102 (split phase), 103 (three phase)', help: '' },
    //     40071: { id: 40071, type: 'R', label: 'l',       classname: 'FroniusSymoNumber', unit: '',    size: 'u16',                        format: '%f', range: { values: [ 50 ] }, description: 'Length of inverter model block', help: '' },
    //     40072: { id: 40072, type: 'R', label: 'a',       classname: 'FroniusSymoNumber', unit: 'A',   size: 'u16', scalefactor: 'a_sf',   format: '%f', range: null, description: 'AC Total Current value', help: '' },
    //     40073: { id: 40073, type: 'R', label: 'apha',    classname: 'FroniusSymoNumber', unit: 'A',   size: 'u16', scalefactor: 'a_sf',   format: '%f', range: null, description: 'AC Phase-A Current value', help: '' },
    //     40074: { id: 40074, type: 'R', label: 'aphb',    classname: 'FroniusSymoNumber', unit: 'A',   size: 'u16', scalefactor: 'a_sf',   format: '%f', range: null, description: 'AC Phase-B Current value', help: '' },
    //     40075: { id: 40075, type: 'R', label: 'aphc',    classname: 'FroniusSymoNumber', unit: 'A',   size: 'u16', scalefactor: 'a_sf',   format: '%f', range: null, description: 'AC Phase-C Current value', help: '' },
    //     40076: { id: 40076, type: 'R', label: 'a_sf',    classname: 'FroniusSymoNumber', unit: '',    size: 'u16',                        format: '%f', range: null, description: 'AC Current scale factor', help: '' },
    //     40077: { id: 40077, type: 'R', label: 'ppvphab', classname: 'FroniusSymoNumber', unit: 'V',   size: 'u16', scalefactor: 'v_sf',   format: '%f', range: null, description: 'AC Voltage Phase-AB value', help: '' },
    //     40078: { id: 40078, type: 'R', label: 'ppvphbc', classname: 'FroniusSymoNumber', unit: 'V',   size: 'u16', scalefactor: 'v_sf',   format: '%f', range: null, description: 'AC Voltage Phase-BC value', help: '' },
    //     40079: { id: 40079, type: 'R', label: 'ppvphca', classname: 'FroniusSymoNumber', unit: 'V',   size: 'u16', scalefactor: 'v_sf',   format: '%f', range: null, description: 'AC Voltage Phase-CA value', help: '' },
    //     40080: { id: 40080, type: 'R', label: 'phvpha',  classname: 'FroniusSymoNumber', unit: 'V',   size: 'u16', scalefactor: 'v_sf',   format: '%f', range: null, description: 'AC Voltage Phase-A-to-neutral value', help: '' },
    //     40081: { id: 40081, type: 'R', label: 'phvphb',  classname: 'FroniusSymoNumber', unit: 'V',   size: 'u16', scalefactor: 'v_sf',   format: '%f', range: null, description: 'AC Voltage Phase-B-to-neutral value', help: '' },
    //     40082: { id: 40082, type: 'R', label: 'phvphc',  classname: 'FroniusSymoNumber', unit: 'V',   size: 'u16', scalefactor: 'v_sf',   format: '%f', range: null, description: 'AC Voltage Phase-C-to-neutral value', help: '' },
    //     40083: { id: 40083, type: 'R', label: 'v_sf',    classname: 'FroniusSymoNumber', unit: '',    size: 'u16',                        format: '%f', range: null, description: 'AC Voltage scale factor', help: '' },
    //     40084: { id: 40084, type: 'R', label: 'w',       classname: 'FroniusSymoNumber', unit: 'W',   size: 's16', scalefactor: 'w_sf',   format: '%f', range: null, description: 'AC Power value', help: '' },
    //     40085: { id: 40085, type: 'R', label: 'w_sf',    classname: 'FroniusSymoNumber', unit: '',    size: 'u16',                        format: '%f', range: null, description: 'AC Power scale factor', help: '' },
    //     40086: { id: 40086, type: 'R', label: 'hz',      classname: 'FroniusSymoNumber', unit: 'Hz',  size: 'u16', scalefactor: 'hz_sf',  format: '%f', range: null, description: 'AC Frequency value', help: '' },
    //     40087: { id: 40087, type: 'R', label: 'hz_sf',   classname: 'FroniusSymoNumber', unit: '',    size: 'u16',                        format: '%f', range: null, description: 'AC Frequency scale factor', help: '' },
    //     40088: { id: 40088, type: 'R', label: 'va',      classname: 'FroniusSymoNumber', unit: 'VA',  size: 's16', scalefactor: 'va_sf',  format: '%f', range: null, description: 'Apparent Power', help: '' },
    //     40089: { id: 40089, type: 'R', label: 'va_sf',   classname: 'FroniusSymoNumber', unit: '',    size: 'u16',                        format: '%f', range: null, description: 'Apparent Power scale factor', help: '' },
    //     40090: { id: 40090, type: 'R', label: 'var',     classname: 'FroniusSymoNumber', unit: 'VAr', size: 's16', scalefactor: 'var_sf', format: '%f', range: null, description: 'Reactive Power', help: '' },
    //     40091: { id: 40091, type: 'R', label: 'var_sf',  classname: 'FroniusSymoNumber', unit: '',    size: 'u16',                        format: '%f', range: null, description: 'Reactive Power scale factor', help: '' },
    //     40092: { id: 40092, type: 'R', label: 'pf',      classname: 'FroniusSymoNumber', unit: '%',   size: 's16', scalefactor: 'pf_sf',  format: '%f', range: null, description: 'Power Factor', help: '' },
    //     40093: { id: 40093, type: 'R', label: 'pf_sf',   classname: 'FroniusSymoNumber', unit: '',    size: 'u16',                        format: '%f', range: null, description: 'Power Factor scale factor', help: '' },
    //     40094: { id: 40094, type: 'R', label: 'wh',      classname: 'FroniusSymoNumber', unit: 'Wh',  size: 'u32', scalefactor: 'wh_sf',  format: '%f', range: null, description: 'AC Lifetime Energy production', help: '' },
    //     40096: { id: 40096, type: 'R', label: 'wh_sf',   classname: 'FroniusSymoNumber', unit: '',    size: 'u16',                        format: '%f', range: null, description: 'AC Lifetime Energy production scale factor', help: '' },
    //     40097: { id: 40097, type: 'R', label: 'dca',     classname: 'FroniusSymoNumber', unit: 'A',   size: 'u16', scalefactor: 'dca_sf', format: '%f', range: null, description: 'DC Current value', help: '' },
    //     40098: { id: 40098, type: 'R', label: 'dca_sf',  classname: 'FroniusSymoNumber', unit: '',    size: 'u16',                        format: '%f', range: null, description: 'DC Current value scale factor', help: '' },
    //     40099: { id: 40099, type: 'R', label: 'dcv',     classname: 'FroniusSymoNumber', unit: 'V',   size: 'u16', scalefactor: 'dcv_df', format: '%f', range: null, description: 'DC Voltage value', help: '' },
    //     40100: { id: 40100, type: 'R', label: 'dcv_sf',  classname: 'FroniusSymoNumber', unit: '',    size: 'u16',                        format: '%f', range: null, description: 'DC Voltage value scale factor', help: '' },
    //     40101: { id: 40101, type: 'R', label: 'dcw',     classname: 'FroniusSymoNumber', unit: 'W',   size: 's16', scalefactor: 'dcw_sf', format: '%f', range: null, description: 'DC Power value', help: '' },
    //     40102: { id: 40102, type: 'R', label: 'dcw_sf',  classname: 'FroniusSymoNumber', unit: '',    size: 'u16',                        format: '%f', range: null, description: 'DC Power value scale factor', help: '' },
    //     40103: { id: 40103, type: 'R', label: 'tmpcab',  classname: 'FroniusSymoNumber', unit: '°C',  size: 's16', scalefactor: 'tmp_sf', format: '%f', range: null, description: 'Cabinet Temperature', help: '' },
    //     40107: { id: 40107, type: 'R', label: 'tmp_sf',  classname: 'FroniusSymoNumber', unit: '',    size: 'u16',                        format: '%f', range: null, description: 'Temperature scale factor', help: '' },
    //     40108: { id: 40108, type: 'R', label: 'st',      classname: 'FroniusSymoNumber', unit: '',    size: 'u16',                        format: '%f', range: null, description: 'Operating State', help: '' },
    //     40109: { id: 40109, type: 'R', label: 'stvnd',   classname: 'FroniusSymoNumber', unit: '',    size: 'u16',                        format: '%f', range: null, description: 'Vendor Defined Operating State', help: '' },
    //     40110: { id: 40110, type: 'R', label: 'evt1',    classname: 'FroniusSymoNumber', unit: '',    size: 'u32',                        format: '%f', range: null, description: 'Event Flags (bits 0-31)', help: '' },
    //     40112: { id: 40112, type: 'R', label: 'evt2',    classname: 'FroniusSymoNumber', unit: '',    size: 'u32',                        format: '%f', range: null, description: 'Event Flags (bits 32-63)', help: '' },
    //     40114: { id: 40114, type: 'R', label: 'evtvnd1', classname: 'FroniusSymoNumber', unit: '',    size: 'u32',                        format: '%f', range: null, description: 'Vendor Defined Event Flags (bits 0-31)', help: '' },
    //     40116: { id: 40116, type: 'R', label: 'evtvnf2', classname: 'FroniusSymoNumber', unit: '',    size: 'u32',                        format: '%f', range: null, description: 'Vendor Defined Event Flags (bits 32-63)', help: '' },
    //     40118: { id: 40118, type: 'R', label: 'evtvnd3', classname: 'FroniusSymoNumber', unit: '',    size: 'u32',                        format: '%f', range: null, description: 'Vendor Defined Event Flags (bits 64-95)', help: '' },
    //     40120: { id: 40120, type: 'R', label: 'evtvnd4', classname: 'FroniusSymoNumber', unit: '',    size: 'u32',                        format: '%f', range: null, description: 'Vendor Defined Event Flags (bits 96-127)', help: '' }
    // };
    // tslint:enable:max-line-length

    static regDefByLabel: {
        register: { [ id1 in FroniusRegisterAttributes ]: IRegisterDefinition },
        common:   { [ id2 in CommonAttributes ]:          IRegisterDefinition }
        // inverter:        { [ id3 in InverterLabels ]:        IRegisterDefinition }
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
        }
        // inverter: {
        //     id:      FroniusSymoModbusRegisters.regDefById[40070],
        //     l:       FroniusSymoModbusRegisters.regDefById[40071],
        //     a:       FroniusSymoModbusRegisters.regDefById[40072],
        //     apha:    FroniusSymoModbusRegisters.regDefById[40073],
        //     aphb:    FroniusSymoModbusRegisters.regDefById[40074],
        //     aphc:    FroniusSymoModbusRegisters.regDefById[40075],
        //     a_sf:    FroniusSymoModbusRegisters.regDefById[40076],
        //     ppvphab: FroniusSymoModbusRegisters.regDefById[40077],
        //     ppvphbc: FroniusSymoModbusRegisters.regDefById[40078],
        //     ppvphca: FroniusSymoModbusRegisters.regDefById[40079],
        //     phvpha:  FroniusSymoModbusRegisters.regDefById[40080],
        //     phvphb:  FroniusSymoModbusRegisters.regDefById[40081],
        //     phvphc:  FroniusSymoModbusRegisters.regDefById[40082],
        //     v_sf:    FroniusSymoModbusRegisters.regDefById[40083],
        //     w:       FroniusSymoModbusRegisters.regDefById[40084],
        //     w_sf:    FroniusSymoModbusRegisters.regDefById[40085],
        //     hz:      FroniusSymoModbusRegisters.regDefById[40086],
        //     hz_sf:   FroniusSymoModbusRegisters.regDefById[40087],
        //     va:      FroniusSymoModbusRegisters.regDefById[40088],
        //     va_sf:   FroniusSymoModbusRegisters.regDefById[40089],
        //     var:     FroniusSymoModbusRegisters.regDefById[40090],
        //     var_sf:  FroniusSymoModbusRegisters.regDefById[40091],
        //     pf:      FroniusSymoModbusRegisters.regDefById[40092],
        //     pf_sf:   FroniusSymoModbusRegisters.regDefById[40093],
        //     wh:      FroniusSymoModbusRegisters.regDefById[40094],
        //     wh_sf:   FroniusSymoModbusRegisters.regDefById[40096],
        //     dca:     FroniusSymoModbusRegisters.regDefById[40097],
        //     dca_sf:  FroniusSymoModbusRegisters.regDefById[40098],
        //     dcv:     FroniusSymoModbusRegisters.regDefById[40099],
        //     dcv_sf:  FroniusSymoModbusRegisters.regDefById[40100],
        //     dcw:     FroniusSymoModbusRegisters.regDefById[40101],
        //     dcw_sf:  FroniusSymoModbusRegisters.regDefById[40102],
        //     tmpcab:  FroniusSymoModbusRegisters.regDefById[40103],
        //     tmp_sf:  FroniusSymoModbusRegisters.regDefById[40107],
        //     st:      FroniusSymoModbusRegisters.regDefById[40108],
        //     stvnd:   FroniusSymoModbusRegisters.regDefById[40109],
        //     evt1:    FroniusSymoModbusRegisters.regDefById[40110],
        //     evt2:    FroniusSymoModbusRegisters.regDefById[40112],
        //     evtvnd1: FroniusSymoModbusRegisters.regDefById[40114],
        //     evtvnf2: FroniusSymoModbusRegisters.regDefById[40116],
        //     evtvnd3: FroniusSymoModbusRegisters.regDefById[40118],
        //     evtvnd4: FroniusSymoModbusRegisters.regDefById[40120]
        // }

    };

}
