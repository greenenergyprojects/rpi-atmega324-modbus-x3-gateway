
// export interface IFroniusSymoValues {
//     froniusRegister?:   { createdAt: Date, error?: string, regs?: IFroniusRegister };
//     common?:            { createdAt: Date, error?: string, regs?: ICommon };
//     inverter?:          { createdAt: Date, error?: string, regs?: IInverter };
//     nameplate?:         { createdAt: Date, error?: string, regs?: INameplate };
//     setting?:           { createdAt: Date, error?: string, regs?: ISetting };
//     status?:            { createdAt: Date, error?: string, regs?: IStatus };
//     control?:           { createdAt: Date, error?: string, regs?: IControl };
//     storage?:           { createdAt: Date, error?: string, regs?: IStorage };
//     inverterExtension?: { createdAt: Date, error?: string, regs?: IInverterExtension };
//     stringCombiner?:    { createdAt: Date, error?: string, regs?: IStringCombiner };
//     meter?:             { createdAt: Date, error?: string, regs?: IMeter };
// }


// export interface IFroniusRegister {
//     r214_F_Active_State_Code: number;
//     r216_F_ModelType:         number;
//     r500_F_Site_Power:        number;
//     r502_F_Site_Energy_Day:   number;
//     r506_F_Site_Energy_Year:  number;
//     r510_F_Site_Energy_Total: number;
// }

// export interface ICommon {
//     r40005_Mn:  string;
//     r40021_Md:  string;
//     r40037_Opt: string;
//     r40045_Vr:  string;
//     r40053_SN:  string;
//     r40069_DA:  number;
// }

// export interface IInverter {
//     r40070_ID:      number;
//     r40072_A:       number;
//     r40074_AphA:    number;
//     r40076_AphB:    number;
//     r40078_AphC:    number;
//     r40080_PPVphAB: number;
//     r40082_PPVphBC: number;
//     r40084_PPVphCA: number;
//     r40086_PhVphA:  number;
//     r40088_PhVphB:  number;
//     r40090_PhVphC:  number;
//     r40092_W:       number;
//     r40094_Hz:      number;
//     r40096_VA:      number;
//     r40098_VAr:     number;
//     r40100_PF:      number;
//     r40102_WH:      number;
//     r40108_DCW:     number;
//     r40110_TmpCab:  number;
//     r40112_TmpSnk:  number;
//     r40114_TmpTrns: number;
//     r40116_TmpOt:   number;
//     r40118_St:      number;
//     r40119_StVnd:   number;
//     r40120_Evt1:    number;
//     r40122_Evt2:    number;
//     r40124_EvtVnd1: number;
//     r40126_EvtVnd2: number;
//     r40128_EvtVnd3: number;
//     r40130_EvtVnd4: number;
// }

// // Base address 40131 (float)
// export interface INameplate {
//     r04_WRtg:            number;
//     r05_WRtg_SF:         number;
//     r06_VARtg:           number;
//     r07_VARtg_SF:        number;
//     r08_VArRtgQ1:        number;
//     r11_VArRtgQ4:        number;
//     r12_VArRtg_SF:       number;
//     r13_ARtg:            number;
//     r14_ARtg_SF:         number;
//     r15_PFRtgQ1:         number;
//     r18_PFRtgQ4:         number;
//     r19_PFRtg_SF:        number;
//     r20_WHRtg:           number;
//     r21_WHRtg_SF:        number;
//     r24_MaxChaRte:       number;
//     r25_MaxChaRte_SF:    number;
//     r26_MaxDisChaRte:    number;
//     r27_MaxDisChaRte_SF: number;
//     r28_Pad:             number;
// }

// // Base address 40159 (float)
// export interface ISetting {
//     r03_WMax:       number;
//     r04_VRef:       number;
//     r05_VRefOfs:    number;
//     r08_VAMax:      number;
//     r09_VARMAXQ1:   number;
//     r12_VARMAXQ4:   number;
//     r14_PFMinQ1:    number;
//     r17_PFMinQ4:    number;
//     r23_WMax_SF:    number;
//     r24_VRef_SF:    number;
//     r25_VRefOfs_SF: number;
//     r27_VAMax_SF:   number;
//     r28_VARMax_SF:  number;
//     r30_PFMIN_SF:   number;
// }

// // Base address 40191 (float)
// export interface IStatus {
//     r03_PVConn:    number;
//     r04_StorConn:  number;
//     r05_ECPConn:   number;
//     r06_ActWh:     number;
//     r36_StActCtl:  number;
//     r38_TmSrc:     string;
//     r42_Tms:       number;
// }

// // Base address 40237 (float)
// export interface IControl {
//     r03_Conn_WinTms:       number;
//     r04_Conn_RvrTms:       number;
//     r05_Conn:              number;
//     r06_WMaxLimPct:        number;
//     r07_WMaxLimPct_WinTms: number;
//     r08_WMaxLimPct_RvrTms: number;
//     r10_WMaxLim_Ena:       number;
//     r11_OutPFSet:          number;
//     r12_OutPFSet_WinTms:   number;
//     r13_OutPFSet_RvrTms:   number;
//     r15_OutPFSet_Ena:      number;
//     r17_VArMaxPct:         number;
//     r19_VArPct_WinTms:     number;
//     r20_VArPct_RvrtTms:    number;
//     r22_VArPct_Mod:        number;
//     r23_VArPct_Ena:        number;
//     r24_WMaxLimPct_SF:     number;
//     r25_OutPFSet_SF:       number;
//     r26_VArPct_SF:         number;
// }

// // Base address 40313 (float)
// export interface IStorage {
//     r03_WChaMax: number;
//     r04_WchaGra: number;
//     r05_WdisChaGra: number;
//     r06_StorCtl_Mod: number;
//     r08_MinRsvPct: number;
//     r09_ChaState: number;
//     r12_ChaSt: number;
//     r13_OutWRte: number;
//     r14_InWRte: number;
//     r18_ChaGriSet: number;
//     r19_WChaMax_SF: number;
//     r20_WchaDisChaGra_SF: number;
//     r22_MinRsvPct_SF: number;
//     r23_ChaState_SF: number;
//     r24_StorAval_SF: number;
//     r26_InOutWRte_SF: number;
// }

