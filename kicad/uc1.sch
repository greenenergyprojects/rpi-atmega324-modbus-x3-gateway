EESchema Schematic File Version 2
LIBS:rpi-atmega324-modbus-x3-gateway-rescue
LIBS:power
LIBS:device
LIBS:switches
LIBS:relays
LIBS:motors
LIBS:transistors
LIBS:conn
LIBS:linear
LIBS:regul
LIBS:74xx
LIBS:cmos4000
LIBS:adc-dac
LIBS:memory
LIBS:xilinx
LIBS:microcontrollers
LIBS:dsp
LIBS:microchip
LIBS:analog_switches
LIBS:motorola
LIBS:texas
LIBS:intel
LIBS:audio
LIBS:interface
LIBS:digital-audio
LIBS:philips
LIBS:display
LIBS:cypress
LIBS:siliconi
LIBS:opto
LIBS:atmel
LIBS:contrib
LIBS:valves
LIBS:import2
LIBS:rpi-atmega324-modbus-x3-gateway-cache
EELAYER 25 0
EELAYER END
$Descr A4 11693 8268
encoding utf-8
Sheet 2 3
Title ""
Date "2018-09-17"
Rev ""
Comp ""
Comment1 ""
Comment2 ""
Comment3 ""
Comment4 ""
$EndDescr
$Comp
L +3.3V #PWR14
U 1 1 5B8BF8F1
P 3900 1000
F 0 "#PWR14" H 3900 850 50  0001 C CNN
F 1 "+3.3V" H 3900 1140 50  0000 C CNN
F 2 "" H 3900 1000 50  0001 C CNN
F 3 "" H 3900 1000 50  0001 C CNN
	1    3900 1000
	1    0    0    -1  
$EndComp
$Comp
L GND #PWR15
U 1 1 5B8BF95B
P 3900 5800
F 0 "#PWR15" H 3900 5550 50  0001 C CNN
F 1 "GND" H 3900 5650 50  0000 C CNN
F 2 "" H 3900 5800 50  0001 C CNN
F 3 "" H 3900 5800 50  0001 C CNN
	1    3900 5800
	1    0    0    -1  
$EndComp
NoConn ~ 5200 4100
NoConn ~ 5200 3900
NoConn ~ 5200 3800
NoConn ~ 5200 3700
NoConn ~ 5200 3600
NoConn ~ 5200 3200
NoConn ~ 5200 3100
NoConn ~ 5200 3000
NoConn ~ 5200 3300
NoConn ~ 5200 4200
$Comp
L C_Small C3
U 1 1 5B8BFF45
P 4100 1300
F 0 "C3" H 4110 1370 50  0000 L CNN
F 1 "100n" H 4110 1220 50  0000 L CNN
F 2 "Capacitors_SMD:C_1206_HandSoldering" H 4100 1300 50  0001 C CNN
F 3 "" H 4100 1300 50  0001 C CNN
	1    4100 1300
	1    0    0    -1  
$EndComp
$Comp
L C_Small C4
U 1 1 5B8C0074
P 4400 1300
F 0 "C4" H 4410 1370 50  0000 L CNN
F 1 "100n" H 4410 1220 50  0000 L CNN
F 2 "Capacitors_SMD:C_1206_HandSoldering" H 4400 1300 50  0001 C CNN
F 3 "" H 4400 1300 50  0001 C CNN
	1    4400 1300
	1    0    0    -1  
$EndComp
$Comp
L C_Small C5
U 1 1 5B8C00A5
P 4700 1300
F 0 "C5" H 4710 1370 50  0000 L CNN
F 1 "100n" H 4710 1220 50  0000 L CNN
F 2 "Capacitors_SMD:C_1206_HandSoldering" H 4700 1300 50  0001 C CNN
F 3 "" H 4700 1300 50  0001 C CNN
	1    4700 1300
	1    0    0    -1  
$EndComp
$Comp
L C_Small C6
U 1 1 5B8C00D1
P 5000 1300
F 0 "C6" H 5010 1370 50  0000 L CNN
F 1 "100n" H 5010 1220 50  0000 L CNN
F 2 "Capacitors_SMD:C_1206_HandSoldering" H 5000 1300 50  0001 C CNN
F 3 "" H 5000 1300 50  0001 C CNN
	1    5000 1300
	1    0    0    -1  
$EndComp
$Comp
L GND #PWR16
U 1 1 5B8C015E
P 5000 1600
F 0 "#PWR16" H 5000 1350 50  0001 C CNN
F 1 "GND" H 5000 1450 50  0000 C CNN
F 2 "" H 5000 1600 50  0001 C CNN
F 3 "" H 5000 1600 50  0001 C CNN
	1    5000 1600
	1    0    0    -1  
$EndComp
$Comp
L C_Small C2
U 1 1 5B8C023F
P 3000 3550
F 0 "C2" H 3010 3620 50  0000 L CNN
F 1 "100n" H 3010 3470 50  0000 L CNN
F 2 "Capacitors_SMD:C_1206_HandSoldering" H 3000 3550 50  0001 C CNN
F 3 "" H 3000 3550 50  0001 C CNN
	1    3000 3550
	1    0    0    -1  
$EndComp
$Comp
L GND #PWR13
U 1 1 5B8C042C
P 3000 3700
F 0 "#PWR13" H 3000 3450 50  0001 C CNN
F 1 "GND" H 3000 3550 50  0000 C CNN
F 2 "" H 3000 3700 50  0001 C CNN
F 3 "" H 3000 3700 50  0001 C CNN
	1    3000 3700
	1    0    0    -1  
$EndComp
$Comp
L Resonator_Small Y1
U 1 1 5B8C0518
P 2400 2900
F 0 "Y1" V 2175 2700 50  0000 L CNN
F 1 "12MHz" V 2175 2825 50  0000 L CNN
F 2 "Crystals:Resonator-3pin_w7.0mm_h2.5mm" H 2375 2900 50  0001 C CNN
F 3 "" H 2375 2900 50  0001 C CNN
	1    2400 2900
	0    1    1    0   
$EndComp
Wire Wire Line
	3900 1600 4400 1600
Connection ~ 4000 1600
Wire Wire Line
	4100 1600 4100 1700
Wire Wire Line
	4000 1700 4000 1600
Wire Wire Line
	4400 1600 4400 1700
Connection ~ 4100 1600
Connection ~ 3900 1600
Wire Wire Line
	3000 3400 3000 3450
Wire Wire Line
	3000 3700 3000 3650
$Comp
L GND #PWR9
U 1 1 5B8C078E
P 2100 3000
F 0 "#PWR9" H 2100 2750 50  0001 C CNN
F 1 "GND" H 2100 2850 50  0000 C CNN
F 2 "" H 2100 3000 50  0001 C CNN
F 3 "" H 2100 3000 50  0001 C CNN
	1    2100 3000
	1    0    0    -1  
$EndComp
Wire Wire Line
	3200 3400 3000 3400
NoConn ~ 5200 4300
NoConn ~ 5200 4800
NoConn ~ 5200 4700
NoConn ~ 5200 5000
NoConn ~ 5200 5100
Text HLabel 1400 5900 0    60   Input ~ 0
RxD
Text HLabel 1400 5800 0    60   Output ~ 0
TxD
Wire Wire Line
	1200 4100 3200 4100
Wire Wire Line
	1200 4200 3200 4200
Wire Wire Line
	1200 4300 3200 4300
Wire Wire Line
	1200 4400 3200 4400
