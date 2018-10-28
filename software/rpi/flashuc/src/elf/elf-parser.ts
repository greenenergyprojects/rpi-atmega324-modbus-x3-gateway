


import * as util from 'util';
import { Reader } from './endian-reader';
import * as constants from './elf-constants';

export class Parser extends Reader {

    public mapFlags (value: number, map: { [ key: number ]: number | string }): {[ key: string ]: boolean } {
        const res: any = {};

        /* tslint:disable:no-bitwise */
        for (let bit = 1; (value < 0 || bit <= value) && bit !== 0; bit <<= 1) {
            if (value & bit) {
                res[map[bit] || bit] = true;
            }
        }
        /* tslint:enable:no-bitwise */

        return res;
    }

    public execute (buf: Buffer): IElfResult {
        if (buf.length < 16) {
            throw new Error('Not enough bytes to parse ident');
        }

        const magic = buf.slice(0, 4).toString();
        if (magic !== '\x7fELF') {
            throw new Error('Invalid magic: ' + magic);
        }

        const header = this.parseHeader(buf);
        const b = this.parseBody(buf, header);
        const rv: IElfResult = {
            header: header,
            body: this.resolveBody(b, header)
        };

        return rv;
    }


    public parseHeader (buf: Buffer): IHeader {
        const class_ = constants.clasz[buf[4]];
        const endian = constants.endian[buf[5]];
        const osabi = constants.osabi[buf[6]];
        const abiversion = constants.abiversion[buf[7]];
        if (class_ !== '32' && class_ !== '64') {
            throw new Error('Invalid class: ' + class_);
        }
        if (endian !== 'lsb' && endian !== 'msb') {
            throw new Error('Invalid endian: ' + endian);
        }
        this.setEndian(endian);
        this.setWord(class_ === '32' ? 4 : 8);

        let type: string;
        let machine: string;
        let version: number;
        let entry: number;
        let phoff: number;
        let shoff: number;
        let flags: number;
        let ehsize: number;
        let phentsize: number;
        let phnum: number;
        let shentsize: number;
        let shnum: number;
        let shstrndx: number;

        if (class_ === '32') {
            type = constants.type[this.readUInt16(buf, 16)];
            machine = constants.machine[this.readUInt16(buf, 18)];
            version = this.readUInt32(buf, 20);
            entry = this.readUInt32(buf, 24);
            phoff = this.readUInt32(buf, 28);
            shoff = this.readUInt32(buf, 32);
            flags = this.readUInt32(buf, 36);
            ehsize = this.readUInt16(buf, 40);
            phentsize = this.readUInt16(buf, 42);
            phnum = this.readUInt16(buf, 44);
            shentsize = this.readUInt16(buf, 46);
            shnum = this.readUInt16(buf, 48);
            shstrndx = this.readUInt16(buf, 50);
        } else {
            type = constants.type[this.readUInt16(buf, 16)];
            machine = constants.machine[this.readUInt16(buf, 18)];
            version = this.readUInt32(buf, 20);
            entry = this.readUInt64(buf, 24);
            phoff = this.readUInt64(buf, 32);
            shoff = this.readUInt64(buf, 40);
            flags = this.readUInt32(buf, 48);
            ehsize = this.readUInt16(buf, 52);
            phentsize = this.readUInt16(buf, 54);
            phnum = this.readUInt16(buf, 56);
            shentsize = this.readUInt16(buf, 58);
            shnum = this.readUInt16(buf, 60);
            shstrndx = this.readUInt16(buf, 62);
        }

        return {
            class: class_,
            endian: endian,
            // version: buf[7],
            osabi: osabi,
            abiversion: abiversion,
            type: type,
            machine: machine,
            version: version,
            entry: entry,
            phoff: phoff,
            shoff: shoff,
            flags: flags,
            ehsize: ehsize,
            phentsize: phentsize,
            phnum: phnum,
            shentsize: shentsize,
            shnum: shnum,
            shstrndx: shstrndx
        };
    }


    public parseBody (buf: Buffer, header: IHeader): IBody {
        return {
            programs: this.parsePrograms(buf, header),
            sections: this.parseSections(buf, header)
        };
    }


    public sliceChunks (buf: Buffer, off: number, count: number, size: number): Buffer [] {
        const start = off;
        const end = start + count * size;
        if (end > buf.length) {
            throw new Error('Failed to slice chunks');
        }

        const chunks: Buffer [] = [];
        for (off = start; off < end; off += size) {
            chunks.push(buf.slice(off, off + size));
        }

        return chunks;
    }


    public parsePrograms (buf: Buffer, header: IHeader): any [] {
        if (header.phoff === 0 || header.phnum === 0) {
          return [];
        }
        const programs = this.sliceChunks(buf, header.phoff, header.phnum, header.phentsize);
        return programs.map(function(program) {
            return this.parseProgram(program, header, buf);
        }, this);
    }