// // Base address 40263 (float)
// export interface IInverterExtension {
//     r03_DCA_SF:  number;
//     r04_DCV_SF:  number;
//     r05_DCW_SF:  number;
//     r06_DCWH_SF: number;
//     r07_EVT:     number;
//     r09_N:       number;
//     r11_1_ID:    number;
//     r12_1_IDStr: string;
//     r20_1_DCA:   number;
//     r21_1_DCV:   number;
//     r22_1_DCW:   number;
//     r23_1_DCWH:  number;
//     r25_1_Tms:   number;
//     r27_1_Tmp:   number;
//     r28_1_DCst:  number;
//     r31_2_ID:    number;
//     r32_2_IDStr: string;
//     r40_2_DCA:   number;
//     r41_2_DCV:   number;
//     r42_2_DCW:   number;
//     r43_2_DCWH:  number;
//     r45_2_Tms:   number;
//     r47_2_Tmp:   number;
//     r48_2_DCst:  number;
// }

// export interface IStringCombiner {
//     r40072_DCA_SF: number;
// }

// export interface IMeter {
//     r40070_ID:              number;
//     r40072_A:               number;
//     r40074_AphA:            number;
//     r40076_AphB:            number;
//     r40078_AphC:            number;
//     r40080_PhV:             number;
//     r40082_PhVphA:          number;
//     r40084_PhVphB:          number;
//     r40086_PhVphC:          number;
//     r40088_PPV:             number;
//     r40090_PPVphAB:         number;
//     r40092_PPVphBC:         number;
//     r40094_PPVphCA:         number;
//     r40096_Hz:              number;
//     r40098_W:               number;
//     r40100_WphA:            number;
//     r40102_WphB:            number;
//     r40104_WphC:            number;
//     r40106_VA:              number;
//     r40108_VAphA:           number;
//     r40110_VAphB:           number;
//     r40112_VAphC:           number;
//     r40114_VAR:             number;
//     r40116_VARphA:          number;
//     r40118_VARphB:          number;
//     r40120_VARphC:          number;
//     r40122_PF:              number;
//     r40124_PFphA:           number;
//     r40126_PFphB:           number;
//     r40128_PFphC:           number;
//     r40130_TotWhExp:        number;
//     r40132_TotWhExpPhA:     number;
//     r40134_TotWhExpPhB:     number;
//     r40136_TotWhExpPhC:     number;
//     r40138_TotWhImp:        number;
//     r40140_TotWhImpPhA:     number;
//     r40142_TotWhImpPhB:     number;
//     r40144_TotWhImpPhC:     number;
//     r40146_TotVAhExp:       number;
//     r40148_TotVAhExpPhA:    number;
//     r40150_TotVAhExpPhB:    number;
//     r40152_TotVAhExpPhC:    number;
//     r40154_TotVAhImp:       number;
//     r40156_TotVAhImpPhA:    number;
//     r40158_TotVAhImpPhB:    number;
//     r40160_TotVAhImpPhC:    number;
//     r40162_TotVArhImpQ1:    number;
//     r40164_TotVArhImpQ1phA: number;
//     r40166_TotVArhImpQ1phB: number;
//     r40168_TotVArhImpQ1phC: number;
//     r40170_TotVArhImpQ2:    number;
//     r40172_TotVArhImpQ2phA: number;
//     r40174_TotVArhImpQ2phB: number;
//     r40176_TotVArhImpQ2phC: number;
//     r40178_TotVArhExpQ3:    number;
//     r40180_TotVArhExpQ3phA: number;
//     r40182_TotVArhExpQ3phB: number;
//     r40184_TotVArhExpQ3phC: number;
//     r40186_TotVArhExpQ4:    number;
//     r40188_TotVArhExpQ4phA: number;
//     r40190_TotVArhExpQ4phB: number;
//     r40192_TotVArhExpQ4phC: number;
//     r40194_Evt:             number;
// }



// abstract class SymoModel<T> {

//     // https://stackoverflow.com/questions/11887934
//     public static isDaylightSavingTime (t: Date) {
//         const jan = new Date(t.getFullYear(), 0, 1);
//         const jul = new Date(t.getFullYear(), 6, 1);
//         return t.getTimezoneOffset() < Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
//     }

//     /* tslint:disable */
//     protected _regs: T;
//     private _createdAt: Date;
//     /* tslint:enable */

//     public constructor (createdAt: number | Date | string, regs: T) {
//         if (typeof(createdAt) === 'number') {
//             this._createdAt = new Date(createdAt);
//             // this._timeStamp.setTime(timeStamp);
//         } else if (typeof(createdAt) === 'string') {
//             this._createdAt = new Date(createdAt);
//         } else if (createdAt instanceof Date) {
//             this._createdAt = createdAt;
//         } else {
//             throw new Error('invalid createdAt');
//         }

//         this._regs = regs;
//     }

//     public get regs (): T {
//         return this._regs;
//     }

//     public get createdAt (): Date {
//         return this._createdAt;
//     }

//     public toObject (): Object {
//         return {
//             regs: this._regs
//         };
//     }

//     public toHumanReadableObject (): Object {
//         return this.toObject();
//     }

//     protected scale (x: number, sf: number): number {
//         switch (sf) {
//             case  3: return x * 1000;
//             case  2: return x * 100;
//             case  1: return x * 10;
//             case  0: return x;
//             case -1: return x / 10;
//             case -2: return x / 100;
//             case -3: return x / 1000;
//             default: {
//                 while (sf > 0) { x = x * 10; sf--; }
//                 while (sf < 0) { x = x / 10; sf++; }
//                 return x;
//             }
//         }
//     }

