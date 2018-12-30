// import * as nconf from 'nconf';
// import { ModbusTcp, ModbusTcpTransactionError, ModbusTransaction } from '../modbus/modbus-tcp';
// import { ModbusTcpDevice } from './modbus-tcp-device';

// import * as debugsx from 'debug-sx';
// import { ModbusDevice } from './modbus-device';
// const debug: debugsx.IDefaultLogger = debugsx.createDefaultLogger('devices:FroniusSymo');

// export interface IFroniusSymoConfig {
//     disabled?: boolean;
//     host: string;
//     port: number;
//     modbusAddress?: number;
//     timeoutMillis?: {
//         default: number;
//         froniusRegister?: number;
//         common?: number;
//         inverter?: number;
//         nameplate?: number;
//         setting?: number;
//         status?: number;
//         control?: number;
//         storage?: number;
//         inverterExtension?: number;
//         stringCombiner?: number;
//         meter?: number;
//     };
// }


// export class FroniusSymo extends ModbusTcpDevice {

//     public static getInstance (id: string | number): FroniusSymo {
//         id = id.toString();
//         let rv = ModbusDevice.getInstance(id);
//         if (!rv) {
//             rv = ModbusDevice.instances.find( (d) => (d instanceof FroniusSymo) && (d.address === +id) );
//         }
//         if (!rv || !( rv instanceof FroniusSymo )) {
//             throw new Error('Fronius Symo with id ' + id + ' not found');
//         }
//         return rv;
//     }

//     private _config: IFroniusSymoConfig;


//     public constructor (gateway: ModbusTcp, config: IFroniusSymoConfig) {
//         super(gateway, config.modbusAddress || 1);
//         if (!config.timeoutMillis) { config.timeoutMillis = { default: 1000 }; }
//         if (config.timeoutMillis.default <= 0) { throw new Error('invalid FroniusSymo config'); }
//         for (const a of [ 'froniusRegister', 'common', 'inverter', 'nameplate', 'setting', 'status',
//                           'control', 'storage', 'inverterExtension', 'stringCombiner', 'meter']) {
//             if (!(<any>config.timeoutMillis)[a]) {
//                 (<any>config.timeoutMillis)[a] = config.timeoutMillis.default;
//             }
//         }
//         this._config = config;
//     }

//     public get froniusRegister (): FroniusRegister { return this._froniusRegister; }
//     public get inverter (): Inverter { return this._inverter; }
//     public get nameplate (): Nameplate { return this._nameplate; }
//     public get storage (): Storage { return this._storage; }
//     public get inverterExtension (): InverterExtension { return this._inverterExtension; }
//     public get meter (): Meter { return this._meter; }

//     public async start () {
//         if (this._gateway.disabled) {
//             return;
//         }
//         await this.readFroniusRegister();
//         await this.readCommon();
//         await this.readInverter();
//         await this.readNameplate();
//         await this.readSetting();
//         await this.readStatus();
//         await this.readControl();
//         await this.readStorage();
//         await this.readInverterExtension();
//         await this.readStringCombiner();
//         try {
//             await this.readMeter();
//         } catch (err) {
//             debug.warn('Fronius meter not avaliable, NOTSTROM-Betrieb?');
//         }
//         const config = nconf.get('froniusSymo');
//     }

//     public async stop () {

//     }

//     public async readFroniusRegister (): Promise<FroniusRegister> {
//         try {
//             const to = this._config.timeoutMillis.froniusRegister ? this._config.timeoutMillis.froniusRegister : this._config.timeoutMillis.default;
//             if (!this._froniusRegister || (Date.now() - this._froniusRegister.createdAt.getTime() > 1000 )) {
//                 const mt212 = await this._gateway.readHoldRegisters(this.address, 212, 5, to);
//                 const mt500 = await this._gateway.readHoldRegisters(this.address, 500, 14, to);
//                 this._froniusRegister = FroniusRegisterFactory.parseModbusTransaction(mt212, mt500);
//                 if (debug.fine.enabled) {
//                     debug.fine('readFroniusRegister(): %o\n%O', this._froniusRegister, this._froniusRegister.toHumanReadableObject());
//                 }
//             }
//             return this._froniusRegister;
//         } catch (err) {
//             debug.warn(err);
//             throw err;
//         }
//     }

//     public async readCommon (): Promise<Common> {
//         try {
//             const to = this._config.timeoutMillis.common ? this._config.timeoutMillis.common : this._config.timeoutMillis.default;
//             if (!this._common || (Date.now() - this._common.createdAt.getTime() > 1000 )) {
//                 const mt = await this._gateway.readHoldRegisters(this.address, 40001, 69, to);
//                 this._common = CommonFactory.parseModbusTransaction(mt);
//                 if (debug.fine.enabled) {
//                     debug.fine('readCommon(): %o\n%O', this._common, this._common.toHumanReadableObject());
//                 }
//             }
//             return this._common;
//         } catch (err) {
//             debug.warn(err);
//             throw err;
//         }
//     }

