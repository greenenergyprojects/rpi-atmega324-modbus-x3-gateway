import * as debugsx from 'debug-sx';
const debug: debugsx.IFullLogger = debugsx.createFullLogger('routers:RouterData');

import * as fs from 'fs';
import * as path from 'path';

import * as express from 'express';

import { handleError, RouterError, BadRequestError, AuthenticationError } from './router-error';
import { VERSION } from '../main';




export class RouterData {

    public static get Instance(): express.Router {
        if (!this._instance) {
            this._instance = new RouterData;
        }
        return this._instance._router;
    }

    private static _instance: RouterData;

    // ******************************************************

    private _router: express.Router;

    private constructor () {
        this._router = express.Router();
        this._router.get('/server/about', (req, res, next) => this.getServerAbout(req, res, next));
    }

    private async getServerAbout (req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            res.json({ name: 'server hwc (Hot Water Controller)', version: VERSION });
        } catch (err) {
            handleError(err, req, res, next, debug);
        }
    }

}
