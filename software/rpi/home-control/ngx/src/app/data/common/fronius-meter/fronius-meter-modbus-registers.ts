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

export type FroniusMeterModbusIds =

    // Meter Model: int+SF
    40070 | 40071 | 40072 | 40073 | 40074 | 40075 | 40076 | 40077 | 40078 | 40079 |
    40080 | 40081 | 40082 | 40083 | 40084 | 40085 | 40086 | 40087 | 40088 | 40089 |
    40090 | 40091 | 40092 | 40093 | 40094 | 40095 | 40096 | 40097 | 40098 | 40099 |
    40100 | 40101 | 40102 | 40103 | 40104 | 40105 | 40106 | 40107 | 40108 |
    40110 |         40112 |         40114 |         40116 |         40118 |
    40120 |         40122 |         40124 | 40125 |         40127 |         40129 |
            40131 |         40133 |         40135 |         40137 |         40139 |
            40141 | 40142 |         40144 |         40146 |         40148 |
    40150 |         40152 |         40154 |         40156 |         40158 |
    40160 |         40162 |         40164 |         40166 |         40168 |
    40170 |         40172 |         40174 | 40175
    ;

export interface IFroniusMeterDefinition {
    id:             IRegisterDefinition;
    l:              IRegisterDefinition;
    a:              IRegisterDefinition;
    apha:           IRegisterDefinition;
    aphb:           IRegisterDefinition;
    aphc:           IRegisterDefinition;
    a_sf:           IRegisterDefinition;
    phv:            IRegisterDefinition;
    phvpha:         IRegisterDefinition;
    phvphb:         IRegisterDefinition;
    phvphc:         IRegisterDefinition;
    ppv:            IRegisterDefinition;
    ppvphab:        IRegisterDefinition;
    ppvphbc:        IRegisterDefinition;
    ppvphca:        IRegisterDefinition;
    v_sf:           IRegisterDefinition;
    hz:             IRegisterDefinition;
    hz_sf:          IRegisterDefinition;
    w:              IRegisterDefinition;
    wpha:           IRegisterDefinition;
    wphb:           IRegisterDefinition;
    wphc:           IRegisterDefinition;
    w_sf:           IRegisterDefinition;
    va:             IRegisterDefinition;
    vapha:          IRegisterDefinition;
    vaphb:          IRegisterDefinition;
    vaphc:          IRegisterDefinition;
    va_sf:          IRegisterDefinition;
    var:            IRegisterDefinition;
    varpha:         IRegisterDefinition;
    varphb:         IRegisterDefinition;
    varphc:         IRegisterDefinition;
    var_sf:         IRegisterDefinition;
    pf:             IRegisterDefinition;
    pfpha:          IRegisterDefinition;
    pfphb:          IRegisterDefinition;
    pfphc:          IRegisterDefinition;
    pf_sf:          IRegisterDefinition;
    totwhexp:       IRegisterDefinition;
    totwhexppha:    IRegisterDefinition;
    totwhexpphb:    IRegisterDefinition;
    totwhexpphc:    IRegisterDefinition;
    totwhimp:       IRegisterDefinition;
    totwhimppha:    IRegisterDefinition;
    totwhimpphb:    IRegisterDefinition;
    totwhimpphc:    IRegisterDefinition;
    totwh_sf:       IRegisterDefinition;
    totvahexp:      IRegisterDefinition;
    totvahexppha:   IRegisterDefinition;
    totvahexpphb:   IRegisterDefinition;
    totvahexpphc:   IRegisterDefinition;
    totvahimp:      IRegisterDefinition;
    totvahimppha:   IRegisterDefinition;
    totvahimpphb:   IRegisterDefinition;
    totvahimpphc:   IRegisterDefinition;
    totvah_sf:      IRegisterDefinition;
    totvarimpq1:    IRegisterDefinition;
    totvarimpq1pha: IRegisterDefinition;
    totvarimpq1phb: IRegisterDefinition;
    totvarimpq1phc: IRegisterDefinition;
    totvarimpq2:    IRegisterDefinition;
    totvarimpq2pha: IRegisterDefinition;
    totvarimpq2phb: IRegisterDefinition;
    totvarimpq2phc: IRegisterDefinition;
    totvarimpq3:    IRegisterDefinition;
    totvarimpq3pha: IRegisterDefinition;
    totvarimpq3phb: IRegisterDefinition;
    totvarimpq3phc: IRegisterDefinition;
    totvarimpq4:    IRegisterDefinition;
    totvarimpq4pha: IRegisterDefinition;
    totvarimpq4phb: IRegisterDefinition;
    totvarimpq4phc: IRegisterDefinition;
    totvarh_sf:     IRegisterDefinition;
    evt:            IRegisterDefinition;
}