//     public async readInverter (): Promise<Inverter> {
//         try {
//             const to = this._config.timeoutMillis.inverter ? this._config.timeoutMillis.inverter : this._config.timeoutMillis.default;
//             if (!this._inverter || (Date.now() - this._inverter.createdAt.getTime() > 1000 )) {
//                 const mt = await this._gateway.readHoldRegisters(this.address, 40070, 62, to);
//                 this._inverter = InverterFactory.parseModbusTransaction(mt);
//                 if (debug.fine.enabled) {
//                     debug.fine('readInverter(): %o\n%O', this._inverter, this._inverter.toHumanReadableObject());
//                 }
//             }
//             return this._inverter;
//         } catch (err) {
//             debug.warn(err);
//             throw err;
//         }
//     }

//     public async readNameplate (): Promise<Nameplate> {
//         try {
//             const to = this._config.timeoutMillis.nameplate ? this._config.timeoutMillis.nameplate : this._config.timeoutMillis.default;
//             if (!this._nameplate || (Date.now() - this._nameplate.createdAt.getTime() > 1000 )) {
//                 const mt = await this._gateway.readHoldRegisters(this.address, 40132, 28, to);
//                 this._nameplate = NameplateFactory.parseModbusTransaction(mt);
//                 if (debug.fine.enabled) {
//                     debug.fine('readNamePlate(): %o\n%O', this._nameplate, this._nameplate.toHumanReadableObject());
//                 }
//             }
//             return this._nameplate;
//         } catch (err) {
//             debug.warn(err);
//             throw err;
//         }
//     }

//     public async readSetting (): Promise<Setting> {
//         try {
//             const to = this._config.timeoutMillis.setting ? this._config.timeoutMillis.setting : this._config.timeoutMillis.default;
//             if (!this._setting || (Date.now() - this._setting.createdAt.getTime() > 1000 )) {
//                 const mt = await this._gateway.readHoldRegisters(this.address, 40160, 31, to);
//                 this._setting = SettingFactory.parseModbusTransaction(mt);
//                 if (debug.fine.enabled) {
//                     debug.fine('readSetting(): %o\n%O', this._setting, this._setting.toHumanReadableObject());
//                 }
//             }
//             return this._setting;
//         } catch (err) {
//             debug.warn(err);
//             throw err;
//         }
//     }

//     public async readStatus (): Promise<Status> {
//         try {
//             const to = this._config.timeoutMillis.status ? this._config.timeoutMillis.status : this._config.timeoutMillis.default;
//             if (!this._status || (Date.now() - this._status.createdAt.getTime() > 1000 )) {
//                 const mt = await this._gateway.readHoldRegisters(this.address, 40192, 45, to);
//                 this._status = StatusFactory.parseModbusTransaction(mt);
//                 if (debug.fine.enabled) {
//                     debug.fine('readStatus(): %o\n%O', this._status, this._status.toHumanReadableObject());
//                 }
//             }
//             return this._status;
//         } catch (err) {
//             debug.warn(err);
//             throw err;
//         }
//     }

//     public async readControl (): Promise<Control> {
//         try {
//             const to = this._config.timeoutMillis.control ? this._config.timeoutMillis.control : this._config.timeoutMillis.default;
//             if (!this._control || (Date.now() - this._control.createdAt.getTime() > 1000 )) {
//                 const mt = await this._gateway.readHoldRegisters(this.address, 40237, 27, to);
//                 this._control = ControlFactory.parseModbusTransaction(mt);
//                 if (debug.fine.enabled) {
//                     debug.fine('readControl(): %o\n%O', this._control, this._control.toHumanReadableObject());
//                 }
//             }
//             return this._control;
//         } catch (err) {
//             debug.warn(err);
//             throw err;
//         }
//     }

//     public async readStorage (): Promise<Storage> {
//         try {
//             const to = this._config.timeoutMillis.storage ? this._config.timeoutMillis.storage : this._config.timeoutMillis.default;
//             if (!this._storage || (Date.now() - this._storage.createdAt.getTime() > 1000 )) {
//                 const mt = await this._gateway.readHoldRegisters(this.address, 40314, 26, to);
//                 this._storage = StorageFactory.parseModbusTransaction(mt);
//                 if (debug.fine.enabled) {
//                     debug.fine('readStorage(): %o\n%O', this._storage, this._storage.toHumanReadableObject());
//                 }
//             }
//             return this._storage;
//         } catch (err) {
//             debug.warn(err);
//             throw err;
//         }
//     }


