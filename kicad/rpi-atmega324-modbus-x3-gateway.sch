EESchema Schematic File Version 4
LIBS:rpi-atmega324-modbus-x3-gateway-cache
EELAYER 26 0
EELAYER END
$Descr A4 11693 8268
encoding utf-8
Sheet 1 3
Title "rpi-atmega324-modbus-x3-gateway"
Date "2018-09-17"
Rev "0.1.0"
Comp "github.com/greenenergyprojects"
Comment1 ""
Comment2 ""
Comment3 ""
Comment4 ""
$EndDescr
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:Raspberry_Pi_2+ J1
U 1 1 5B8BF88A
P 3300 3100
F 0 "J1" H 4000 3550 50  0000 C CNN
F 1 "Raspberry_Pi_2+" H 4000 0   50  0000 C CNN
F 2 "Project: Raspberry-PI" H 2450 -1650 50  0001 C CNN
F 3 "" H 3300 2000 50  0001 C CNN
	1    3300 3100
	1    0    0    -1  
$EndComp
$Sheet
S 5200 2775 1400 925 
U 5B8BFAA6
F0 "uc1" 60
F1 "uc1.sch" 60
F2 "RxD" I L 5200 3100 60 
F3 "TxD" O L 5200 3200 60 
F4 "~CS~" O R 6600 3100 60 
F5 "SCK" O R 6600 3200 60 
F6 "MOSI" O R 6600 3300 60 
F7 "MISO" I R 6600 3400 60 
F8 "~RESET~" I L 5200 3550 60 
F9 "USB-5V" O L 5200 2900 60 
$EndSheet
$Sheet
S 7850 2800 1300 1100
U 5B8BFAAA
F0 "uc2" 60
F1 "uc2.sch" 60
F2 "~RESET~" I L 7850 3800 60 
F3 "~CS~" I L 7850 3100 60 
F4 "SCK" I L 7850 3200 60 
F5 "MOSI" I L 7850 3300 60 
F6 "MISO" O L 7850 3400 60 
F7 "USB-5V" O L 7850 2900 60 
$EndSheet
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:+3.3V #PWR01
U 1 1 5B8BF7CC
P 3000 2300
F 0 "#PWR01" H 3000 2150 50  0001 C CNN
F 1 "+3.3V" H 3000 2440 50  0000 C CNN
F 2 "" H 3000 2300 50  0001 C CNN
F 3 "" H 3000 2300 50  0001 C CNN
	1    3000 2300
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:+5V #PWR02
U 1 1 5B8BF7FE
P 4600 1500
F 0 "#PWR02" H 4600 1350 50  0001 C CNN
F 1 "+5V" H 4600 1640 50  0000 C CNN
F 2 "" H 4600 1500 50  0001 C CNN
F 3 "" H 4600 1500 50  0001 C CNN
	1    4600 1500
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:GND #PWR03
U 1 1 5B8BF820
P 2900 6500
F 0 "#PWR03" H 2900 6250 50  0001 C CNN
F 1 "GND" H 2900 6350 50  0000 C CNN
F 2 "" H 2900 6500 50  0001 C CNN
F 3 "" H 2900 6500 50  0001 C CNN
	1    2900 6500
	1    0    0    -1  
$EndComp
Wire Wire Line
	3000 2300 3000 2500
NoConn ~ 2400 3000
NoConn ~ 2400 3100
NoConn ~ 2400 3200
NoConn ~ 2400 3300
NoConn ~ 2400 3400
NoConn ~ 2400 3600
NoConn ~ 2400 3700
NoConn ~ 2400 3800
NoConn ~ 2400 3900
NoConn ~ 2400 4000
NoConn ~ 2400 4100
NoConn ~ 2400 4200
NoConn ~ 2400 4300
NoConn ~ 2400 4400
NoConn ~ 2400 4500
NoConn ~ 2400 4600
NoConn ~ 2400 4700
NoConn ~ 2400 4800
Wire Wire Line
	4200 3100 5200 3100
Wire Wire Line
	5200 3200 4200 3200
NoConn ~ 2400 5000
NoConn ~ 2400 5100
NoConn ~ 2400 5300
NoConn ~ 2400 5400
NoConn ~ 2400 5500
NoConn ~ 2400 5600
Wire Wire Line
	2900 6300 3000 6300
