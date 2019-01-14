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
                    40122 | 40123 | 40124 | 40125 | 40126 | 40127 | 40128 | 40129 |
    40130 | 40131 | 40132 | 40133 | 40134 | 40135 | 40136 | 40137 | 40138 | 40139 |
    40140 | 40141 | 40142 | 40143 | 40144 | 40145 | 40146 | 40147 | 40148 | 40149 |

    // Settings Model: int+SF
    40150 | 40151 | 40152 | 40153 | 40154 | 40155 | 40156 | 40157 | 40158 | 40159 |
    40160 | 40161 | 40162 | 40163 | 40164 | 40165 | 40166 | 40167 | 40168 | 40169 |
    40170 | 40171 | 40172 | 40173 | 40174 | 40175 | 40176 | 40177 | 40178 | 40179 |
    40180 | 40181 |

    // Extended Measurment and Status Model: int+SF
                    40182 | 40183 | 40184 | 40185 | 40186 | 40187 |
           40191 |                          40195 |                         40199 |
                            40203 |                         40207 |
            40211 | 40212 | 40213 | 40214 | 40215 |         40217 |         40219 |
                            40223 |         40225 | 40226 |

    // Immediate Controls Model: int+SF
                                                                    40228 | 40229 |
    40230 | 40231 | 40232 | 40233 | 40234 | 40235 | 40236 | 40237 | 40238 | 40239 |
    40240 | 40241 | 40242 | 40243 | 40244 | 40245 | 40246 | 40247 | 40248 | 40249 |
    40250 | 40251 | 40252 | 40253 |

    // Basic Storage Control Model: int+SF
                                    40304 | 40305 | 40306 | 40307 | 40308 | 40309 |
    40310 | 40311 | 40312 | 40313 | 40314 | 40315 | 40316 | 40317 | 40318 | 40319 |
    40320 | 40321 | 40322 | 40323 | 40324 | 40325 | 40326 | 40327 | 40328 | 40329 |

    // Multiple MPPT Inverter Extension Model: int+SF
                                    40254 | 40255 | 40256 | 40257 | 40258 | 40259 |
    40260 |         40262 | 40263 | 40264 | 40265 |
                            40273 | 40274 | 40275 | 40276 |         40278 |
    40280 | 40281 | 40282 |         40284 | 40285 |
                            40293 | 40294 | 40295 | 40296 |         40298 |
    40300 | 40301 | 40302
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
    evtvnd2: IRegisterDefinition;
    evtvnd3: IRegisterDefinition;
    evtvnd4: IRegisterDefinition;
}

export interface INameplateDefinition {
    id:              IRegisterDefinition;
    l:               IRegisterDefinition;
    dertyp:          IRegisterDefinition;
    wrtg:            IRegisterDefinition;
    wrtg_sf:         IRegisterDefinition;
    vatg:            IRegisterDefinition;
    vatg_sf:         IRegisterDefinition;
    vartgq1:         IRegisterDefinition;
    vartgq2:         IRegisterDefinition;
    vartgq3:         IRegisterDefinition;
    vartgq4:         IRegisterDefinition;
    vartgx_sf:       IRegisterDefinition;
    artg:            IRegisterDefinition;
    artg_sf:         IRegisterDefinition;
    pfrtgq1:         IRegisterDefinition;
    pfrtgq2:         IRegisterDefinition;
    pfrtgq3:         IRegisterDefinition;
    pfrtgq4:         IRegisterDefinition;
    pfrtg_sf:        IRegisterDefinition;
    whrtg:           IRegisterDefinition;
    whrtg_sf:        IRegisterDefinition;
    ahrrtg:          IRegisterDefinition;
    ahrrtg_sf:       IRegisterDefinition;
    maxcharte:       IRegisterDefinition;
    maxcharte_sf:    IRegisterDefinition;
    maxdischarte:    IRegisterDefinition;
    maxdischarte_sf: IRegisterDefinition;
    pad:             IRegisterDefinition;
}

export interface  ISettingsDefinition {
    id:           IRegisterDefinition;
    l:            IRegisterDefinition;
    wmax:         IRegisterDefinition;
    vref:         IRegisterDefinition;
    vrefofs:      IRegisterDefinition;
    vmax:         IRegisterDefinition;
    vmin:         IRegisterDefinition;
    vamax:        IRegisterDefinition;
    varmaxq1:     IRegisterDefinition;
    varmaxq2:     IRegisterDefinition;
    varmaxq3:     IRegisterDefinition;
    varmaxq4:     IRegisterDefinition;
    wgra:         IRegisterDefinition;
    pfminq1:      IRegisterDefinition;
    pfminq2:      IRegisterDefinition;
    pfminq3:      IRegisterDefinition;
    pfminq4:      IRegisterDefinition;
    varact:       IRegisterDefinition;
    clctotva:     IRegisterDefinition;
    maxrmprte:    IRegisterDefinition;
    ecpnomhz:     IRegisterDefinition;
    connph:       IRegisterDefinition;
    wmax_sf:      IRegisterDefinition;
    vref_sf:      IRegisterDefinition;
    vrefofs_sf:   IRegisterDefinition;
    vminmax_sf:   IRegisterDefinition;
    vamax_sf:     IRegisterDefinition;
    varmax_sf:    IRegisterDefinition;
    wgra_sf:      IRegisterDefinition;
    pfmin_sf:     IRegisterDefinition;
    maxrmprte_sf: IRegisterDefinition;
    ecpnomhz_sf:  IRegisterDefinition;
}

export interface IStatusDefinition {
    id:         IRegisterDefinition;
    l:          IRegisterDefinition;
    pvConn:     IRegisterDefinition;
    storconn:   IRegisterDefinition;
    ecpconn:    IRegisterDefinition;
    actwh:      IRegisterDefinition;
    actvah:     IRegisterDefinition;
    actvarhq1:  IRegisterDefinition;
    actvarhq2:  IRegisterDefinition;
    actvarhq3:  IRegisterDefinition;
    actvarhq4:  IRegisterDefinition;
    varaval:    IRegisterDefinition;
    varaval_sf: IRegisterDefinition;
    waval:      IRegisterDefinition;
    waval_sf:   IRegisterDefinition;
    stsetlimms: IRegisterDefinition;
    stactctl:   IRegisterDefinition;
    tmsrc:      IRegisterDefinition;
    tms:        IRegisterDefinition;
    riso:       IRegisterDefinition;
    riso_sf:    IRegisterDefinition;
}

export interface IControlDefinition {
    id:                 IRegisterDefinition;
    l:                  IRegisterDefinition;
    conn_wintms:        IRegisterDefinition;
    conn_rvrttms:       IRegisterDefinition;
    conn:               IRegisterDefinition;
    wmaxlimpct:         IRegisterDefinition;
    wmaxlimpct_wintms:  IRegisterDefinition;
    wmaxlimpct_rvrttms: IRegisterDefinition;
    wmaxlimpct_rmptmss: IRegisterDefinition;
    wmaxlim_ena:        IRegisterDefinition;
    outpfset:           IRegisterDefinition;
    outpfset_wintms:    IRegisterDefinition;
    outpfset_rvrttms:   IRegisterDefinition;
    outpfset_rmptms:    IRegisterDefinition;
    outpfset_ena:       IRegisterDefinition;
    varwmaxpct:         IRegisterDefinition;
    varmaxpct:          IRegisterDefinition;
    varavalpct:         IRegisterDefinition;
    varpct_wintms:      IRegisterDefinition;
    varpct_rvrttms:     IRegisterDefinition;
    varpct_rmptms:      IRegisterDefinition;
    varpct_mod:         IRegisterDefinition;
    varpct_ena:         IRegisterDefinition;
    wmaxlimpct_sf:      IRegisterDefinition;
    outpfset_sf:        IRegisterDefinition;
    varpct_sf:          IRegisterDefinition;
}

export interface IStorageDefinition {
    id:                IRegisterDefinition;
    l:                 IRegisterDefinition;
    wchamax:           IRegisterDefinition;
    wchagra:           IRegisterDefinition;
    wdischagra:        IRegisterDefinition;
    storctl_mod:       IRegisterDefinition;
    vachamax:          IRegisterDefinition;
    minrsvpct:         IRegisterDefinition;
    chastate:          IRegisterDefinition;
    storaval:          IRegisterDefinition;
    inbatv:            IRegisterDefinition;
    chast:             IRegisterDefinition;
    outwrte:           IRegisterDefinition;
    inwrte:            IRegisterDefinition;
    inoutwrte_wintms:  IRegisterDefinition;
    inoutwrte_rvrttms: IRegisterDefinition;
    inoutwrte_rmptms:  IRegisterDefinition;
    chagriset:         IRegisterDefinition;
    wchamax_sf:        IRegisterDefinition;
    wchadischagra_sf:  IRegisterDefinition;
    vachamax_sf:       IRegisterDefinition;
    minrsvpct_sf:      IRegisterDefinition;
    chastate_sf:       IRegisterDefinition;
    storaval_sf:       IRegisterDefinition;
    inbatv_sf:         IRegisterDefinition;
    inoutwrte_sf:      IRegisterDefinition;
}