export type FroniusMeterAttributes = keyof IFroniusMeterDefinition;

export class FroniusMeterRegisters {

    // tslint:disable:max-line-length
    static regDefById: { [ id in FroniusMeterModbusIds ]: IRegisterDefinition } =  {

        40070: { uid: '40070', label: 'id',             class: ModbusNumber, id: 40070,                           code: 'u16', access: 'R', format: '%d',                                                range: { values: [ 203 ] },           description: 'Fixed value 203 as identifier for a SunSpec 3phase meter' },
        40071: { uid: '40071', label: 'l',              class: ModbusNumber, id: 40071,                           code: 'u16', access: 'R', format: '%d',                                                range: { values: [ 105 ] },           description: 'Length of Meter Model' },
        40072: { uid: '40072', label: 'a',              class: ModbusNumber, id: 40072,                           code: 's16', access: 'R', format: '%.1f', type: { int: { scale: '40076' }}, unit: 'A',                                       description: 'AC total current value' },
        40073: { uid: '40073', label: 'apha',           class: ModbusNumber, id: 40073,                           code: 's16', access: 'R', format: '%.1f', type: { int: { scale: '40076' }}, unit: 'A',                                       description: 'AC phase a current value' },
        40074: { uid: '40074', label: 'aphb',           class: ModbusNumber, id: 40074,                           code: 's16', access: 'R', format: '%.1f', type: { int: { scale: '40076' }}, unit: 'A',                                       description: 'AC phase b current value' },
        40075: { uid: '40075', label: 'aphc',           class: ModbusNumber, id: 40075,                           code: 's16', access: 'R', format: '%.1f', type: { int: { scale: '40076' }}, unit: 'A',                                       description: 'AC phase c current value' },
        40076: { uid: '40076', label: 'a_sf',           class: ModbusNumber, id: 40076,                           code: 's16', access: 'R', format: '%d',                                                                                      description: 'Current value scale factor' },
        40077: { uid: '40077', label: 'phv',            class: ModbusNumber, id: 40077,                           code: 's16', access: 'R', format: '%.1f', type: { int: { scale: '40085' }}, unit: 'V',                                       description: 'AC voltage average phase-to-neutral value' },
        40078: { uid: '40078', label: 'phvpha',         class: ModbusNumber, id: 40078,                           code: 's16', access: 'R', format: '%.1f', type: { int: { scale: '40085' }}, unit: 'V',                                       description: 'AC voltage phase-A-to-neutral value' },
        40079: { uid: '40079', label: 'phvphb',         class: ModbusNumber, id: 40079,                           code: 's16', access: 'R', format: '%.1f', type: { int: { scale: '40085' }}, unit: 'V',                                       description: 'AC voltage phase-B-to-neutral value' },
        40080: { uid: '40080', label: 'phvphc',         class: ModbusNumber, id: 40080,                           code: 's16', access: 'R', format: '%.1f', type: { int: { scale: '40085' }}, unit: 'V',                                       description: 'AC voltage phase-C-to-neutral value' },
        40081: { uid: '40081', label: 'ppv',            class: ModbusNumber, id: 40081,                           code: 's16', access: 'R', format: '%.1f', type: { int: { scale: '40085' }}, unit: 'V',                                       description: 'AC voltage average phase-to-phase value' },
        40082: { uid: '40082', label: 'ppvphab',        class: ModbusNumber, id: 40082,                           code: 's16', access: 'R', format: '%.1f', type: { int: { scale: '40085' }}, unit: 'V',                                       description: 'AC voltage phase-AB value' },
        40083: { uid: '40083', label: 'ppvphbc',        class: ModbusNumber, id: 40083,                           code: 's16', access: 'R', format: '%.1f', type: { int: { scale: '40085' }}, unit: 'V',                                       description: 'AC voltage phase-BC value' },
        40084: { uid: '40084', label: 'ppvphca',        class: ModbusNumber, id: 40084,                           code: 's16', access: 'R', format: '%.1f', type: { int: { scale: '40085' }}, unit: 'V',                                       description: 'AC voltage phase-CA value' },
        40085: { uid: '40085', label: 'v_sf',           class: ModbusNumber, id: 40085,                           code: 's16', access: 'R', format: '%d',                                                                                      description: 'AC phase voltage scale factor' },
        40086: { uid: '40086', label: 'hz',             class: ModbusNumber, id: 40086,                           code: 's16', access: 'R', format: '%.1f', type: { int: { scale: '40087' }}, unit: 'Hz',                                      description: 'AC frequency value' },
        40087: { uid: '40087', label: 'hz_sf',          class: ModbusNumber, id: 40087,                           code: 's16', access: 'R', format: '%d',                                                                                      description: 'AC frequency scale factor' },
        40088: { uid: '40088', label: 'w',              class: ModbusNumber, id: 40088,                           code: 's16', access: 'R', format: '%.1f', type: { int: { scale: '40092' }}, unit: 'W',                                       description: 'AC power value' },
        40089: { uid: '40089', label: 'wpha',           class: ModbusNumber, id: 40089,                           code: 's16', access: 'R', format: '%.1f', type: { int: { scale: '40092' }}, unit: 'W',                                       description: 'AC power phase A value' },
        40090: { uid: '40090', label: 'wphb',           class: ModbusNumber, id: 40090,                           code: 's16', access: 'R', format: '%.1f', type: { int: { scale: '40092' }}, unit: 'W',                                       description: 'AC power phase B value' },
        40091: { uid: '40091', label: 'wphc',           class: ModbusNumber, id: 40091,                           code: 's16', access: 'R', format: '%.1f', type: { int: { scale: '40092' }}, unit: 'W',                                       description: 'AC power phase C value' },
        40092: { uid: '40092', label: 'w_sf',           class: ModbusNumber, id: 40092,                           code: 's16', access: 'R', format: '%d',                                                                                      description: 'AC phase power scale factor' },
        40093: { uid: '40093', label: 'va',             class: ModbusNumber, id: 40093,                           code: 's16', access: 'R', format: '%.1f', type: { int: { scale: '40097' }}, unit: 'VA',                                      description: 'AC apparent power value' },
        40094: { uid: '40094', label: 'vapha',          class: ModbusNumber, id: 40094,                           code: 's16', access: 'R', format: '%.1f', type: { int: { scale: '40097' }}, unit: 'VA',                                      description: 'AC apparent power phase a value' },
        40095: { uid: '40095', label: 'vaphb',          class: ModbusNumber, id: 40095,                           code: 's16', access: 'R', format: '%.1f', type: { int: { scale: '40097' }}, unit: 'VA',                                      description: 'AC apparent power phase b value' },
        40096: { uid: '40096', label: 'vaphc',          class: ModbusNumber, id: 40096,                           code: 's16', access: 'R', format: '%.1f', type: { int: { scale: '40097' }}, unit: 'VA',                                      description: 'AC apparent power phase c value' },
        40097: { uid: '40097', label: 'va_sf',          class: ModbusNumber, id: 40097,                           code: 's16', access: 'R', format: '%d',                                                                                      description: 'AC apparent power scale factor' },
        40098: { uid: '40098', label: 'var',            class: ModbusNumber, id: 40098,                           code: 's16', access: 'R', format: '%.1f', type: { int: { scale: '40102' }}, unit: 'var',                                     description: 'AC reactive power value' },
        40099: { uid: '40099', label: 'varpha',         class: ModbusNumber, id: 40099,                           code: 's16', access: 'R', format: '%.1f', type: { int: { scale: '40102' }}, unit: 'var',                                     description: 'AC reactive power phase a value' },
        40100: { uid: '40100', label: 'varphb',         class: ModbusNumber, id: 40100,                           code: 's16', access: 'R', format: '%.1f', type: { int: { scale: '40102' }}, unit: 'var',                                     description: 'AC reactive power phase b value' },
        40101: { uid: '40101', label: 'varphc',         class: ModbusNumber, id: 40101,                           code: 's16', access: 'R', format: '%.1f', type: { int: { scale: '40102' }}, unit: 'var',                                     description: 'AC reactive power phase c value' },
        40102: { uid: '40102', label: 'var_sf',         class: ModbusNumber, id: 40102,                           code: 's16', access: 'R', format: '%d',                                                                                      description: 'AC reactive power scale factor' },
        40103: { uid: '40103', label: 'pf',             class: ModbusNumber, id: 40103,                           code: 's16', access: 'R', format: '%.2f', type: { int: { scale: '40107' }},                                                  description: 'AC power factor value' },
        40104: { uid: '40104', label: 'pfpha',          class: ModbusNumber, id: 40104,                           code: 's16', access: 'R', format: '%.2f', type: { int: { scale: '40107' }},                                                  description: 'AC power factor phase a value' },
        40105: { uid: '40105', label: 'pfphb',          class: ModbusNumber, id: 40105,                           code: 's16', access: 'R', format: '%.2f', type: { int: { scale: '40107' }},                                                  description: 'AC power factor phase b value' },
        40106: { uid: '40106', label: 'pfphc',          class: ModbusNumber, id: 40106,                           code: 's16', access: 'R', format: '%.2f', type: { int: { scale: '40107' }},                                                  description: 'AC power factor phase c value' },
        40107: { uid: '40107', label: 'pf_sf',          class: ModbusNumber, id: 40107,                           code: 's16', access: 'R', format: '%d',                                                                                      description: 'AC power factor scale factor' },
        40108: { uid: '40108', label: 'totwhexp',       class: ModbusNumber, id: [{ first: 40108, last: 40109 }], code: 'u32', access: 'R', format: '%.0f', type: { int: { scale: '40124' }}, unit: 'Wh',                                      description: 'Total Watt-hours exported' },
        40110: { uid: '40110', label: 'totwhexppha',    class: ModbusNumber, id: [{ first: 40110, last: 40111 }], code: 'u32', access: 'R', format: '%.0f', type: { int: { scale: '40124' }}, unit: 'Wh',                                      description: 'Total Watt-hours phase a exported' },
        40112: { uid: '40112', label: 'totwhexpphb',    class: ModbusNumber, id: [{ first: 40112, last: 40113 }], code: 'u32', access: 'R', format: '%.0f', type: { int: { scale: '40124' }}, unit: 'Wh',                                      description: 'Total Watt-hours phase b exported' },
        40114: { uid: '40114', label: 'totwhexpphc',    class: ModbusNumber, id: [{ first: 40114, last: 40115 }], code: 'u32', access: 'R', format: '%.0f', type: { int: { scale: '40124' }}, unit: 'Wh',                                      description: 'Total Watt-hours phase c exported' },
        40116: { uid: '40116', label: 'totwhimp',       class: ModbusNumber, id: [{ first: 40116, last: 40117 }], code: 'u32', access: 'R', format: '%.0f', type: { int: { scale: '40124' }}, unit: 'Wh',                                      description: 'Total Watt-hours imported' },
        40118: { uid: '40118', label: 'totwhimppha',    class: ModbusNumber, id: [{ first: 40118, last: 40119 }], code: 'u32', access: 'R', format: '%.0f', type: { int: { scale: '40124' }}, unit: 'Wh',                                      description: 'Total Watt-hours phase a imported' },
        40120: { uid: '40120', label: 'totwhimpphb',    class: ModbusNumber, id: [{ first: 40120, last: 40121 }], code: 'u32', access: 'R', format: '%.0f', type: { int: { scale: '40124' }}, unit: 'Wh',                                      description: 'Total Watt-hours phase b imported' },
        40122: { uid: '40122', label: 'totwhimpphc',    class: ModbusNumber, id: [{ first: 40122, last: 40123 }], code: 'u32', access: 'R', format: '%.0f', type: { int: { scale: '40124' }}, unit: 'Wh',                                      description: 'Total Watt-hours phase c imported' },
        40124: { uid: '40124', label: 'totwh_sf',       class: ModbusNumber, id: 40124,                           code: 's16', access: 'R', format: '%d',                                                                                      description: 'Total Watt-hours scale factor' },
        40125: { uid: '40125', label: 'totvahexp',      class: ModbusNumber, id: [{ first: 40125, last: 40126 }], code: 'u32', access: 'R', format: '%.0f', type: { int: { scale: '40141' }}, unit: 'VAh',                                     description: 'Total VA-hours exported' },
        40127: { uid: '40127', label: 'totvahexppha',   class: ModbusNumber, id: [{ first: 40127, last: 40128 }], code: 'u32', access: 'R', format: '%.0f', type: { int: { scale: '40141' }}, unit: 'VAh',                                     description: 'Total VA-hours phase a exported' },
        40129: { uid: '40129', label: 'totvahexpphb',   class: ModbusNumber, id: [{ first: 40129, last: 40130 }], code: 'u32', access: 'R', format: '%.0f', type: { int: { scale: '40141' }}, unit: 'VAh',                                     description: 'Total VA-hours phase b exported' },
        40131: { uid: '40131', label: 'totvahexpphc',   class: ModbusNumber, id: [{ first: 40131, last: 40132 }], code: 'u32', access: 'R', format: '%.0f', type: { int: { scale: '40141' }}, unit: 'VAh',                                     description: 'Total VA-hours phase c exported' },
        40133: { uid: '40133', label: 'totvahimp',      class: ModbusNumber, id: [{ first: 40133, last: 40134 }], code: 'u32', access: 'R', format: '%.0f', type: { int: { scale: '40141' }}, unit: 'VAh',                                     description: 'Total VA-hours imported' },
        40135: { uid: '40135', label: 'totvahimppha',   class: ModbusNumber, id: [{ first: 40135, last: 40136 }], code: 'u32', access: 'R', format: '%.0f', type: { int: { scale: '40141' }}, unit: 'VAh',                                     description: 'Total VA-hours phase a imported' },
        40137: { uid: '40137', label: 'totvahimpphb',   class: ModbusNumber, id: [{ first: 40137, last: 40138 }], code: 'u32', access: 'R', format: '%.0f', type: { int: { scale: '40141' }}, unit: 'VAh',                                     description: 'Total VA-hours phase b imported' },
        40139: { uid: '40139', label: 'totvahimpphc',   class: ModbusNumber, id: [{ first: 40139, last: 40140 }], code: 'u32', access: 'R', format: '%.0f', type: { int: { scale: '40141' }}, unit: 'VAh',                                     description: 'Total VA-hours phase c imported' },
        40141: { uid: '40141', label: 'totvah_sf',      class: ModbusNumber, id: 40141,                           code: 's16', access: 'R', format: '%d',                                                                                      description: 'Total VA-hours scale factor' },
        40142: { uid: '40142', label: 'totvarimpq1',    class: ModbusNumber, id: [{ first: 40142, last: 40143 }], code: 'u32', access: 'R', format: '%.0f', type: { int: { scale: '40174' }}, unit: 'varh',                                    description: 'Total var-hours imported Q1' },
        40144: { uid: '40144', label: 'totvarimpq1pha', class: ModbusNumber, id: [{ first: 40144, last: 40145 }], code: 'u32', access: 'R', format: '%.0f', type: { int: { scale: '40174' }}, unit: 'varh',                                    description: 'Total var-hours imported Q1 phase a' },
        40146: { uid: '40146', label: 'totvarimpq1phb', class: ModbusNumber, id: [{ first: 40146, last: 40147 }], code: 'u32', access: 'R', format: '%.0f', type: { int: { scale: '40174' }}, unit: 'varh',                                    description: 'Total var-hours imported Q1 phase b' },
        40148: { uid: '40148', label: 'totvarimpq1phc', class: ModbusNumber, id: [{ first: 40148, last: 40149 }], code: 'u32', access: 'R', format: '%.0f', type: { int: { scale: '40174' }}, unit: 'varh',                                    description: 'Total var-hours imported Q1 phase c' },
        40150: { uid: '40150', label: 'totvarimpq2',    class: ModbusNumber, id: [{ first: 40150, last: 40151 }], code: 'u32', access: 'R', format: '%.0f', type: { int: { scale: '40174' }}, unit: 'varh',                                    description: 'Total var-hours imported Q2' },
        40152: { uid: '40152', label: 'totvarimpq2pha', class: ModbusNumber, id: [{ first: 40152, last: 40153 }], code: 'u32', access: 'R', format: '%.0f', type: { int: { scale: '40174' }}, unit: 'varh',                                    description: 'Total var-hours imported Q2 phase a' },
        40154: { uid: '40154', label: 'totvarimpq2phb', class: ModbusNumber, id: [{ first: 40154, last: 40155 }], code: 'u32', access: 'R', format: '%.0f', type: { int: { scale: '40174' }}, unit: 'varh',                                    description: 'Total var-hours imported Q2 phase b' },
        40156: { uid: '40156', label: 'totvarimpq2phc', class: ModbusNumber, id: [{ first: 40156, last: 40157 }], code: 'u32', access: 'R', format: '%.0f', type: { int: { scale: '40174' }}, unit: 'varh',                                    description: 'Total var-hours imported Q2 phase c' },
        40158: { uid: '40158', label: 'totvarimpq3',    class: ModbusNumber, id: [{ first: 40158, last: 40159 }], code: 'u32', access: 'R', format: '%.0f', type: { int: { scale: '40174' }}, unit: 'varh',                                    description: 'Total var-hours imported Q3' },
        40160: { uid: '40160', label: 'totvarimpq3pha', class: ModbusNumber, id: [{ first: 40160, last: 40161 }], code: 'u32', access: 'R', format: '%.0f', type: { int: { scale: '40174' }}, unit: 'varh',                                    description: 'Total var-hours imported Q3 phase a' },
        40162: { uid: '40162', label: 'totvarimpq3phb', class: ModbusNumber, id: [{ first: 40162, last: 40163 }], code: 'u32', access: 'R', format: '%.0f', type: { int: { scale: '40174' }}, unit: 'varh',                                    description: 'Total var-hours imported Q3 phase b' },
        40164: { uid: '40164', label: 'totvarimpq3phc', class: ModbusNumber, id: [{ first: 40164, last: 40165 }], code: 'u32', access: 'R', format: '%.0f', type: { int: { scale: '40174' }}, unit: 'varh',                                    description: 'Total var-hours imported Q3 phase c' },
        40166: { uid: '40166', label: 'totvarimpq4',    class: ModbusNumber, id: [{ first: 40166, last: 40167 }], code: 'u32', access: 'R', format: '%.0f', type: { int: { scale: '40174' }}, unit: 'varh',                                    description: 'Total var-hours imported Q4' },
        40168: { uid: '40168', label: 'totvarimpq4pha', class: ModbusNumber, id: [{ first: 40168, last: 40169 }], code: 'u32', access: 'R', format: '%.0f', type: { int: { scale: '40174' }}, unit: 'varh',                                    description: 'Total var-hours imported Q4 phase a' },
        40170: { uid: '40170', label: 'totvarimpq4phb', class: ModbusNumber, id: [{ first: 40170, last: 40171 }], code: 'u32', access: 'R', format: '%.0f', type: { int: { scale: '40174' }}, unit: 'varh',                                    description: 'Total var-hours imported Q4 phase b' },
        40172: { uid: '40172', label: 'totvarimpq4phc', class: ModbusNumber, id: [{ first: 40172, last: 40173 }], code: 'u32', access: 'R', format: '%.0f', type: { int: { scale: '40174' }}, unit: 'varh',                                    description: 'Total var-hours imported Q4 phase c' },
        40174: { uid: '40174', label: 'totvarh_sf',     class: ModbusNumber, id: 40174,                           code: 's16', access: 'R', format: '%d',                                                                                      description: 'Total var-hours scale factor' },
        40175: { uid: '40175', label: 'evt',            class: ModbusNumber, id: [{ first: 40175, last: 40176 }], code: 'u32', access: 'R', format: '%d',                                                                                      description: 'Events' }
    };

