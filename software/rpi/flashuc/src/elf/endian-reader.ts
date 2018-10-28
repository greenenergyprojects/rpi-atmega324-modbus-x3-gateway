

export class Reader  {

    private _endian: string;
    private _word: number;

    constructor (endian?: 'le' | 'be' | 'lsb' | 'msb', word = 4) {
        this.setEndian(endian);
        this._word = word;
    }

    public setEndian (endian: 'le' | 'be' | 'lsb' | 'msb') {
        this._endian = /le|lsb|little/i.test(endian) ? 'le' : 'be';
    }

    public setWord (word: number) {
        this._word = word;
    }

    public readUInt8 (buf: Buffer, offset: number) {
        return buf.readUInt8(offset);
    }

    public readInt8 (buf: Buffer, offset: number) {
        return buf.readInt8(offset);
    }

    public readUInt16 (buf: Buffer, offset: number) {
        if (this._endian === 'le') {
            return buf.readUInt16LE(offset);
        } else {
            return buf.readUInt16BE(offset);
        }
    }

    public readInt16 (buf: Buffer, offset: number) {
        if (this._endian === 'le') {
            return buf.readInt16LE(offset);
        } else {
            return buf.readInt16BE(offset);
        }
    }

    public readUInt32 (buf: Buffer, offset: number) {
        if (this._endian === 'le') {
            return buf.readUInt32LE(offset);
        } else {
            return buf.readUInt32BE(offset);
        }
    }

    public readInt32 (buf: Buffer, offset: number) {
        if (this._endian === 'le') {
            return buf.readInt32LE(offset);
        } else {
            return buf.readInt32BE(offset);
        }
    }

    public readUInt64 (buf: Buffer, offset: number) {
        const a = this.readUInt32(buf, offset);
        const b = this.readUInt32(buf, offset + 4);
        if (this._endian === 'le') {
            return a + b * 0x100000000;
        } else {
            return b + a * 0x100000000;
        }
    }

    public readInt64 (buf: Buffer, offset: number) {
        if (this._endian === 'le') {
            const a = this.readUInt32(buf, offset);
            const b = this.readInt32(buf, offset + 4);
            return a + b * 0x100000000;
        } else {
            const a = this.readInt32(buf, offset);
            const b = this.readUInt32(buf, offset + 4);
            return b + a * 0x100000000;
        }
    }

    public readHalf (buf: Buffer, offset: number) {
        if (this._word === 2) {
            return this.readInt8(buf, offset);
        } else if (this._word === 4) {
            return this.readInt16(buf, offset);
        } else {
            return this.readInt32(buf, offset);
        }
    }

    public readUHalf (buf: Buffer, offset: number) {
        if (this._word === 2) {
            return this.readUInt8(buf, offset);
        } else if (this._word === 4) {
            return this.readUInt16(buf, offset);
        } else {
            return this.readUInt32(buf, offset);
        }
    }

    public readWord (buf: Buffer, offset: number) {
        if (this._word === 1) {
            return this.readInt8(buf, offset);
        } else if (this._word === 2) {
            return this.readInt16(buf, offset);
        } else if (this._word === 4) {
            return this.readInt32(buf, offset);
        } else {
            return this.readInt64(buf, offset);
        }
    }

    public readUWord (buf: Buffer, offset: number) {
        if (this._word === 1) {
            return this.readUInt8(buf, offset);
        } else if (this._word === 2) {
            return this.readUInt16(buf, offset);
        } else if (this._word === 4) {
            return this.readUInt32(buf, offset);
        } else {
            return this.readUInt64(buf, offset);
        }
    }
}