export interface IInverterExtensionDefinition {
    id:      IRegisterDefinition;
    l:       IRegisterDefinition;
    dca_sf:  IRegisterDefinition;
    dcv_sf:  IRegisterDefinition;
    dcw_sf:  IRegisterDefinition;
    dcwh_sf: IRegisterDefinition;
    evt:     IRegisterDefinition;
    n:       IRegisterDefinition;
    tmsper:  IRegisterDefinition;
    id_1:    IRegisterDefinition;
    idstr_1: IRegisterDefinition;
    dca_1:   IRegisterDefinition;
    dcv_1:   IRegisterDefinition;
    dcw_1:   IRegisterDefinition;
    dcwh_1:  IRegisterDefinition;
    tms_1:   IRegisterDefinition;
    tmp_1:   IRegisterDefinition;
    dcst_1:  IRegisterDefinition;
    dcevt_1: IRegisterDefinition;
    id_2:    IRegisterDefinition;
    idstr_2: IRegisterDefinition;
    dca_2:   IRegisterDefinition;
    dcv_2:   IRegisterDefinition;
    dcw_2:   IRegisterDefinition;
    dcwh_2:  IRegisterDefinition;
    tms_2:   IRegisterDefinition;
    tmp_2:   IRegisterDefinition;
    dcst_2:  IRegisterDefinition;
    dcevt_2: IRegisterDefinition;
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
        40001: { uid: '40001', label: 'sid',             class: ModbusNumber, id: [{ first: 40001, last: 40002 }], code: 'u32',    access: 'R', format: '%d', description: 'Well-known value. Uniquely identifies this as a SunSpec Modbus Map', range: { values: [ 0x53756e53 ] } },
        40003: { uid: '40003', label: 'id',              class: ModbusNumber, id: 40003,                           code: 'u16',    access: 'R', format: '%d', description: 'Well-known value. Uniquely identifies this as a SunSpec Common Model block', range: { values: [ 1 ] } },
        40004: { uid: '40004', label: 'l',               class: ModbusNumber, id: 40004,                           code: 'u16',    access: 'R', format: '%s', description: 'Length of Common Model block', range: { values: [ 65 ] } },
        40005: { uid: '40005', label: 'mn',              class: ModbusString, id: [{ first: 40005, last: 40020 }], code: 'string', access: 'R', format: '%s', description: 'Manufacturer' },
        40021: { uid: '40021', label: 'md',              class: ModbusString, id: [{ first: 40021, last: 40036 }], code: 'string', access: 'R', format: '%s', description: 'Device model' },
        40037: { uid: '40037', label: 'opt',             class: ModbusString, id: [{ first: 40037, last: 40044 }], code: 'string', access: 'R', format: '%s', description: 'SW version of datamanager' },
        40045: { uid: '40045', label: 'vr',              class: ModbusString, id: [{ first: 40045, last: 40052 }], code: 'string', access: 'R', format: '%s', description: 'SW version of inverter' },
        40053: { uid: '40053', label: 'sn',              class: ModbusString, id: [{ first: 40053, last: 40068 }], code: 'string', access: 'R', format: '%s', description: 'Serialnumber of inverter, string control or energy meter' },
        40069: { uid: '40069', label: 'da',              class: ModbusNumber, id: 40069,                           code: 'u16',    access: 'R', format: '%d', description: 'Modbus device address', range: { min: 1, max: 247 } },

        // Inverter Model
        40070: { uid: '40070', label: 'id',              class: ModbusNumber, id: 40070,                           code: 'u16', access: 'R', format: '%d',                                               range: { values: [ 101, 102, 103 ]}, description: 'Uniquely identifies this as a SunSpec Inverter Modbus Map; 101 (single phase), 102 (split phase), 103 (three phase)' },
        40071: { uid: '40071', label: 'l',               class: ModbusNumber, id: 40071,                           code: 'u16', access: 'R', format: '%d',                                               range: { values: [ 50 ] },           description: 'Length of inverter model block' },
        40072: { uid: '40072', label: 'a',               class: ModbusNumber, id: 40072,                           code: 'u16', access: 'R', format: '%.2f', type: { int: { scale: '40076' }}, unit: 'A',                                       description: 'AC Total Current value' },
        40073: { uid: '40073', label: 'apha',            class: ModbusNumber, id: 40073,                           code: 'u16', access: 'R', format: '%.2f', type: { int: { scale: '40076' }}, unit: 'A',                                       description: 'AC Phase-A Current value' },
        40074: { uid: '40074', label: 'aphb',            class: ModbusNumber, id: 40074,                           code: 'u16', access: 'R', format: '%.2f', type: { int: { scale: '40076' }}, unit: 'A',                                       description: 'AC Phase-B Current value' },
        40075: { uid: '40075', label: 'aphc',            class: ModbusNumber, id: 40075,                           code: 'u16', access: 'R', format: '%.2f', type: { int: { scale: '40076' }}, unit: 'A',                                       description: 'AC Phase-C Current value' },
        40076: { uid: '40076', label: 'a_sf',            class: ModbusNumber, id: 40076,                           code: 's16', access: 'R', format: '%d',                                                                                    description: 'AC Current scale factor' },
        40077: { uid: '40077', label: 'ppvphab',         class: ModbusNumber, id: 40077,                           code: 'u16', access: 'R', format: '%.1f', type: { int: { scale: '40083' }}, unit: 'V',                                       description: 'AC Voltage Phase-AB value' },
        40078: { uid: '40078', label: 'ppvphbc',         class: ModbusNumber, id: 40078,                           code: 'u16', access: 'R', format: '%.1f', type: { int: { scale: '40083' }}, unit: 'V',                                       description: 'AC Voltage Phase-BC value' },
        40079: { uid: '40079', label: 'ppvphca',         class: ModbusNumber, id: 40079,                           code: 'u16', access: 'R', format: '%.1f', type: { int: { scale: '40083' }}, unit: 'V',                                       description: 'AC Voltage Phase-CA value' },
        40080: { uid: '40080', label: 'phvpha',          class: ModbusNumber, id: 40080,                           code: 'u16', access: 'R', format: '%.1f', type: { int: { scale: '40083' }}, unit: 'V',                                       description: 'AC Voltage Phase-A-to-neutral value' },
        40081: { uid: '40081', label: 'phvphb',          class: ModbusNumber, id: 40081,                           code: 'u16', access: 'R', format: '%.1f', type: { int: { scale: '40083' }}, unit: 'V',                                       description: 'AC Voltage Phase-B-to-neutral value' },
        40082: { uid: '40082', label: 'phvphc',          class: ModbusNumber, id: 40082,                           code: 'u16', access: 'R', format: '%.1f', type: { int: { scale: '40083' }}, unit: 'V',                                       description: 'AC Voltage Phase-C-to-neutral value' },
        40083: { uid: '40083', label: 'v_sf',            class: ModbusNumber, id: 40083,                           code: 's16', access: 'R', format: '%d',                                                                                    description: 'AC Voltage scale factor' },
        40084: { uid: '40084', label: 'w',               class: ModbusNumber, id: 40084,                           code: 's16', access: 'R', format: '%.0f', type: { int: { scale: '40085' }}, unit: 'W',                                       description: 'AC Power value' },
        40085: { uid: '40085', label: 'w_sf',            class: ModbusNumber, id: 40085,                           code: 's16', access: 'R', format: '%d',                                                                                    description: 'AC Power scale factor' },
        40086: { uid: '40086', label: 'hz',              class: ModbusNumber, id: 40086,                           code: 'u16', access: 'R', format: '%.1f', type: { int: { scale: '40087' }}, unit: 'Hz',                                      description: 'AC Frequency value' },
        40087: { uid: '40087', label: 'hz_sf',           class: ModbusNumber, id: 40087,                           code: 's16', access: 'R', format: '%f',                                                                                    description: 'AC Frequency scale factor' },
        40088: { uid: '40088', label: 'va',              class: ModbusNumber, id: 40088,                           code: 's16', access: 'R', format: '%.0f', type: { int: { scale: '40089' }}, unit: 'VA',                                      description: 'Apparent Power' },
        40089: { uid: '40089', label: 'va_sf',           class: ModbusNumber, id: 40089,                           code: 's16', access: 'R', format: '%d',                                                                                    description: 'Apparent Power scale factor' },
        40090: { uid: '40090', label: 'var',             class: ModbusNumber, id: 40090,                           code: 's16', access: 'R', format: '%.0f', type: { int: { scale: '40091' }}, unit: 'var',                                     description: 'Reactive Power' },
        40091: { uid: '40091', label: 'var_sf',          class: ModbusNumber, id: 40091,                           code: 's16', access: 'R', format: '%f',                                                                                    description: 'Reactive Power scale factor' },
        40092: { uid: '40092', label: 'pf',              class: ModbusNumber, id: 40092,                           code: 's16', access: 'R', format: '%.2f', type: { int: { scale: '40093' }}, unit: '%',                                       description: 'Power Factor' },
        40093: { uid: '40093', label: 'pf_sf',           class: ModbusNumber, id: 40093,                           code: 's16', access: 'R', format: '%d',                                                                                    description: 'Power Factor scale factor' },
        40094: { uid: '40094', label: 'wh',              class: ModbusNumber, id: [{ first: 40094, last: 40095 }], code: 'u32', access: 'R', format: '%.0f', type: { int: { scale: '40096' }}, unit: 'Wh',                                      description: 'AC Lifetime Energy production' },
        40096: { uid: '40096', label: 'wh_sf',           class: ModbusNumber, id: 40096,                           code: 's16', access: 'R', format: '%f',                                                                                    description: 'AC Lifetime Energy production scale factor' },
        40097: { uid: '40097', label: 'dca',             class: ModbusNumber, id: 40097,                           code: 'u16', access: 'R', format: '%.2f', type: { int: { scale: '40098' }}, unit: 'A',                                       description: 'DC Current value' },
        40098: { uid: '40098', label: 'dca_sf',          class: ModbusNumber, id: 40098,                           code: 's16', access: 'R', format: '%d',                                                                                    description: 'DC Current value scale factor' },
        40099: { uid: '40099', label: 'dcv',             class: ModbusNumber, id: 40099,                           code: 'u16', access: 'R', format: '%.0f', type: { int: { scale: '40100' }}, unit: 'V',                                       description: 'DC Voltage value' },
        40100: { uid: '40100', label: 'dcv_sf',          class: ModbusNumber, id: 40100,                           code: 's16', access: 'R', format: '%d',                                                                                    description: 'DC Voltage value scale factor' },
        40101: { uid: '40101', label: 'dcw',             class: ModbusNumber, id: 40101,                           code: 's16', access: 'R', format: '%.0f', type: { int: { scale: '40102' }}, unit: 'W',                                       description: 'DC Power value' },
        40102: { uid: '40102', label: 'dcw_sf',          class: ModbusNumber, id: 40102,                           code: 's16', access: 'R', format: '%d',                                                                                    description: 'DC Power value scale factor' },
        40103: { uid: '40103', label: 'tmpcab',          class: ModbusNumber, id: 40103,                           code: 's16', access: 'R', format: '%.1f', type: { int: { scale: '40107' }}, unit: '°C',                                      description: 'Cabinet Temperature' },
        40104: { uid: '40104', label: 'tmpsnk',          class: ModbusNumber, id: 40104,                           code: 's16', access: 'R', format: '%.1f', type: { int: { scale: '40107' }}, unit: '°C',                                      description: 'Heat Sink temperature (not supported)' },
        40105: { uid: '40105', label: 'tmptms',          class: ModbusNumber, id: 40105,                           code: 's16', access: 'R', format: '%.1f', type: { int: { scale: '40107' }}, unit: '°C',                                      description: 'Transformer temperature (not supported)' },
        40106: { uid: '40106', label: 'tmpot',           class: ModbusNumber, id: 40106,                           code: 's16', access: 'R', format: '%.1f', type: { int: { scale: '40107' }}, unit: '°C',                                      description: 'Other Temperatur (not supported)' },
        40107: { uid: '40107', label: 'tmp_sf',          class: ModbusNumber, id: 40107,                           code: 's16', access: 'R', format: '%d',                                                                                    description: 'Temperature scale factor' },
        40108: { uid: '40108', label: 'st',              class: ModbusNumber, id: 40108,                           code: 'u16', access: 'R', format: '%d',                                                                                    description: 'Operating State'  },
        40109: { uid: '40109', label: 'stvnd',           class: ModbusNumber, id: 40109,                           code: 'u16', access: 'R', format: '%d',                                                                                    description: 'Vendor Defined Operating State' },
        40110: { uid: '40110', label: 'evt1',            class: ModbusNumber, id: [{ first: 40110, last: 40111 }], code: 'u32', access: 'R', format: '%d',                                                                                    description: 'Event Flags (bits 0-31)' },
        40112: { uid: '40112', label: 'evt2',            class: ModbusNumber, id: [{ first: 40112, last: 40113 }], code: 'u32', access: 'R', format: '%d',                                                                                    description: 'Event Flags (bits 32-63)' },
        40114: { uid: '40114', label: 'evtvnd1',         class: ModbusNumber, id: [{ first: 40114, last: 40115 }], code: 'u32', access: 'R', format: '%d',                                                                                    description: 'Vendor Defined Event Flags (bits 0-31)' },
        40116: { uid: '40116', label: 'evtvnd2',         class: ModbusNumber, id: [{ first: 40116, last: 40117 }], code: 'u32', access: 'R', format: '%d',                                                                                    description: 'Vendor Defined Event Flags (bits 32-63)' },
        40118: { uid: '40118', label: 'evtvnd3',         class: ModbusNumber, id: [{ first: 40118, last: 40119 }], code: 'u32', access: 'R', format: '%d',                                                                                    description: 'Vendor Defined Event Flags (bits 64-95)' },
        40120: { uid: '40120', label: 'evtvnd4',         class: ModbusNumber, id: [{ first: 40120, last: 40120 }], code: 'u32', access: 'R', format: '%d',                                                                                    description: 'Vendor Defined Event Flags (bits 96-127)' },

