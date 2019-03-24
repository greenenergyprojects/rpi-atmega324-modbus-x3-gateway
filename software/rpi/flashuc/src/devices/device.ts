
import * as debugsx from 'debug-sx';
const debug: debugsx.IDefaultLogger = debugsx.createDefaultLogger('device');


import { devices, IDevice } from './devices';
import { Elf } from '../elf/elf';
import { Serial } from '../serial';
import { sprintf } from 'sprintf-js';
import { stringify } from 'querystring';

export class Device {

    private _deviceDescription: IDevice;
    private _elf: Elf;
    private _program: { paddr: number, memsz: number, data: Buffer } [] = [];

    constructor (id: string, elf: Elf) {
        this._deviceDescription = devices[id];
        if (!this._deviceDescription) {
            throw new Error('invalid/unsupported device id ' + id);
        }
        if (!elf || !elf.header || elf.header.machine !== 'avr') {
            throw new Error('invalid/unsupported elf');
        }
        if (!elf.body || !Array.isArray(elf.body.programs) || elf.body.programs.length < 1) {
            throw new Error('missing program in elf');
        }
        let size = 0;
        for (const p of elf.body.programs) {
            if (p.type !== 'load' || !(p.data instanceof Buffer) || p.data.length === 0) { continue; }
            if (p.paddr >= 0 && p.memsz > 0) {
                if (!(p.data instanceof Buffer) || p.data.length !== p.memsz) {
                    throw new Error('invalid elf, error in body/programs, missing/invalid data (' + JSON.stringify(p) + ')');
                }
                this._program.push(p);
                size += p.memsz;
            }
        }
        if (size === 0) {
            throw new Error('missing program bytes in elf');
        }
        this._elf = elf;
        this._program.sort( (a, b) => { return a.paddr - b.paddr ; });
    }

    public get program (): { paddr: number, memsz: number, data: Buffer } [] {
        return this._program;
    }

    public async flash (serial?: Serial) {
        serial = serial || Serial.instance;
        const firstAddr = this._deviceDescription.flashStart;
        const pageSize = this._deviceDescription.spmPageSize;
        const lastAddr =  this._deviceDescription.flashEnd;
        const buffers: Buffer [] = [];

        // for (let a = firstAddr; a <= lastAddr; a += pageSize) {
        //     const b = this.flashMemory(a, pageSize);
        //     if (b.length > 0) {
        //         buffers.push(b);
        //         if (b.length < pageSize) {
        //             buffers.push(Buffer.alloc(pageSize - b.length, 0xff));
        //         }
        //     } else {
        //         buffers.push(Buffer.alloc(pageSize, 0xff));
        //     }
        // }
        // const mem = Buffer.concat(buffers);
        // this._program = [ { paddr: firstAddr, data: mem, memsz: mem.length } ];
        // debug.info('\n%s', this.hexdump());

        const idTarget = await serial.resetAll();
        debug.info('reset done (%o)', idTarget);

        const promisses: Promise<{ address: number, buffer: Buffer }> [] = [];
        for (let a = firstAddr; a <= lastAddr; a += pageSize) {
            const b = this.flashMemory(a, pageSize);
            if (b && b.length > 0) {
                promisses.push(serial.flash(a, b));
            }
        }
        let segOkCnt = 0, segErrCnt = 0;
        for (const p of promisses) {
            p.then( () => { segOkCnt++; }).catch( (e) => { segErrCnt++; } );
        }
        try {
            await Promise.all(promisses);
            debug.info('device sucessfully flashed (%d pages)', segOkCnt);
        } catch (err) {
            console.log('Error: ' + segErrCnt + ' segments have errors, ' + segOkCnt + ' segments OK');
            debug.warn('%e', err);
        }

    }

    public hexdump (compact = true): string {
        let addr = 0;
        let index = 0;
        let ascii = '';
        let lastline = '';
        let suppressLine = false;
        let s = '';
        let rv = '';
        for (const p of this._program) {
            for (const b of p.data) {
                if (index % 16 === 0) {
                    if (ascii.length > 0) {
                        while (ascii.length < 16) { ascii += ' '; }
                        s = s + sprintf('  |%s|', ascii);
                    }
                    ascii = '';
                    if (!compact || lastline.length < 9 || lastline.substr(9) !== s.substr(9)) {
                        if (s.length > 0) {
                            rv = rv + '\n' + s;
                            lastline = s;
                            suppressLine = false;
                        }
                    } else if (!suppressLine) {
                        rv = rv + '\n*';
                        suppressLine = true;
                    }
                    s = sprintf('%08x  %02x ', addr, b);
                } else if (index % 8 === 0) {
                    s = s + sprintf(' %02x ', b);
                } else {
                    s = s + sprintf('%02x ', b);
                }
                ascii += (b > 32 && b < 127) ? String.fromCharCode(b) : '.';
                index++; addr++;
            }
        }
        if (ascii.length > 0) {
            while (index % 16 !== 0) {
                s += index % 8 === 0 ? '    ' : '   ';
                ascii += ' ';
                index++;
            }
            rv = rv + '\n' + s + sprintf('  |%s|', ascii);
        }
        return rv;
    }

    private flashMemory (addr: number, size: number): Buffer {
        const buffers: Buffer [] = [];
        let a = addr;
        let l = 0;
        for (const p of this._program) {
            const firstAddr = p.paddr;
            const lastAddr = p.paddr + p.memsz - 1;
            if (a < firstAddr || a > lastAddr)  {
                continue;
            }
            if (a < firstAddr) {
                const bEmpty = Buffer.alloc(firstAddr - a, 0xff);
                buffers.push(bEmpty);
                a += bEmpty.length;
                l += bEmpty.length;
            }
            const bSize = Math.min(lastAddr - a + 1, size - l);
            const b = p.data.slice(a - firstAddr, a - firstAddr + bSize);
            buffers.push(b);
            a += b.length;
            l += b.length;
            if (l >= size) {
                break;
            }
        }
        const rv = Buffer.concat(buffers);
        if (rv.length > size) {
            throw new Error('internal error');
        }
        return rv;
    }
}
