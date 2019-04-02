import * as fs from 'fs';
import * as path from 'path';
import * as nconf from 'nconf';

process.on('unhandledRejection', (reason, p) => {
    const now = new Date();
    console.log(now.toLocaleDateString() + '/' + now.toLocaleTimeString() + ': unhandled rejection at: Promise', p, 'reason:', reason);
});

// ***********************************************************
// configuration, logging
// ***********************************************************

let configFilename = path.join(__dirname, '..', 'config.json');
for (let i = 2; i < process.argv.length; i++) {
    const v = process.argv[i];
    if (v === '--config' || v === '-c') {
        configFilename = process.argv[i + 1];
        if (!configFilename.startsWith('/')) {
            path.join(__dirname, '..', configFilename);
        }
    }
}
nconf.argv().env();

try {
    console.log('using config file %s', configFilename);
    fs.accessSync(configFilename, fs.constants.R_OK);
    nconf.file(configFilename);
} catch (err) {
    console.log('Error on config file ' + configFilename + '\n' + err);
    process.exit(1);
}

let debugConfig: any = nconf.get('debug');
if (!debugConfig) {
    debugConfig = { enabled: '*::*' };
}
for (const a in debugConfig) {
    if (debugConfig.hasOwnProperty(a)) {
        const name: string = (a === 'enabled') ? 'DEBUG' : 'DEBUG_' + a.toUpperCase();
        if (!process.env[name] && (debugConfig[a] !== undefined || debugConfig[a] !== undefined)) {
            process.env[name] = debugConfig[a] ? debugConfig[a] : debugConfig[a];
        }
    }
}

// logging with debug-sx/debug
import * as debugsx from 'debug-sx';
import { stringify } from 'querystring';
import { SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION } from 'constants';
const debug: debugsx.IDefaultLogger = debugsx.createDefaultLogger('main');

debugsx.formatters.h = (v: any) => {
    if (v instanceof Buffer) {
        let s = '';
        for (const b of v) {
            if (b >= 32 && b <= 126) {
                s = s + sprintf(' %02x', b) + '(' + String.fromCodePoint(b) + ')';
            } else {
                s = s + sprintf(' %02x', b);
            }
        }
        return s;
    } else {
        return v.toString('hex');
    }
};

// debugsx.addHandler(debugsx.createConsoleHandler('stdout'));
debugsx.addHandler(debugsx.createRawConsoleHandler());
const logfileConfig = nconf.get('logfile');
if (logfileConfig) {
    for (const att in logfileConfig) {
        if (!logfileConfig.hasOwnProperty(att)) { continue; }
        const logHandlerConfig = logfileConfig[att];
        if (logHandlerConfig.disabled) { continue; }
        const h = debugsx.createFileHandler( logHandlerConfig);
        console.log('Logging ' + att + ' to ' + logHandlerConfig.filename);
        debugsx.addHandler(h);
    }
}

// ***************************************************************************

import { Elf } from './elf/elf';
import { sprintf } from 'sprintf-js';
import { Device } from './devices/device';
import { Serial, ISerialConfig } from './serial';
import { Gpio } from './gpio';



debug.info('start of application');
main();

async function main () {
    try {
        const serialConfig: ISerialConfig = nconf.get('serial');
        if (!serialConfig) {
            throw new Error('missing attribute serial in config file');
        }
        // const elfFilename = path.join(__dirname, '..', 'atmega324p_u1.elf');
        // const serial = await Serial.createInstance({ device: '/dev/ttyS0', options: { baudRate: 115200 }});
        const serial = await Serial.createInstance(serialConfig);
        for (const t of serialConfig.targets) {
            if (t.disabled) { continue; }
            const elfFilename = path.join(__dirname, '..', t.program.path);
            const elf = await Elf.createFromFile(elfFilename);
            const d: Device = new Device(t.program.cpu, elf);
            // console.log(d.hexdump());
            await d.flash(t);
        }
        await serial.close();
        Gpio.shutdown();

    } catch (err) {
        console.log(err);
        process.exit(1);
    }

}
