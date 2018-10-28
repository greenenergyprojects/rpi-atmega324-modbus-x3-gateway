
// attributes take from avr include file

export interface IDevice {
    id:          string;
    spmPageSize: number;   // SPM_PAGESIZE
    flashStart:  number;   // FLASHSTART
    flashEnd:    number;   // FLASHEND
    ramStart:    number;   // RAMSTART
    ramSize:     number;   // RAMSIZE
    ramEnd:      number;   // RAMEND
    e2Start:     number;   // E2START
    e2Size:      number;   // E2SIZE
    e2PageSize:  number;   // E2PAGESIZE
    e2End:       number;   // E2END
}

export const atmega16: IDevice = {
    id:         'atmega16',
    spmPageSize: 128,
    flashStart:  0x0000,
    flashEnd:    0x3fff,
    ramStart:    0x0060,
    ramSize:     1024,
    ramEnd:      0x045f,
    e2Start:     0,
    e2Size:      512,
    e2PageSize:  4,
    e2End:       0x01ff
};

export const atmega324p: IDevice = {
    id:         'atmega324p',
    spmPageSize: 128,
    flashStart:  0x0000,
    flashEnd:    0x7fff,
    ramStart:    0x0100,
    ramSize:     2048,
    ramEnd:      0x08ff,
    e2Start:     0,
    e2Size:      1024,
    e2PageSize:  4,
    e2End:       0x03ff
};

export const atmega328p: IDevice = {
    id:         'atmega328p',
    spmPageSize: 128,
    flashStart:  0x0000,
    flashEnd:    0x7fff,
    ramStart:    0x0100,
    ramSize:     2048,
    ramEnd:      0x08ff,
    e2Start:     0,
    e2Size:      1024,
    e2PageSize:  4,
    e2End:       0x03ff
};


export const devices: { [ id: string]: IDevice } = {
    atmega16:   atmega16,
    atmega324p: atmega324p,
    atmega328p: atmega328p
};