//     protected normaliseUnit (x: number, digits = 2, unit?: string): string {
//         let k: number;
//         switch (digits) {
//             case 3: k = 1000; break;
//             case 2: k = 100; break;
//             case 1: k = 10; break;
//             case 0:  k = 1; break;
//             default: {
//                 k = 1;
//                 while (digits > 0) {
//                     k *= 10;
//                     digits--;
//                 }
//             }
//         }
//         if (!unit)                   { return (Math.round(x * k) / k).toString(); }
//         if (Math.abs(x) >   1000000) { return Math.round(x * k / 1000000) / k + 'M' + unit; }
//         if (Math.abs(x) >      1000) { return Math.round(x * k / 1000) / k + 'k' + unit; }
//         if (Math.abs(x) >=      0.1) { return Math.round(x * k) / k + unit; }
//         if (Math.abs(x) >=    0.001) { return Math.round(x * k * 1000) / k + 'm' + unit; }
//         if (Math.abs(x) >= 0.000001) { return Math.round(x * k * 1000000) / k + 'µ' + unit; }
//         return x + unit;
//     }

// }


// export class FroniusRegister extends SymoModel<IFroniusRegister> {

//     public get sitePower (): number { return this._regs.r500_F_Site_Power; }
//     public get siteEnergyDay (): number { return this._regs.r502_F_Site_Energy_Day; }
//     public get siteEnergyYear (): number { return this._regs.r506_F_Site_Energy_Year; }
//     public get siteEnergyTotal (): number { return this._regs.r510_F_Site_Energy_Total; }

//     public toHumanReadableObject (): Object {
//         return {
//             createdAt:       this.createdAt,
//             sitePower:       this.normaliseUnit(this.sitePower, 2, 'W'),
//             siteEnergyDay:   this.normaliseUnit(this.siteEnergyDay, 2, 'Wh'),
//             siteEnergyYear:  this.normaliseUnit(this.siteEnergyYear, 2, 'Wh'),
//             siteEnergyTotal: this.normaliseUnit(this.siteEnergyTotal, 2, 'Wh')
//         };
//     }

// }


// export class Common extends SymoModel<ICommon> {

//     public get manufacturer (): string { return this._regs.r40005_Mn; }
//     public get deviceModel (): string {  return this._regs.r40021_Md; }
//     public get dataManagerVersion (): string { return this._regs.r40037_Opt; }
//     public get inverterVersion (): string { return this._regs.r40045_Vr; }
//     public get serialNumber (): string { return this._regs.r40053_SN; }
//     public get modbusAddress (): number { return this._regs.r40069_DA; }

//     public toHumanReadableObject (): Object {
//         return {
//             createdAt:          this.createdAt,
//             manufacturer:       this.manufacturer,
//             deviceModel:        this.deviceModel,
//             dataManagerVersion: this.dataManagerVersion,
//             inverterVersion:    this.inverterVersion,
//             serialNumber:       this.serialNumber,
//             modbusAddress:      this.modbusAddress
//         };
//     }
// }

// export class Inverter extends SymoModel<IInverter> {

//     private static evt1_bit: string [] = [
//         'GROUND_FAULT', 'DC_OVER_VOLT', 'AC_DISCONNECT', 'DC_DISCONNECT',
//         'GRID_DISCONNECT', 'CABINET_OPEN', 'MANUAL_SHUTDOWN', 'OVER_TEMP',
//         'OVER_FREQUENCY', 'UNDER_FREQUENCY', 'AC_OVER_VOLT', 'AC_UNDER_VOLT',
//         'BLOWN_STRING_FUSE', 'UNDER_TEMP', 'MEMORY_LOSS', 'HW_TEST_FAILURE'
//     ];

//     public get isSinglePhaseInverter (): boolean { return this._regs.r40070_ID === 111; }
//     public get isSplitPhaseInverter (): boolean { return this._regs.r40070_ID === 112; }
//     public get isThreePhaseInverter (): boolean { return this._regs.r40070_ID === 113; }
//     public get currentTotal (): number { return this._regs.r40072_A; }
//     public get currentL1 (): number { return  this._regs.r40074_AphA; }
//     public get currentL2 (): number { return  this._regs.r40076_AphB; }
//     public get currentL3 (): number { return  this._regs.r40078_AphC; }
//     public get voltageL12 (): number { return this._regs.r40080_PPVphAB; }
//     public get voltageL23 (): number { return this._regs.r40082_PPVphBC; }
//     public get voltageL31 (): number { return this._regs.r40084_PPVphCA; }
//     public get voltageL1 (): number { return  this._regs.r40086_PhVphA; }
//     public get voltageL2 (): number { return  this._regs.r40088_PhVphB; }
//     public get voltageL3 (): number { return  this._regs.r40090_PhVphC; }
//     public get activePower (): number { return this._regs.r40092_W; }
//     public get frequency (): number { return this._regs.r40094_Hz; }
//     public get apparentPower (): number { return this._regs.r40096_VA; }
//     public get reactivePower (): number { return this._regs.r40098_VAr; }
//     public get powerFactor (): number { return this._regs.r40100_PF / 100; }
//     public get lifeTimeEnergy (): number { return this._regs.r40102_WH; }
//     public get dcPower (): number { return this._regs.r40108_DCW; }

//     public get operatingState (): string {
//         // SunSpecInformationModelReference20170928.xlsx, Tab 103, St
//         switch (this._regs.r40118_St) {
//             case 1: return 'OFF';
//             case 2: return 'SLEEPING';
//             case 3: return 'STARTING';
//             case 4: return 'MPPT';
//             case 5: return 'THROTTLED';
//             case 6: return 'SHUTTING_DOWN';
//             case 7: return 'FAULT';
//             case 8: return 'STANDBY';
//             default: return '?';
//         }
//     }

//     public get operatingVendorState (): string {
//         switch (this._regs.r40119_StVnd) {
//             case  1: return 'OFF';
//             case  2: return 'SLEEPING';
//             case  3: return 'STARTING';
//             case  4: return 'MPPT';
//             case  5: return 'THROTTLED';
//             case  6: return 'SHUTTING_DOWN';
//             case  7: return 'FAULT';
//             case  8: return 'STANDBY';
//             case  9: return 'NO_BUSINIT';
//             case 10: return 'NO_COMM_INV';
//             case 11: return 'SN_OVERCURRENT';
//             case 12: return 'BOOTLOAD';
//             case 13: return 'AFCI';
//             default: return '?';
//         }
//     }