$Comp
L R R1
U 1 1 5B8C21E7
P 2300 3850
F 0 "R1" H 2400 3850 50  0000 C CNN
F 1 "47K" V 2300 3850 50  0000 C CNN
F 2 "Resistors_SMD:R_1206_HandSoldering" V 2230 3850 50  0001 C CNN
F 3 "" H 2300 3850 50  0001 C CNN
	1    2300 3850
	1    0    0    -1  
$EndComp
Wire Wire Line
	2300 4100 2300 4000
Connection ~ 2300 4100
$Comp
L +3.3V #PWR10
U 1 1 5B8C232B
P 2300 3600
F 0 "#PWR10" H 2300 3450 50  0001 C CNN
F 1 "+3.3V" H 2300 3740 50  0000 C CNN
F 2 "" H 2300 3600 50  0001 C CNN
F 3 "" H 2300 3600 50  0001 C CNN
	1    2300 3600
	1    0    0    -1  
$EndComp
Wire Wire Line
	2300 3700 2300 3600
Text HLabel 1200 4100 0    60   Output ~ 0
~CS~
Text HLabel 1200 4200 0    60   Output ~ 0
SCK
Text HLabel 1200 4300 0    60   Output ~ 0
MOSI
Text HLabel 1200 4400 0    60   Input ~ 0
MISO
$Comp
L SW_Push SW1
U 1 1 5B8CC0C0
P 2300 2000
F 0 "SW1" H 2350 2100 50  0000 L CNN
F 1 "SW_Push" H 2300 1940 50  0000 C CNN
F 2 "Buttons_Switches_SMD:SW_SPST_FSMSM" H 2300 2200 50  0001 C CNN
F 3 "" H 2300 2200 50  0001 C CNN
	1    2300 2000
	1    0    0    -1  
$EndComp
Wire Wire Line
	3900 5600 3900 5800
Wire Wire Line
	3900 5700 4200 5700
Wire Wire Line
	4200 5700 4200 5600
Connection ~ 3900 5700
Wire Wire Line
	4100 5600 4100 5700
Connection ~ 4100 5700
Wire Wire Line
	4000 5600 4000 5700
Connection ~ 4000 5700
Wire Wire Line
	3900 1000 3900 1700
Wire Wire Line
	3900 1100 5000 1100
Wire Wire Line
	5000 1100 5000 1200
Connection ~ 3900 1100
Wire Wire Line
	4700 1200 4700 1100
Connection ~ 4700 1100
Wire Wire Line
	4400 1200 4400 1100
Connection ~ 4400 1100
Wire Wire Line
	4100 1200 4100 1100
Connection ~ 4100 1100
Wire Wire Line
	4100 1400 4100 1500
Wire Wire Line
	4100 1500 5000 1500
Wire Wire Line
	5000 1400 5000 1600
Connection ~ 5000 1500
Wire Wire Line
	4700 1500 4700 1400
Connection ~ 4700 1500
Wire Wire Line
	4400 1500 4400 1400
Connection ~ 4400 1500
Wire Wire Line
	2500 2800 3200 2800
Wire Wire Line
	2500 3000 3200 3000
Wire Wire Line
	2200 2900 2100 2900
Wire Wire Line
	2100 2900 2100 3000
$Comp
L C_Small C1
U 1 1 5B8CF80B
P 2300 1500
F 0 "C1" V 2350 1350 50  0000 L CNN
F 1 "100n" V 2250 1250 50  0000 L CNN
F 2 "Capacitors_SMD:C_1206_HandSoldering" H 2300 1500 50  0001 C CNN
F 3 "" H 2300 1500 50  0001 C CNN
	1    2300 1500
	0    -1   -1   0   
$EndComp
$Comp
L R R2
U 1 1 5B8CF88A
P 2600 1150
F 0 "R2" H 2700 1150 50  0000 C CNN
F 1 "47K" V 2600 1150 50  0000 C CNN
F 2 "Resistors_SMD:R_1206_HandSoldering" V 2530 1150 50  0001 C CNN
F 3 "" H 2600 1150 50  0001 C CNN
	1    2600 1150
	1    0    0    -1  
$EndComp
$Comp
L +3.3V #PWR11
U 1 1 5B8CF934
P 2600 800
F 0 "#PWR11" H 2600 650 50  0001 C CNN
F 1 "+3.3V" H 2600 940 50  0000 C CNN
F 2 "" H 2600 800 50  0001 C CNN
F 3 "" H 2600 800 50  0001 C CNN
	1    2600 800 
	1    0    0    -1  
$EndComp
$Comp
L GND #PWR8
U 1 1 5B8CFAF7
P 1900 2100
F 0 "#PWR8" H 1900 1850 50  0001 C CNN
F 1 "GND" H 1900 1950 50  0000 C CNN
F 2 "" H 1900 2100 50  0001 C CNN
F 3 "" H 1900 2100 50  0001 C CNN
	1    1900 2100
	1    0    0    -1  
$EndComp
Wire Wire Line
	2100 2000 1900 2000
Wire Wire Line
	1900 2000 1900 2100
Wire Wire Line
	2600 800  2600 1000
Text HLabel 1200 1400 0    60   Input ~ 0
~RESET~
Wire Wire Line
	2100 1500 2200 1500
Wire Wire Line
	2600 1500 2400 1500
Connection ~ 2600 1500
Wire Wire Line
	2600 1300 2600 2000
Connection ~ 2600 2000
$Comp
L CH340G U4
U 1 1 5B8D48EB
P 8200 4700
F 0 "U4" H 8300 5000 50  0000 L CNN
F 1 "CH340G" H 8700 3700 50  0000 L CNN
F 2 "Project:SOIC-16_3.9x9.9mm_Pitch1.27mm_HANDSOLDERED" H 8750 4350 50  0001 C CNN
F 3 "" H 8750 4350 50  0001 C CNN
	1    8200 4700
	1    0    0    -1  
$EndComp
$Comp
L Atmega-ISP-6 J8
U 1 1 5B8D510C
P 5100 6400
F 0 "J8" H 5300 6550 50  0000 L BNN
F 1 "Atmega-ISP-6" H 5300 5950 50  0000 L BNN
F 2 "Pin_Headers:Pin_Header_Straight_2x03_Pitch2.54mm" H 5550 6100 50  0001 C CIN
F 3 "" H 4650 6050 50  0001 C CNN
	1    5100 6400
	1    0    0    -1  
$EndComp
$Comp
L LED D3
U 1 1 5B8D52D3
P 5900 1450
F 0 "D3" V 5900 1550 50  0000 C CNN
F 1 "LED" H 5900 1350 50  0001 C CNN
F 2 "LEDs:LED_0805_HandSoldering" H 5900 1450 50  0001 C CNN
F 3 "" H 5900 1450 50  0001 C CNN
	1    5900 1450
	0    -1   -1   0   
$EndComp
$Comp
L LED D4
U 1 1 5B8D56C1
P 6100 1450
F 0 "D4" V 6100 1350 50  0000 C CNN
F 1 "LED" H 6100 1350 50  0001 C CNN
F 2 "LEDs:LED_0805_HandSoldering" H 6100 1450 50  0001 C CNN
F 3 "" H 6100 1450 50  0001 C CNN
	1    6100 1450
	0    -1   -1   0   