//     public async readInverterExtension (): Promise<InverterExtension> {
//         try {
//             const to = this._config.timeoutMillis.inverterExtension ? this._config.timeoutMillis.inverterExtension : this._config.timeoutMillis.default;
//             if (!this._inverterExtension || (Date.now() - this._inverterExtension.createdAt.getTime() > 1000 )) {
//                 const mt = await this._gateway.readHoldRegisters(this.address, 40264, 50, to);
//                 this._inverterExtension = InverterExtensionFactory.parseModbusTransaction(mt);
//                 if (debug.fine.enabled) {
//                     debug.fine('readInverterExtension(): %o\n%O', this._inverterExtension, this._inverterExtension.toHumanReadableObject());
//                 }
//             }
//             return this._inverterExtension;
//         } catch (err) {
//             debug.warn(err);
//             throw err;
//         }
//     }

//     public async readStringCombiner (): Promise<StringCombiner> {
//         let mt: ModbusTransaction;
//         try {
//             const to = this._config.timeoutMillis.stringCombiner ? this._config.timeoutMillis.stringCombiner : this._config.timeoutMillis.default;
//             if (!this._stringCombiner || (Date.now() - this._stringCombiner.createdAt.getTime() > 1000 )) {
//                 mt = await this._gateway.readHoldRegisters(this.address, 40070, 58, to);
//             } else {
//                 return this._stringCombiner;
//             }
//             // debug.info('request:\nMBAP: %o\nPDU:  %o', mt.request.mbapHeader, mt.request.pdu);
//             // debug.info('response:\nMBAP: %o\nPDU:  %o', mt.response.mbapHeader, mt.response.pdu);
//         } catch (err) {
//             debug.warn(err);
//             throw err;
//         }
//         try {
//             this._stringCombiner = StringCombinerFactory.parseModbusTransaction(mt);
//             if (debug.fine.enabled) {
//                 debug.fine('readStringCombiner(): %o\n%O', this._stringCombiner, this._stringCombiner.toHumanReadableObject());
//             }
//             return this._stringCombiner;
//         } catch (err) {
//             debug.warn('PDU: %o\n%e', mt.response.pdu, err);
//             // throw err;
//         }
//     }

//     public async readMeter (): Promise<Meter> {
//         try {
//             const to = this._config.timeoutMillis.meter ? this._config.timeoutMillis.meter : this._config.timeoutMillis.default;
//             // console.log('--> readMeter, to=' + to);
//             if (!this._meter || (Date.now() - this._meter.createdAt.getTime() > 1000 )) {
//                 const mt070 = await this._gateway.readHoldRegisters(240, 40070, 125, to);
//                 const mt194 = await this._gateway.readHoldRegisters(240, 40194, 2, to);
//                 // debug.info('request 1:\nMBAP: %o\nPDU:  %o', mt070.request.mbapHeader, mt070.request.pdu);
//                 // debug.info('response 1:\nMBAP: %o\nPDU:  %o', mt070.response.mbapHeader, mt070.response.pdu);
//                 this._meter = MeterFactory.parseModbusTransaction(mt070, mt194);
//                 if (debug.fine.enabled) {
//                     debug.fine('readMeter(): %o\n%O', this._meter, this._meter.toHumanReadableObject());
//                 }
//             }
//             return this._meter;
//         } catch (err) {
//             debug.warn(err);
//             throw err;
//         }
//     }

// }


// class FroniusRegisterFactory {

//     public static parseModbusTransaction (mt212: ModbusTransaction, mt500: ModbusTransaction): FroniusRegister {
//         // values are 0 on reading hold registers, spec. says 0xffff
//         // if (mt212.getRegisterAsUint16(212) !== 0xffff) { throw new Error('invalid fronius register response (212'); }
//         // if (mt212.getRegisterAsUint16(213) !== 0xffff) { throw new Error('invalid fronius register response (213'); }
//         // if (mt212.getRegisterAsUint16(213) !== 0xffff) { throw new Error('invalid fronius register response (215'); }
//         const data: IFroniusRegister =  {
//             r214_F_Active_State_Code: mt212.getRegisterAsUint16(214),
//             r216_F_ModelType:         mt212.getRegisterAsUint16(216),
//             r500_F_Site_Power:        mt500.getRegisterAsUint32(500),
//             r502_F_Site_Energy_Day:   mt500.getRegisterAsUint64(502),
//             r506_F_Site_Energy_Year:  mt500.getRegisterAsUint64(506),
//             r510_F_Site_Energy_Total: mt500.getRegisterAsUint64(510)
//         };
//         if (data.r216_F_ModelType !== 1) { throw new Error('wrong model type (216), change inverter configuration'); }
//         const rv = new FroniusRegister(mt500.response.at, data);
//         return rv;
//     }

// }

// class CommonFactory {