        // Nameplate Model: int+SF
        40122: { uid: '40122', label: 'id',              class: ModbusNumber, id: 40122,                           code: 'u16', access: 'R', format: '%d',                                              range: { values: [ 120 ] },           description: 'Fixed value 120 as identifier for a SunSpec Nameplate Model' },
        40123: { uid: '40123', label: 'l',               class: ModbusNumber, id: 40123,                           code: 'u16', access: 'R', format: '%d',                                              range: { values: [ 26 ] },            description: 'Length of Nameplate Model' },
        40124: { uid: '40124', label: 'dertyp',          class: ModbusNumber, id: 40124,                           code: 'u16', access: 'R', format: '%d',                                              range: { values: [ 4 ] },             description: 'Fixed value 4 indicate PV device.' },
        40125: { uid: '40125', label: 'wrtg',            class: ModbusNumber, id: 40125,                           code: 'u16', access: 'R', format: '%f', type: { int: { scale: '40126' }}, unit: 'W',                                       description: 'Continuous power output capability of the inverter.' },
        40126: { uid: '40126', label: 'wrtg_sf',         class: ModbusNumber, id: 40126,                           code: 's16', access: 'R', format: '%d',                                                                                    description: 'Power output scale factor' },
        40127: { uid: '40127', label: 'vatg',            class: ModbusNumber, id: 40127,                           code: 'u16', access: 'R', format: '%f', type: { int: { scale: '40128' }}, unit: 'VA',                                      description: 'Continuous VA capability of the inverter.' },
        40128: { uid: '40128', label: 'vatg_sf',         class: ModbusNumber, id: 40128,                           code: 's16', access: 'R', format: '%d',                                                                                    description: 'Continuous VA scale factor' },
        40129: { uid: '40129', label: 'vartgq1',         class: ModbusNumber, id: 40129,                           code: 's16', access: 'R', format: '%f', type: { int: { scale: '40133' }}, unit: 'var',                                     description: 'Continuous var capability of the inverter quadrant 1.' },
        40130: { uid: '40130', label: 'vartgq2',         class: ModbusNumber, id: 40130,                           code: 's16', access: 'R', format: '%f', type: { int: { scale: '40133', const: 'NaN' }}, unit: 'var',                        description: 'Not supported (Continuous var capability of the inverter quadrant 2.)' },
        40131: { uid: '40131', label: 'vartgq3',         class: ModbusNumber, id: 40131,                           code: 's16', access: 'R', format: '%f', type: { int: { scale: '40133', const: 'NaN' }}, unit: 'var',                        description: 'Not supported (Continuous var capability of the inverter quadrant 3.)' },
        40132: { uid: '40132', label: 'vartgq4',         class: ModbusNumber, id: 40132,                           code: 's16', access: 'R', format: '%f', type: { int: { scale: '40133' }}, unit: 'var',                                     description: 'Continuous var capability of the inverter quadrant 4.' },
        40133: { uid: '40133', label: 'vartgx_sf',       class: ModbusNumber, id: 40133,                           code: 's16', access: 'R', format: '%d',                                                                                    description: 'Continuous var scale factor' },
        40134: { uid: '40134', label: 'artg',            class: ModbusNumber, id: 40134,                           code: 'u16', access: 'R', format: '%f', type: { int: { scale: '40135' }}, unit: 'var',                                     description: 'Maximum RMS AC current level capability of the inverter' },
        40135: { uid: '40135', label: 'artg_sf',         class: ModbusNumber, id: 40135,                           code: 's16', access: 'R', format: '%d',                                                                                    description: 'Maximum RMS AC current scale factor' },
        40136: { uid: '40136', label: 'pfrtgq1',         class: ModbusNumber, id: 40136,                           code: 's16', access: 'R', format: '%f', type: { int: { scale: '40140' }},                                                  description: 'Minimum power factor capability of the inverter in quadrant 1' },
        40137: { uid: '40137', label: 'pfrtgq2',         class: ModbusNumber, id: 40137,                           code: 's16', access: 'R', format: '%f', type: { int: { scale: '40140', const: 'NaN' }},                                     description: 'Not supported (Minimum power factor capability of the inverter in quadrant 2)' },
        40138: { uid: '40138', label: 'pfrtgq3',         class: ModbusNumber, id: 40138,                           code: 's16', access: 'R', format: '%f', type: { int: { scale: '40140', const: 'NaN' }},                                     description: 'Not supported (Minimum power factor capability of the inverter in quadrant 3)' },
        40139: { uid: '40139', label: 'pfrtgq4',         class: ModbusNumber, id: 40139,                           code: 's16', access: 'R', format: '%f', type: { int: { scale: '40140' }},                                                  description: 'Minimum power factor capability of the inverter in quadrant 4' },
        40140: { uid: '40140', label: 'pfrtg_sf',        class: ModbusNumber, id: 40140,                           code: 's16', access: 'R', format: '%d',                                                                                    description: 'Minimum power factor scale factor' },
        40141: { uid: '40141', label: 'whrtg',           class: ModbusNumber, id: 40141,                           code: 'u16', access: 'R', format: '%f', type: { int: { scale: '40142' }}, unit: 'Wh',                                      description: 'Nominal energy rating of storage device' },
        40142: { uid: '40142', label: 'whrtg_sf',        class: ModbusNumber, id: 40142,                           code: 's16', access: 'R', format: '%d',                                                                                    description: 'Nominal energy rating of storage device scale factor' },
        40143: { uid: '40143', label: 'ahrrtg',          class: ModbusNumber, id: 40143,                           code: 'u16', access: 'R', format: '%f', type: { int: { scale: '40144' }}, unit: 'Ah',                                      description: 'Useable capacity of the battery' },
        40144: { uid: '40144', label: 'ahrrtg_sf',       class: ModbusNumber, id: 40144,                           code: 's16', access: 'R', format: '%d',                                                                                    description: 'Useable capacity of the battery scale factor' },
        40145: { uid: '40145', label: 'maxcharte',       class: ModbusNumber, id: 40145,                           code: 'u16', access: 'R', format: '%f', type: { int: { scale: '40146' }}, unit: 'W',                                       description: 'Maximum rate of energy transfer into the storage device' },
        40146: { uid: '40146', label: 'maxcharte_sf',    class: ModbusNumber, id: 40146,                           code: 's16', access: 'R', format: '%d',                                                                                    description: 'Maximum rate of energy transfer into the storage device scale factor' },
        40147: { uid: '40147', label: 'maxdischarte',    class: ModbusNumber, id: 40147,                           code: 'u16', access: 'R', format: '%f', type: { int: { scale: '40148' }}, unit: 'W',                                       description: 'Maximum rate of energy transfer out the storage device' },
        40148: { uid: '40148', label: 'maxdischarte_sf', class: ModbusNumber, id: 40148,                           code: 's16', access: 'R', format: '%d',                                                                                    description: 'Maximum rate of energy transfer out the storage device scale factor' },
        40149: { uid: '40149', label: 'pad',             class: ModbusNumber, id: 40149,                           code: 's16', access: 'R', format: '%d', type: { int: { const: 'NaN' }},                                                      description: 'not supported (Pad register)' },