$EndComp
$Comp
L SN65HVD11 U3
U 1 1 5B8D572F
P 7300 2300
F 0 "U3" H 7060 2750 50  0000 C CNN
F 1 "SN65HVD11" H 7350 1750 50  0000 L CNN
F 2 "Project:SOIC-8_3.9x4.9mm_Pitch1.27mm_Handsolded" H 7300 1600 50  0001 C CNN
F 3 "" H 7300 2350 50  0001 C CNN
	1    7300 2300
	1    0    0    -1  
$EndComp
$Comp
L UART-Harwin3 J2
U 1 1 5B8D59C8
P 1500 5000
F 0 "J2" H 950 5350 50  0000 L BNN
F 1 "UART-Harwin3" H 800 4700 50  0000 L BNN
F 2 "Connectors_Harwin:Harwin_LTek-Male_03x2.00mm_Straight_StrainRelief" H 1150 4900 50  0001 C CIN
F 3 "" H 1050 4650 50  0001 C CNN
	1    1500 5000
	1    0    0    -1  
$EndComp
$Comp
L D_Schottky D2
U 1 1 5B8D5AC2
P 7750 3900
F 0 "D2" H 7750 4000 50  0000 C CNN
F 1 "D_Schottky" H 7750 3800 50  0001 C CNN
F 2 "Diodes_SMD:D_2114" H 7750 3900 50  0001 C CNN
F 3 "" H 7750 3900 50  0001 C CNN
	1    7750 3900
	-1   0    0    1   
$EndComp
$Comp
L Screw_Terminal_01x02 J16
U 1 1 5B8D5F19
P 10800 2300
F 0 "J16" H 10800 2400 50  0000 C CNN
F 1 "Screw_Terminal_01x02" H 10800 2100 50  0001 C CNN
F 2 "Project:Terminalblock-2x-5mm" H 10800 2300 50  0001 C CNN
F 3 "" H 10800 2300 50  0001 C CNN
	1    10800 2300
	1    0    0    -1  
$EndComp
$Comp
L D_TVS_x2_AAC-RESCUE-rpi-atmega324-modbus-x3-gateway D?
U 1 1 5B8D4252
P 9800 2300
AR Path="/5B8D4252" Ref="D?"  Part="1" 
AR Path="/5B8BFAA6/5B8D4252" Ref="D8"  Part="1" 
F 0 "D8" V 9800 2450 50  0000 C CNN
F 1 "D_TVS_x2_AAC" H 9800 2400 50  0001 C CNN
F 2 "TO_SOT_Packages_SMD:SOT-23_Handsoldering" H 9650 2300 50  0001 C CNN
F 3 "" H 9650 2300 50  0001 C CNN
	1    9800 2300
	0    -1   -1   0   
$EndComp
$Comp
L Conn_01x02 J13
U 1 1 5B8D4695
P 9800 1400
F 0 "J13" H 9800 1500 50  0000 C CNN
F 1 "Conn_01x02" H 9800 1200 50  0001 C CNN
F 2 "Pin_Headers:Pin_Header_Straight_1x02_Pitch2.54mm" H 9800 1400 50  0001 C CNN
F 3 "" H 9800 1400 50  0001 C CNN
	1    9800 1400
	1    0    0    -1  
$EndComp
$Comp
L Conn_01x02 J14
U 1 1 5B8D4818
P 9800 3100
F 0 "J14" H 9800 3200 50  0000 C CNN
F 1 "Conn_01x02" H 9800 2900 50  0001 C CNN
F 2 "Pin_Headers:Pin_Header_Straight_1x02_Pitch2.54mm" H 9800 3100 50  0001 C CNN
F 3 "" H 9800 3100 50  0001 C CNN
	1    9800 3100
	1    0    0    -1  
$EndComp
$Comp
L Conn_01x02 J12
U 1 1 5B8D4897
P 9300 2100
F 0 "J12" H 9300 2200 50  0000 C CNN
F 1 "Conn_01x02" H 9300 1900 50  0001 C CNN
F 2 "Pin_Headers:Pin_Header_Straight_1x02_Pitch2.54mm" H 9300 2100 50  0001 C CNN
F 3 "" H 9300 2100 50  0001 C CNN
	1    9300 2100
	1    0    0    -1  
$EndComp
$Comp
L R R17
U 1 1 5B8D4B41
P 9500 1150
F 0 "R17" H 9600 1150 50  0000 C CNN
F 1 "330R" V 9500 1150 50  0000 C CNN
F 2 "Resistors_SMD:R_1206_HandSoldering" V 9430 1150 50  0001 C CNN
F 3 "" H 9500 1150 50  0001 C CNN
	1    9500 1150
	1    0    0    -1  
$EndComp
$Comp
L +3.3V #PWR34
U 1 1 5B8D4C88
P 9500 900
F 0 "#PWR34" H 9500 750 50  0001 C CNN
F 1 "+3.3V" H 9500 1040 50  0000 C CNN
F 2 "" H 9500 900 50  0001 C CNN
F 3 "" H 9500 900 50  0001 C CNN
	1    9500 900 
	1    0    0    -1  
$EndComp
Wire Wire Line
	10600 2300 10500 2300
Wire Wire Line
	10500 2300 10500 1800
Wire Wire Line
	10500 1800 8700 1800
Wire Wire Line
	9800 1800 9800 1900
Wire Wire Line
	10600 2400 10500 2400
Wire Wire Line
	10500 2400 10500 2800
Wire Wire Line
	10500 2800 8700 2800
Wire Wire Line
	9800 2800 9800 2700
$Comp
L GND #PWR37
U 1 1 5B8D4F3C
P 10100 2400
F 0 "#PWR37" H 10100 2150 50  0001 C CNN
F 1 "GND" H 10100 2250 50  0000 C CNN
F 2 "" H 10100 2400 50  0001 C CNN
F 3 "" H 10100 2400 50  0001 C CNN
	1    10100 2400
	1    0    0    -1  
$EndComp
$Comp
L R R18
U 1 1 5B8D5109
P 9500 3450
F 0 "R18" H 9600 3450 50  0000 C CNN
F 1 "330R" V 9500 3450 50  0000 C CNN
F 2 "Resistors_SMD:R_1206_HandSoldering" V 9430 3450 50  0001 C CNN
F 3 "" H 9500 3450 50  0001 C CNN
	1    9500 3450
	1    0    0    -1  
$EndComp
$Comp
L R R16
U 1 1 5B8D518F
P 9000 2450
F 0 "R16" H 9100 2450 50  0000 C CNN
F 1 "150R" V 9000 2450 50  0000 C CNN
F 2 "Resistors_SMD:R_1206_HandSoldering" V 8930 2450 50  0001 C CNN
F 3 "" H 9000 2450 50  0001 C CNN
	1    9000 2450
	1    0    0    -1  
$EndComp
$Comp
L R R14
U 1 1 5B8D5222
P 8450 2200
F 0 "R14" V 8350 2200 50  0000 C CNN
F 1 "10R" V 8450 2200 50  0000 C CNN
F 2 "Resistors_SMD:R_1206_HandSoldering" V 8380 2200 50  0001 C CNN
F 3 "" H 8450 2200 50  0001 C CNN
	1    8450 2200
	0    1    1    0   
$EndComp
$Comp
L R R15
U 1 1 5B8D562A
P 8450 2500
F 0 "R15" V 8550 2500 50  0000 C CNN
F 1 "10R" V 8450 2500 50  0000 C CNN
F 2 "Resistors_SMD:R_1206_HandSoldering" V 8380 2500 50  0001 C CNN
F 3 "" H 8450 2500 50  0001 C CNN
	1    8450 2500
	0    1    1    0   
