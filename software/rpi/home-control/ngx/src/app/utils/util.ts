import { sprintf } from 'sprintf-js';

export function ageToString (at: Date): string {
    if (!(at instanceof Date)) {
        return 'time ?';
    }
    let dt = Date.now() - at.getTime();
    let sign = 1;
    if (dt < 0) {
        dt = -dt;
        sign = -1;
    }
    // console.log(dt);
    const h = Math.floor(dt / 1000 / 60 / 60); dt = dt - h * 60 * 60 * 1000;
    const m = Math.floor(dt / 1000 / 60); dt = dt - m * 60 * 1000;
    const s = Math.floor(dt / 1000); dt = dt - s * 1000;
    const ms = dt;
    // console.log(h, m, s, ms);

    let rv: string;
    if (h !== 0) {
        rv = sprintf('%dhrs %dmin', h, m);
    } else if (m !== 0) {
        rv = sprintf('%dmin %ds', m, s);
    } else if (s !== 0) {
        rv = sprintf('%.01fs', s + ms / 1000);
    } else {
        rv = sprintf('%dms', ms);
    }
    if (sign === -1) {
        rv = '-' + rv;
    }
    return rv;
}

export function timeStampAsString (d: Date | string | number): string {
    try {
        const x = d instanceof Date ? d : new Date(<any>d);
        const now = new Date();
        if (now.getFullYear() !== x.getFullYear() || now.getMonth() !== x.getMonth() || now.getDate() !== x.getDate()) {
            return sprintf('%04d-%02d-%02d %02d:%02d:%02d',
                x.getFullYear(), x.getMonth() + 1, x.getDate(),
                x.getHours(), x.getMinutes(), x.getSeconds());
        } else {
            return sprintf('%02d:%02d:%02d', x.getHours(), x.getMinutes(), x.getSeconds());
        }
    } catch (err) {
        console.log('ERROR: not a valid date/time', d, err);
        return '?';
    }
}