//     public static parseModbusTransaction (mt: ModbusTransaction): Common {
//         if (mt.getRegisterAsUint32(40001) !== 0x53756e53) { throw new Error('invalid common response SID (40001)'); }
//         if (mt.getRegisterAsUint16(40003) !== 1) { throw new Error('invalid common response ID (40003)'); }
//         if (mt.getRegisterAsUint16(40004) !== 65) { throw new Error('invalid common response length (40004)'); }
//         const data: ICommon =  {
//             r40005_Mn:  mt.getRegisterAsString(40005, 40020),
//             r40021_Md:  mt.getRegisterAsString(40021, 40036),
//             r40037_Opt: mt.getRegisterAsString(40037, 40044),
//             r40045_Vr:  mt.getRegisterAsString(40045, 40052),
//             r40053_SN:  mt.getRegisterAsString(40053, 40068),
//             r40069_DA:  mt.getRegisterAsUint16(40069)
//         };
//         const rv = new Common(mt.response.at, data);
//         return rv;
//     }

// }

// class InverterFactory {
//     public static parseModbusTransaction (mt: ModbusTransaction): Inverter {
//         if (mt.getRegisterAsUint16(40071) !== 60) { throw new Error('invalid inverter response length (40071)'); }
//         const data: IInverter =  {
//             r40070_ID:        mt.getRegisterAsUint16(40070),
//             r40072_A:         Math.round(mt.getRegisterAsFloat32(40072) * 100) / 100,
//             r40074_AphA:      Math.round(mt.getRegisterAsFloat32(40074) * 100) / 100,
//             r40076_AphB:      Math.round(mt.getRegisterAsFloat32(40076) * 100) / 100,
//             r40078_AphC:      Math.round(mt.getRegisterAsFloat32(40078) * 100) / 100,
//             r40080_PPVphAB:   Math.round(mt.getRegisterAsFloat32(40080) * 10) / 10,
//             r40082_PPVphBC:   Math.round(mt.getRegisterAsFloat32(40082) * 10) / 10,
//             r40084_PPVphCA:   Math.round(mt.getRegisterAsFloat32(40084) * 10) / 10,
//             r40086_PhVphA:    Math.round(mt.getRegisterAsFloat32(40086) * 10) / 10,
//             r40088_PhVphB:    Math.round(mt.getRegisterAsFloat32(40088) * 10) / 10,
//             r40090_PhVphC:    Math.round(mt.getRegisterAsFloat32(40090) * 10) / 10,
//             r40092_W:         Math.round(mt.getRegisterAsFloat32(40092)),
//             r40094_Hz:        Math.round(mt.getRegisterAsFloat32(40094) * 100) / 100,
//             r40096_VA:        Math.round(mt.getRegisterAsFloat32(40096) * 100) / 100,
//             r40098_VAr:       Math.round(mt.getRegisterAsFloat32(40098) * 100) / 100,
//             r40100_PF:        Math.round(mt.getRegisterAsFloat32(40100) * 100) / 100,
//             r40102_WH:        Math.round(mt.getRegisterAsFloat32(40102) * 10) / 10,
//             r40108_DCW:       Math.round(mt.getRegisterAsFloat32(40108) * 10) / 10,
//             r40110_TmpCab:    mt.getRegisterAsFloat32(40110),
//             r40112_TmpSnk:    mt.getRegisterAsFloat32(40112),
//             r40114_TmpTrns:   mt.getRegisterAsFloat32(40114),
//             r40116_TmpOt:     mt.getRegisterAsFloat32(40116),
//             r40118_St:        mt.getRegisterAsUint16(40118),
//             r40119_StVnd:     mt.getRegisterAsUint16(40119),
//             r40120_Evt1:      mt.getRegisterAsUint32(40120),
//             r40122_Evt2:      mt.getRegisterAsUint32(40122),
//             r40124_EvtVnd1:   mt.getRegisterAsUint32(40124),
//             r40126_EvtVnd2:   mt.getRegisterAsUint32(40126),
//             r40128_EvtVnd3:   mt.getRegisterAsUint32(40128),
//             r40130_EvtVnd4:   mt.getRegisterAsUint32(40130)
//         };
//         if (data.r40070_ID < 111 && data.r40070_ID > 113) {
//             throw new Error('invalid inverter response ID (40070s)');
//         }
//         const rv = new Inverter(mt.response.at, data);
//         return rv;
//     }
// }

// class NameplateFactory {

