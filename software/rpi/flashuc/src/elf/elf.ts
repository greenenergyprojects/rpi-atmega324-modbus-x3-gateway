

import * as fs from 'fs';
import { Parser, IElfResult, IHeader, IBody, ISection } from './elf-parser';

export class Elf {

    public static async createFromFile (path: string): Promise<Elf> {
        const rs = fs.createReadStream(path);
        const rv = new Elf();
        await rv.init(rs);
        rv.parse();
        return rv;
    }

    private _f: Buffer;
    private _elf: IElfResult;

    private constructor () {}

    public get header (): IHeader {
        return this._elf.header;
    }

    public get body (): IBody {
        return this._elf.body;
    }

    public get text (): ISection {
        const section = this._elf.body.sections.find( (s) => { return s.name === '.text'; });
        return section;
    }

    public get bss (): ISection {
        const section = this._elf.body.sections.find( (s) => { return s.name === '.bss'; });
        return section;
    }

    public get data (): ISection {
        const section = this._elf.body.sections.find( (s) => { return s.name === '.data'; });
        return section;
    }

    private async init (from: fs.ReadStream): Promise<Elf> {
        return new Promise<Elf>( (res, rej) => {
            const buffers: Buffer [] = [];
            from.on('data', (d) => { buffers.push(d); });
            from.on('end', () => {
                this._f = Buffer.concat(buffers);
                res(this);
            });
            from.on('error', (err) => { rej(err); });
        });
    }

    private parse () {
        const p: Parser = new Parser();
        this._elf = p.execute(this._f);
    }
}

// function pad (d: number, len: number): string {
//     let r = d.toString(16);
//     while (r.length < len) {
//         r = '0' + r;
//     }
//     return r;
// }

// function twoComp (v: number): number {
//     const inv = (0 + v).toString(2).split('').map( (p: string) => {
//         return p === '0' ? '1' : '0';
//     }).join('');

//     v = parseInt(inv, 2) + 1;
//     /* tslint:disable:no-bitwise */
//     return v & 255;
//     /* tslint:enable:no-bitwise */
// }



