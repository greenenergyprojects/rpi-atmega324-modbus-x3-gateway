
import * as debugsx from 'debug-sx';
const debug: debugsx.IFullLogger = debugsx.createFullLogger('routers:RouterControl');

import * as fs from 'fs';
import * as path from 'path';

import * as express from 'express';

import { handleError, RouterError, BadRequestError, AuthenticationError } from './router-error';
import { Nibe1155 } from '../devices/nibe1155';
import { HotWaterController } from '../devices/hot-water-controller';
import { BoilerMode, IBoilerMode, ControllerMode } from '../data/common/hot-water-controller/boiler-mode';


export class RouterControl {

    public static getInstance(): express.Router {
        if (!this._instance) {
            this._instance = new RouterControl;
        }
        return this._instance._router;
    }

    private static _instance: RouterControl;

    // ******************************************************

    private _router: express.Router;

    private constructor () {
        this._router = express.Router();
        // this._router.get('/heatpumpmode', (req, res, next) => this.getHeatpumpmode(req, res, next));
        // this._router.post('/heatpumpmode', (req, res, next) => this.postHeatpumpmode(req, res, next));
        this._router.post('/boilermode', (req, res, next) => this.postBoilerMode(req, res, next));

    }

    // private async getHeatpumpmode (req: express.Request, res: express.Response, next: express.NextFunction) {
    //     try {
    //         res.send({ ok: true});
    //     } catch (err) {
    //         handleError(err, req, res, next, debug);
    //     }
    // }

    // private async postHeatpumpmode (req: express.Request, res: express.Response, next: express.NextFunction) {
    //     try {
    //         debug.warn(req.body);
    //         const x: IHeatpumpMode = req.body;
    //         if (!x || !x.createdAt || !x.desiredMode) { throw new BadRequestError('invalid request'); }
    //         if (x.pin === undefined) { throw new AuthenticationError('missing pin'); }
    //         const rv = await Nibe1155.Instance.setHeatpumpMode(x);
    //         res.send(rv);
    //     } catch (err) {
    //         handleError(err, req, res, next, debug);
    //     }
    // }

    private async postBoilerMode (req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            debug.info('POST /boilermode %o', req.body);
            let bm: BoilerMode;
            try {
                const data: IBoilerMode = req.body;
                bm = new BoilerMode(data);
                debug.info('POST /boilermode parsing ok');
            } catch (err) {
                throw new BadRequestError('invalid request', err);
            }
            debug.info('POST /boilermode setBoilerMode()...');
            const rv = await HotWaterController.getInstance().setBoilerMode(bm);
            debug.info('POST return -> %o', rv);
            res.send(rv.toObject());
        } catch (err) {
            handleError(err, req, res, next, debug);
        }
    }

}