//     public get events (): string [] {
//         const rv: string [] = [];
//         for (let i = 0, mask = 0x00000001; i < Inverter.evt1_bit.length; i++, mask *= 2) {
//             /* tslint:disable-next-line:no-bitwise */
//             if (this._regs.r40120_Evt1 & mask) {
//                 rv.push(Inverter.evt1_bit[i]);
//             }
//         }
//         return rv;
//     }

//     public toHumanReadableObject (): Object {
//         return {
//             createdAt:               this.createdAt,
//             isSinglePhaseInverter:   this._regs.r40070_ID === 111,
//             isSplitPhaseInverter:    this._regs.r40070_ID === 112,
//             isThreePhaseInverter:    this._regs.r40070_ID === 113,
//             currentTotal:            this.normaliseUnit(this.currentTotal, 2, 'A'),
//             currentL1:               this.normaliseUnit(this.currentL1, 2, 'A'),
//             currentL2:               this.normaliseUnit(this.currentL2, 2, 'A'),
//             currentL3:               this.normaliseUnit(this.currentL3, 2, 'A'),
//             voltageL12:              this.normaliseUnit(this.voltageL12, 1, 'V'),
//             voltageL23:              this.normaliseUnit(this.voltageL23, 1, 'V'),
//             voltageL31:              this.normaliseUnit(this.voltageL31, 1, 'V'),
//             voltageL1:               this.normaliseUnit(this.voltageL1, 1, 'V'),
//             voltageL2:               this.normaliseUnit(this.voltageL2, 1, 'V'),
//             voltageL3:               this.normaliseUnit(this.voltageL3, 1, 'V'),
//             activePower:             this.normaliseUnit(this.activePower, 5, 'W'),
//             frequency:               this.normaliseUnit(this.frequency, 2, 'Hz'),
//             apparentPower:           this.normaliseUnit(this.apparentPower, 2, 'VA'),
//             reactivePower:           this.normaliseUnit(this.reactivePower, 2, 'var'),
//             powerFactor:             this.normaliseUnit(this.powerFactor, 2),
//             lifeTimeEnergy:          this.normaliseUnit(this.lifeTimeEnergy, 1, 'Wh'),
//             dcPower:                 this.normaliseUnit(this.dcPower, 1, 'W'),
//             operatingState:          this.operatingState,
//             operatingVendorState:    this.operatingVendorState,
//             events:                  this.events
//         };
//     }
// }

// export class Nameplate extends SymoModel<INameplate> {
//     public get continousActivePowerOutputCapability (): number { return this.scale(this._regs.r04_WRtg, this._regs.r05_WRtg_SF); }
//     public get continousApparentPowerCapability (): number { return this.scale(this._regs.r06_VARtg, this._regs.r07_VARtg_SF); }
//     public get continousReactivePowerQ1Capability (): number { return this.scale(this._regs.r08_VArRtgQ1, this._regs.r12_VArRtg_SF); }
//     public get continousReactivePowerQ4Capability (): number { return this.scale(this._regs.r11_VArRtgQ4, this._regs.r12_VArRtg_SF); }
//     public get maxRMSACCurrentCapability (): number { return this.scale(this._regs.r13_ARtg, this._regs.r14_ARtg_SF); }
//     public get minPowerFactorQ1Capability (): number { return this.scale(this._regs.r15_PFRtgQ1, this._regs.r19_PFRtg_SF); }
//     public get minPowerFactorQ4Capability (): number { return this.scale(this._regs.r18_PFRtgQ4, this._regs.r19_PFRtg_SF); }
//     public get nominalStorageEnergy (): number { return this.scale(this._regs.r20_WHRtg, this._regs.r21_WHRtg_SF); }
//     public get maxStorageChargeRate (): number { return this.scale(this._regs.r24_MaxChaRte, this._regs.r25_MaxChaRte_SF); }
//     public get maxStorageDischargeRate (): number { return this.scale(this._regs.r26_MaxDisChaRte, this._regs.r27_MaxDisChaRte_SF); }

//     public toHumanReadableObject (): Object {
//         return {
//             createdAt:                            this.createdAt,
//             continousActivePowerOutputCapability: this.normaliseUnit(this.continousActivePowerOutputCapability, 2, 'W'),
//             continousApparentPowerCapability:     this.normaliseUnit(this.continousApparentPowerCapability, 2, 'VA'),
//             continousReactivePowerQ1Capability:   this.normaliseUnit(this.continousReactivePowerQ1Capability, 2, 'var'),
//             continousReactivePowerQ4Capability:   this.normaliseUnit(this.continousReactivePowerQ4Capability, 2, 'var'),
//             maxRMSACCurrentCapability:            this.normaliseUnit(this.maxRMSACCurrentCapability, 2, 'A'),
//             minPowerFactorQ1Capability:           this.normaliseUnit(this.minPowerFactorQ1Capability, 2),
//             minPowerFactorQ4Capability:           this.normaliseUnit(this.minPowerFactorQ4Capability, 2),
//             nominalStorageEnergy:                 this.normaliseUnit(this.nominalStorageEnergy, 2, 'Wh'),
//             maxStorageChargeRate:                 this.normaliseUnit(this.maxStorageChargeRate, 2, 'W'),
//             maxStorageDischargeRate:              this.normaliseUnit(this.maxStorageDischargeRate, 2, 'W')
//         };
//     }
// }

