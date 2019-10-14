
import * as debugsx from 'debug-sx';
const debug: debugsx.IFullLogger = debugsx.createFullLogger('CsvFile');

import * as fs from 'fs';

export class CsvFile {

    private _path: string;
    private _lastHeader: string;
    private _lastSize: number;
    private _lastModifiedMs: number;
    private _lastLineNumber: number;

    constructor (path: string) {
        this._path = path;
    }

    public get path (): string {
        return this._path;
    }

    public async addLine (name: string, header: string, line: string) {
        let s = '';
        let stats: fs.Stats;
        let saveHeader = false;
        try {
            const x = await this.readLastHeaderAndLineFromFile(name);
            if (x && x.lastLine) {
                const pos = x.lastLine.indexOf(',');
                const f1 = x.lastLine.slice(0, pos);
                if (f1.match(/^"[0-9]+"$/)) {
                    this._lastLineNumber = + f1.slice(1, f1.length - 1);
                }
            }
            stats = fs.statSync(this._path);
            if (!stats || stats.mtimeMs !== this._lastModifiedMs || stats.size !== this._lastSize) {
                if (!x || !x.lastHeader || x.lastHeader !== header) {
                    saveHeader = true;
                }
            } else if (header !== this._lastHeader) {
                saveHeader = true;
            }
        } catch (err) {
            saveHeader = true;
        }

        if (this._lastLineNumber >= 0) {
            this._lastLineNumber++;
        } else {
            this._lastLineNumber = 0;
        }

        if (saveHeader) {
            s = header + '\n';
            debug.fine('%s: save header + line (%d)', this._path, this._lastLineNumber);
        } else {
            debug.fine('%s: save line (%d)', this._path, this._lastLineNumber);
        }

        s = s + '"' + this._lastLineNumber + '",' + line + '\n';
        fs.appendFileSync(this.path, s);
        try {
            stats = fs.statSync(this._path);
            this._lastHeader = header;
            this._lastSize = stats.size;
            this._lastModifiedMs = stats.mtimeMs;
        } catch (err) {
            debug.warn('cannot read stats from file %s\n%e', this._path, err);
        }
    }


    private async readLastHeaderAndLineFromFile (name: string): Promise<{ lastHeader: string, lastLine: string}> {
        return new Promise<{ lastHeader: string, lastLine: string}>( (resolve, reject) => {
            let lastHeader = '';
            let lastLine = '';
            const rs = fs.createReadStream(this._path, { encoding: 'utf8' });
            let s = '';
            let index = 0;
            rs.on('data', (chunk) => {
                s += chunk;
                while (true) {
                    const pos1 = index;
                    index = chunk.indexOf('\n', index);
                    if (index < 0) { break; }
                    const line = s.slice(pos1, index);
                    index++;
                    const pos2 = line.indexOf(',');
                    if (pos2 < 0) {
                        lastHeader = line;
                    } else {
                        const c0 = line.slice(0, pos2);
                        if (!c0.match(/^"[0-9]+"$/)) {
                            lastHeader = line;
                        } else {
                            lastLine = line;
                        }
                    }
                }
            });
            rs.on('end', () => {
                rs.close();
            });
            rs.on('close', () => {
                resolve({ lastHeader: lastHeader, lastLine: lastLine });
            });
            rs.on('error', (err) => {
                reject(err);
            });

        });
    }

    private async readFirstLine (): Promise<string> {
        return new Promise<string>( (resolve, reject) => {
            const rs = fs.createReadStream(this._path, { encoding: 'utf8' });
            let line = '';
            let pos = 0;
            rs.on('data', (chunk) => {
                const index = chunk.indexOf('\n');
                line += chunk;
                if (index !== -1) {
                    line = line.slice(0, pos + index);
                    rs.close();
                } else {
                    pos += chunk.length;
                }
            });
            rs.on('close', () => {
                resolve(line);
            });
            rs.on('error', (err) => {
                reject(err);
            });
        });
    }
}