$EndComp
$Comp
L Conn_01x03 J10
U 1 1 5B8D5923
P 8000 1300
F 0 "J10" V 8100 1400 50  0000 C CNN
F 1 "Conn_01x03" H 8000 1100 50  0001 C CNN
F 2 "Pin_Headers:Pin_Header_Straight_1x03_Pitch2.54mm" H 8000 1300 50  0001 C CNN
F 3 "" H 8000 1300 50  0001 C CNN
	1    8000 1300
	0    -1   -1   0   
$EndComp
Wire Wire Line
	9500 1500 9600 1500
Connection ~ 9800 2800
Wire Wire Line
	9600 1400 9500 1400
Wire Wire Line
	9500 1400 9500 1300
Wire Wire Line
	9500 1000 9500 900 
Wire Wire Line
	9500 3100 9600 3100
Connection ~ 9800 1800
Wire Wire Line
	9600 3200 9500 3200
Wire Wire Line
	9500 3200 9500 3300
$Comp
L GND #PWR35
U 1 1 5B8D63D4
P 9500 3700
F 0 "#PWR35" H 9500 3450 50  0001 C CNN
F 1 "GND" H 9500 3550 50  0000 C CNN
F 2 "" H 9500 3700 50  0001 C CNN
F 3 "" H 9500 3700 50  0001 C CNN
	1    9500 3700
	1    0    0    -1  
$EndComp
Wire Wire Line
	9500 3700 9500 3600
Wire Wire Line
	9000 1800 9000 2100
Wire Wire Line
	9000 2100 9100 2100
Wire Wire Line
	9000 2800 9000 2600
Wire Wire Line
	9000 2300 9000 2200
Wire Wire Line
	9000 2200 9100 2200
Wire Wire Line
	10000 2300 10100 2300
Wire Wire Line
	10100 2300 10100 2400
Wire Wire Line
	9500 1500 9500 1800
Connection ~ 9500 1800
Wire Wire Line
	9500 3100 9500 2800
Connection ~ 9500 2800
Wire Wire Line
	8700 1800 8700 2200
Wire Wire Line
	8700 2200 8600 2200
Connection ~ 9000 1800
Wire Wire Line
	8700 2800 8700 2500
Wire Wire Line
	8700 2500 8600 2500
Connection ~ 9000 2800
Wire Wire Line
	8100 1500 8100 2500
Wire Wire Line
	7700 2500 8300 2500
Wire Wire Line
	7700 2200 8300 2200
Wire Wire Line
	8000 2200 8000 1500
$Comp
L GND #PWR30
U 1 1 5B8D844E
P 7900 1700
F 0 "#PWR30" H 7900 1450 50  0001 C CNN
F 1 "GND" H 7900 1550 50  0000 C CNN
F 2 "" H 7900 1700 50  0001 C CNN
F 3 "" H 7900 1700 50  0001 C CNN
	1    7900 1700
	1    0    0    -1  
$EndComp
Wire Wire Line
	7900 1500 7900 1700
Connection ~ 8000 2200
Connection ~ 8100 2500
Wire Wire Line
	5200 2200 6900 2200
Wire Wire Line
	5200 2300 6900 2300
Wire Wire Line
	5200 2400 6900 2400
Wire Wire Line
	5200 2500 6900 2500
$Comp
L R R13
U 1 1 5B8DC664
P 6700 2850
F 0 "R13" H 6800 2850 50  0000 C CNN
F 1 "47K" V 6700 2850 50  0000 C CNN
F 2 "Resistors_SMD:R_1206_HandSoldering" V 6630 2850 50  0001 C CNN
F 3 "" H 6700 2850 50  0001 C CNN
	1    6700 2850
	1    0    0    -1  
$EndComp
$Comp
L GND #PWR24
U 1 1 5B8DC717
P 6700 3100
F 0 "#PWR24" H 6700 2850 50  0001 C CNN
F 1 "GND" H 6700 2950 50  0000 C CNN
F 2 "" H 6700 3100 50  0001 C CNN
F 3 "" H 6700 3100 50  0001 C CNN
	1    6700 3100
	1    0    0    -1  
$EndComp
Wire Wire Line
	6700 2700 6700 2400
Connection ~ 6700 2400
Wire Wire Line
	6700 3100 6700 3000
$Comp
L R R12
U 1 1 5B8DC8C5
P 6700 1850
F 0 "R12" H 6800 1850 50  0000 C CNN
F 1 "47K" V 6700 1850 50  0000 C CNN
F 2 "Resistors_SMD:R_1206_HandSoldering" V 6630 1850 50  0001 C CNN
F 3 "" H 6700 1850 50  0001 C CNN
	1    6700 1850
	1    0    0    -1  
$EndComp
$Comp
L R R11
U 1 1 5B8DC94D
P 6500 1850
F 0 "R11" H 6400 1850 50  0000 C CNN
F 1 "47K" V 6500 1850 50  0000 C CNN
F 2 "Resistors_SMD:R_1206_HandSoldering" V 6430 1850 50  0001 C CNN
F 3 "" H 6500 1850 50  0001 C CNN
	1    6500 1850
	1    0    0    -1  
$EndComp
Wire Wire Line
	6700 2300 6700 2000
Connection ~ 6700 2300
Wire Wire Line
	6500 2500 6500 2000
Connection ~ 6500 2500
$Comp
L +3.3V #PWR23
U 1 1 5B8DCB13
P 6600 1500
F 0 "#PWR23" H 6600 1350 50  0001 C CNN
F 1 "+3.3V" H 6600 1640 50  0000 C CNN
F 2 "" H 6600 1500 50  0001 C CNN
F 3 "" H 6600 1500 50  0001 C CNN
	1    6600 1500
	1    0    0    -1  
$EndComp
Wire Wire Line
	6500 1700 6500 1600
Wire Wire Line
	6500 1600 6700 1600
Wire Wire Line
	6600 1600 6600 1500
Wire Wire Line
	6700 1600 6700 1700
Connection ~ 6600 1600
$Comp
L R R5
U 1 1 5B8DD305
P 5900 1850
F 0 "R5" H 5800 1850 50  0000 C CNN
F 1 "560R" V 5900 1850 50  0000 C CNN
F 2 "Resistors_SMD:R_1206_HandSoldering" V 5830 1850 50  0001 C CNN
F 3 "" H 5900 1850 50  0001 C CNN
	1    5900 1850
	1    0    0    -1  
$EndComp
$Comp
L R R9
U 1 1 5B8DD3FA
P 6100 1850
F 0 "R9" H 6200 1850 50  0000 C CNN
F 1 "560R" V 6100 1850 50  0000 C CNN
F 2 "Resistors_SMD:R_1206_HandSoldering" V 6030 1850 50  0001 C CNN
F 3 "" H 6100 1850 50  0001 C CNN
	1    6100 1850
	1    0    0    -1  
$EndComp
$Comp
L +3.3V #PWR18
U 1 1 5B8DD67E
P 6000 1100
F 0 "#PWR18" H 6000 950 50  0001 C CNN
F 1 "+3.3V" H 6000 1240 50  0000 C CNN
F 2 "" H 6000 1100 50  0001 C CNN
F 3 "" H 6000 1100 50  0001 C CNN
	1    6000 1100
	1    0    0    -1  
$EndComp
Wire Wire Line
	5900 1300 5900 1200
Wire Wire Line
	5900 1200 6100 1200