// export class Setting extends SymoModel<ISetting> {
//     public get maxPowerOutput (): number { return this.scale(this._regs.r03_WMax, this._regs.r23_WMax_SF); }
//     public get voltageAtPCC (): number { return this.scale(this._regs.r04_VRef, this._regs.r24_VRef_SF); }
//     public get voltageOffsetAtPCC (): number { return this.scale(this._regs.r05_VRefOfs, this._regs.r25_VRefOfs_SF); }
//     public get maxApparantPower (): number { return this.scale(this._regs.r08_VAMax, this._regs.r27_VAMax_SF); }
//     public get maxReactiveQ1Power (): number { return this.scale(this._regs.r09_VARMAXQ1, this._regs.r28_VARMax_SF); }
//     public get maxReactiveQ4Power (): number { return this.scale(this._regs.r12_VARMAXQ4, this._regs.r28_VARMax_SF); }
//     public get minPowerFactorQ1 (): number { return this.scale(this._regs.r14_PFMinQ1, this._regs.r30_PFMIN_SF); }
//     public get minPowerFactorQ4 (): number { return this.scale(this._regs.r17_PFMinQ4, this._regs.r30_PFMIN_SF); }

//     public toHumanReadableObject (): Object {
//         return {
//             createdAt:          this.createdAt,
//             maxPowerOutput:     this.normaliseUnit(this.maxPowerOutput, 2, 'W'),
//             voltageAtPCC:       this.normaliseUnit(this.voltageAtPCC, 2, 'V'),
//             voltageOffsetAtPCC: this.normaliseUnit(this.voltageOffsetAtPCC, 2, 'V'),
//             maxApparantPower:   this.normaliseUnit(this.maxApparantPower, 2, 'VA'),
//             maxReactiveQ1Power: this.normaliseUnit(this.maxReactiveQ1Power, 2, 'var'),
//             maxReactiveQ4Power: this.normaliseUnit(this.maxReactiveQ4Power, 2, 'var'),
//             minPowerFactorQ1:   this.normaliseUnit(this.minPowerFactorQ1, 2),
//             minPowerFactorQ4:   this.normaliseUnit(this.minPowerFactorQ4, 2)
//         };
//     }
// }

// export class Status extends SymoModel<IStatus> {

//     /* tslint:disable:no-bitwise */
//     public get isConnected (): boolean { return (this.regs.r03_PVConn & 0x01) === 0x01; }
//     public get isResponsive (): boolean { return (this.regs.r03_PVConn & 0x02) === 0x02; }
//     public get isOperating (): boolean { return (this.regs.r03_PVConn & 0x04) === 0x04; }
//     public get isInTest (): boolean { return (this.regs.r03_PVConn & 0x08) === 0x08; }
//     public get isStorageConnected (): boolean { return (this.regs.r04_StorConn & 0x01) === 0x01; }
//     public get isStorageAvailable (): boolean { return (this.regs.r04_StorConn & 0x02) === 0x02; }
//     public get isStorageOperating (): boolean { return (this.regs.r04_StorConn & 0x04) === 0x04; }
//     public get isECPConnected (): boolean { return (this.regs.r05_ECPConn & 0x01) === 0x01; }
//     public get isControllerModeFixedW (): boolean { return (this.regs.r36_StActCtl & 0x01) === 0x01; }
//     public get isControllerModeFixedVar (): boolean { return (this.regs.r36_StActCtl & 0x02) === 0x02; }
//     public get isControllerModeFixedPF (): boolean { return (this.regs.r36_StActCtl & 0x04) === 0x04; }
//     /* tslint:enable:no-bitwise */
//     public get lifetimeActiveACEnergyOut (): number { return this._regs.r06_ActWh; }
//     public get sourceOfTimeSync (): string { return this.regs.r38_TmSrc; }

//     public get time (): Date {
//         const rv = new Date;
//         rv.setTime((this._regs.r42_Tms + 946684800 - (SymoModel.isDaylightSavingTime(rv) ? 3600 : 0) ) * 1000);
//         return rv;
//     }

//     public toHumanReadableObject (): Object {
//         return {
//             createdAt:                 this.createdAt,
//             isConnected:               this.isConnected,
//             isResponsive:              this.isResponsive,
//             isOperating:               this.isOperating,
//             isInTest:                  this.isInTest,
//             isStorageConnected:        this.isStorageConnected,
//             // isStorageAvailable:       this.isStorageAvailable, // Fronius-Bug ? always false
//             // isStorageOperating:       this.isStorageOperating, // Fronius-Bug ? always false
//             isECPConnected:            this.isECPConnected, // ECP = Eclectrical Connection Point
//             isControllerModeFixedW:    this.isControllerModeFixedW,
//             isControllerModeFixedVar:  this.isControllerModeFixedVar,
//             isControllerModeFixedPF:   this.isControllerModeFixedPF,
//             lifetimeActiveACEnergyOut: this.normaliseUnit(this.lifetimeActiveACEnergyOut, 2, 'Wh'),
//             sourceOfTimeSync:          this.sourceOfTimeSync,
//             time:                      this.time
//         };
//     }

// }


// export class Control extends SymoModel<IControl> {

//     public get connectTimeWindow (): number { return this.regs.r03_Conn_WinTms; }
//     public get connectTimeout (): number { return this.regs.r04_Conn_RvrTms; }
//     public get isConnected (): boolean { return this.regs.r05_Conn === 1; }
//     public get powerOutLevel (): number { return this.scale(this._regs.r06_WMaxLimPct, this._regs.r24_WMaxLimPct_SF); }
//     public get powerLimitChangeTimeWindow (): number { return this.regs.r07_WMaxLimPct_WinTms; }
//     public get powerLimitChangeTimeout (): number { return this.regs.r08_WMaxLimPct_RvrTms; }
//     public get isThrottleControlEnabled (): boolean { return this.regs.r10_WMaxLim_Ena === 1; }
//     public get powerFactorSetpoint (): number { return this.scale(this._regs.r11_OutPFSet, this._regs.r25_OutPFSet_SF); }
//     public get powerFactorChangeTimeWindow (): number { return this.regs.r12_OutPFSet_WinTms; }
//     public get powerFactorChangeTimeout (): number { return this.regs.r13_OutPFSet_RvrTms; }
//     public get isPowerFactorControlEnabled (): boolean { return this.regs.r15_OutPFSet_Ena === 1; }
//     public get reactivePowerinPercent (): number { return this.scale(this._regs.r17_VArMaxPct, this._regs.r26_VArPct_SF); }
//     public get varLimitChangeTimeWindow (): number { return this.regs.r19_VArPct_WinTms; }
//     public get varLimitChangeTimeout (): number { return this.regs.r20_VArPct_RvrtTms; }
//     public get isVarLimitPercentOfVarMax (): boolean { return this.regs.r22_VArPct_Mod === 2; }
//     public get isVarControlEnabled (): boolean { return this.regs.r23_VArPct_Ena === 1; }