//     public static parseModbusTransaction (mt: ModbusTransaction): Nameplate {
//         if (mt.getRegisterAsUint16(40132) !== 120) { throw new Error('invalid nameplate response, wrong ID (40132)'); }
//         if (mt.getRegisterAsUint16(40133) !== 26) { throw new Error('invalid nameplate response, wrong length (40133)'); }
//         if (mt.getRegisterAsUint16(40134) !== 4) { throw new Error('invalid nameplate response, wrong DERTyp (40134)'); }
//         const data: INameplate =  {
//             r04_WRtg:            mt.getRegisterAsUint16(40131 +  4),
//             r05_WRtg_SF:         mt.getRegisterAsUint16(40131 +  5),
//             r06_VARtg:           mt.getRegisterAsUint16(40131 +  6),
//             r07_VARtg_SF:        mt.getRegisterAsInt16( 40131 +  7),
//             r08_VArRtgQ1:        mt.getRegisterAsInt16( 40131 +  8),
//             r11_VArRtgQ4:        mt.getRegisterAsInt16( 40131 + 11),
//             r12_VArRtg_SF:       mt.getRegisterAsInt16( 40131 + 12),
//             r13_ARtg:            mt.getRegisterAsUint16(40131 + 13),
//             r14_ARtg_SF:         mt.getRegisterAsInt16( 40131 + 14),
//             r15_PFRtgQ1:         mt.getRegisterAsInt16( 40131 + 15),
//             r18_PFRtgQ4:         mt.getRegisterAsInt16( 40131 + 18),
//             r19_PFRtg_SF:        mt.getRegisterAsInt16( 40131 + 19),
//             r20_WHRtg:           mt.getRegisterAsUint16(40131 + 20),
//             r21_WHRtg_SF:        mt.getRegisterAsInt16( 40131 + 21),
//             r24_MaxChaRte:       mt.getRegisterAsUint16(40131 + 24),
//             r25_MaxChaRte_SF:    0, // Fronius-Bug mt.getRegisterAsInt16( 40131 + 25) === -2
//             r26_MaxDisChaRte:    mt.getRegisterAsUint16(40131 + 26),
//             r27_MaxDisChaRte_SF: 0, // Fronius-Bug mt.getRegisterAsInt16( 40131 + 27) === -2
//             r28_Pad:             mt.getRegisterAsUint16(40131 + 28)
//         };
//         const rv = new Nameplate(mt.response.at, data);
//         return rv;
//     }
// }

// class SettingFactory {

//     public static parseModbusTransaction (mt: ModbusTransaction): Setting {
//         if (mt.getRegisterAsUint16(40160) !== 121) { throw new Error('invalid setting response, wrong ID (40160)'); }
//         if (mt.getRegisterAsUint16(40161) !== 30) { throw new Error('invalid setting response, wrong length (40161)'); }
//         const data: ISetting =  {
//             r03_WMax:       mt.getRegisterAsUint16(40159 + 3),
//             r04_VRef:       mt.getRegisterAsUint16(40159 + 4),
//             r05_VRefOfs:    mt.getRegisterAsInt16(40159 + 5),
//             r08_VAMax:      mt.getRegisterAsUint16(40159 + 8),
//             r09_VARMAXQ1:   mt.getRegisterAsInt16(40159 +  9),
//             r12_VARMAXQ4:   mt.getRegisterAsInt16(40159 + 12),
//             r14_PFMinQ1:    mt.getRegisterAsInt16(40159 + 14),
//             r17_PFMinQ4:    mt.getRegisterAsInt16(40159 + 17),
//             r23_WMax_SF:    mt.getRegisterAsInt16(40159 + 23),
//             r24_VRef_SF:    mt.getRegisterAsInt16(40159 + 24),
//             r25_VRefOfs_SF: mt.getRegisterAsInt16(40159 + 25),
//             r27_VAMax_SF:   mt.getRegisterAsInt16(40159 + 27),
//             r28_VARMax_SF:  mt.getRegisterAsInt16(40159 + 28),
//             r30_PFMIN_SF:   mt.getRegisterAsInt16(40159 + 30)
//         };
//         const rv = new Setting(mt.response.at, data);
//         return rv;
//     }
// }

// class StatusFactory {

//     public static parseModbusTransaction (mt: ModbusTransaction): Status {
//         if (mt.getRegisterAsUint16(40192) !== 122) { throw new Error('invalid status response, wrong ID (40190)'); }
//         if (mt.getRegisterAsUint16(40193) !== 44) { throw new Error('invalid status response, wrong length (40191)'); }
//         const data: IStatus =  {
//             r03_PVConn:     mt.getRegisterAsUint16(40191 + 3),
//             r04_StorConn:   mt.getRegisterAsUint16(40191 + 4),
//             r05_ECPConn:    mt.getRegisterAsUint16(40191 + 5),
//             r06_ActWh:      mt.getRegisterAsUint64(40191 + 6),
//             r36_StActCtl:   mt.getRegisterAsUint32(40191 + 36),
//             r38_TmSrc:      mt.getRegisterAsString(40191 + 38, 40191 + 41),
//             r42_Tms:        mt.getRegisterAsUint32(40191 + 42)
//         };
//         const rv = new Status(mt.response.at, data);
//         return rv;
//     }

// }

// class ControlFactory {