Wire Wire Line
	6000 1200 6000 1100
Wire Wire Line
	6100 1200 6100 1300
Connection ~ 6000 1200
Wire Wire Line
	5900 1600 5900 1700
Wire Wire Line
	6100 1600 6100 1700
Wire Wire Line
	5900 2000 5900 2200
Connection ~ 5900 2200
Wire Wire Line
	6100 2000 6100 2500
Connection ~ 6100 2500
$Comp
L +3.3V #PWR26
U 1 1 5B8DDB3F
P 7300 1400
F 0 "#PWR26" H 7300 1250 50  0001 C CNN
F 1 "+3.3V" H 7300 1540 50  0000 C CNN
F 2 "" H 7300 1400 50  0001 C CNN
F 3 "" H 7300 1400 50  0001 C CNN
	1    7300 1400
	1    0    0    -1  
$EndComp
$Comp
L C_Small C7
U 1 1 5B8DDD08
P 7600 1600
F 0 "C7" V 7550 1650 50  0000 L CNN
F 1 "100n" V 7650 1650 50  0000 L CNN
F 2 "Capacitors_SMD:C_1206_HandSoldering" H 7600 1600 50  0001 C CNN
F 3 "" H 7600 1600 50  0001 C CNN
	1    7600 1600
	0    1    1    0   
$EndComp
Wire Wire Line
	7300 1400 7300 1800
Wire Wire Line
	7500 1600 7300 1600
Connection ~ 7300 1600
Wire Wire Line
	7700 1600 7900 1600
Connection ~ 7900 1600
$Comp
L GND #PWR27
U 1 1 5B8DE192
P 7300 3000
F 0 "#PWR27" H 7300 2750 50  0001 C CNN
F 1 "GND" H 7300 2850 50  0000 C CNN
F 2 "" H 7300 3000 50  0001 C CNN
F 3 "" H 7300 3000 50  0001 C CNN
	1    7300 3000
	1    0    0    -1  
$EndComp
Wire Wire Line
	7300 3000 7300 2900
$Comp
L Resonator_Small Y2
U 1 1 5B8E15A3
P 8000 5300
F 0 "Y2" V 7775 5100 50  0000 L CNN
F 1 "12MHz" V 7775 5225 50  0000 L CNN
F 2 "Crystals:Resonator-3pin_w7.0mm_h2.5mm" H 7975 5300 50  0001 C CNN
F 3 "" H 7975 5300 50  0001 C CNN
	1    8000 5300
	0    1    1    0   
$EndComp
$Comp
L GND #PWR32
U 1 1 5B8E1773
P 8500 5900
F 0 "#PWR32" H 8500 5650 50  0001 C CNN
F 1 "GND" H 8500 5750 50  0000 C CNN
F 2 "" H 8500 5900 50  0001 C CNN
F 3 "" H 8500 5900 50  0001 C CNN
	1    8500 5900
	1    0    0    -1  
$EndComp
$Comp
L GND #PWR29
U 1 1 5B8E17F3
P 7700 5400
F 0 "#PWR29" H 7700 5150 50  0001 C CNN
F 1 "GND" H 7700 5250 50  0000 C CNN
F 2 "" H 7700 5400 50  0001 C CNN
F 3 "" H 7700 5400 50  0001 C CNN
	1    7700 5400
	1    0    0    -1  
$EndComp
NoConn ~ 8200 5000
NoConn ~ 9000 5500
NoConn ~ 9000 5400
NoConn ~ 9000 5300
NoConn ~ 9000 5200
NoConn ~ 9000 5000
Wire Wire Line
	8200 5200 8100 5200
Wire Wire Line
	8200 5400 8100 5400
Wire Wire Line
	7800 5300 7700 5300
Wire Wire Line
	7700 5300 7700 5400
Wire Wire Line
	8500 5800 8500 5900
$Comp
L +3.3V #PWR33
U 1 1 5B8E1DF2
P 9100 3600
F 0 "#PWR33" H 9100 3450 50  0001 C CNN
F 1 "+3.3V" H 9100 3740 50  0000 C CNN
F 2 "" H 9100 3600 50  0001 C CNN
F 3 "" H 9100 3600 50  0001 C CNN
	1    9100 3600
	1    0    0    -1  
$EndComp
Connection ~ 8500 4200
Wire Wire Line
	8200 4700 7300 4700
Wire Wire Line
	8200 4800 7300 4800
$Comp
L GND #PWR25
U 1 1 5B8E2C87
P 7000 5300
F 0 "#PWR25" H 7000 5050 50  0001 C CNN
F 1 "GND" H 7000 5150 50  0000 C CNN
F 2 "" H 7000 5300 50  0001 C CNN
F 3 "" H 7000 5300 50  0001 C CNN
	1    7000 5300
	1    0    0    -1  
$EndComp
Wire Wire Line
	7000 5100 7000 5300
NoConn ~ 7300 4900
$Comp
L C_Small C8
U 1 1 5B8E3077
P 8200 4200
F 0 "C8" V 8150 4250 50  0000 L CNN
F 1 "100n" V 8250 4250 50  0000 L CNN
F 2 "Capacitors_SMD:C_1206_HandSoldering" H 8200 4200 50  0001 C CNN
F 3 "" H 8200 4200 50  0001 C CNN
	1    8200 4200
	0    1    1    0   
$EndComp
$Comp
L GND #PWR31
U 1 1 5B8E3267
P 8000 4300
F 0 "#PWR31" H 8000 4050 50  0001 C CNN
F 1 "GND" H 8000 4150 50  0000 C CNN
F 2 "" H 8000 4300 50  0001 C CNN
F 3 "" H 8000 4300 50  0001 C CNN
	1    8000 4300
	1    0    0    -1  
$EndComp
Wire Wire Line
	9000 4700 9600 4700
Wire Wire Line
	9000 4800 9800 4800
Text Label 9100 4700 0    60   ~ 0
USB1-TxD
Text Label 9100 4800 0    60   ~ 0
USB1-RxD
Text Label 2650 3000 0    60   ~ 0
UC1-XTAL1
Text Label 2700 2000 0    60   ~ 0
UC1-RST
Text Label 2500 4100 0    60   ~ 0
~UC1-SS~
Text Label 2500 4200 0    60   ~ 0
UC1-SCK
Text Label 2500 4300 0    60   ~ 0
UC1-MOSI
Text Label 2500 4400 0    60   ~ 0
UC1-MISO
Wire Wire Line
	6000 6500 6600 6500
Wire Wire Line
	5100 6600 4500 6600
Wire Wire Line
	5100 6500 4500 6500
Wire Wire Line
	5100 6400 4500 6400
Text Label 4600 6400 0    60   ~ 0
UC1-MISO
Text Label 4600 6500 0    60   ~ 0
UC1-SCK
Text Label 4600 6600 0    60   ~ 0
UC1-RST
Text Label 6100 6500 0    60   ~ 0
UC1-MOSI
$Comp
L GND #PWR22
U 1 1 5B8E5FA1
P 6100 6800
F 0 "#PWR22" H 6100 6550 50  0001 C CNN
F 1 "GND" H 6100 6650 50  0000 C CNN
F 2 "" H 6100 6800 50  0001 C CNN
F 3 "" H 6100 6800 50  0001 C CNN
	1    6100 6800
	1    0    0    -1  
$EndComp
Wire Wire Line
	6000 6600 6100 6600
Wire Wire Line
	6100 6600 6100 6800
