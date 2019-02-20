import * as debugsx from 'debug-sx';
const debug: debugsx.IFullLogger = debugsx.createFullLogger('Archive');

import * as fs from 'fs';
import * as zlib from 'zlib';

import { sprintf } from 'sprintf-js';


import { ArchiveConfig } from './archive-worker';
import { ArchiveRequest } from '../data/common/home-control/archive-request';
import { StatisticsType } from '../data/common/home-control/statistics';
import { StatisticsDataCollection } from '../data/common/home-control/statistics-data-collection';
import { IArchiveResponse } from '../data/common/home-control/archive-response';
import { StatisticsCache } from './statistics-cache';
import { reverse } from 'dns';
import { IBackup, Backup } from './backup';
import { ICompactBackup, CompactBackup } from './compact-backup';

export class Archive {

    private _config: ArchiveConfig;

    constructor (config: ArchiveConfig) {
        this._config = config;
        debug.info('---> config %o', config);
    }

    public async get (req: ArchiveRequest): Promise<IArchiveResponse> {
        const rv: IArchiveResponse = {
            request: req.toObject(),
            result: {}
        };
        const collections = await this.loadData(req.type, req.from, req.to);
        for (const id of req.dataIds) {
            let re: RegExp;
            if (id.startsWith('/') && id.endsWith('/')) {
                re = new RegExp(id.substr(1, id.length - 2));
            } else {
                re = this.glob2regEx(id);
            }

            for (const c of collections) {
                if (c.id.match(re)) {
                    if (!Array.isArray(rv.result[c.id])) {
                        rv.result[c.id] = [];
                    }
                    rv.result[c.id].push(c.toObject());
                }
            }
        }
        return rv;
    }


    private async loadData(t: StatisticsType, from: Date, to: Date): Promise<StatisticsDataCollection []> {
        const cfg = this._config.path[t];
        if (!cfg || !cfg.path)  {
            return [];
        }
        let rv: StatisticsDataCollection [] = [];
        while (from < to) {
            const path = StatisticsCache.replaceControls(cfg.path, from);
            if (fs.existsSync(path)) {
                try {
                    let content = fs.readFileSync(path);
                    if (path.lastIndexOf('.gz') + 3 === path.length) {
                        content = zlib.gunzipSync(content);
                    }
                    const x = content.toString('utf-8');
                    const o: ICompactBackup = JSON.parse(x);
                    const compactBackup = new CompactBackup(o);
                    rv = rv.concat(compactBackup.data);
                    // if (o.createdAt && Array.isArray(o.data)) {
                    //     for (const d of o.data) {
                    //         rv.push(StatisticsDataCollection.createInstance(d));
                    //     }
                    // }
                } catch (err) {
                    debug.warn('loadData(): cannot parse %s', path);
                }
            }
            switch (t) {
                case 'second': from.setTime(from.getTime() + 1000); break;
                case 'minute': from.setTime(from.getTime() + 60 * 1000); break;
                case 'min10' : from.setTime(from.getTime() + 10 * 60 * 1000); break;
                case 'hour':   from.setTime(from.getTime() + 60 * 60 * 1000); break;
                case 'day':    from.setTime(from.getTime() + 24 * 60 * 60 * 1000); break;
                case 'week':   from.setTime(from.getTime() + 7 * 24 * 60 * 60 * 1000); break;
                case 'month': {
                    const m = from.getMonth() + 1;
                    from = m <= 10 ? new Date(from.getFullYear(), m + 1) : new Date(from.getFullYear() + 1, 0);
                    break;
                }
                case 'year': {
                    from = new Date(from.getFullYear() + 1);
                    break;
                }
                default: from = to; break;
            }
        }
        return rv;

    }

    private glob2regEx (pat: string): RegExp {
        const f = (p: string) =>  {
            return p.replace(/\W/g, (m0) => {
                return (
                    m0 === '?' ? '[\\s\\S]' :
                    '\\' + m0
                );
            });
        };

        let n = 1;
        pat = pat.replace(/\W[^*]*/g, (m0, mp, ms) => {
            if (m0.charAt(0) !== '*') {
                return f(m0);
            }
            const eos = mp + m0.length === ms.length ? '$' : '';
            return '(?=([\\s\\S]*?' + f(m0.substr(1)) + eos + '))\\' + n++;
        });

        return new RegExp('^' + pat + '$');
    }


}
