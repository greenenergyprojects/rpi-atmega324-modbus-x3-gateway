import * as debugsx from 'debug-sx';
const debug: debugsx.ISimpleLogger = debugsx.createSimpleLogger('common-class');


export class CommonLogger {

    public static info (format: string, ...param: any) {
        debug.info(format, ...param);
    }

    public static warn (format: string, ...param: any) {
        debug.warn(format, ...param);
    }

}