        // Settings Model
        40150: { uid: '40150', label: 'id',              class: ModbusNumber, id: 40150,                           code: 'u16', access: 'R', format: '%d',                                                range: { values: [ 121 ] },         description: 'Fixed value 121 as identifier for a SunSpec Nameplate Model' },
        40151: { uid: '40151', label: 'l',               class: ModbusNumber, id: 40151,                           code: 'u16', access: 'R', format: '%d',                                                range: { values: [ 30 ] },          description: 'Length of Settings Model' },
        40152: { uid: '40152', label: 'wmax',            class: ModbusNumber, id: 40152,                           code: 'u16', access: 'R', format: '%f',   type: { int: { scale: '40172' }}, unit: 'W',                                     description: 'Setting for maximum power output. Default to wrtg.' },
        40153: { uid: '40153', label: 'vref',            class: ModbusNumber, id: 40153,                           code: 's16', access: 'R', format: '%.1f', type: { int: { scale: '40173' }}, unit: 'V',                                     description: 'Voltage at the PCC.' },
        40154: { uid: '40154', label: 'vrefofs',         class: ModbusNumber, id: 40154,                           code: 's16', access: 'R', format: '%.1f', type: { int: { scale: '40174' }}, unit: 'V',                                     description: 'Offset from PCC to inverter.' },
        40155: { uid: '40155', label: 'vmax',            class: ModbusNumber, id: 40155,                           code: 'u16', access: 'R', format: '%.1f', type: { int: { scale: '40175' }}, unit: 'V',                                     description: 'Currently not supported' },
        40156: { uid: '40156', label: 'vmin',            class: ModbusNumber, id: 40156,                           code: 'u16', access: 'R', format: '%.1f', type: { int: { scale: '40175' }}, unit: 'V',                                     description: 'Currently not supported' },
        40157: { uid: '40157', label: 'vamax',           class: ModbusNumber, id: 40157,                           code: 'u16', access: 'R', format: '%f',   type: { int: { scale: '40176' }}, unit: 'VA',                                    description: 'Setpoint of maximum apparent power. Default ro vartg.' },
        40158: { uid: '40158', label: 'varmaxq1',        class: ModbusNumber, id: 40158,                           code: 's16', access: 'R', format: '%f',   type: { int: { scale: '40177' }}, unit: 'var',                                   description: 'Setpoint of maximum reactive power in quadrant 1. Default ro vartgq1.' },
        40159: { uid: '40159', label: 'varmaxq2',        class: ModbusNumber, id: 40159,                           code: 's16', access: 'R', format: '%f',   type: { int: { scale: '40177', const: 'NaN'  }}, unit: 'var',                    description: 'Setpoint of maximum reactive power in quadrant 2. Default ro vartgq2.' },
        40160: { uid: '40160', label: 'varmaxq3',        class: ModbusNumber, id: 40160,                           code: 's16', access: 'R', format: '%f',   type: { int: { scale: '40177', const: 'NaN'  }}, unit: 'var',                    description: 'Setpoint of maximum reactive power in quadrant 3. Default ro vartgq3.' },
        40161: { uid: '40161', label: 'varmaxq4',        class: ModbusNumber, id: 40161,                           code: 's16', access: 'R', format: '%f',   type: { int: { scale: '40177' }}, unit: 'var',                                   description: 'Setpoint of maximum reactive power in quadrant 4. Default ro vartgq4.' },
        40162: { uid: '40162', label: 'wgra',            class: ModbusNumber, id: 40162,                           code: 'u16', access: 'R', format: '%.1f', type: { int: { scale: '40178' }}, unit: '%',                                     description: 'Default ramp rate of change of active power due to command or internal action' },
        40163: { uid: '40163', label: 'pfminq1',         class: ModbusNumber, id: 40163,                           code: 's16', access: 'R', format: '%.1f', type: { int: { scale: '40179' }},                                                description: 'Setpoint for minimum power factor value in quadrant 1. Default to pfrtgq1' },
        40164: { uid: '40164', label: 'pfminq2',         class: ModbusNumber, id: 40164,                           code: 's16', access: 'R', format: '%.1f', type: { int: { scale: '40179', const: 'NaN' }},                                  description: 'Setpoint for minimum power factor value in quadrant 2. Default to pfrtgq2' },
        40165: { uid: '40165', label: 'pfminq3',         class: ModbusNumber, id: 40165,                           code: 's16', access: 'R', format: '%.1f', type: { int: { scale: '40179', const: 'NaN' }},                                  description: 'Setpoint for minimum power factor value in quadrant 3. Default to pfrtgq3' },
        40166: { uid: '40166', label: 'pfminq4',         class: ModbusNumber, id: 40166,                           code: 's16', access: 'R', format: '%.1f', type: { int: { scale: '40179' }},                                                description: 'Setpoint for minimum power factor value in quadrant 4. Default to pfrtgq4' },
        40167: { uid: '40167', label: 'varact',          class: ModbusNumber, id: 40167,                           code: 'u16', access: 'R', format: '%f',   type: { int: { const: 'NaN' }},                                                  description: 'Not supported' },
        40168: { uid: '40168', label: 'clctotva',        class: ModbusNumber, id: 40168,                           code: 'u16', access: 'R', format: '%f',   type: { int: { const: 'NaN' }},                                                  description: 'Not supported' },
        40169: { uid: '40169', label: 'maxrmprte',       class: ModbusNumber, id: 40169,                           code: 'u16', access: 'R', format: '%f',   type: { int: { const: 'NaN' }},                                                  description: 'Not supported' },
        40170: { uid: '40170', label: 'ecpnomhz',        class: ModbusNumber, id: 40170,                           code: 'u16', access: 'R', format: '%f',   type: { int: { const: 'NaN' }},                                                  description: 'Not supported' },
        40171: { uid: '40171', label: 'connph',          class: ModbusNumber, id: 40171,                           code: 'u16', access: 'R', format: '%f',   type: { int: { const: 'NaN' }},                                                  description: 'Not supported' },
        40172: { uid: '40172', label: 'wmax_sf',         class: ModbusNumber, id: 40172,                           code: 's16', access: 'R', format: '%d',                                                                                    description: 'Scale factor: Setting for maximum power output.' },
        40173: { uid: '40173', label: 'vref_sf',         class: ModbusNumber, id: 40173,                           code: 's16', access: 'R', format: '%d',                                                                                    description: 'Scale factor: Voltage at the PCC.' },
        40174: { uid: '40174', label: 'vrefofs_sf',      class: ModbusNumber, id: 40174,                           code: 's16', access: 'R', format: '%d',                                                                                    description: 'Scale factor: Offset from PCC to inverter.' },
        40175: { uid: '40175', label: 'vminmax_sf',      class: ModbusNumber, id: 40175,                           code: 's16', access: 'R', format: '%d',                                                                                    description: 'Scale factor: vmin and vmax' },
        40176: { uid: '40176', label: 'vamax_sf',        class: ModbusNumber, id: 40176,                           code: 's16', access: 'R', format: '%d',                                                                                    description: 'Scale factor: Setpoint of maximum apparent power.' },
        40177: { uid: '40177', label: 'varmax_sf',       class: ModbusNumber, id: 40177,                           code: 's16', access: 'R', format: '%d',                                                                                    description: 'Scale factor: Setpoint of maximum reactive power.' },
        40178: { uid: '40178', label: 'wgra_sf',         class: ModbusNumber, id: 40178,                           code: 's16', access: 'R', format: '%d',                                                                                    description: 'Scale factor: Default ramp rate of change of active power.' },
        40179: { uid: '40179', label: 'pfmin_sf',        class: ModbusNumber, id: 40179,                           code: 's16', access: 'R', format: '%d',                                                                                    description: 'Scale factor: Setpoint for minimum power factor value in quadrant 1. Default to pfrtgq1' },
        40180: { uid: '40180', label: 'maxrmprte_sf',    class: ModbusNumber, id: 40180,                           code: 's16', access: 'R', format: '%d',                                                                                    description: 'Scale factor: Maximum ramp percentage.' },
        40181: { uid: '40181', label: 'ecpnomhz_sf',     class: ModbusNumber, id: 40181,                           code: 's16', access: 'R', format: '%d',                                                                                    description: 'Scale factor: Nominal frequency.' },