Wire Wire Line
	3600 6300 3600 6200
Connection ~ 2900 6300
Wire Wire Line
	6600 3100 7850 3100
Wire Wire Line
	7850 3200 6600 3200
Wire Wire Line
	7850 3300 6600 3300
Wire Wire Line
	7850 3400 6600 3400
Wire Wire Line
	4200 3400 4700 3400
Wire Wire Line
	4700 3400 4700 4100
Wire Wire Line
	4700 4100 7100 4100
Wire Wire Line
	7100 4100 7100 3800
Wire Wire Line
	7100 3800 7850 3800
Wire Wire Line
	5000 2400 5000 2900
Wire Wire Line
	5000 2900 5200 2900
Wire Wire Line
	7100 2400 7100 2900
Wire Wire Line
	7100 2900 7850 2900
Connection ~ 5000 2400
Connection ~ 4600 2400
Wire Wire Line
	3500 2400 3500 2500
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:PWR_FLAG #FLG04
U 1 1 5B8F6C0B
P 5250 2300
F 0 "#FLG04" H 5250 2375 50  0001 C CNN
F 1 "PWR_FLAG" H 5250 2450 50  0000 C CNN
F 2 "" H 5250 2300 50  0001 C CNN
F 3 "" H 5250 2300 50  0001 C CNN
	1    5250 2300
	1    0    0    -1  
$EndComp
Wire Wire Line
	5250 2400 5250 2300
Connection ~ 5250 2400
Wire Wire Line
	3500 2400 4600 2400
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:HLK-PM01 U8
U 1 1 5B8FBF97
P 3900 1800
F 0 "U8" H 3150 2050 50  0000 L BNN
F 1 "HLK-5M05" H 3150 1550 50  0000 L BNN
F 2 "Project:HLK_5M05" H 3450 1700 50  0001 C CIN
F 3 "" H 3450 1500 50  0001 C CNN
	1    3900 1800
	1    0    0    -1  
$EndComp
Wire Wire Line
	2150 1700 2650 1700
Wire Wire Line
	2150 1800 2900 1800
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:GND #PWR05
U 1 1 5B8FD6FE
P 4000 1900
F 0 "#PWR05" H 4000 1650 50  0001 C CNN
F 1 "GND" H 4000 1750 50  0000 C CNN
F 2 "" H 4000 1900 50  0001 C CNN
F 3 "" H 4000 1900 50  0001 C CNN
	1    4000 1900
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:D_Schottky D18
U 1 1 5B8FDA4D
P 4350 1700
F 0 "D18" H 4350 1800 50  0000 C CNN
F 1 "D_Schottky" H 4350 1600 50  0001 C CNN
F 2 "Diodes_SMD:D_2114" H 4350 1700 50  0001 C CNN
F 3 "" H 4350 1700 50  0001 C CNN
	1    4350 1700
	-1   0    0    1   
$EndComp
Wire Wire Line
	3900 1700 4200 1700
Wire Wire Line
	4500 1700 4600 1700
Wire Wire Line
	4600 1500 4600 1700
Connection ~ 4600 1700
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:PWR_FLAG #FLG06
U 1 1 5B8FED55
P 2900 1400
F 0 "#FLG06" H 2900 1475 50  0001 C CNN
F 1 "PWR_FLAG" H 2900 1550 50  0000 C CNN
F 2 "" H 2900 1400 50  0001 C CNN
F 3 "" H 2900 1400 50  0001 C CNN
	1    2900 1400
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:PWR_FLAG #FLG07
U 1 1 5B8FEDC0
P 2650 1200
F 0 "#FLG07" H 2650 1275 50  0001 C CNN
F 1 "PWR_FLAG" H 2650 1350 50  0000 C CNN
F 2 "" H 2650 1200 50  0001 C CNN
F 3 "" H 2650 1200 50  0001 C CNN
	1    2650 1200
	1    0    0    -1  
$EndComp
Wire Wire Line
	2650 1200 2650 1700
Connection ~ 2650 1700
Wire Wire Line
	2900 1400 2900 1800
Connection ~ 2900 1800
Wire Wire Line
	4000 1900 4000 1800