$Comp
L +3.3V #PWR21
U 1 1 5B8E616A
P 6100 6200
F 0 "#PWR21" H 6100 6050 50  0001 C CNN
F 1 "+3.3V" H 6100 6340 50  0000 C CNN
F 2 "" H 6100 6200 50  0001 C CNN
F 3 "" H 6100 6200 50  0001 C CNN
	1    6100 6200
	1    0    0    -1  
$EndComp
Wire Wire Line
	6000 6400 6100 6400
Wire Wire Line
	6100 6400 6100 6200
Wire Wire Line
	6900 5100 6900 5200
Wire Wire Line
	6900 5200 7000 5200
Connection ~ 7000 5200
$Comp
L D_Schottky D1
U 1 1 5B8E7224
P 2900 1150
F 0 "D1" H 2900 1250 50  0000 C CNN
F 1 "D_Schottky" H 2900 1050 50  0001 C CNN
F 2 "Diodes_SMD:D_0805" H 2900 1150 50  0001 C CNN
F 3 "" H 2900 1150 50  0001 C CNN
	1    2900 1150
	0    1    1    0   
$EndComp
Wire Wire Line
	2900 1000 2900 900 
Wire Wire Line
	2900 900  2600 900 
Connection ~ 2600 900 
Wire Wire Line
	2900 1300 2900 1400
Wire Wire Line
	2900 1400 2600 1400
Connection ~ 2600 1400
Wire Wire Line
	2500 2000 3200 2000
$Comp
L SOLDERBRDIGE-3 J5
U 1 1 5B8D53E9
P 1900 1500
F 0 "J5" H 1950 1700 50  0000 C CNN
F 1 "SOLDERBRDIGE-3" H 1950 1301 50  0001 C CNN
F 2 "Project:SOLDER-JUMPER_2-WAY" H 1900 1500 50  0001 C CNN
F 3 "" H 1900 1500 60  0001 C CNN
	1    1900 1500
	1    0    0    -1  
$EndComp
Wire Wire Line
	1700 1400 1200 1400
Wire Wire Line
	1700 1600 1200 1600
Text Label 1200 1600 0    60   ~ 0
~USB1-DTR~
Wire Wire Line
	9000 5100 9600 5100
Text Label 9100 5100 0    60   ~ 0
~USB1-DTR~
Connection ~ 1800 4800
Wire Wire Line
	1800 4800 1800 5800
Wire Wire Line
	1800 5800 1400 5800
$Comp
L Conn_02x03_Odd_Even J6
U 1 1 5B8D76F0
P 2300 5900
F 0 "J6" H 2350 5700 50  0000 C CNN
F 1 "Conn_02x03_Odd_Even" H 2350 5700 50  0001 C CNN
F 2 "Pin_Headers:Pin_Header_Straight_2x03_Pitch2.54mm" H 2300 5900 50  0001 C CNN
F 3 "" H 2300 5900 50  0001 C CNN
	1    2300 5900
	-1   0    0    1   
$EndComp
Wire Wire Line
	2000 6000 1400 6000
Wire Wire Line
	2000 5900 1400 5900
Text Label 1500 6000 0    60   ~ 0
USB1-TxD
$Comp
L SOLDERBRDIGE-2 J15
U 1 1 5B8D8ADC
P 10000 4800
F 0 "J15" H 10100 4950 50  0000 C CNN
F 1 "SOLDERBRDIGE-2" H 10100 4651 50  0001 C CNN
F 2 "Project:SOLDER-JUMPER_1-WAY" H 10000 4800 50  0001 C CNN
F 3 "" H 10000 4800 60  0001 C CNN
	1    10000 4800
	0    -1   -1   0   
$EndComp
Wire Wire Line
	10200 4800 10700 4800
Wire Wire Line
	1500 4800 3200 4800
Wire Wire Line
	3200 4900 2600 4900
Wire Wire Line
	2600 4900 2600 6000
Wire Wire Line
	2600 6000 2500 6000
Wire Wire Line
	2600 5900 2500 5900
Connection ~ 2600 5900
Wire Wire Line
	2600 5800 2500 5800
Connection ~ 2600 5800
$Comp
L R R3
U 1 1 5B8D9815
P 2800 5450
F 0 "R3" H 2900 5450 50  0000 C CNN
F 1 "47K" V 2800 5450 50  0000 C CNN
F 2 "Resistors_SMD:R_1206_HandSoldering" V 2730 5450 50  0001 C CNN
F 3 "" H 2800 5450 50  0001 C CNN
	1    2800 5450
	1    0    0    -1  
$EndComp
$Comp
L +3.3V #PWR12
U 1 1 5B8D98CD
P 2800 5200
F 0 "#PWR12" H 2800 5050 50  0001 C CNN
F 1 "+3.3V" H 2800 5340 50  0000 C CNN
F 2 "" H 2800 5200 50  0001 C CNN
F 3 "" H 2800 5200 50  0001 C CNN
	1    2800 5200
	1    0    0    -1  
$EndComp
Wire Wire Line
	2800 5300 2800 5200
Wire Wire Line
	2800 5600 2800 5700
Wire Wire Line
	2800 5700 2600 5700
Connection ~ 2600 5700
$Comp
L GND #PWR6
U 1 1 5B8D9B8B
P 1600 5100
F 0 "#PWR6" H 1600 4850 50  0001 C CNN
F 1 "GND" H 1600 4950 50  0000 C CNN
F 2 "" H 1600 5100 50  0001 C CNN
F 3 "" H 1600 5100 50  0001 C CNN
	1    1600 5100
	1    0    0    -1  
$EndComp
Wire Wire Line
	1500 5000 1600 5000
Wire Wire Line
	1600 5000 1600 5100
$Comp
L LED D7
U 1 1 5B8DA238
P 5800 5250
F 0 "D7" V 5800 5350 50  0000 C CNN
F 1 "LED" H 5800 5150 50  0001 C CNN
F 2 "LEDs:LED_0805_HandSoldering" H 5800 5250 50  0001 C CNN
F 3 "" H 5800 5250 50  0001 C CNN
	1    5800 5250
	0    -1   -1   0   
$EndComp
$Comp
L LED D6
U 1 1 5B8DA42F
P 6000 5250
F 0 "D6" V 6100 5200 50  0000 C CNN
F 1 "LED" H 6000 5150 50  0001 C CNN
F 2 "LEDs:LED_0805_HandSoldering" H 6000 5250 50  0001 C CNN
F 3 "" H 6000 5250 50  0001 C CNN
	1    6000 5250
	0    -1   -1   0   
$EndComp
$Comp
L LED D5
U 1 1 5B8DA4C9
P 6200 5250
F 0 "D5" V 6200 5150 50  0000 C CNN
F 1 "LED" H 6200 5150 50  0001 C CNN
F 2 "LEDs:LED_0805_HandSoldering" H 6200 5250 50  0001 C CNN
F 3 "" H 6200 5250 50  0001 C CNN
	1    6200 5250
	0    -1   -1   0   
$EndComp
$Comp
L R R4
U 1 1 5B8DA7A5
P 5800 4850
F 0 "R4" H 5700 4850 50  0000 C CNN
F 1 "560R" V 5800 4850 50  0000 C CNN
F 2 "Resistors_SMD:R_1206_HandSoldering" V 5730 4850 50  0001 C CNN
F 3 "" H 5800 4850 50  0001 C CNN
	1    5800 4850
	1    0    0    -1  