//     public static parseModbusTransaction (mt: ModbusTransaction): Control {
//         if (mt.getRegisterAsUint16(40238) !== 123) { throw new Error('invalid status response, wrong ID (40238)'); }
//         if (mt.getRegisterAsUint16(40239) !== 24) { throw new Error('invalid status response, wrong length (40239)'); }
//         const data: IControl =  {
//             r03_Conn_WinTms:       mt.getRegisterAsUint16(40237 +  3),
//             r04_Conn_RvrTms:       mt.getRegisterAsUint16(40237 +  4),
//             r05_Conn:              mt.getRegisterAsUint16(40237 +  5),
//             r06_WMaxLimPct:        mt.getRegisterAsUint16(40237 +  6),
//             r07_WMaxLimPct_WinTms: mt.getRegisterAsUint16(40237 +  7),
//             r08_WMaxLimPct_RvrTms: mt.getRegisterAsUint16(40237 +  8),
//             r10_WMaxLim_Ena:       mt.getRegisterAsUint16(40237 + 10),
//             r11_OutPFSet:          mt.getRegisterAsInt16( 40237 + 11),
//             r12_OutPFSet_WinTms:   mt.getRegisterAsUint16(40237 + 12),
//             r13_OutPFSet_RvrTms:   mt.getRegisterAsUint16(40237 + 13),
//             r15_OutPFSet_Ena:      mt.getRegisterAsUint16(40237 + 15),
//             r17_VArMaxPct:         mt.getRegisterAsInt16( 40237 + 17),
//             r19_VArPct_WinTms:     mt.getRegisterAsUint16(40237 + 19),
//             r20_VArPct_RvrtTms:    mt.getRegisterAsUint16(40237 + 20),
//             r22_VArPct_Mod:        mt.getRegisterAsUint16(40237 + 22),
//             r23_VArPct_Ena:        mt.getRegisterAsUint16(40237 + 23),
//             r24_WMaxLimPct_SF:     mt.getRegisterAsInt16( 40237 + 24),
//             r25_OutPFSet_SF:       mt.getRegisterAsInt16( 40237 + 25),
//             r26_VArPct_SF:         mt.getRegisterAsInt16( 40237 + 26)
//         };
//         const rv = new Control(mt.response.at, data);
//         return rv;
//     }
// }




// class StorageFactory {

//     public static parseModbusTransaction (mt: ModbusTransaction): Storage {
//         if (mt.getRegisterAsUint16(40314) !== 124) { throw new Error('invalid common block response, wrong ID (40314'); }
//         if (mt.getRegisterAsUint16(40315) !== 24) { throw new Error('invalid common block response, wrong length (40315'); }
//         const data: IStorage =  {
//             r03_WChaMax:          mt.getRegisterAsUint16(40313 +  3),
//             r04_WchaGra:          mt.getRegisterAsUint16(40313 +  4),
//             r05_WdisChaGra:       mt.getRegisterAsUint16(40313 +  5),
//             r06_StorCtl_Mod:      mt.getRegisterAsUint16(40313 +  6),
//             r08_MinRsvPct:        mt.getRegisterAsUint16(40313 +  8),
//             r09_ChaState:         mt.getRegisterAsUint16(40313 +  9),
//             r12_ChaSt:            mt.getRegisterAsUint16(40313 + 12),
//             r13_OutWRte:          mt.getRegisterAsUint16(40313 + 13),
//             r14_InWRte:           mt.getRegisterAsUint16(40313 + 14),
//             r18_ChaGriSet:        mt.getRegisterAsUint16(40313 + 18),
//             r19_WChaMax_SF:       mt.getRegisterAsInt16( 40313 + 19),
//             r20_WchaDisChaGra_SF: mt.getRegisterAsInt16( 40313 + 20),
//             r22_MinRsvPct_SF:     mt.getRegisterAsInt16( 40313 + 22),
//             r23_ChaState_SF:      mt.getRegisterAsInt16( 40313 + 23),
//             r24_StorAval_SF:      mt.getRegisterAsInt16( 40313 + 24),
//             r26_InOutWRte_SF:     mt.getRegisterAsInt16( 40313 + 26)
//         };
//         const rv = new Storage(mt.response.at, data);
//         return rv;
//     }
// }

// class InverterExtensionFactory {