//     public toHumanReadableObject (): Object {
//         return {
//             createdAt:                   this.createdAt,
//             connectTimeWindow:           this.connectTimeWindow + 's',
//             connectTimeout:              this.connectTimeout + 's',
//             isConnected:                 this.isConnected,
//             powerOutLevel:               this.normaliseUnit(this.powerOutLevel, 2, 'W'),
//             powerLimitChangeTimeWindow:  this.powerLimitChangeTimeWindow + 's',
//             powerLimitChangeTimeout:     this.powerLimitChangeTimeout + 's',
//             isThrottleControlEnabled:    this.isThrottleControlEnabled,
//             powerFactorSetpoint:         this.normaliseUnit(this.powerFactorSetpoint, 2),
//             powerFactorChangeTimeWindow: this.powerFactorChangeTimeWindow + 's',
//             powerFactorChangeTimeout:    this.powerFactorChangeTimeout + 's',
//             isPowerFactorControlEnabled: this.isPowerFactorControlEnabled,
//             reactivePowerinPercent:      this.normaliseUnit(this.reactivePowerinPercent, 2) + '%',
//             varLimitChangeTimeWindow:    this.varLimitChangeTimeWindow + 's',
//             varLimitChangeTimeout:       this.varLimitChangeTimeout + 's',
//             isVarLimitPercentOfVarMax:   this.isVarLimitPercentOfVarMax,
//             isVarControlEnabled:         this.isVarControlEnabled
//         };
//     }
// }

// export class Storage extends SymoModel<IStorage> {

//     public get maxChargeSetpoint (): number { return this.scale(this._regs.r03_WChaMax, this._regs.r19_WChaMax_SF); }
//     public get maxChargeGradient (): number { return this.scale(this._regs.r04_WchaGra, this._regs.r20_WchaDisChaGra_SF); }
//     public get maxDischargeGradient (): number { return this.scale(this._regs.r05_WdisChaGra, this._regs.r20_WchaDisChaGra_SF); }
//     public get isActiveControlEnabled (): boolean { return this._regs.r06_StorCtl_Mod === 1; }
//     public get minReserveInPercent (): number { return this.scale(this._regs.r08_MinRsvPct, this._regs.r22_MinRsvPct_SF); }
//     public get chargeLevelInPercent (): number { return this.scale(this._regs.r09_ChaState, this._regs.r23_ChaState_SF); }
//     public get dischargeRateInPercent (): number { return this.scale(this._regs.r13_OutWRte, this._regs.r26_InOutWRte_SF); }
//     public get chargeRateInPercent (): number { return this.scale(this._regs.r14_InWRte, this._regs.r26_InOutWRte_SF); }
//     public get isChargingFromGridEnabled (): boolean { return this._regs.r18_ChaGriSet === 1; }
//     public get isOff(): boolean { return this._regs.r12_ChaSt === 1; }
//     public get isEmpty(): boolean { return this._regs.r12_ChaSt === 2; }
//     public get isDischarging(): boolean { return this._regs.r12_ChaSt === 3; }
//     public get isCharging (): boolean { return this._regs.r12_ChaSt === 4; }
//     public get isFull(): boolean { return this._regs.r12_ChaSt === 5; }
//     public get isHolding(): boolean { return this._regs.r12_ChaSt === 6; }
//     public get isInCalibration(): boolean { return this._regs.r12_ChaSt === 7; }

//     public get chargeState (): string {
//         switch (this._regs.r12_ChaSt) {
//             case 1: return 'OFF';
//             case 2: return 'EMPTY';
//             case 3: return 'DISCHARGING';
//             case 4: return 'CHARGING';
//             case 5: return 'FULL';
//             case 6: return 'HOLDING';
//             case 7: return 'TEST';
//             default: return '?';
//         }
//     }

//     public toHumanReadableObject (): Object {
//         return {
//             createdAt:                 this.createdAt,
//             maxChargeSetpoint:         this.normaliseUnit(this.maxChargeSetpoint, 2, 'W'),
//             maxChargeGradient:         this.normaliseUnit(this.maxChargeGradient, 2) + '%',
//             maxDischargeGradient:      this.normaliseUnit(this.maxDischargeGradient, 2) + '%',
//             isActiveControlEnabled:    this.isActiveControlEnabled,
//             minReserveInPercent:       this.normaliseUnit(this.minReserveInPercent, 2) + '%',
//             chargeLevelInPercent:      this.normaliseUnit(this.chargeLevelInPercent, 2) + '%',
//             chargeState:               this.chargeState,
//             dischargeRateInPercent:    this.normaliseUnit(this.dischargeRateInPercent, 2) + '%',
//             chargeRateInPercent:       this.normaliseUnit(this.chargeRateInPercent, 2) + '%',
//             isChargingFromGridEnabled: this.isChargingFromGridEnabled,
//         };
//     }
// }


// export class InverterExtension extends SymoModel<IInverterExtension> {

//     public get globalEvents (): number { return this._regs.r07_EVT; }
//     public get numberOfModules (): number { return this._regs.r09_N; }
//     public get string1_Id (): number { return this._regs.r11_1_ID; }
//     public get string1_Name (): string { return this._regs.r12_1_IDStr; }

