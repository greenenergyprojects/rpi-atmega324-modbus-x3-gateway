import { ModbusString } from './modbus-string';
import { ModbusNumber } from './modbus-number';

export interface Type extends Function { new (...args: any[]): ModbusString | ModbusNumber; }

export interface IRegisterDefinition {
    uid:           string;
    label:         string;
    class:         Type;
    id:            number | number [] | { first: number, last: number } [];
    code:         'u8' | 's8' | 'u16' | 's16' | 'u32' | 's32' |'u64' | 's64' | 'string' | 'bitfield';
    access:       'R' | 'R/W';
    format:       string;
    description:  string;
    type?:        { int?: { factor?: number, scale?: string }, float?: { factor?: number }, string?: { code?: 'utf-8' } };
    unit?:        '°C' | 's' | 'Wh' | 'VAh' | 'varh' | 'W' | 'VA' | 'var' | 'V' | 'A' | 'Hz' | '%';
    range?:       { min?: number, max?: number, values?: number [], minmax?: { min: number, max: number } [] };
    tooltip?:     { [ lang: string ]: string };
}

export class RegisterDefinition {

    public static areIdsEqual (ids1: number [], ids2: number []): boolean {
        if (!Array.isArray(ids1) || !Array.isArray(ids2)) { return false; }
        if (ids1.length !== ids2.length) { return false; }
        ids1.forEach( (v, index) => {
            if (ids2[index] !== v || !(v >= 0) && (v <= 0xffff)) {
                return false;
            }
        });
        return true;
    }

    // public static areBlockIdsEqual (ids1: number [][], ids2: number [][]): boolean {
    //     if (!Array.isArray(ids1) || !Array.isArray(ids2)) { return false; }
    //     if (ids1.length !== ids2.length) { return false; }
    //     ids1.forEach( (v, index) => {
    //         if (ids2[index] !== v || !(v >= 0) && (v <= 0xffff)) {
    //             return false;
    //         }
    //     });
    //     return true;
    // }

    public static getIds (def: IRegisterDefinition [] | { [ id: string ]: IRegisterDefinition }): number [] {
        const ids: number [] = [];

        if (!Array.isArray(def)) {
            const x = def;
            def = [];
            for (const a of Object.getOwnPropertyNames(x)) {
                const d = <IRegisterDefinition>x[a];
                def.push(d);
            }
        }

        for (const d of def) {
            const id = d.id;
            if (typeof id === 'number') {
                ids.push(id);
            } else if (Array.isArray(id)) {
                for (const x of id) {
                    if (typeof x === 'number') {
                        ids.push(x);
                        continue;
                    } else {
                        const first = x.first;
                        const last = x.last;
                        if (first >= 0 && first <= 0xffff && last >= 0 && last <= 0xffff) {
                            for (let i = first; i <= last; i++) {
                                ids.push(i);
                            }
                            continue;
                        }
                    }
                    throw new Error('invalid definition id on uid ' + d.uid);
                }
            }
        }

        return ids.sort();
    }


    public static getBlockIds (def: IRegisterDefinition [] | { [ id: string ]: IRegisterDefinition }): number [] [] {
        const ids = RegisterDefinition.getIds(def);
        const rv: number [] [] = [];
        if (ids.length > 0) {
            let last = ids[0];
            let block: number [] = [ last ];
            for (let i = 1; i < ids.length; i++) {
                const id = ids[i];
                if (id === (last + 1)) {
                    block.push(id);
                } else {
                    rv.push(block);
                    block = [ id ];
                }
                last = id;
            }
            rv.push(block);
        }
        return rv;
    }

}