//     public static parseModbusTransaction (mt: ModbusTransaction): InverterExtension {
//         if (mt.getRegisterAsUint16(40264) !== 160) { throw new Error('invalid inverter response, wrong ID (40264)'); }
//         if (mt.getRegisterAsUint16(40265) !== 48) { throw new Error('invalid inverter response, wrong length (40265)'); }
//         const data: IInverterExtension =  {
//             r03_DCA_SF:  mt.getRegisterAsInt16( 40263 +  3),
//             r04_DCV_SF:  mt.getRegisterAsInt16( 40263 +  4),
//             r05_DCW_SF:  mt.getRegisterAsInt16( 40263 +  5),
//             r06_DCWH_SF: mt.getRegisterAsInt16( 40263 +  6),
//             r07_EVT:     mt.getRegisterAsUint32(40263 +  7),
//             r09_N:       mt.getRegisterAsUint16(40263 +  9),
//             r11_1_ID:    mt.getRegisterAsUint16(40263 + 11),
//             r12_1_IDStr: mt.getRegisterAsString(40263 + 12, 40263 + 19),
//             r20_1_DCA:   mt.getRegisterAsUint16(40263 + 20),
//             r21_1_DCV:   mt.getRegisterAsUint16(40263 + 21),
//             r22_1_DCW:   mt.getRegisterAsUint16(40263 + 22),
//             r23_1_DCWH:  mt.getRegisterAsUint32(40263 + 23),
//             r25_1_Tms:   mt.getRegisterAsUint32(40263 + 25),
//             r27_1_Tmp:   mt.getRegisterAsInt16( 40263 + 27),
//             r28_1_DCst:  mt.getRegisterAsUint16(40263 + 28),
//             r31_2_ID:    mt.getRegisterAsUint16(40263 + 31),
//             r32_2_IDStr: mt.getRegisterAsString(40263 + 32, 40263 + 39),
//             r40_2_DCA:   mt.getRegisterAsUint16(40263 + 40),
//             r41_2_DCV:   mt.getRegisterAsUint16(40263 + 41),
//             r42_2_DCW:   mt.getRegisterAsUint16(40263 + 42),
//             r43_2_DCWH:  mt.getRegisterAsUint16(40263 + 43),
//             r45_2_Tms:   mt.getRegisterAsUint16(40263 + 45),
//             r47_2_Tmp:   mt.getRegisterAsInt16( 40263 + 47),
//             r48_2_DCst:  mt.getRegisterAsUint16(40263 + 48)
//         };
//         // if (data.r22_1_DCW === 65535) {
//         //     data.r22_1_DCW = 0;
//         // }
//         // if (data.r28_1_DCst === 3 && data.r21_1_DCV === 65535) {
//         //     // RUN UP PHASE, wrong values
//         //     data.r21_1_DCV = 0;
//         // }
//         const rv = new InverterExtension(mt.response.at, data);
//         return rv;
//     }
// }

// class StringCombinerFactory {

//     public static parseModbusTransaction (mt: ModbusTransaction): StringCombiner {
//         if (mt.getRegisterAsUint16(40070) !== 403) { throw new Error('invalid string combiner response, wrong ID (40070)'); }
//         if (mt.getRegisterAsUint16(40071) !== 56) { throw new Error('invalid string combiner, wrong length (40071)'); }
//         const data: IStringCombiner =  {
//             r40072_DCA_SF:       mt.getRegisterAsUint16(40072)
//         };
//         const rv = new StringCombiner(mt.response.at, data);
//         return rv;
//     }
// }

// class MeterFactory {

