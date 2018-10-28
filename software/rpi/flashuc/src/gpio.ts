
export class Gpio {

    public static async setup (pin: string, direction: 'OUT') {
        return new Promise<void>( (res, rej) => {
            let d: any;
            switch (direction) {
                case 'OUT': d = this.gpio.DIR_OUT; break;
                default: rej(new Error('invalid direction')); return;
            }
            this.gpio.setup(pin, d, (err: any) => {
                if (err instanceof Error) {
                    rej(err);
                } else if (err) {
                    rej(new Error(err));
                }
                res();
            });
        });
    }

    public static async setPin (pin: string, value: boolean, timeoutMillis?: number) {
        return new Promise<void>( (res, rej) => {
            this.gpio.write(pin, value, (err: any) => {
                if (err instanceof Error) {
                    rej(err);
                } else if (err) {
                    rej(new Error(err));
                }
                if (timeoutMillis > 0) {
                    setTimeout( () => {
                        res();
                    }, timeoutMillis);
                } else {
                    res();
                }
            });
        });
    }

    public static shutdown () {
        if (this._gpio) {
            this._gpio.destroy();
            this._gpio = null;
        }
    }

    private static _gpio: any;

    private static get gpio (): any {
        if (!this._gpio) {
            this._gpio = require('rpi-gpio');
        }
        return this._gpio;

    }
}