Wire Wire Line
	4000 1800 3900 1800
Wire Wire Line
	2900 6200 2900 6300
Wire Wire Line
	3000 6300 3000 6200
Connection ~ 3000 6300
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:Screw_Terminal_01x03 J37
U 1 1 5B9B43C3
P 1950 1800
F 0 "J37" H 1950 2000 50  0000 C CNN
F 1 "Screw_Terminal_01x03" H 1950 1600 50  0001 C CNN
F 2 "Project:Terminalblock-3x-5mm" H 1950 1800 50  0001 C CNN
F 3 "" H 1950 1800 50  0001 C CNN
	1    1950 1800
	-1   0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:R R44
U 1 1 5B9B46B9
P 2550 2150
F 0 "R44" H 2700 2250 50  0000 C CNN
F 1 "100k" V 2550 2150 50  0000 C CNN
F 2 "Resistors_SMD:R_1206_HandSoldering" V 2480 2150 50  0001 C CNN
F 3 "" H 2550 2150 50  0001 C CNN
	1    2550 2150
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:C C18
U 1 1 5B9B4843
P 2350 2150
F 0 "C18" H 2200 2250 50  0000 L CNN
F 1 "100n" H 2150 2050 50  0000 L CNN
F 2 "Capacitors_SMD:C_1206_HandSoldering" H 2388 2000 50  0001 C CNN
F 3 "" H 2350 2150 50  0001 C CNN
	1    2350 2150
	1    0    0    -1  
$EndComp
Wire Wire Line
	2350 2300 2350 2350
Wire Wire Line
	2350 2350 2450 2350
Wire Wire Line
	2550 2350 2550 2300
Wire Wire Line
	2450 2400 2450 2350
Connection ~ 2450 2350
Wire Wire Line
	2150 1900 2350 1900
Wire Wire Line
	2550 1900 2550 2000
Wire Wire Line
	2350 1900 2350 2000
Connection ~ 2350 1900
Wire Wire Line
	4800 3550 5200 3550
Wire Wire Line
	4800 3300 4800 3550
Wire Wire Line
	4200 3300 4800 3300
Wire Wire Line
	3100 6300 3100 6200
Connection ~ 3100 6300
Wire Wire Line
	3200 6300 3200 6200
Connection ~ 3200 6300
Wire Wire Line
	3300 6300 3300 6200
Connection ~ 3300 6300
Wire Wire Line
	3400 6300 3400 6200
Connection ~ 3400 6300
Wire Wire Line
	3500 6300 3500 6200
Connection ~ 3500 6300
Wire Wire Line
	3100 2600 3100 2500
Wire Wire Line
	3100 2500 3000 2500
Connection ~ 3000 2500
Wire Wire Line
	3600 2500 3500 2500
Connection ~ 3500 2500
Wire Wire Line
	3600 2600 3600 2500
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:GND #PWR08
U 1 1 5B9EC2F9
P 2450 2400
F 0 "#PWR08" H 2450 2150 50  0001 C CNN
F 1 "GND" H 2450 2250 50  0000 C CNN
F 2 "" H 2450 2400 50  0001 C CNN
F 3 "" H 2450 2400 50  0001 C CNN
	1    2450 2400
	1    0    0    -1  
$EndComp
Wire Wire Line
	2900 6300 2900 6500
Wire Wire Line
	5000 2400 5250 2400
Wire Wire Line
	4600 2400 5000 2400
Wire Wire Line
	5250 2400 7100 2400
Wire Wire Line
	4600 1700 4600 2400
Wire Wire Line
	2650 1700 3000 1700
Wire Wire Line
	2900 1800 3000 1800
Wire Wire Line
	3000 6300 3100 6300
Wire Wire Line
	2450 2350 2550 2350
Wire Wire Line
	2350 1900 2550 1900
Wire Wire Line
	3100 6300 3200 6300
Wire Wire Line
	3200 6300 3300 6300
Wire Wire Line
	3300 6300 3400 6300
Wire Wire Line
	3400 6300 3500 6300
Wire Wire Line
	3500 6300 3600 6300
Wire Wire Line
	3000 2500 3000 2600
Wire Wire Line
	3500 2500 3500 2600
$EndSCHEMATC