$EndComp
$Comp
L R R8
U 1 1 5B8DA92F
P 6000 4850
F 0 "R8" H 6050 5000 50  0000 C CNN
F 1 "560R" V 6000 4850 50  0000 C CNN
F 2 "Resistors_SMD:R_1206_HandSoldering" V 5930 4850 50  0001 C CNN
F 3 "" H 6000 4850 50  0001 C CNN
	1    6000 4850
	1    0    0    -1  
$EndComp
$Comp
L R R10
U 1 1 5B8DA9D2
P 6200 4850
F 0 "R10" H 6300 4850 50  0000 C CNN
F 1 "560R" V 6200 4850 50  0000 C CNN
F 2 "Resistors_SMD:R_1206_HandSoldering" V 6130 4850 50  0001 C CNN
F 3 "" H 6200 4850 50  0001 C CNN
	1    6200 4850
	1    0    0    -1  
$EndComp
$Comp
L GND #PWR17
U 1 1 5B8DAA78
P 5800 5600
F 0 "#PWR17" H 5800 5350 50  0001 C CNN
F 1 "GND" H 5800 5450 50  0000 C CNN
F 2 "" H 5800 5600 50  0001 C CNN
F 3 "" H 5800 5600 50  0001 C CNN
	1    5800 5600
	1    0    0    -1  
$EndComp
Wire Wire Line
	5800 5400 5800 5600
Wire Wire Line
	5800 5500 6200 5500
Wire Wire Line
	6000 5500 6000 5400
Connection ~ 5800 5500
Wire Wire Line
	6200 5500 6200 5400
Connection ~ 6000 5500
Wire Wire Line
	5800 5100 5800 5000
Wire Wire Line
	6000 5100 6000 5000
Wire Wire Line
	6200 5100 6200 5000
Wire Wire Line
	5800 4700 5800 4600
Wire Wire Line
	5800 4600 5200 4600
Wire Wire Line
	6000 4700 6000 4500
Wire Wire Line
	6000 4500 5200 4500
Wire Wire Line
	6200 4700 6200 4400
Wire Wire Line
	6200 4400 5200 4400
Text Label 9900 1800 0    60   ~ 0
Modbus1-A
Text Label 9900 2800 0    60   ~ 0
Modbus1-B
$Comp
L R R6
U 1 1 5B8DC363
P 6000 3150
F 0 "R6" H 6100 3150 50  0000 C CNN
F 1 "10K" V 6000 3150 50  0000 C CNN
F 2 "Resistors_SMD:R_1206_HandSoldering" V 5930 3150 50  0001 C CNN
F 3 "" H 6000 3150 50  0001 C CNN
	1    6000 3150
	1    0    0    -1  
$EndComp
$Comp
L R R7
U 1 1 5B8DC4E9
P 6000 3650
F 0 "R7" H 6100 3650 50  0000 C CNN
F 1 "100R" V 6000 3650 50  0000 C CNN
F 2 "Resistors_SMD:R_1206_HandSoldering" V 5930 3650 50  0001 C CNN
F 3 "" H 6000 3650 50  0001 C CNN
	1    6000 3650
	1    0    0    -1  
$EndComp
$Comp
L GND #PWR20
U 1 1 5B8DC59B
P 6000 3900
F 0 "#PWR20" H 6000 3650 50  0001 C CNN
F 1 "GND" H 6000 3750 50  0000 C CNN
F 2 "" H 6000 3900 50  0001 C CNN
F 3 "" H 6000 3900 50  0001 C CNN
	1    6000 3900
	1    0    0    -1  
$EndComp
$Comp
L +3.3V #PWR19
U 1 1 5B8DC676
P 6000 2900
F 0 "#PWR19" H 6000 2750 50  0001 C CNN
F 1 "+3.3V" H 6000 3040 50  0000 C CNN
F 2 "" H 6000 2900 50  0001 C CNN
F 3 "" H 6000 2900 50  0001 C CNN
	1    6000 2900
	1    0    0    -1  
$EndComp
Wire Wire Line
	6000 3000 6000 2900
Wire Wire Line
	6000 3900 6000 3800
Wire Wire Line
	6000 3300 6000 3500
Connection ~ 6000 3400
Wire Wire Line
	5200 3400 6000 3400
Wire Wire Line
	5200 2700 5700 2700
Wire Wire Line
	5200 2800 5700 2800
Wire Wire Line
	5200 2900 5700 2900
Text Label 5300 3400 0    60   ~ 0
HW-VERSION
Text Label 5300 2700 0    60   ~ 0
UC1-PA0
Text Label 5300 2800 0    60   ~ 0
UC1-PA1
Text Label 5300 2900 0    60   ~ 0
UC1-PA2
Wire Wire Line
	1500 6600 900  6600
Wire Wire Line
	1500 6700 900  6700
Wire Wire Line
	1500 6800 900  6800
Wire Wire Line
	1500 6900 900  6900
Text Label 900  6600 0    60   ~ 0
GND
Text Label 900  6700 0    60   ~ 0
UC1-PA0
Text Label 900  6800 0    60   ~ 0
UC1-PA1
Text Label 900  6900 0    60   ~ 0
UC1-PA2
Wire Wire Line
	3800 6600 3300 6600
Wire Wire Line
	3800 6700 3300 6700
Wire Wire Line
	3800 6800 3300 6800
Wire Wire Line
	2700 6700 2100 6700
Wire Wire Line
	2700 6800 2100 6800
Wire Wire Line
	2700 6900 2100 6900
Wire Wire Line
	2700 7000 2100 7000
Text Label 3300 6600 0    60   ~ 0
GND
Text Label 3300 6700 0    60   ~ 0
UC1-RxD0
Wire Wire Line
	2000 5800 1900 5800
Wire Wire Line
	1500 4900 1900 4900
Wire Wire Line
	1900 4900 1900 5800
Text Label 2600 4800 0    60   ~ 0
UC1-TxD0
Text Label 2600 4900 0    60   ~ 0
UC1-RxD0
Text Label 3300 6800 0    60   ~ 0
UC1-TxD0
Text Label 10200 4800 0    60   ~ 0
UC1-TxD0
Text Label 5300 2200 0    60   ~ 0
UC1-RxD1
Text Label 5300 2400 0    60   ~ 0
MODBUS1-DE
Text Label 2100 6700 0    60   ~ 0
UC1-RxD1
Text Label 2100 6800 0    60   ~ 0
UC1-TxD1
Text Label 2100 6900 0    60   ~ 0
MODBUS1-DE
Text Label 2100 7000 0    60   ~ 0
~MODBUS1-RE~
$Comp
L PRJ-UC1-ATMEGA324P-20AU U1
U 1 1 5B8EAD03
P 4200 3700
F 0 "U1" H 3400 5600 50  0000 L BNN
F 1 "PRJ-UC1-ATMEGA324P-20AU" H 4500 1800 50  0000 L BNN
F 2 "Project:TQFP-44_10x10mm_Pitch0.8mm_Handsolded" H 4200 3750 50  0001 C CIN
F 3 "" H 4200 3750 50  0001 C CNN
	1    4200 3700
	1    0    0    -1  
