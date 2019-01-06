
export class CommonLogger {

    public static info (format: string, ...param: any) {
        console.log('INFO:', format, ...param);
    }

    public static warn (format: string, ...param: any) {
        console.log('WARNING:', format, ...param);
    }

}
