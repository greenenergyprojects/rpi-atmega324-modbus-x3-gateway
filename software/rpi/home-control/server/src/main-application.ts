
import * as debugsx from 'debug-sx';
const debug: debugsx.IDefaultLogger = debugsx.createDefaultLogger('application');

import * as nconf from 'nconf';

import { VERSION, Main } from './main';
import * as git from './utils/git';

import { sprintf } from 'sprintf-js';
import { Server } from './server';
import { Auth } from './auth';
import { DbUser } from './db-user';
import { Monitor } from './monitor';
import { Statistics as OldStatistics } from './statistics';
import { Statistics as NewStatistics } from './statistics/statistics';
import { PiTechnik } from './devices/pi-technik';
import { Nibe1155 } from './devices/nibe1155';
import { HotWaterController } from './devices/hot-water-controller';
import { FroniusSymo } from './devices/fronius-symo';
import { ModbusDevice } from './devices/modbus-device';
import { ModbusTcp } from './modbus/modbus-tcp';
import { FroniusMeterTcp } from './devices/fronius-meter-tcp';


export class MainApplication {

    public static getInstance (): MainApplication {
        if (!MainApplication.instance) { throw new Error('instance not created yet'); }
        return MainApplication.instance;
    }

    public static async createInstance (): Promise<MainApplication> {
        if (MainApplication.instance) { throw new Error('instance already created'); }
        MainApplication.instance = new MainApplication();
        await MainApplication.instance.init();
        return MainApplication.instance;
    }

    private static instance: MainApplication;

    // *****************************************************************

    private _shutdownBy: string;

    public constructor () {
    }

    public async start () {
        if (this._shutdownBy) { throw new Error('application in shutdown'); }
        debug.info('Start of Home Control Server V' + VERSION);
        try {
            if (nconf.get('git')) {
                const gitInfo = await git.getGitInfo();
                this.startupPrintVersion(gitInfo);
            }

            await this.startupParallel();
            await OldStatistics.createInstance(nconf.get('statistics-old'));
            const newStatistics = await NewStatistics.createInstance(nconf.get('statistics'));
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

            await this.startupServer();
            this.doSomeTests();
            debug.info('startup finished, enter now normal running mode.');

        } catch (err) {
            debug.warn('start of main-application fails\n%e', err);
            throw new MainApplicationError('start fails', err);
        }
    }

    public async shutdown (src: string) {
        if (this._shutdownBy) { throw new Error('application in shutdown'); }
        this._shutdownBy = src;
        debug.info('starting shutdown ... (caused by %s)', src || '?');
        return new Promise<void>( (res, rej) => {
            const shutdownMillis = +nconf.get('shutdownMillis');
            const timer = setTimeout( () => {
                debug.warn('Some jobs hanging?');
                rej(new Error('shutdown fails, hanging jobs?'));
            }, shutdownMillis > 0 ? shutdownMillis : 500);
            this.executeShutdown().then( (failedShutdownJobs) => {
                if (timer) {
                    clearTimeout(timer);
                }
                if (failedShutdownJobs.length === 0) {
                    res();
                } else {
                    rej(new Error('Shutdown fails!'));
                }
            }).catch ( (err) => {
                if (timer) {
                    clearTimeout(timer);
                }
                debug.warn('Shutdown fails!\n%e', err);
                rej(err);
            });
        });
    }

    private async executeShutdown (): Promise<{ job: string, promise: Promise<any> } []> {
        let errCnt = 0;
        const rv: { job: string, promise: Promise<any> } [] = [];

        let p: Promise<any>;
        try {
            p =  Server.Instance.stop();
            await p;
        } catch (err) {
            errCnt++;
            debug.warn('stop server fails\n%e', err);
            rv.push({ job: 'server', promise: p });
        }

        return rv;
    }


    private async init () {
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
    }

    private startupPrintVersion (info?: git.GitInfo) {
        console.log('main.ts Version ' + VERSION);
        if (info) {
            console.log('GIT: ' + info.branch + ' (' + info.hash + ')');
            const cnt = info.modified.length;
            console.log('     ' + (cnt === 0 ? 'No files modified' : cnt + ' files modified'));
        }
    }

    private async startupParallel (): Promise<any []> {
        debug.info('startupParallel finished');
        return [];
    }

    private async startupServer () {
        const configServer = nconf.get('server');
        const configAuth = nconf.get('auth');
        const configUsers = nconf.get('database-users');
        if (configServer && configServer.start) {
            await DbUser.createInstance(configUsers);
            await Auth.createInstance(configAuth);
            await Server.Instance.start();
        }
    }

    // private async startupShutdown (src: string) {
    //     const shutdownMillis = +nconf.get('shutdownMillis');
    //     if (shutdownMillis > 0) {
    //         const timer = setTimeout( () => {
    //             this.shutdown(src ? src : 'startupShutdown').then( () => {
    //                 clearTimeout(timer);;
    //                 debug.info('shutdown successful');
    //             }).catch( err => {
    //                 console.log(err);
    //                 console.log('shutdown fails');
    //                 process.exit(1);
    //             });
    //         }, shutdownMillis);
    //         debug.info('startupShutdown finished, shutdown in ' + (shutdownMillis / 1000) + ' seconds.');
    //     }
    // }

    private async delay (ms: number) {
        return new Promise<void>( (res, rej) => {
            setTimeout( () => {
                res();
            }, ms);
        });
    }

    private async doSomeTests () {
        return;
    }

}

export class MainApplicationError extends Error {
    public constructor (message: string, public error: Error) { super(message); }
}