        // Extended Measurment and Status Model: int+SF
        40182: { uid: '40182', label: 'id',              class: ModbusNumber, id: 40182,                            code: 'u16', access: 'R', format: '%d',                                                  range: { values: [ 122 ] },      description: 'Fixed value 122 as identifier for a SunSpec Measurements_Status Model.' },
        40183: { uid: '40183', label: 'l',               class: ModbusNumber, id: 40183,                            code: 'u16', access: 'R', format: '%d',                                                  range: { values: [ 44 ] },       description: 'Length of Status Model.' },
        40184: { uid: '40184', label: 'pvconn',          class: ModbusNumber, id: 40184,                            code: 'u16', access: 'R', format: '%d',                                                  range: { min: 0, max: 15 },      description: 'PV inverter present/available status.' },
        40185: { uid: '40185', label: 'storconn',        class: ModbusNumber, id: 40185,                            code: 'u16', access: 'R', format: '%d',                                                  range: { min: 0, max: 7 },       description: 'Storage inverter present/available status' },
        40186: { uid: '40186', label: 'ecpconn',         class: ModbusNumber, id: 40186,                            code: 'u16', access: 'R', format: '%d',                                                  range: { min: 0, max: 1 },       description: 'ECP connection status.' },
        40187: { uid: '40187', label: 'actwh',           class: ModbusNumber, id: [{ first: 40187, last: 40190 }],  code: 'u64', access: 'R', format: '%.0f',                                  unit: 'Wh',                                    description: 'AC lifetime active energy output.' },
        40191: { uid: '40191', label: 'actvah',          class: ModbusNumber, id: [{ first: 40191, last: 40194 }],  code: 'u64', access: 'R', format: '%.0f', type: { int: { const: 'NaN' }},  unit: 'VAh',                                   description: 'Not supported (AC lifetime apparent energy output).' },
        40195: { uid: '40195', label: 'actvarhq1',       class: ModbusNumber, id: [{ first: 40195, last: 40198 }],  code: 'u64', access: 'R', format: '%.0f', type: { int: { const: 'NaN' }},  unit: 'varh',                                  description: 'Not supported (AC lifetime reactive energy output quadrant 1).' },
        40199: { uid: '40199', label: 'actvarhq2',       class: ModbusNumber, id: [{ first: 40199, last: 40202 }],  code: 'u64', access: 'R', format: '%.0f', type: { int: { const: 'NaN' }},  unit: 'varh',                                  description: 'Not supported (AC lifetime reactive energy output quadrant 2).' },
        40203: { uid: '40203', label: 'actvarhq3',       class: ModbusNumber, id: [{ first: 40203, last: 40206 }],  code: 'u64', access: 'R', format: '%.0f', type: { int: { const: 'NaN' }},  unit: 'varh',                                  description: 'Not supported (AC lifetime reactive energy output quadrant 3).' },
        40207: { uid: '40207', label: 'actvarhq4',       class: ModbusNumber, id: [{ first: 40207, last: 40210 }],  code: 'u64', access: 'R', format: '%.0f', type: { int: { const: 'NaN' }},  unit: 'varh',                                  description: 'Not supported (AC lifetime reactive energy output quadrant 4).' },
        40211: { uid: '40211', label: 'varaval',         class: ModbusNumber, id: 40211,                            code: 's16', access: 'R', format: '%f',   type: { int: { scale: '40212', const: 'NaN' }},                                 description: 'Not supported (Amount of VARs available without impacting watts output' },
        40212: { uid: '40212', label: 'varaval_sf',      class: ModbusNumber, id: 40212,                            code: 's16', access: 'R', format: '%d',                                                                                   description: 'Scale factor for varvval (not supported).' },
        40213: { uid: '40213', label: 'waval',           class: ModbusNumber, id: 40213,                            code: 'u16', access: 'R', format: '%f',   type: { int: { scale: '40214', const: 'NaN' }},                                 description: 'Not supported (Amount of Watts available).' },
        40214: { uid: '40214', label: 'waval_sf',        class: ModbusNumber, id: 40214,                            code: 's16', access: 'R', format: '%d',                                                                                   description: 'Scale factor for waval (not supported).' },
        40215: { uid: '40215', label: 'stsetlimmsk',     class: ModbusNumber, id: [{ first: 40215, last: 40216 }],  code: 'u32', access: 'R', format: '%d',   type: { int: { const: 'NaN' }},                                                  description: 'Not supported (Bit Mask indicating setpoint limit(s) reached. Bits are persistent and must be cleared by the controller)' },
        40217: { uid: '40217', label: 'stactctl',        class: ModbusNumber, id: [{ first: 40217, last: 40218 }],  code: 'u32', access: 'R', format: '%d',                                                                                   description: 'Storage inverter present/available status' },
        40219: { uid: '40219', label: 'tmsrc',           class: ModbusString, id: [{ first: 40219, last: 40222 }],  code: 'string', access: 'R', format: '%s',                                                                                description: 'Source of time synchronization.' },
        40223: { uid: '40223', label: 'tms',             class: ModbusNumber, id: [{ first: 40223, last: 40224 }],  code: 'u32', access: 'R', format: '%d',                                                                                   description: 'Seconds since 01-01-2000 00:00 UTC' },
        40225: { uid: '40225', label: 'riso',            class: ModbusNumber, id: 40225,                            code: 'u16', access: 'R', format: '%f', type: { int: { scale: '40225', const: 'NaN' }},                                   description: 'Not supported (Isolation resistance)' },
        40226: { uid: '40226', label: 'riso_sf',         class: ModbusNumber, id: 40226,                            code: 's16', access: 'R', format: '%d',                                                                                   description: 'Scale factor: Isolation resistance (not supported)' },

        // Immediate Controls Model: int+SF
        40228: { uid: '40228', label: 'id',                 class: ModbusNumber, id: 40228,                            code: 'u16', access: 'R',   format: '%d',                                                range: { values: [ 123 ] },      description: 'Fixed value 123 as identifier for a SunSpec Immediate Controls Model' },
        40229: { uid: '40229', label: 'l',                  class: ModbusNumber, id: 40229,                            code: 'u16', access: 'R',   format: '%d',                                                range: { values: [ 24 ] },       description: 'Length of Immediate Controls Model' },
        40230: { uid: '40230', label: 'conn_wintms',        class: ModbusNumber, id: 40230,                            code: 'u16', access: 'R/W', format: '%d', unit: 's',                                     range: { min: 0, max: 300 },     description: 'Time window for connect/disconnect.' },
        40231: { uid: '40231', label: 'conn_rvrttms',       class: ModbusNumber, id: 40231,                            code: 'u16', access: 'R/W', format: '%d', unit: 's',                                     range: { min: 0, max: 28800 },   description: 'Timeout period for connnect/disconnect' },
        40232: { uid: '40232', label: 'conn',               class: ModbusNumber, id: 40232,                            code: 'u16', access: 'R/W', format: '%d',                                                range: { min: 0, max: 1 },       description: 'Connection control' },
        40233: { uid: '40233', label: 'wmaxlimpct',         class: ModbusNumber, id: 40233,                            code: 'u16', access: 'R/W', format: '%d', type: { int: { scale: '40251' }}, unit: '%',                                    description: 'Set power output to specified level in percent of wmax' },
        40234: { uid: '40234', label: 'wmaxlimpct_wintms',  class: ModbusNumber, id: 40234,                            code: 'u16', access: 'R/W', format: '%d', unit: 's',                                     range: { min: 0, max: 300 },     description: 'Time window for power limit change' },
        40235: { uid: '40235', label: 'wmaxlimpct_rvrttms', class: ModbusNumber, id: 40235,                            code: 'u16', access: 'R/W', format: '%d', unit: 's',                                     range: { min: 0, max: 28800 },   description: 'Timeout period for power limit' },
        40236: { uid: '40236', label: 'wmaxlimpct_rmptmss', class: ModbusNumber, id: 40236,                            code: 'u16', access: 'R/W', format: '%d', type: { int: { const: 'NaN' }}, unit: 's',                                      description: 'Not supported (Ramp time for moving from current setpoint to new setpoint)' },
        40237: { uid: '40237', label: 'wmaxlim_ena',        class: ModbusNumber, id: 40237,                            code: 'u16', access: 'R/W', format: '%d',                                                range: { min: 0, max: 1 },       description: 'Throttle enable/disable control' },
        40238: { uid: '40238', label: 'outpfset',           class: ModbusNumber, id: 40238,                            code: 's16', access: 'R/W', format: '%f', type: { int: { scale: '40252' }},                                               description: 'Set power factor to specific value in range 0.8 .. -0.8' },
        40239: { uid: '40239', label: 'outpfset_wintms',    class: ModbusNumber, id: 40239,                            code: 'u16', access: 'R/W', format: '%d', unit: 's',                                     range: { min: 0, max: 300 },     description: 'Time window for power factor change' },
        40240: { uid: '40240', label: 'outpfset_rvrttms',   class: ModbusNumber, id: 40240,                            code: 'u16', access: 'R/W', format: '%d', unit: 's',                                     range: { min: 0, max: 28800 },   description: 'Time period for power factor' },
        40241: { uid: '40241', label: 'outpfset_rmptms',    class: ModbusNumber, id: 40241,                            code: 'u16', access: 'R',   format: '%d', type: { int: { const: 'NaN' }}, unit: 's',                                      description: 'Not supported (Ramp time for moving from current setpoint to new setpoint)' },
        40242: { uid: '40242', label: 'outpfset_ena',       class: ModbusNumber, id: 40242,                            code: 'u16', access: 'R/W', format: '%f',                                                range: { min: 0, max: 1 },       description: 'Fixed power factor enabled / disabled' },
        40243: { uid: '40243', label: 'varwmaxpct',         class: ModbusNumber, id: 40243,                            code: 's16', access: 'R',   format: '%d', type: { int: { const: 'NaN' }},                                                 description: 'Not supported (Reactive power in percent of wmax)' },
        40244: { uid: '40244', label: 'varmaxpct',          class: ModbusNumber, id: 40244,                            code: 's16', access: 'R/W', format: '%f', type: { int: { scale: '40253' }}, unit: '%',                                    description: 'Reactive power in percent of varmax' },
        40245: { uid: '40245', label: 'varavalpct',         class: ModbusNumber, id: 40245,                            code: 's16', access: 'R',   format: '%f', type: { int: { scale: '40253', const: 'NaN' }}, unit: '%',                      description: 'Not supported (Reactive power in percent of varaval)' },
        40246: { uid: '40246', label: 'varpct_wintms',      class: ModbusNumber, id: 40246,                            code: 'u16', access: 'R/W', format: '%d', unit: 's',                                     range: { min: 0, max: 300 },     description: 'Time window for var limit change' },
        40247: { uid: '40247', label: 'varpct_rvrttms',     class: ModbusNumber, id: 40247,                            code: 'u16', access: 'R/W', format: '%d', unit: 's',                                     range: { min: 0, max: 28800 },   description: 'Time period for var limit' },
        40248: { uid: '40248', label: 'varpct_rmptms',      class: ModbusNumber, id: 40248,                            code: 'u16', access: 'R',   format: '%d', type: { int: { const: 'NaN' }}, unit: 's',                                      description: 'Not supported (Ramp time for moving from current setpoint to new setpoint)' },
        40249: { uid: '40249', label: 'varpct_mod',         class: ModbusNumber, id: 40249,                            code: 'u16', access: 'R',   format: '%f',                                                                                 description: 'var limit mode as % of varmax' },
        40250: { uid: '40250', label: 'varpct_ena',         class: ModbusNumber, id: 40250,                            code: 'u16', access: 'R/W', format: '%d',                                                range: { min: 0, max: 1 },       description: 'Fixed var enable / disable control' },
        40251: { uid: '40251', label: 'wmaxlimpct_sf',      class: ModbusNumber, id: 40251,                            code: 's16', access: 'R',   format: '%d',                                                range: { values: [ 65534 ] },    description: 'Scale factor: power output percent' },
        40252: { uid: '40252', label: 'outpfset_sf',        class: ModbusNumber, id: 40252,                            code: 's16', access: 'R',   format: '%d',                                                range: { values: [ 65533 ] },    description: 'Scale factor: power factor' },
        40253: { uid: '40253', label: 'varpct_sf',          class: ModbusNumber, id: 40253,                            code: 's16', access: 'R',   format: '%d',                                                range: { values: [ 0 ] },        description: 'Scale factor: reactive power' },