//     public get string1_Current (): number {
//         switch (this._regs.r28_1_DCst) {
//             case 2: case 4: case 5: case 6: case 7: case 8:
//                 return this.scale(this._regs.r20_1_DCA, this._regs.r03_DCA_SF);
//             case 1: case 3: default:
//                 if (this._regs.r20_1_DCA !== 0) {
//                     // console.log('Fronius Symo bug: inverter extension r20_1_DCA = ' + this._regs.r20_1_DCA);
//                 }
//                 return 0;
//         }
//     }

//     public get string1_Voltage (): number {
//         switch (this._regs.r28_1_DCst) {
//             case 2: case 4: case 5: case 6: case 7: case 8:
//                 return this.scale(this._regs.r21_1_DCV, this._regs.r04_DCV_SF);
//             case 1: case 3: default:
//                 if (this._regs.r21_1_DCV !== 0) {
//                     // console.log('Fronius Symo bug: inverter extension r21_1_DCV = ' + this._regs.r21_1_DCV);
//                 }
//                 return 0;
//         }
//     }

//     public get string1_Power (): number {
//         switch (this._regs.r28_1_DCst) {
//             case 2: case 4: case 5: case 6: case 7: case 8:
//                 return this.scale(this._regs.r22_1_DCW, this._regs.r05_DCW_SF);
//             case 1: case 3: default:
//                 if (this._regs.r22_1_DCW !== 0) {
//                     // console.log('Fronius Symo bug: inverter extension r22_1_DCW = ' + this._regs.r22_1_DCW);
//                 }
//                 return 0;
//         }
//     }

//     public get string1_LifetimeEnergy (): number { return this.scale(this._regs.r23_1_DCWH, this._regs.r06_DCWH_SF); }
//     public get string1_Temperature (): number { return this._regs.r27_1_Tmp; }
//     public get string1_operatingState (): string { return this.stringOperatingState(this._regs.r28_1_DCst); }
//     public get string2_Id (): number { return this._regs.r31_2_ID; }
//     public get string2_Name (): string { return this._regs.r32_2_IDStr; }

//     public get string2_Current (): number {
//         if (this._regs.r48_2_DCst === 65535 && this._regs.r40_2_DCA === 65535) {
//             return 0;
//         } else {
//             return this.scale(this._regs.r40_2_DCA, this._regs.r03_DCA_SF);
//         }
//     }

//     public get string2_Voltage (): number {
//         if (this._regs.r48_2_DCst === 65535 && this._regs.r41_2_DCV === 65535) {
//             return 0;
//         } else {
//             return this.scale(this._regs.r41_2_DCV, this._regs.r04_DCV_SF);
//         }
//     }

//     public get string2_Power (): number {
//         if (this._regs.r48_2_DCst === 65535 && this._regs.r42_2_DCW === 65535) {
//             return 0;
//         } else {
//             return this.scale(this._regs.r42_2_DCW, this._regs.r05_DCW_SF);
//         }
//     }

//     public get string2_LifetimeEnergy (): number { return this.scale(this._regs.r43_2_DCWH, this._regs.r06_DCWH_SF); }
//     public get string2_Temperature (): number { return this._regs.r47_2_Tmp; }
//     public get string2_operatingState (): string { return this.stringOperatingState(this._regs.r48_2_DCst); }

//     public get string1_Timestamp (): Date {
//         const rv = new Date;
//         rv.setTime((this._regs.r25_1_Tms + 946684800 - (SymoModel.isDaylightSavingTime(rv) ? 3600 : 0) ) * 1000);
//         return rv;
//     }

//     public get string2_Timestamp (): Date {
//         const rv = new Date;
//         rv.setTime((this._regs.r45_2_Tms + 946684800 - (SymoModel.isDaylightSavingTime(rv) ? 3600 : 0) ) * 1000);
//         return rv;
//     }

//     public toHumanReadableObject (): Object {
//         return {
//             createdAt:              this.createdAt,
//             globalEvents:           this.globalEvents,
//             numberOfModules:        this.numberOfModules,
//             string1_Id:             this.string1_Id,
//             string1_Name:           this.string1_Name,
//             string1_Current:        this.normaliseUnit(this.string1_Current, 2, 'A'),
//             string1_Voltage:        this.normaliseUnit(this.string1_Voltage, 2, 'V'),
//             string1_Power:          this.normaliseUnit(this.string1_Power, 2, 'W'),
//             string1_LifetimeEnergy: this.normaliseUnit(this.string1_LifetimeEnergy, 2, 'Wh'),
//             string1_Timestamp:      this.string1_Timestamp,
//             string1_Temperature:    this.string1_Temperature,
//             string1_operatingState: this.string1_operatingState,
//             string2_Id:             this.string2_Id,
//             string2_Name:           this.string2_Name,
//             string2_Current:        this.normaliseUnit(this.string2_Current, 2, 'A'),
//             string2_Voltage:        this.normaliseUnit(this.string2_Voltage, 2, 'V'),
//             string2_Power:          this.normaliseUnit(this.string2_Power, 2, 'W'),
//             string2_LifetimeEnergy: this.normaliseUnit(this.string2_LifetimeEnergy, 2, 'Wh'),
//             string2_Timestamp:      this.string2_Timestamp,
//             string2_Temperature:    this.string2_Temperature,
//             string2_operatingState: this.string2_operatingState
//         };
//     }

//     private stringOperatingState (reg: number): string {
//         switch (reg) {
//             case 1: return 'OFF';
//             case 2: return 'IN OPERATION';
//             case 3: return 'RUN UP PHASE';
//             case 4: return 'NORMAL OPERATION';
//             case 5: return 'POWER REDUCTION';
//             case 6: return 'SWITCH-OFF PHASE';
//             case 7: return 'ERROR EXISTS';
//             case 8: return 'STANDBY';
//             default: return '? (' + reg + ')';
//         }
//     }
// }

// // String Combiner Fronius-Bug
// export class StringCombiner extends SymoModel<IStringCombiner> {

//     public toHumanReadableObject (): Object {
//         return {
//             typ: 'StringCombiner'
//         };
//     }
// }




// export class Meter extends SymoModel<IMeter> {

