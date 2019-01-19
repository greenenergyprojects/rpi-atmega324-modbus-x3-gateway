export const VERSION = '1.2.0';

import * as nconf from 'nconf';
import * as fs from 'fs';
import * as path from 'path';

import * as git from './utils/git';

process.on('unhandledRejection', (reason, p) => {
    const now = new Date();
    console.log(now.toLocaleDateString() + '/' + now.toLocaleTimeString() + ': unhandled rejection at: Promise', p, 'reason:', reason);
});


// ***********************************************************
// configuration, logging
// ***********************************************************

nconf.argv().env();
const configFilename = path.join(__dirname, '../config.json');
try {
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
const debug: debugsx.IDefaultLogger = debugsx.createDefaultLogger('main');

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


// ***********************************************************
// startup of application
//   ... things to do before server can be started
// ***********************************************************

import { sprintf } from 'sprintf-js';
import { Server } from './server';
import { Auth } from './auth';
import { DbUser } from './db-user';
import { Monitor } from './monitor';
import { Statistics } from './statistics';
import { PiTechnik } from './devices/pi-technik';
import { Nibe1155 } from './devices/nibe1155';
import { HotWaterController } from './devices/hot-water-controller';
import { FroniusSymo } from './devices/fronius-symo';
import { ModbusDevice } from './devices/modbus-device';
import { ModbusTcp } from './modbus/modbus-tcp';
import { FroniusMeterTcp } from './devices/fronius-meter-tcp';

doStartup();

async function doStartup () {
    // await delay(3000);
    // debugger;
    debug.info('Start of Home Control Server V' + VERSION);
    try {
        if (nconf.get('git')) {
            const gitInfo = await git.getGitInfo();
            startupPrintVersion(gitInfo);
        }

        await startupParallel();
        await Statistics.createInstance(nconf.get('statistics'));
        const piTechnik = await PiTechnik.createInstance(nconf.get('pi-technik'));
        const monitor = await Monitor.createInstance(nconf.get('monitor'));
        const nibe1155 = await Nibe1155.createInstance(nconf.get('nibe1155'));
        const hwc = await HotWaterController.createInstance(nconf.get('hot-water-controller'));
        const froniusSymo = new FroniusSymo(nconf.get('froniusSymo'));
        const gridmeter = new FroniusMeterTcp(nconf.get('gridMeter'));
        ModbusDevice.addInstance(froniusSymo);
        ModbusDevice.addInstance(gridmeter);
        await froniusSymo.start();
        await gridmeter.start();
        await nibe1155.start();
        await hwc.start();
        await piTechnik.start();
        await monitor.start();

        await startupServer();
        doSomeTests();
        process.on('SIGINT', () => {
            console.log('...caught interrupt signal');
            shutdown('interrupt signal (CTRL + C)').catch( (err) => {
                console.log(err);
                process.exit(1);
            });
        });
        debug.info('startup finished, enter now normal running mode.');

    } catch (err) {
        console.log(err);
        console.log('-----------------------------------------');
        console.log('Error: exit program');
        process.exit(1);
    }
}

// setTimeout( () => { modbus.close(); }, 5000);

// ***********************************************************
// startup and shutdown functions
// ***********************************************************

async function shutdown (src: string): Promise<void> {
    debug.info('starting shutdown ... (caused by %s)', src || '?');
    const shutdownMillis = +nconf.get('shutdownMillis');
    const timer = setTimeout( () => {
        console.log('Some jobs hanging? End program with exit code 1!');
        process.exit(1);
    }, shutdownMillis > 0 ? shutdownMillis : 500);
    let rv = 0;

    try { await Server.Instance.stop(); } catch (err) { rv++; console.log(err); }
    debug.fine('monitor shutdown done');

    clearTimeout(timer);
    debug.info('shutdown successfully finished');
    process.exit(rv);
}

function startupPrintVersion (info?: git.GitInfo) {
    console.log('main.ts Version ' + VERSION);
    if (info) {
        console.log('GIT: ' + info.branch + ' (' + info.hash + ')');
        const cnt = info.modified.length;
        console.log('     ' + (cnt === 0 ? 'No files modified' : cnt + ' files modified'));
    }
}

async function startupParallel (): Promise<any []> {
    debug.info('startupParallel finished');
    return [];
}

async function startupServer (): Promise<void> {
    const configServer = nconf.get('server');
    const configAuth = nconf.get('auth');
    const configUsers = nconf.get('database-users');
    if (configServer && configServer.start) {
        await DbUser.createInstance(configUsers);
        await Auth.createInstance(configAuth);
        await Server.Instance.start();
    }
}

async function startupShutdown (src?: string): Promise<void> {
    const shutdownMillis = +nconf.get('shutdownMillis');
    if (shutdownMillis > 0) {
        setTimeout( () => {
            shutdown(src ? src : 'startupShutdown').then( () => {
                console.log('shutdown successful');
                process.exit(0);
            }).catch( err => {
                console.log(err);
                console.log('shutdown fails');
                process.exit(1);
            });
        }, shutdownMillis);
        debug.info('startupShutdown finished, shutdown in ' + (shutdownMillis / 1000) + ' seconds.');
    }
}


async function delay (ms: number) {
    return new Promise<void>( (res, rej) => {
        setTimeout( () => {
            res();
        }, ms);
    });
}


async function doSomeTests () {
    return;
}
