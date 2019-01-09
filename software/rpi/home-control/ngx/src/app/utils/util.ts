import { sprintf } from 'sprintf-js';

export function ageToString (at: Date): string {
    if (!(at instanceof Date)) {
        return 'time ?';
    }
    let dt = Date.now() - at.getTime();
    // console.log(dt);
    const h = Math.floor(dt / 1000 / 60 / 60); dt = dt - h * 60 * 60 * 1000;
    const m = Math.floor(dt / 1000 / 60); dt = dt - h * 60 * 1000;
    const s = Math.floor(dt / 1000); dt = dt - m * 1000;
    const ms = dt - s * 1000;
    // console.log(h, m, s, ms);

    if (h !== 0) {
        return sprintf('%dhrs %dmin', h, m);
    } else if (m !== 0) {
        return sprintf('%dmin %ds', m, s);
    } else if (s !== 0) {
        return sprintf('%.01fs', s + ms / 1000);
    } else {
        return sprintf('%dms', ms);
    }
}