    public parseProgram (ent: Buffer, header: IHeader, buf: Buffer): IProgram {
        const type = constants.entryType[this.readUInt32(ent, 0)];
        let offset: number;
        let vaddr: number;
        let paddr: number;
        let filesz: number;
        let memsz: number;
        let flags: number;
        let align: number;

        if (header.class === '32') {
            offset = this.readUInt32(ent, 4);
            vaddr = this.readUInt32(ent, 8);
            paddr = this.readUInt32(ent, 12);
            filesz = this.readUInt32(ent, 16);
            memsz = this.readUInt32(ent, 20);
            flags = this.readUInt32(ent, 24);
            align = this.readUInt32(ent, 28);
        } else {
            flags = this.readUInt32(ent, 4);
            offset = this.readUInt64(ent, 8);
            vaddr = this.readUInt64(ent, 16);
            paddr = this.readUInt64(ent, 24);
            filesz = this.readUInt64(ent, 32);
            memsz = this.readUInt64(ent, 40);
            align = this.readUInt64(ent, 48);
        }

        return {
            type: type,
            offset: offset,
            vaddr: vaddr,
            paddr: paddr,
            filesz: filesz,
            memsz: memsz,
            flags: this.mapFlags(flags, constants.entryFlags),
            align: align,
            data: buf.slice(offset, offset + filesz)
        };
    }


    public parseSections (buf: Buffer, header: IHeader): ISection [] {
        if (header.shoff === 0 || header.shnum === 0) {
            return [];
        }
        const sections = this.sliceChunks(buf, header.shoff, header.shnum, header.shentsize);
        return sections.map(function(section) {
            return this.parseSection(section, header, buf);
        }, this);
    }


    public parseSection (section: Buffer, header: IHeader, buf: Buffer): ISection {
        const name = this.readUInt32(section, 0);
        const type = this.readUInt32(section, 4);

        let flags: number;
        let addr: number;
        let off: number;
        let size: number;
        let link: number;
        let info: number;
        let addralign: number;
        let entsize: number;

        if (header.class === '32') {
            flags = this.readUInt32(section, 8);
            addr = this.readUInt32(section, 12);
            off = this.readUInt32(section, 16);
            size = this.readUInt32(section, 20);
            link = this.readUInt32(section, 24);
            info = this.readUInt32(section, 28);
            addralign = this.readUInt32(section, 32);
            entsize = this.readUInt32(section, 36);
        } else {
            flags = this.readUInt64(section, 8);
            addr = this.readUInt64(section, 16);
            off = this.readUInt64(section, 24);
            size = this.readUInt64(section, 32);
            link = this.readUInt32(section, 40);
            info = this.readUInt32(section, 44);
            addralign = this.readUInt64(section, 46);
            entsize = this.readUInt64(section, 54);
        }

        return {
            name: name.toString(),
            type: constants.sectType[type] || type.toString(),
            flags: this.mapFlags(flags, constants.sectFlags),
            addr: addr,
            off: off,
            size: size,
            link: link,
            info: info,
            addralign: addralign,
            entsize: entsize,
            data: buf.slice(off, off + size)
        };
    }


    public resolveStr (strtab: number [], off: number): string {
        let i: number;
        for (i = off; i < strtab.length && strtab[i] !== 0; i++) {
        }
        return strtab.slice(off, i).toString();
    }

    public resolveBody (body: IBody, header: IHeader): IBody {
        const strtab = body.sections[header.shstrndx];
        // assert.equal(strtab.type, 'strtab');

        return {
            programs: body.programs,
            sections: body.sections.map(function(section) {
                section.name = this.resolveStr(strtab.data, section.name);
                return section;
            }, this)
        };
    }

}

export interface IElfResult {
    header: IHeader;
    body: IBody;
}

export interface IHeader {
    class: string;
    endian: string;
    // version: buf[7],
    osabi: string;
    abiversion: string;
    type: string;
    machine: string;
    version: number;
    entry: number;
    phoff: number;
    shoff: number;
    flags: number;
    ehsize: number;
    phentsize: number;
    phnum: number;
    shentsize: number;
    shnum: number;
    shstrndx: number;
}

export interface IBody {
    programs: any;
    sections: ISection [];
}

interface IFlags {
    [ key: string ]: boolean;
}

interface IProgram {
    type: string;
    offset: number;
    vaddr: number;
    paddr: number;
    filesz: number;
    memsz: number;
    flags: IFlags;
    align: number;
    data: Buffer;
}

export interface ISection {
    name: string;
    type: string;
    flags: IFlags;
    addr: number;
    off: number;
    size: number;
    link: number;
    info: number;
    addralign: number;
    entsize: number;
    data: Buffer;
}