    static regDefByUid = FroniusMeterRegisters.regDefById;

    static regDefByLabel: { [ id in FroniusMeterAttributes ]: IRegisterDefinition } = {
        id:             FroniusMeterRegisters.regDefById[40070],
        l:              FroniusMeterRegisters.regDefById[40071],
        a:              FroniusMeterRegisters.regDefById[40072],
        apha:           FroniusMeterRegisters.regDefById[40073],
        aphb:           FroniusMeterRegisters.regDefById[40074],
        aphc:           FroniusMeterRegisters.regDefById[40075],
        a_sf:           FroniusMeterRegisters.regDefById[40076],
        phv:            FroniusMeterRegisters.regDefById[40077],
        phvpha:         FroniusMeterRegisters.regDefById[40078],
        phvphb:         FroniusMeterRegisters.regDefById[40079],
        phvphc:         FroniusMeterRegisters.regDefById[40080],
        ppv:            FroniusMeterRegisters.regDefById[40081],
        ppvphab:        FroniusMeterRegisters.regDefById[40082],
        ppvphbc:        FroniusMeterRegisters.regDefById[40083],
        ppvphca:        FroniusMeterRegisters.regDefById[40084],
        v_sf:           FroniusMeterRegisters.regDefById[40085],
        hz:             FroniusMeterRegisters.regDefById[40086],
        hz_sf:          FroniusMeterRegisters.regDefById[40087],
        w:              FroniusMeterRegisters.regDefById[40088],
        wpha:           FroniusMeterRegisters.regDefById[40089],
        wphb:           FroniusMeterRegisters.regDefById[40090],
        wphc:           FroniusMeterRegisters.regDefById[40091],
        w_sf:           FroniusMeterRegisters.regDefById[40092],
        va:             FroniusMeterRegisters.regDefById[40093],
        vapha:          FroniusMeterRegisters.regDefById[40094],
        vaphb:          FroniusMeterRegisters.regDefById[40095],
        vaphc:          FroniusMeterRegisters.regDefById[40096],
        va_sf:          FroniusMeterRegisters.regDefById[40097],
        var:            FroniusMeterRegisters.regDefById[40098],
        varpha:         FroniusMeterRegisters.regDefById[40099],
        varphb:         FroniusMeterRegisters.regDefById[40100],
        varphc:         FroniusMeterRegisters.regDefById[40101],
        var_sf:         FroniusMeterRegisters.regDefById[40102],
        pf:             FroniusMeterRegisters.regDefById[40103],
        pfpha:          FroniusMeterRegisters.regDefById[40104],
        pfphb:          FroniusMeterRegisters.regDefById[40105],
        pfphc:          FroniusMeterRegisters.regDefById[40106],
        pf_sf:          FroniusMeterRegisters.regDefById[40107],
        totwhexp:       FroniusMeterRegisters.regDefById[40108],
        totwhexppha:    FroniusMeterRegisters.regDefById[40110],
        totwhexpphb:    FroniusMeterRegisters.regDefById[40112],
        totwhexpphc:    FroniusMeterRegisters.regDefById[40114],
        totwhimp:       FroniusMeterRegisters.regDefById[40116],
        totwhimppha:    FroniusMeterRegisters.regDefById[40118],
        totwhimpphb:    FroniusMeterRegisters.regDefById[40120],
        totwhimpphc:    FroniusMeterRegisters.regDefById[40122],
        totwh_sf:       FroniusMeterRegisters.regDefById[40124],
        totvahexp:      FroniusMeterRegisters.regDefById[40125],
        totvahexppha:   FroniusMeterRegisters.regDefById[40127],
        totvahexpphb:   FroniusMeterRegisters.regDefById[40129],
        totvahexpphc:   FroniusMeterRegisters.regDefById[40131],
        totvahimp:      FroniusMeterRegisters.regDefById[40133],
        totvahimppha:   FroniusMeterRegisters.regDefById[40135],
        totvahimpphb:   FroniusMeterRegisters.regDefById[40137],
        totvahimpphc:   FroniusMeterRegisters.regDefById[40139],
        totvah_sf:      FroniusMeterRegisters.regDefById[40141],
        totvarimpq1:    FroniusMeterRegisters.regDefById[40142],
        totvarimpq1pha: FroniusMeterRegisters.regDefById[40144],
        totvarimpq1phb: FroniusMeterRegisters.regDefById[40146],
        totvarimpq1phc: FroniusMeterRegisters.regDefById[40148],
        totvarimpq2:    FroniusMeterRegisters.regDefById[40150],
        totvarimpq2pha: FroniusMeterRegisters.regDefById[40152],
        totvarimpq2phb: FroniusMeterRegisters.regDefById[40154],
        totvarimpq2phc: FroniusMeterRegisters.regDefById[40156],
        totvarimpq3:    FroniusMeterRegisters.regDefById[40158],
        totvarimpq3pha: FroniusMeterRegisters.regDefById[40160],
        totvarimpq3phb: FroniusMeterRegisters.regDefById[40162],
        totvarimpq3phc: FroniusMeterRegisters.regDefById[40164],
        totvarimpq4:    FroniusMeterRegisters.regDefById[40166],
        totvarimpq4pha: FroniusMeterRegisters.regDefById[40168],
        totvarimpq4phb: FroniusMeterRegisters.regDefById[40170],
        totvarimpq4phc: FroniusMeterRegisters.regDefById[40172],
        totvarh_sf:     FroniusMeterRegisters.regDefById[40174],
        evt:            FroniusMeterRegisters.regDefById[40175]
    };
}