        // Basic Storage Control Model: int+SF
        40304: { uid: '40304', label: 'id',                 class: ModbusNumber, id: 40304,                            code: 'u16', access: 'R',   format: '%d',                                                range: { values: [ 124 ] },      description: 'Fixed value 124 as identifier for a SunSpec Storage Controls' },
        40305: { uid: '40305', label: 'l',                  class: ModbusNumber, id: 40305,                            code: 'u16', access: 'R',   format: '%d',                                                range: { values: [ 24 ] },       description: 'Length of Storage Controls Model' },
        40306: { uid: '40306', label: 'wchamax',            class: ModbusNumber, id: 40306,                            code: 'u16', access: 'R',   format: '%f', type: { int: { scale: '40322' }}, unit: 'W',                                    description: 'Setpoint for maximum charge' },
        40307: { uid: '40307', label: 'wchagra',            class: ModbusNumber, id: 40307,                            code: 'u16', access: 'R',   format: '%f', type: { int: { scale: '40323' }}, unit: '%',                                    description: 'Setpoint for maximum charging rate in percent of wchamax/sec. Default is maxcharte.' },
        40308: { uid: '40308', label: 'wdischagra',         class: ModbusNumber, id: 40308,                            code: 'u16', access: 'R',   format: '%f', type: { int: { scale: '40323' }}, unit: '%',                                    description: 'Setpoint for maximum discharging rate in percent of wchamax/sec. Default is maxdischarte.' },
        40309: { uid: '40309', label: 'storctl_mod',        class: ModbusNumber, id: 40309,                            code: 'u16', access: 'R/W', format: '%d',                                                range: { min: 0, max: 1 },       description: 'Activate storage control (0=charge, 1=discharge).' },
        40310: { uid: '40310', label: 'vachamax',           class: ModbusNumber, id: 40310,                            code: 'u16', access: 'R',   format: '%d', type: { int: { const: 'NaN' }}, unit: 'VA',                                     description: 'Not supported (Setpoint for maximum charging VA).' },
        40311: { uid: '40311', label: 'minrsvpct',          class: ModbusNumber, id: 40311,                            code: 'u16', access: 'R/W', format: '%f', type: { int: { scale: '40325' }}, unit: '%',                                    description: 'Setpoint for minimum reserve for storage as a percentage of the nominal maximum storage. If a higher value is set on the web interface, the register value set here is not accepted.' },
        40312: { uid: '40312', label: 'chastate',           class: ModbusNumber, id: 40312,                            code: 'u16', access: 'R',   format: '%f', type: { int: { scale: '40326' }}, unit: '%',                                    description: 'Currently available energy as a percent of the capacity rating.' },
        40313: { uid: '40313', label: 'storaval',           class: ModbusNumber, id: 40313,                            code: 'u16', access: 'R',   format: '%f', type: { int: { scale: '40327', const: 'NaN' }}, unit: 'Ah',                     description: 'Not supported (State of charge).' },
        40314: { uid: '40314', label: 'inbatv',             class: ModbusNumber, id: 40314,                            code: 'u16', access: 'R',   format: '%f', type: { int: { scale: '40328', const: 'NaN' }}, unit: 'V',                      description: 'Not supported (Internal battery voltage).' },
        40315: { uid: '40315', label: 'chast',              class: ModbusNumber, id: 40315,                            code: 'u16', access: 'R',   format: '%d',                                                range: { min: 0, max: 7 },       description: 'Charge status of storage device.' },
        40316: { uid: '40316', label: 'outwrte',            class: ModbusNumber, id: 40316,                            code: 's16', access: 'R/W', format: '%f', type: { int: { scale: '40329' }}, unit: '%',                                    description: 'Percent of max. discharge rate in percent of wchamax.' },
        40317: { uid: '40317', label: 'inwrte',             class: ModbusNumber, id: 40317,                            code: 's16', access: 'R/W', format: '%f', type: { int: { scale: '40329' }}, unit: '%',                                    description: 'Percent of max. charging rate in percent of wchamax.' },
        40318: { uid: '40318', label: 'inoutwrte_wintms',   class: ModbusNumber, id: 40318,                            code: 'u16', access: 'R',   format: '%d', type: { int: { const: 'NaN' }}, unit: 's',                                      description: 'Not supported (Time window for charge/discharge rate)' },
        40319: { uid: '40319', label: 'inoutwrte_rvrttms',  class: ModbusNumber, id: 40319,                            code: 'u16', access: 'R',   format: '%d', type: { int: { const: 'NaN' }}, unit: 's',                                      description: 'Not supported (Time period for charge/discharge rate)' },
        40320: { uid: '40320', label: 'inoutwrte_rmptms',   class: ModbusNumber, id: 40320,                            code: 'u16', access: 'R',   format: '%d', type: { int: { const: 'NaN' }}, unit: 's',                                      description: 'Not supported (Ramp time for moving from current setpoint to new setpoint)' },
        40321: { uid: '40321', label: 'chagriset',          class: ModbusNumber, id: 40321,                            code: 'u16', access: 'R/W', format: '%d',                                                range: { min: 0, max: 1 },       description: 'Setpoint to charging from grid (0=disabled, 1=enabled)' },
        40322: { uid: '40322', label: 'wchamax_sf',         class: ModbusNumber, id: 40322,                            code: 's16', access: 'R',   format: '%d',                                                range: { values: [ 0 ] },        description: 'Scale factor: wchamax' },
        40323: { uid: '40323', label: 'wchadischagra_sf',   class: ModbusNumber, id: 40323,                            code: 's16', access: 'R',   format: '%d',                                                range: { values: [ 0 ] },        description: 'Scale factor: wchagra, wdischagra' },
        40324: { uid: '40324', label: 'vachamax_sf',        class: ModbusNumber, id: 40324,                            code: 's16', access: 'R',   format: '%d',                                                range: { values: [ 0 ] },        description: 'Scale factor: vachamax' },
        40325: { uid: '40325', label: 'minrsvpct_sf',       class: ModbusNumber, id: 40325,                            code: 's16', access: 'R',   format: '%d',                                                range: { values: [ 0 ] },        description: 'Scale factor: minrsvpct' },
        40326: { uid: '40326', label: 'chastate_sf',        class: ModbusNumber, id: 40326,                            code: 's16', access: 'R',   format: '%d',                                                range: { values: [ 0 ] },        description: 'Scale factor: chastate' },
        40327: { uid: '40327', label: 'storaval_sf',        class: ModbusNumber, id: 40327,                            code: 's16', access: 'R',   format: '%d',                                                range: { values: [ 0 ] },        description: 'Scale factor: storaval' },
        40328: { uid: '40328', label: 'inbatv_sf',          class: ModbusNumber, id: 40328,                            code: 's16', access: 'R',   format: '%d',                                                range: { values: [ 0 ] },        description: 'Scale factor: inbatv' },
        40329: { uid: '40329', label: 'inoutwrte_sf',       class: ModbusNumber, id: 40329,                            code: 's16', access: 'R',   format: '%d',                                                range: { values: [ 0 ] },        description: 'Scale factor: inwrte' },

