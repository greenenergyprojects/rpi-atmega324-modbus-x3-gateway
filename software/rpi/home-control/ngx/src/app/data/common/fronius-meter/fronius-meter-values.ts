export interface IFroniusMeterValues {
    lastUpdateAt: Date;           // Zeitpunkt der gemessenen Werte
    voltageL1: number;            // Phasenspannung L1 - N in Volt
    voltageL2: number;            // Phasenspannung L2 - N in Volt
    voltageL3: number;            // Phasenspannung L3 - N in Volt
    currentL1: number;            // Phasenstrom in L1 in Ampere
    currentL2: number;            // Phasenstrom in L2 in Ampere
    currentL3: number;            // Phasenstrom in L3 in Ampere
    voltageL12: number;           // Phasenspannung L1 - L2 in Volt
    voltageL23: number;           // Phasenspannung L2 - L3 in Volt
    voltageL31: number;           // Phasenspannung L3 - L1 in Volt
    activePower: number;          // Wirkleistung in W (+/-)
    reactivePower: number;        // Blindleistung in var (+/-)
    apparentPower: number;        // Scheinleistung in VA
    activeEnergy: number;         // Wirkeinergie Bezug in Wh
    reactiveEnergy: number;       // Blindenergie Bezug in varh
    activeFeedEnergy: number;     // Wirkeinergie Lieferung in Wh
    reactiveFeedEnergy: number;   // Blindenergie Lieferung in varh
    powerFactor: number;          // Leistungsfaktor (+ IND, - CAP)
    powerStatus: 'NoPower' | 'Inductive' | 'Capacitice' | '?';
    frequency: number;            // Frequency in Hz
    activePowerDemand: number;    // Wirkleistungmittelwert in letztem 5 Minuten Zeitintervall in W
    activePowerMaxDemand: number; // Maximaler Wirkleistungsmittelwert seit Reset in W
    lastDemandAt: Date;           // Zeitpunkt der letzten Mittelwerte
    demandMinute: 0 | 1 | 2 | 3 | 4 | undefined;
    activePowerL1: number;        // Wirkleistung von Phase 1 in W (+/-)
    activePowerL2: number;        // Wirkleistung von Phase 2 in W (+/-)
    activePowerL3: number;        // Wirkleistung von Phase 3 in W (+/-)
    reactivePowerL1: number;      // Blindleitung von Phase 1 in var (+/-)
    reactivePowerL2: number;      // Blindleitung von Phase 2 in var (+/-)
    reactivePowerL3: number;      // Blindleitung von Phase 3 in var (+/-)
    powerFactorL1: number;        // Leistungsfaktor von Phase 1 (+ IND, - CAP)
    powerFactorL2: number;        // Leistungsfaktor von Phase 2 (+ IND, - CAP)
    powerFactorL3: number;        // Leistungsfaktor von Phase 3 (+ IND, - CAP)
}