//     public get isSinglePhaseMeter (): boolean { return this._regs.r40070_ID === 201; }
//     public get isSplitPhaseMeter (): boolean { return this._regs.r40070_ID === 202; }
//     public get isThreePhaseMeter (): boolean { return this._regs.r40070_ID === 213; }
//     public get current (): number { return this._regs.r40072_A; }
//     public get currentL1 (): number { return this._regs.r40074_AphA; }
//     public get currentL2 (): number { return this._regs.r40076_AphB; }
//     public get currentL3 (): number { return this._regs.r40078_AphC; }
//     public get voltagePN (): number { return this._regs.r40080_PhV; }
//     public get voltageL1 (): number { return this._regs.r40082_PhVphA; }
//     public get voltageL2 (): number { return this._regs.r40084_PhVphB; }
//     public get voltageL3 (): number { return this._regs.r40086_PhVphC; }
//     public get voltagePP (): number { return this._regs.r40088_PPV; }
//     public get voltageL12 (): number { return this._regs.r40090_PPVphAB; }
//     public get voltageL23 (): number { return this._regs.r40092_PPVphBC; }
//     public get voltageL31 (): number { return this._regs.r40094_PPVphCA; }
//     public get frequency (): number { return this._regs.r40096_Hz; }
//     public get activePower (): number { return this._regs.r40098_W; }
//     public get activePowerL1 (): number { return this._regs.r40100_WphA; }
//     public get activePowerL2 (): number { return this._regs.r40102_WphB; }
//     public get activePowerL3 (): number { return this._regs.r40104_WphC; }
//     public get apparentPower (): number { return this._regs.r40106_VA; }
//     public get apparentPowerL1 (): number { return this._regs.r40108_VAphA; }
//     public get apparentPowerL2 (): number { return this._regs.r40110_VAphB; }
//     public get apparentPowerL3 (): number { return this._regs.r40112_VAphC; }
//     public get reactivePower (): number { return this._regs.r40114_VAR; }
//     public get reactivePowerL1 (): number { return this._regs.r40116_VARphA; }
//     public get reactivePowerL2 (): number { return this._regs.r40118_VARphB; }
//     public get reactivePowerL3 (): number { return this._regs.r40120_VARphC; }
//     public get powerFactor (): number { return this._regs.r40122_PF; }
//     public get powerFactorL1 (): number { return this._regs.r40124_PFphA; }
//     public get powerFactorL2 (): number { return this._regs.r40126_PFphB; }
//     public get powerFactorL3 (): number { return this._regs.r40128_PFphC; }
//     public get totalExportedEnergy (): number { return this._regs.r40130_TotWhExp; }
//     public get totalImportedEnergy (): number { return this._regs.r40138_TotWhImp; }
//     public get events (): number { return this._regs.r40194_Evt; }

//     public toHumanReadableObject (): Object {
//         return {
//             createdAt:             this.createdAt,
//             isSinglePhaseMeter:    this.isSinglePhaseMeter,
//             isSplitPhaseMeter:     this.isSplitPhaseMeter,
//             isThreePhaseMeter:     this.isThreePhaseMeter,
//             current:               this.normaliseUnit(this.current, 3, 'A'),
//             currentL1:             this.normaliseUnit(this.currentL1, 3, 'A'),
//             currentL2:             this.normaliseUnit(this.currentL2, 3, 'A'),
//             currentL3:             this.normaliseUnit(this.currentL3, 3, 'A'),
//             voltagePN:             this.normaliseUnit(this.voltagePN, 1, 'V'),
//             voltageL1:             this.normaliseUnit(this.voltageL1, 1, 'V'),
//             voltageL2:             this.normaliseUnit(this.voltageL2, 1, 'V'),
//             voltageL3:             this.normaliseUnit(this.voltageL3, 1, 'V'),
//             voltagePP:             this.normaliseUnit(this.voltagePP, 1, 'V'),
//             voltageL12:            this.normaliseUnit(this.voltageL12, 1, 'V'),
//             voltageL23:            this.normaliseUnit(this.voltageL23, 1, 'V'),
//             voltageL31:            this.normaliseUnit(this.voltageL31, 1, 'V'),
//             frequency:             this.normaliseUnit(this.frequency, 1, 'Hz'),
//             activePower:           this.normaliseUnit(this.activePower, 2, 'W'),
//             activePowerL1:         this.normaliseUnit(this.activePowerL1, 2, 'W'),
//             activePowerL2:         this.normaliseUnit(this.activePowerL2, 2, 'W'),
//             activePowerL3:         this.normaliseUnit(this.activePowerL3, 2, 'W'),
//             apparentPower:         this.normaliseUnit(this.apparentPower, 2, 'VA'),
//             apparentPowerL1:       this.normaliseUnit(this.apparentPowerL1, 2, 'VA'),
//             apparentPowerL2:       this.normaliseUnit(this.apparentPowerL2, 2, 'VA'),
//             apparentPowerL3:       this.normaliseUnit(this.apparentPowerL3, 2, 'VA'),
//             reactivePower:         this.normaliseUnit(this.reactivePower, 2, 'var'),
//             reactivePowerL1:       this.normaliseUnit(this.reactivePowerL1, 2, 'var'),
//             reactivePowerL2:       this.normaliseUnit(this.reactivePowerL2, 2, 'var'),
//             reactivePowerL3:       this.normaliseUnit(this.reactivePowerL3, 2, 'var'),
//             powerFactor:           this.normaliseUnit(this.powerFactor, 2),
//             powerFactorL1:         this.normaliseUnit(this.powerFactorL1, 2),
//             powerFactorL2:         this.normaliseUnit(this.powerFactorL2, 2),
//             powerFactorL3:         this.normaliseUnit(this.powerFactorL3, 2),
//             totalExportedEnergy:   this.normaliseUnit(this.totalExportedEnergy, 3, 'Wh'),
//             totalImportedEnergy:   this.normaliseUnit(this.totalImportedEnergy, 3, 'Wh'),
//             events:                this.events
//         };
//     }
// }