        // Multiple MPPT Inverter Extension Model: int+SF
        40254: { uid: '40254', label: 'id',                 class: ModbusNumber, id: 40254,                            code: 'u16', access: 'R', format: '%d',                                                  range: { values: [ 160 ] },      description: 'Fixed value 160 as identifier for a SunSpec Inverter Extendsion Model' },
        40255: { uid: '40255', label: 'l',                  class: ModbusNumber, id: 40255,                            code: 'u16', access: 'R', format: '%d',                                                  range: { values: [ 48 ] },       description: 'Length of Inverter Extendsion Model' },
        40256: { uid: '40256', label: 'dca_sf',             class: ModbusNumber, id: 40256,                            code: 's16', access: 'R', format: '%d',                                                                                   description: 'Scale Factor: current' },
        40257: { uid: '40257', label: 'dcv_sf',             class: ModbusNumber, id: 40257,                            code: 's16', access: 'R', format: '%d',                                                                                   description: 'Scale Factor: voltage' },
        40258: { uid: '40258', label: 'dcw_sf',             class: ModbusNumber, id: 40258,                            code: 's16', access: 'R', format: '%d',                                                                                   description: 'Scale Factor: power' },
        40259: { uid: '40259', label: 'dcwh_sf',            class: ModbusNumber, id: 40259,                            code: 's16', access: 'R', format: '%d',                                                                                   description: 'Scale Factor: energy' },
        40260: { uid: '40260', label: 'evt',                class: ModbusNumber, id: [{ first: 40260, last: 40261 }],  code: 'u32', access: 'R', format: '%d',                                                                                   description: 'Global events' },
        40262: { uid: '40262', label: 'n',                  class: ModbusNumber, id: 40262,                            code: 'u16', access: 'R', format: '%d',                                                  range: { values: [ 2 ] },        description: 'Number of modules' },
        40263: { uid: '40263', label: 'tmsper',             class: ModbusNumber, id: 40263,                            code: 'u16', access: 'R', format: '%d', type: { int: { const: 'NaN' }},                                                   description: 'Not supported (Timestamp period)' },
        40264: { uid: '40264', label: 'id_1',               class: ModbusNumber, id: 40264,                            code: 'u16',    access: 'R', format: '%d',                                               range: { values: [ 1 ] },        description: 'String 1: Input Id' },
        40265: { uid: '40265', label: 'idstr_1',            class: ModbusString, id: [{ first: 40265, last: 40272 }],  code: 'string', access: 'R', format: '%s',                                                                                description: 'String 1: Innut Id String' },
        40273: { uid: '40273', label: 'dca_1',              class: ModbusNumber, id: 40273,                            code: 'u16',    access: 'R', format: '%.1f', type: { int: { scale: '40256' }}, unit: 'A',                                 description: 'String 1: DC current' },
        40274: { uid: '40274', label: 'dcv_1',              class: ModbusNumber, id: 40274,                            code: 'u16',    access: 'R', format: '%.1f', type: { int: { scale: '40257' }}, unit: 'V',                                 description: 'String 1: DC voltage' },
        40275: { uid: '40275', label: 'dcw_1',              class: ModbusNumber, id: 40275,                            code: 'u16',    access: 'R', format: '%.1f', type: { int: { scale: '40258' }}, unit: 'W',                                 description: 'String 1: DC power' },
        40276: { uid: '40276', label: 'dcwh_1',             class: ModbusNumber, id: [{ first: 40276, last: 40277 }],  code: 'u32',    access: 'R', format: '%.2f', type: { int: { scale: '40259', const: 'NaN' }}, unit: 'Wh',                  description: 'Not supported? (String 1: DC lifetime energy)' },
        40278: { uid: '40278', label: 'tms_1',              class: ModbusNumber, id: [{ first: 40278, last: 40279 }],  code: 'u32',    access: 'R', format: '%d',   unit: 's',                                                                   description: 'String 1: timestamp' },
        40280: { uid: '40280', label: 'tmp_1',              class: ModbusNumber, id: 40280,                            code: 's16',    access: 'R', format: '%d',   type: { int: { const: 'NaN' }}, unit: '°C',                                  description: 'Not supported (String 1: temperature)' },
        40281: { uid: '40281', label: 'dcst_1',             class: ModbusNumber, id: 40281,                            code: 'u16',    access: 'R', format: '%d',                                               range: { min: 0, max: 8 },       description: 'String 1: operating state' },
        40282: { uid: '40282', label: 'dcevt_1',            class: ModbusNumber, id: [{ first: 40282, last: 40283 }],  code: 'u32',    access: 'R', format: '%d',   type: { int: { const: 'NaN' }},                                               description: 'Not supported (String 1: module events)' },
        40284: { uid: '40284', label: 'id_2',               class: ModbusNumber, id: 40284,                            code: 'u16',    access: 'R', format: '%d',                                               range: { values: [ 1 ] },        description: 'String 2: Input Id' },
        40285: { uid: '40285', label: 'idstr_2',            class: ModbusString, id: [{ first: 40285, last: 40292 }],  code: 'string', access: 'R', format: '%s',                                                                                description: 'String 2: Innut Id String' },
        40293: { uid: '40293', label: 'dca_2',              class: ModbusNumber, id: 40293,                            code: 'u16',    access: 'R', format: '%.1f', type: { int: { scale: '40256' }}, unit: 'A',                                 description: 'String 2: DC current' },
        40294: { uid: '40294', label: 'dcv_2',              class: ModbusNumber, id: 40294,                            code: 'u16',    access: 'R', format: '%.1f', type: { int: { scale: '40257' }}, unit: 'V',                                 description: 'String 2: DC voltage' },
        40295: { uid: '40295', label: 'dcw_2',              class: ModbusNumber, id: 40295,                            code: 'u16',    access: 'R', format: '%.1f', type: { int: { scale: '40258' }}, unit: 'W',                                 description: 'String 2: DC power' },
        40296: { uid: '40296', label: 'dcwh_2',             class: ModbusNumber, id: [{ first: 40296, last: 40297 }],  code: 'u32',    access: 'R', format: '%.2f', type: { int: { scale: '40259', const: 'NaN' }}, unit: 'Wh',                  description: 'Not supported? (String 2: DC lifetime energy)' },
        40298: { uid: '40298', label: 'tms_2',              class: ModbusNumber, id: [{ first: 40298, last: 40299 }],  code: 'u32',    access: 'R', format: '%d',   unit: 's',                                                                   description: 'String 2: timestamp' },
        40300: { uid: '40300', label: 'tmp_2',              class: ModbusNumber, id: 40300,                            code: 's16',    access: 'R', format: '%d',   type: { int: { const: 'NaN' }}, unit: '°C',                                  description: 'Not supported (String 2: temperature)' },
        40301: { uid: '40301', label: 'dcst_2',             class: ModbusNumber, id: 40301,                            code: 'u16',    access: 'R', format: '%d',                                               range: { min: 0, max: 8 },       description: 'String 2: operating state' },
        40302: { uid: '40302', label: 'dcevt_2',            class: ModbusNumber, id: [{ first: 40302, last: 40303 }],  code: 'u32',    access: 'R', format: '%d',   type: { int: { const: 'NaN' }},                                              description: 'Not supported (String 2: module events)' },

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
            evtvnd2: FroniusSymoModbusRegisters.regDefById[40116],
            evtvnd3: FroniusSymoModbusRegisters.regDefById[40118],
            evtvnd4: FroniusSymoModbusRegisters.regDefById[40120]
        },
        nameplate: {
            id:              FroniusSymoModbusRegisters.regDefById[40122],
            l:               FroniusSymoModbusRegisters.regDefById[40123],
            dertyp:          FroniusSymoModbusRegisters.regDefById[40124],
            wrtg:            FroniusSymoModbusRegisters.regDefById[40125],
            wrtg_sf:         FroniusSymoModbusRegisters.regDefById[40126],
            vatg:            FroniusSymoModbusRegisters.regDefById[40127],
            vatg_sf:         FroniusSymoModbusRegisters.regDefById[40128],
            vartgq1:         FroniusSymoModbusRegisters.regDefById[40129],
            vartgq2:         FroniusSymoModbusRegisters.regDefById[40130],
            vartgq3:         FroniusSymoModbusRegisters.regDefById[40131],
            vartgq4:         FroniusSymoModbusRegisters.regDefById[40132],
            vartgx_sf:       FroniusSymoModbusRegisters.regDefById[40133],
            artg:            FroniusSymoModbusRegisters.regDefById[40134],
            artg_sf:         FroniusSymoModbusRegisters.regDefById[40135],
            pfrtgq1:         FroniusSymoModbusRegisters.regDefById[40136],
            pfrtgq2:         FroniusSymoModbusRegisters.regDefById[40137],
            pfrtgq3:         FroniusSymoModbusRegisters.regDefById[40138],
            pfrtgq4:         FroniusSymoModbusRegisters.regDefById[40139],
            pfrtg_sf:        FroniusSymoModbusRegisters.regDefById[40140],
            whrtg:           FroniusSymoModbusRegisters.regDefById[40141],
            whrtg_sf:        FroniusSymoModbusRegisters.regDefById[40142],
            ahrrtg:          FroniusSymoModbusRegisters.regDefById[40143],
            ahrrtg_sf:       FroniusSymoModbusRegisters.regDefById[40144],
            maxcharte:       FroniusSymoModbusRegisters.regDefById[40145],
            maxcharte_sf:    FroniusSymoModbusRegisters.regDefById[40146],
            maxdischarte:    FroniusSymoModbusRegisters.regDefById[40147],
            maxdischarte_sf: FroniusSymoModbusRegisters.regDefById[40148],
            pad:             FroniusSymoModbusRegisters.regDefById[40149]
        },
        settings: {
            id:           FroniusSymoModbusRegisters.regDefById[40150],
            l:            FroniusSymoModbusRegisters.regDefById[40151],
            wmax:         FroniusSymoModbusRegisters.regDefById[40152],
            vref:         FroniusSymoModbusRegisters.regDefById[40153],
            vrefofs:      FroniusSymoModbusRegisters.regDefById[40154],
            vmax:         FroniusSymoModbusRegisters.regDefById[40155],
            vmin:         FroniusSymoModbusRegisters.regDefById[40156],
            vamax:        FroniusSymoModbusRegisters.regDefById[40157],
            varmaxq1:     FroniusSymoModbusRegisters.regDefById[40158],
            varmaxq2:     FroniusSymoModbusRegisters.regDefById[40159],
            varmaxq3:     FroniusSymoModbusRegisters.regDefById[40160],
            varmaxq4:     FroniusSymoModbusRegisters.regDefById[40161],
            wgra:         FroniusSymoModbusRegisters.regDefById[40162],
            pfminq1:      FroniusSymoModbusRegisters.regDefById[40163],
            pfminq2:      FroniusSymoModbusRegisters.regDefById[40164],
            pfminq3:      FroniusSymoModbusRegisters.regDefById[40165],
            pfminq4:      FroniusSymoModbusRegisters.regDefById[40166],
            varact:       FroniusSymoModbusRegisters.regDefById[40167],
            clctotva:     FroniusSymoModbusRegisters.regDefById[40168],
            maxrmprte:    FroniusSymoModbusRegisters.regDefById[40169],
            ecpnomhz:     FroniusSymoModbusRegisters.regDefById[40170],
            connph:       FroniusSymoModbusRegisters.regDefById[40171],
            wmax_sf:      FroniusSymoModbusRegisters.regDefById[40172],
            vref_sf:      FroniusSymoModbusRegisters.regDefById[40173],
            vrefofs_sf:   FroniusSymoModbusRegisters.regDefById[40174],
            vminmax_sf:   FroniusSymoModbusRegisters.regDefById[40175],
            vamax_sf:     FroniusSymoModbusRegisters.regDefById[40176],
            varmax_sf:    FroniusSymoModbusRegisters.regDefById[40177],
            wgra_sf:      FroniusSymoModbusRegisters.regDefById[40178],
            pfmin_sf:     FroniusSymoModbusRegisters.regDefById[40179],
            maxrmprte_sf: FroniusSymoModbusRegisters.regDefById[40180],
            ecpnomhz_sf:  FroniusSymoModbusRegisters.regDefById[40181]
        },
        status: {
            id:         FroniusSymoModbusRegisters.regDefById[40182],
            l:          FroniusSymoModbusRegisters.regDefById[40183],
            pvConn:     FroniusSymoModbusRegisters.regDefById[40184],
            storconn:   FroniusSymoModbusRegisters.regDefById[40185],
            ecpconn:    FroniusSymoModbusRegisters.regDefById[40186],
            actwh:      FroniusSymoModbusRegisters.regDefById[40187],
            actvah:     FroniusSymoModbusRegisters.regDefById[40191],
            actvarhq1:  FroniusSymoModbusRegisters.regDefById[40195],
            actvarhq2:  FroniusSymoModbusRegisters.regDefById[40199],
            actvarhq3:  FroniusSymoModbusRegisters.regDefById[40203],
            actvarhq4:  FroniusSymoModbusRegisters.regDefById[40207],
            varaval:    FroniusSymoModbusRegisters.regDefById[40211],
            varaval_sf: FroniusSymoModbusRegisters.regDefById[40212],
            waval:      FroniusSymoModbusRegisters.regDefById[40213],
            waval_sf:   FroniusSymoModbusRegisters.regDefById[40214],
            stsetlimms: FroniusSymoModbusRegisters.regDefById[40215],
            stactctl:   FroniusSymoModbusRegisters.regDefById[40217],
            tmsrc:      FroniusSymoModbusRegisters.regDefById[40219],
            tms:        FroniusSymoModbusRegisters.regDefById[40223],
            riso:       FroniusSymoModbusRegisters.regDefById[40225],
            riso_sf:    FroniusSymoModbusRegisters.regDefById[40226]
        },
        control: {
            id:                 FroniusSymoModbusRegisters.regDefById[40228],
            l:                  FroniusSymoModbusRegisters.regDefById[40229],
            conn_wintms:        FroniusSymoModbusRegisters.regDefById[40230],
            conn_rvrttms:       FroniusSymoModbusRegisters.regDefById[40231],
            conn:               FroniusSymoModbusRegisters.regDefById[40232],
            wmaxlimpct:         FroniusSymoModbusRegisters.regDefById[40233],
            wmaxlimpct_wintms:  FroniusSymoModbusRegisters.regDefById[40234],
            wmaxlimpct_rvrttms: FroniusSymoModbusRegisters.regDefById[40235],
            wmaxlimpct_rmptmss: FroniusSymoModbusRegisters.regDefById[40236],
            wmaxlim_ena:        FroniusSymoModbusRegisters.regDefById[40237],
            outpfset:           FroniusSymoModbusRegisters.regDefById[40238],
            outpfset_wintms:    FroniusSymoModbusRegisters.regDefById[40239],
            outpfset_rvrttms:   FroniusSymoModbusRegisters.regDefById[40240],
            outpfset_rmptms:    FroniusSymoModbusRegisters.regDefById[40241],
            outpfset_ena:       FroniusSymoModbusRegisters.regDefById[40242],
            varwmaxpct:         FroniusSymoModbusRegisters.regDefById[40243],
            varmaxpct:          FroniusSymoModbusRegisters.regDefById[40244],
            varavalpct:         FroniusSymoModbusRegisters.regDefById[40245],
            varpct_wintms:      FroniusSymoModbusRegisters.regDefById[40246],
            varpct_rvrttms:     FroniusSymoModbusRegisters.regDefById[40247],
            varpct_rmptms:      FroniusSymoModbusRegisters.regDefById[40248],
            varpct_mod:         FroniusSymoModbusRegisters.regDefById[40249],
            varpct_ena:         FroniusSymoModbusRegisters.regDefById[40250],
            wmaxlimpct_sf:      FroniusSymoModbusRegisters.regDefById[40251],
            outpfset_sf:        FroniusSymoModbusRegisters.regDefById[40252],
            varpct_sf:          FroniusSymoModbusRegisters.regDefById[40253],
        },
        storage: {
            id:                FroniusSymoModbusRegisters.regDefById[40304],
            l:                 FroniusSymoModbusRegisters.regDefById[40305],
            wchamax:           FroniusSymoModbusRegisters.regDefById[40306],
            wchagra:           FroniusSymoModbusRegisters.regDefById[40307],
            wdischagra:        FroniusSymoModbusRegisters.regDefById[40308],
            storctl_mod:       FroniusSymoModbusRegisters.regDefById[40309],
            vachamax:          FroniusSymoModbusRegisters.regDefById[40310],
            minrsvpct:         FroniusSymoModbusRegisters.regDefById[40311],
            chastate:          FroniusSymoModbusRegisters.regDefById[40312],
            storaval:          FroniusSymoModbusRegisters.regDefById[40313],
            inbatv:            FroniusSymoModbusRegisters.regDefById[40314],
            chast:             FroniusSymoModbusRegisters.regDefById[40315],
            outwrte:           FroniusSymoModbusRegisters.regDefById[40316],
            inwrte:            FroniusSymoModbusRegisters.regDefById[40317],
            inoutwrte_wintms:  FroniusSymoModbusRegisters.regDefById[40318],
            inoutwrte_rvrttms: FroniusSymoModbusRegisters.regDefById[40319],
            inoutwrte_rmptms:  FroniusSymoModbusRegisters.regDefById[40320],
            chagriset:         FroniusSymoModbusRegisters.regDefById[40321],
            wchamax_sf:        FroniusSymoModbusRegisters.regDefById[40322],
            wchadischagra_sf:  FroniusSymoModbusRegisters.regDefById[40323],
            vachamax_sf:       FroniusSymoModbusRegisters.regDefById[40324],
            minrsvpct_sf:      FroniusSymoModbusRegisters.regDefById[40325],
            chastate_sf:       FroniusSymoModbusRegisters.regDefById[40326],
            storaval_sf:       FroniusSymoModbusRegisters.regDefById[40327],
            inbatv_sf:         FroniusSymoModbusRegisters.regDefById[40328],
            inoutwrte_sf:      FroniusSymoModbusRegisters.regDefById[40329]
        },
        inverterExtension: {
            id:      FroniusSymoModbusRegisters.regDefById[40254],
            l:       FroniusSymoModbusRegisters.regDefById[40255],
            dca_sf:  FroniusSymoModbusRegisters.regDefById[40256],
            dcv_sf:  FroniusSymoModbusRegisters.regDefById[40257],
            dcw_sf:  FroniusSymoModbusRegisters.regDefById[40258],
            dcwh_sf: FroniusSymoModbusRegisters.regDefById[40259],
            evt:     FroniusSymoModbusRegisters.regDefById[40260],
            n:       FroniusSymoModbusRegisters.regDefById[40262],
            tmsper:  FroniusSymoModbusRegisters.regDefById[40263],
            id_1:    FroniusSymoModbusRegisters.regDefById[40264],
            idstr_1: FroniusSymoModbusRegisters.regDefById[40265],
            dca_1:   FroniusSymoModbusRegisters.regDefById[40273],
            dcv_1:   FroniusSymoModbusRegisters.regDefById[40274],
            dcw_1:   FroniusSymoModbusRegisters.regDefById[40275],
            dcwh_1:  FroniusSymoModbusRegisters.regDefById[40276],
            tms_1:   FroniusSymoModbusRegisters.regDefById[40278],
            tmp_1:   FroniusSymoModbusRegisters.regDefById[40280],
            dcst_1:  FroniusSymoModbusRegisters.regDefById[40281],
            dcevt_1: FroniusSymoModbusRegisters.regDefById[40282],
            id_2:    FroniusSymoModbusRegisters.regDefById[40284],
            idstr_2: FroniusSymoModbusRegisters.regDefById[40285],
            dca_2:   FroniusSymoModbusRegisters.regDefById[40293],
            dcv_2:   FroniusSymoModbusRegisters.regDefById[40294],
            dcw_2:   FroniusSymoModbusRegisters.regDefById[40295],
            dcwh_2:  FroniusSymoModbusRegisters.regDefById[40296],
            tms_2:   FroniusSymoModbusRegisters.regDefById[40298],
            tmp_2:   FroniusSymoModbusRegisters.regDefById[40300],
            dcst_2:  FroniusSymoModbusRegisters.regDefById[40301],
            dcevt_2: FroniusSymoModbusRegisters.regDefById[40302]
        }
    };
}

