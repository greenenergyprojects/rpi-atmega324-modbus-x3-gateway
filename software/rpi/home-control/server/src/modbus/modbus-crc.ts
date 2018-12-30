
export class ModbusCrc {

    private _crc: number;

    public constructor () {
        this._crc = 0xffff;
    }

    /* tslint:disable */
    public get crc (): number {
        return (this._crc >> 8) | ((this._crc & 0xff) << 8);
    }
    /* tslint:enable */

    public getCrcBytes (): Buffer {
        const buf = Buffer.alloc(2);
        buf.writeUInt16LE(this.crc, 0);
        return buf;
    }

    public update (b: number | Buffer, offset = 0, length = -1) {
        if (b instanceof Buffer) {
            length = length < 0 ? b.length : length;
            for (let i = offset; i < length; i++) {
                this.updateByte(b[i]);
            }
        } else {
            this.updateByte(<number>b);
        }
    }

    /* tslint:disable */
    private updateByte (b: number) {
        this._crc = this._crc ^ b;
        for (let i = 0; i < 8; i++) {
            if ((this._crc & 0x0001) === 0x0001) {
                this._crc = (this._crc >> 1) ^ 0xa001;
            } else {
                this._crc = this._crc >> 1;
            }
        }
    }
    /* tslint:enable */



}