$EndComp
Text Label 5300 2500 0    60   ~ 0
UC1-TxD1
Text Label 5300 2300 0    60   ~ 0
~MODBUS1-RE~
$Comp
L PRJ_USB_MINI J9
U 1 1 5B8EA04F
P 7000 4700
F 0 "J9" H 6800 5150 50  0000 L CNN
F 1 "PRJ_USB_MINI" H 6800 5050 50  0000 L CNN
F 2 "Project:USB_Mini-B-THT" H 7150 4650 50  0001 C CNN
F 3 "" H 7150 4650 50  0001 C CNN
	1    7000 4700
	1    0    0    -1  
$EndComp
Text HLabel 8000 3900 2    60   Output ~ 0
USB-5V
Wire Wire Line
	7300 4500 7400 4500
Wire Wire Line
	7400 4500 7400 3900
Wire Wire Line
	7400 3900 7600 3900
Wire Wire Line
	7900 3900 8000 3900
$Comp
L SOLDERBRDIGE-3 J11
U 1 1 5B8F77A4
P 8800 3900
F 0 "J11" H 8850 4100 50  0000 C CNN
F 1 "SOLDERBRDIGE-3" H 8850 3701 50  0001 C CNN
F 2 "Project:SOLDER-JUMPER_2-WAY" H 8800 3900 50  0001 C CNN
F 3 "" H 8800 3900 60  0001 C CNN
	1    8800 3900
	-1   0    0    1   
$EndComp
Wire Wire Line
	8100 4200 8000 4200
Wire Wire Line
	8000 4200 8000 4300
Wire Wire Line
	8500 4200 8300 4200
Wire Wire Line
	8700 4300 8700 4200
Wire Wire Line
	8700 4200 9200 4200
Wire Wire Line
	9100 4200 9100 4000
Wire Wire Line
	9100 4000 9000 4000
Wire Wire Line
	9100 3600 9100 3800
Wire Wire Line
	9100 3800 9000 3800
Wire Wire Line
	8600 3900 8500 3900
Wire Wire Line
	8500 3700 8500 4300
$Comp
L PWR_FLAG #FLG4
U 1 1 5B8FFB6B
P 8500 3700
F 0 "#FLG4" H 8500 3775 50  0001 C CNN
F 1 "PWR_FLAG" H 8500 3850 50  0000 C CNN
F 2 "" H 8500 3700 50  0001 C CNN
F 3 "" H 8500 3700 50  0001 C CNN
	1    8500 3700
	1    0    0    -1  
$EndComp
Connection ~ 8500 3900
Text Label 7500 4700 0    60   ~ 0
USB1-DP
Text Label 7500 4800 0    60   ~ 0
USB1-DM
Text Label 7400 4350 1    60   ~ 0
USB1-5V
Text Label 9100 4050 0    60   ~ 0
USB1_V3
$Comp
L Conn_01x05 J7
U 1 1 5B9BBCF0
P 2900 6800
F 0 "J7" H 2900 7100 50  0000 C CNN
F 1 "Conn_01x05" H 2900 6500 50  0001 C CNN
F 2 "Pin_Headers:Pin_Header_Straight_1x05_Pitch2.54mm" H 2900 6800 50  0001 C CNN
F 3 "" H 2900 6800 50  0001 C CNN
	1    2900 6800
	1    0    0    -1  
$EndComp
Wire Wire Line
	2700 6600 2100 6600
Text Label 2100 6600 0    60   ~ 0
GND
$Comp
L Conn_01x04 J4
U 1 1 5B9D086C
P 1700 6700
F 0 "J4" H 1700 6900 50  0000 C CNN
F 1 "Conn_01x04" H 1700 6400 50  0001 C CNN
F 2 "Pin_Headers:Pin_Header_Straight_1x04_Pitch2.54mm" H 1700 6700 50  0001 C CNN
F 3 "" H 1700 6700 50  0001 C CNN
	1    1700 6700
	1    0    0    -1  
$EndComp
Connection ~ 2600 3000
$Comp
L Conn_01x02 J38
U 1 1 5B9D7611
P 1300 3350
F 0 "J38" H 1300 3150 50  0000 C CNN
F 1 "Conn_01x02" H 1300 3150 50  0001 C CNN
F 2 "Pin_Headers:Pin_Header_Straight_1x02_Pitch2.54mm" H 1300 3350 50  0001 C CNN
F 3 "" H 1300 3350 50  0001 C CNN
	1    1300 3350
	-1   0    0    1   
$EndComp
$Comp
L GND #PWR7
U 1 1 5B9D7B32
P 1650 3450
F 0 "#PWR7" H 1650 3200 50  0001 C CNN
F 1 "GND" H 1650 3300 50  0000 C CNN
F 2 "" H 1650 3450 50  0001 C CNN
F 3 "" H 1650 3450 50  0001 C CNN
	1    1650 3450
	1    0    0    -1  
$EndComp
Wire Wire Line
	1500 3350 1650 3350
Wire Wire Line
	1650 3350 1650 3450
Wire Wire Line
	1500 3250 2600 3250
Wire Wire Line
	2600 3250 2600 3000
$Comp
L Conn_01x04 J3
U 1 1 5B9DA87C
P 4000 6700
F 0 "J3" H 4000 6900 50  0000 C CNN
F 1 "Conn_01x04" H 4000 6400 50  0001 C CNN
F 2 "Pin_Headers:Pin_Header_Straight_1x04_Pitch2.54mm" H 4000 6700 50  0001 C CNN
F 3 "" H 4000 6700 50  0001 C CNN
	1    4000 6700
	1    0    0    -1  
$EndComp
Wire Wire Line
	3800 6900 3300 6900
Text Label 3300 6900 0    60   ~ 0
~UC1-SS~
$Comp
L C_Small C20
U 1 1 5B9F2FB1
P 9300 4200
F 0 "C20" V 9350 4050 50  0000 L CNN
F 1 "100n" V 9250 3950 50  0000 L CNN
F 2 "Capacitors_SMD:C_1206_HandSoldering" H 9300 4200 50  0001 C CNN
F 3 "" H 9300 4200 50  0001 C CNN
	1    9300 4200
	0    -1   -1   0   
$EndComp
$Comp
L GND #PWR36
U 1 1 5B9F33CF
P 9600 4250
F 0 "#PWR36" H 9600 4000 50  0001 C CNN
F 1 "GND" H 9600 4100 50  0000 C CNN
F 2 "" H 9600 4250 50  0001 C CNN
F 3 "" H 9600 4250 50  0001 C CNN
	1    9600 4250
	1    0    0    -1  
$EndComp
Connection ~ 9100 4200
Wire Wire Line
	9400 4200 9600 4200
Wire Wire Line
	9600 4200 9600 4250
$Comp
L C_Small C19
U 1 1 5B9F3787
P 7550 4100
F 0 "C19" H 7450 4200 50  0000 L CNN
F 1 "100n" H 7600 4000 50  0000 L CNN
F 2 "Capacitors_SMD:C_1206_HandSoldering" H 7550 4100 50  0001 C CNN
F 3 "" H 7550 4100 50  0001 C CNN
	1    7550 4100
	1    0    0    -1  
$EndComp
$Comp
L GND #PWR28
U 1 1 5B9F3B03
P 7550 4300
F 0 "#PWR28" H 7550 4050 50  0001 C CNN
F 1 "GND" H 7550 4150 50  0000 C CNN
F 2 "" H 7550 4300 50  0001 C CNN
F 3 "" H 7550 4300 50  0001 C CNN
	1    7550 4300
	1    0    0    -1  
$EndComp
Wire Wire Line
	7550 4300 7550 4200
Wire Wire Line
	7550 4000 7550 3900
Connection ~ 7550 3900
$EndSCHEMATC
