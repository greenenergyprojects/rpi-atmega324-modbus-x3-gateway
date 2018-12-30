
export abstract class ModbusFrame  {

    public abstract get createdAt (): Date;
    public abstract get buffer(): Buffer;
    public abstract get ok (): boolean;
    public abstract get checkSumOk (): boolean;
    public abstract get address (): number;
    public abstract get funcCode (): number;
    public abstract get excCode (): number;
    public abstract byteAt (index: number): number;
    public abstract wordAt (index: number): number;

}