//     public static parseModbusTransaction (mt070: ModbusTransaction, mt194: ModbusTransaction): Meter {
//         if (mt070.getRegisterAsUint16(40071) !== 124) { throw new Error('invalid meter response, wrong length (240:40071)'); }
//         const data: IMeter =  {
//             r40070_ID:              mt070.getRegisterAsUint16( 40070),
//             r40072_A:               Math.round(mt070.getRegisterAsFloat32(40072) * 1000) / 1000,
//             r40074_AphA:            Math.round(mt070.getRegisterAsFloat32(40074) * 1000) / 1000,
//             r40076_AphB:            Math.round(mt070.getRegisterAsFloat32(40076) * 1000) / 1000,
//             r40078_AphC:            Math.round(mt070.getRegisterAsFloat32(40078) * 1000) / 1000,
//             r40080_PhV:             Math.round(mt070.getRegisterAsFloat32(40080) * 10) / 10,
//             r40082_PhVphA:          Math.round(mt070.getRegisterAsFloat32(40082) * 10) / 10,
//             r40084_PhVphB:          Math.round(mt070.getRegisterAsFloat32(40084) * 10) / 10,
//             r40086_PhVphC:          Math.round(mt070.getRegisterAsFloat32(40086) * 10) / 10,
//             r40088_PPV:             Math.round(mt070.getRegisterAsFloat32(40088) * 10) / 10,
//             r40090_PPVphAB:         Math.round(mt070.getRegisterAsFloat32(40090) * 10) / 10,
//             r40092_PPVphBC:         Math.round(mt070.getRegisterAsFloat32(40092) * 10) / 10,
//             r40094_PPVphCA:         Math.round(mt070.getRegisterAsFloat32(40094) * 10) / 10,
//             r40096_Hz:              Math.round(mt070.getRegisterAsFloat32(40096) * 100) / 100,
//             r40098_W:               Math.round(mt070.getRegisterAsFloat32(40098) * 100) / 100,
//             r40100_WphA:            Math.round(mt070.getRegisterAsFloat32(40100) * 100) / 100,
//             r40102_WphB:            Math.round(mt070.getRegisterAsFloat32(40102) * 100) / 100,
//             r40104_WphC:            Math.round(mt070.getRegisterAsFloat32(40104) * 100) / 100,
//             r40106_VA:              Math.round(mt070.getRegisterAsFloat32(40106) * 100) / 100,
//             r40108_VAphA:           Math.round(mt070.getRegisterAsFloat32(40108) * 100) / 100,
//             r40110_VAphB:           Math.round(mt070.getRegisterAsFloat32(40110) * 100) / 100,
//             r40112_VAphC:           Math.round(mt070.getRegisterAsFloat32(40112) * 100) / 100,
//             r40114_VAR:             Math.round(mt070.getRegisterAsFloat32(40114) * 100) / 100,
//             r40116_VARphA:          Math.round(mt070.getRegisterAsFloat32(40116) * 100) / 100,
//             r40118_VARphB:          Math.round(mt070.getRegisterAsFloat32(40118) * 100) / 100,
//             r40120_VARphC:          Math.round(mt070.getRegisterAsFloat32(40120) * 100) / 100,
//             r40122_PF:              Math.round(mt070.getRegisterAsFloat32(40122) * 100) / 100,
//             r40124_PFphA:           Math.round(mt070.getRegisterAsFloat32(40124) * 100) / 100,
//             r40126_PFphB:           Math.round(mt070.getRegisterAsFloat32(40126) * 100) / 100,
//             r40128_PFphC:           Math.round(mt070.getRegisterAsFloat32(40128) * 100) / 100,
//             r40130_TotWhExp:        mt070.getRegisterAsFloat32(40130),
//             r40132_TotWhExpPhA:     mt070.getRegisterAsFloat32(40132),
//             r40134_TotWhExpPhB:     mt070.getRegisterAsFloat32(40134),
//             r40136_TotWhExpPhC:     mt070.getRegisterAsFloat32(40136),
//             r40138_TotWhImp:        mt070.getRegisterAsFloat32(40138),
//             r40140_TotWhImpPhA:     mt070.getRegisterAsFloat32(40140),
//             r40142_TotWhImpPhB:     mt070.getRegisterAsFloat32(40142),
//             r40144_TotWhImpPhC:     mt070.getRegisterAsFloat32(40144),
//             r40146_TotVAhExp:       mt070.getRegisterAsFloat32(40146),
//             r40148_TotVAhExpPhA:    mt070.getRegisterAsFloat32(40148),
//             r40150_TotVAhExpPhB:    mt070.getRegisterAsFloat32(40150),
//             r40152_TotVAhExpPhC:    mt070.getRegisterAsFloat32(40152),
//             r40154_TotVAhImp:       mt070.getRegisterAsFloat32(40154),
//             r40156_TotVAhImpPhA:    mt070.getRegisterAsFloat32(40156),
//             r40158_TotVAhImpPhB:    mt070.getRegisterAsFloat32(40158),
//             r40160_TotVAhImpPhC:    mt070.getRegisterAsFloat32(40160),
//             r40162_TotVArhImpQ1:    mt070.getRegisterAsFloat32(40162),
//             r40164_TotVArhImpQ1phA: mt070.getRegisterAsFloat32(40164),
//             r40166_TotVArhImpQ1phB: mt070.getRegisterAsFloat32(40166),
//             r40168_TotVArhImpQ1phC: mt070.getRegisterAsFloat32(40168),
//             r40170_TotVArhImpQ2:    mt070.getRegisterAsFloat32(40170),
//             r40172_TotVArhImpQ2phA: mt070.getRegisterAsFloat32(40172),
//             r40174_TotVArhImpQ2phB: mt070.getRegisterAsFloat32(40174),
//             r40176_TotVArhImpQ2phC: mt070.getRegisterAsFloat32(40176),
//             r40178_TotVArhExpQ3:    mt070.getRegisterAsFloat32(40178),
//             r40180_TotVArhExpQ3phA: mt070.getRegisterAsFloat32(40180),
//             r40182_TotVArhExpQ3phB: mt070.getRegisterAsFloat32(40182),
//             r40184_TotVArhExpQ3phC: mt070.getRegisterAsFloat32(40184),
//             r40186_TotVArhExpQ4:    mt070.getRegisterAsFloat32(40186),
//             r40188_TotVArhExpQ4phA: mt070.getRegisterAsFloat32(40188),
//             r40190_TotVArhExpQ4phB: mt070.getRegisterAsFloat32(40190),
//             r40192_TotVArhExpQ4phC: mt070.getRegisterAsFloat32(40192),
//             r40194_Evt:             mt194.getRegisterAsUint16 (40194)
//         };
//         const rv = new Meter(mt070.response.at, data);
//         return rv;
//     }
// }





