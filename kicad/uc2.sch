EESchema Schematic File Version 4
LIBS:rpi-atmega324-modbus-x3-gateway-cache
EELAYER 26 0
EELAYER END
$Descr A4 11693 8268
encoding utf-8
Sheet 3 3
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
L rpi-atmega324-modbus-x3-gateway-rescue:+3.3V #PWR042
U 1 1 5B8EEC2D
P 3700 700
F 0 "#PWR042" H 3700 550 50  0001 C CNN
F 1 "+3.3V" H 3700 840 50  0000 C CNN
F 2 "" H 3700 700 50  0001 C CNN
F 3 "" H 3700 700 50  0001 C CNN
	1    3700 700 
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:GND #PWR043
U 1 1 5B8EEC33
P 3700 5700
F 0 "#PWR043" H 3700 5450 50  0001 C CNN
F 1 "GND" H 3700 5550 50  0000 C CNN
F 2 "" H 3700 5700 50  0001 C CNN
F 3 "" H 3700 5700 50  0001 C CNN
	1    3700 5700
	1    0    0    -1  
$EndComp
NoConn ~ 5000 3500
NoConn ~ 5000 3400
NoConn ~ 5000 3300
NoConn ~ 5000 3000
NoConn ~ 5000 3900
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:C_Small C12
U 1 1 5B8EEC43
P 3900 1000
F 0 "C12" H 3910 1070 50  0000 L CNN
F 1 "100n" H 3910 920 50  0000 L CNN
F 2 "Capacitors_SMD:C_1206_HandSoldering" H 3900 1000 50  0001 C CNN
F 3 "" H 3900 1000 50  0001 C CNN
	1    3900 1000
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:C_Small C13
U 1 1 5B8EEC4A
P 4200 1000
F 0 "C13" H 4210 1070 50  0000 L CNN
F 1 "100n" H 4210 920 50  0000 L CNN
F 2 "Capacitors_SMD:C_1206_HandSoldering" H 4200 1000 50  0001 C CNN
F 3 "" H 4200 1000 50  0001 C CNN
	1    4200 1000
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:C_Small C14
U 1 1 5B8EEC51
P 4500 1000
F 0 "C14" H 4510 1070 50  0000 L CNN
F 1 "100n" H 4510 920 50  0000 L CNN
F 2 "Capacitors_SMD:C_1206_HandSoldering" H 4500 1000 50  0001 C CNN
F 3 "" H 4500 1000 50  0001 C CNN
	1    4500 1000
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:C_Small C15
U 1 1 5B8EEC58
P 4800 1000
F 0 "C15" H 4810 1070 50  0000 L CNN
F 1 "100n" H 4810 920 50  0000 L CNN
F 2 "Capacitors_SMD:C_1206_HandSoldering" H 4800 1000 50  0001 C CNN
F 3 "" H 4800 1000 50  0001 C CNN
	1    4800 1000
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:GND #PWR044
U 1 1 5B8EEC5F
P 4800 1300
F 0 "#PWR044" H 4800 1050 50  0001 C CNN
F 1 "GND" H 4800 1150 50  0000 C CNN
F 2 "" H 4800 1300 50  0001 C CNN
F 3 "" H 4800 1300 50  0001 C CNN
	1    4800 1300
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:C_Small C10
U 1 1 5B8EEC65
P 2800 3250
F 0 "C10" H 2810 3320 50  0000 L CNN
F 1 "100n" H 2810 3170 50  0000 L CNN
F 2 "Capacitors_SMD:C_1206_HandSoldering" H 2800 3250 50  0001 C CNN
F 3 "" H 2800 3250 50  0001 C CNN
	1    2800 3250
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:GND #PWR045
U 1 1 5B8EEC6C
P 2800 3400
F 0 "#PWR045" H 2800 3150 50  0001 C CNN
F 1 "GND" H 2800 3250 50  0000 C CNN
F 2 "" H 2800 3400 50  0001 C CNN
F 3 "" H 2800 3400 50  0001 C CNN
	1    2800 3400
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:Resonator_Small Y4
U 1 1 5B8EEC72
P 2200 2600
F 0 "Y4" V 1975 2400 50  0000 L CNN
F 1 "12MHz" V 1975 2525 50  0000 L CNN
F 2 "Crystals:Resonator-3pin_w7.0mm_h2.5mm" H 2175 2600 50  0001 C CNN
F 3 "" H 2175 2600 50  0001 C CNN
	1    2200 2600
	0    1    1    0   
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:GND #PWR046
U 1 1 5B8EEC82
P 1900 2700
F 0 "#PWR046" H 1900 2450 50  0001 C CNN
F 1 "GND" H 1900 2550 50  0000 C CNN
F 2 "" H 1900 2700 50  0001 C CNN
F 3 "" H 1900 2700 50  0001 C CNN
	1    1900 2700
	1    0    0    -1  
$EndComp
NoConn ~ 5000 4000
NoConn ~ 5000 4700
NoConn ~ 5000 4800
Text HLabel 1000 3800 0    60   Input ~ 0
~CS~
Text HLabel 1000 3900 0    60   Input ~ 0
SCK
Text HLabel 1000 4000 0    60   Input ~ 0
MOSI
Text HLabel 1000 4100 0    60   Output ~ 0
MISO
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:SW_Push SW2
U 1 1 5B8EECA8
P 2000 1800
F 0 "SW2" H 2050 1900 50  0000 L CNN
F 1 "SW_Push" H 2000 1740 50  0000 C CNN
F 2 "Buttons_Switches_SMD:SW_SPST_FSMSM" H 2000 2000 50  0001 C CNN
F 3 "" H 2000 2000 50  0001 C CNN
	1    2000 1800
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:C_Small C9
U 1 1 5B8EECCD
P 2000 1400
F 0 "C9" V 2050 1250 50  0000 L CNN
F 1 "100n" V 1950 1150 50  0000 L CNN
F 2 "Capacitors_SMD:C_1206_HandSoldering" H 2000 1400 50  0001 C CNN
F 3 "" H 2000 1400 50  0001 C CNN
	1    2000 1400
	0    -1   -1   0   
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:R R19
U 1 1 5B8EECD4
P 2300 1050
F 0 "R19" H 2400 1050 50  0000 C CNN
F 1 "47K" V 2300 1050 50  0000 C CNN
F 2 "Resistors_SMD:R_1206_HandSoldering" V 2230 1050 50  0001 C CNN
F 3 "" H 2300 1050 50  0001 C CNN
	1    2300 1050
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:+3.3V #PWR047
U 1 1 5B8EECDB
P 2300 700
F 0 "#PWR047" H 2300 550 50  0001 C CNN
F 1 "+3.3V" H 2300 840 50  0000 C CNN
F 2 "" H 2300 700 50  0001 C CNN
F 3 "" H 2300 700 50  0001 C CNN
	1    2300 700 
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:GND #PWR048
U 1 1 5B8EECE1
P 1600 1900
F 0 "#PWR048" H 1600 1650 50  0001 C CNN
F 1 "GND" H 1600 1750 50  0000 C CNN
F 2 "" H 1600 1900 50  0001 C CNN
F 3 "" H 1600 1900 50  0001 C CNN
	1    1600 1900
	1    0    0    -1  
$EndComp
Text HLabel 1000 1300 0    60   Input ~ 0
~RESET~
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:CH340G U5
U 1 1 5B8EECF7
P 2000 6300
F 0 "U5" H 2100 6600 50  0000 L CNN
F 1 "CH340G" H 2500 5300 50  0000 L CNN
F 2 "Project:SOIC-16_3.9x9.9mm_Pitch1.27mm_HANDSOLDERED" H 2550 5950 50  0001 C CNN
F 3 "" H 2550 5950 50  0001 C CNN
	1    2000 6300
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:Atmega-ISP-6 J25
U 1 1 5B8EECFE
P 7700 5800
F 0 "J25" H 7900 5950 50  0000 L BNN
F 1 "Atmega-ISP-6" H 7900 5350 50  0000 L BNN
F 2 "Pin_Headers:Pin_Header_Straight_2x03_Pitch2.54mm" H 8150 5500 50  0001 C CIN
F 3 "" H 7250 5450 50  0001 C CNN
	1    7700 5800
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:LED D14
U 1 1 5B8EED05
P 5900 1150
F 0 "D14" V 5900 1250 50  0000 C CNN
F 1 "LED" H 5900 1050 50  0001 C CNN
F 2 "LEDs:LED_0805_HandSoldering" H 5900 1150 50  0001 C CNN
F 3 "" H 5900 1150 50  0001 C CNN
	1    5900 1150
	0    -1   -1   0   
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:LED D15
U 1 1 5B8EED0C
P 6100 1150
F 0 "D15" V 6100 1050 50  0000 C CNN
F 1 "LED" H 6100 1050 50  0001 C CNN
F 2 "LEDs:LED_0805_HandSoldering" H 6100 1150 50  0001 C CNN
F 3 "" H 6100 1150 50  0001 C CNN
	1    6100 1150
	0    -1   -1   0   
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:SN65HVD11 U6
U 1 1 5B8EED13
P 7400 2000
F 0 "U6" H 7160 2450 50  0000 C CNN
F 1 "SN65HVD11" H 7450 1450 50  0000 L CNN
F 2 "Project:SOIC-8_3.9x4.9mm_Pitch1.27mm_Handsolded" H 7400 1300 50  0001 C CNN
F 3 "" H 7400 2050 50  0001 C CNN
	1    7400 2000
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:UART-Harwin3 J23
U 1 1 5B8EED1A
P 5300 6900
F 0 "J23" H 4750 7250 50  0000 L BNN
F 1 "UART-Harwin3" H 4600 6600 50  0000 L BNN
F 2 "Connectors_Harwin:Harwin_LTek-Male_03x2.00mm_Straight_StrainRelief" H 4950 6800 50  0001 C CIN
F 3 "" H 4850 6550 50  0001 C CNN
	1    5300 6900
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:D_Schottky D9
U 1 1 5B8EED21
P 1250 5450
F 0 "D9" V 1200 5350 50  0000 C CNN
F 1 "D_Schottky" H 1250 5350 50  0001 C CNN
F 2 "Diodes_SMD:D_2114" H 1250 5450 50  0001 C CNN
F 3 "" H 1250 5450 50  0001 C CNN
	1    1250 5450
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:Screw_Terminal_01x02 J35
U 1 1 5B8EED28
P 10800 2000
F 0 "J35" H 10800 2100 50  0000 C CNN
F 1 "Screw_Terminal_01x02" H 10800 1800 50  0001 C CNN
F 2 "Project:Terminalblock-2x-5mm" H 10800 2000 50  0001 C CNN
F 3 "" H 10800 2000 50  0001 C CNN
	1    10800 2000
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:D_TVS_x2_AAC-RESCUE-rpi-atmega324-modbus-x3-gateway D16
U 1 1 5B8EED2F
P 9800 2000
F 0 "D16" V 9800 2150 50  0000 C CNN
F 1 "D_TVS_x2_AAC" H 9800 2100 50  0001 C CNN
F 2 "TO_SOT_Packages_SMD:SOT-23_Handsoldering" H 9650 2000 50  0001 C CNN
F 3 "" H 9650 2000 50  0001 C CNN
	1    9800 2000
	0    -1   -1   0   
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:Conn_01x02 J30
U 1 1 5B8EED36
P 9800 1200
F 0 "J30" H 9800 1300 50  0000 C CNN
F 1 "Conn_01x02" H 9800 1000 50  0001 C CNN
F 2 "Pin_Headers:Pin_Header_Straight_1x02_Pitch2.54mm" H 9800 1200 50  0001 C CNN
F 3 "" H 9800 1200 50  0001 C CNN
	1    9800 1200
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:Conn_01x02 J31
U 1 1 5B8EED3D
P 9800 2700
F 0 "J31" H 9800 2800 50  0000 C CNN
F 1 "Conn_01x02" H 9800 2500 50  0001 C CNN
F 2 "Pin_Headers:Pin_Header_Straight_1x02_Pitch2.54mm" H 9800 2700 50  0001 C CNN
F 3 "" H 9800 2700 50  0001 C CNN
	1    9800 2700
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:Conn_01x02 J28
U 1 1 5B8EED44
P 9300 1800
F 0 "J28" H 9300 1900 50  0000 C CNN
F 1 "Conn_01x02" H 9300 1600 50  0001 C CNN
F 2 "Pin_Headers:Pin_Header_Straight_1x02_Pitch2.54mm" H 9300 1800 50  0001 C CNN
F 3 "" H 9300 1800 50  0001 C CNN
	1    9300 1800
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:R R38
U 1 1 5B8EED4B
P 9350 1200
F 0 "R38" V 9250 1200 50  0000 C CNN
F 1 "330R" V 9350 1200 50  0000 C CNN
F 2 "Resistors_SMD:R_1206_HandSoldering" V 9280 1200 50  0001 C CNN
F 3 "" H 9350 1200 50  0001 C CNN
	1    9350 1200
	0    1    1    0   
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:+3.3V #PWR049
U 1 1 5B8EED52
P 9100 1100
F 0 "#PWR049" H 9100 950 50  0001 C CNN
F 1 "+3.3V" H 9100 1240 50  0000 C CNN
F 2 "" H 9100 1100 50  0001 C CNN
F 3 "" H 9100 1100 50  0001 C CNN
	1    9100 1100
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:GND #PWR050
U 1 1 5B8EED60
P 10100 2100
F 0 "#PWR050" H 10100 1850 50  0001 C CNN
F 1 "GND" H 10100 1950 50  0000 C CNN
F 2 "" H 10100 2100 50  0001 C CNN
F 3 "" H 10100 2100 50  0001 C CNN
	1    10100 2100
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:R R39
U 1 1 5B8EED66
P 9350 2800
F 0 "R39" V 9250 2800 50  0000 C CNN
F 1 "330R" V 9350 2800 50  0000 C CNN
F 2 "Resistors_SMD:R_1206_HandSoldering" V 9280 2800 50  0001 C CNN
F 3 "" H 9350 2800 50  0001 C CNN
	1    9350 2800
	0    1    1    0   
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:R R36
U 1 1 5B8EED6D
P 9000 2150
F 0 "R36" H 9100 2150 50  0000 C CNN
F 1 "150R" V 9000 2150 50  0000 C CNN
F 2 "Resistors_SMD:R_1206_HandSoldering" V 8930 2150 50  0001 C CNN
F 3 "" H 9000 2150 50  0001 C CNN
	1    9000 2150
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:R R32
U 1 1 5B8EED74
P 8450 1900
F 0 "R32" V 8350 1900 50  0000 C CNN
F 1 "10R" V 8450 1900 50  0000 C CNN
F 2 "Resistors_SMD:R_1206_HandSoldering" V 8380 1900 50  0001 C CNN
F 3 "" H 8450 1900 50  0001 C CNN
	1    8450 1900
	0    1    1    0   
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:R R33
U 1 1 5B8EED7B
P 8450 2200
F 0 "R33" V 8550 2200 50  0000 C CNN
F 1 "10R" V 8450 2200 50  0000 C CNN
F 2 "Resistors_SMD:R_1206_HandSoldering" V 8380 2200 50  0001 C CNN
F 3 "" H 8450 2200 50  0001 C CNN
	1    8450 2200
	0    1    1    0   
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:Conn_01x03 J26
U 1 1 5B8EED82
P 8000 1000
F 0 "J26" V 8100 1100 50  0000 C CNN
F 1 "Conn_01x03" H 8000 800 50  0001 C CNN
F 2 "Pin_Headers:Pin_Header_Straight_1x03_Pitch2.54mm" H 8000 1000 50  0001 C CNN
F 3 "" H 8000 1000 50  0001 C CNN
	1    8000 1000
	0    -1   -1   0   
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:GND #PWR051
U 1 1 5B8EED92
P 9100 2900
F 0 "#PWR051" H 9100 2650 50  0001 C CNN
F 1 "GND" H 9100 2750 50  0000 C CNN
F 2 "" H 9100 2900 50  0001 C CNN
F 3 "" H 9100 2900 50  0001 C CNN
	1    9100 2900
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:GND #PWR052
U 1 1 5B8EEDAE
P 7900 1400
F 0 "#PWR052" H 7900 1150 50  0001 C CNN
F 1 "GND" H 7900 1250 50  0000 C CNN
F 2 "" H 7900 1400 50  0001 C CNN
F 3 "" H 7900 1400 50  0001 C CNN
	1    7900 1400
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:R R27
U 1 1 5B8EEDBB
P 6600 2550
F 0 "R27" H 6700 2550 50  0000 C CNN
F 1 "47K" V 6600 2550 50  0000 C CNN
F 2 "Resistors_SMD:R_1206_HandSoldering" V 6530 2550 50  0001 C CNN
F 3 "" H 6600 2550 50  0001 C CNN
	1    6600 2550
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:GND #PWR053
U 1 1 5B8EEDC2
P 6600 2800
F 0 "#PWR053" H 6600 2550 50  0001 C CNN
F 1 "GND" H 6600 2650 50  0000 C CNN
F 2 "" H 6600 2800 50  0001 C CNN
F 3 "" H 6600 2800 50  0001 C CNN
	1    6600 2800
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:R R29
U 1 1 5B8EEDCB
P 6700 1550
F 0 "R29" H 6800 1550 50  0000 C CNN
F 1 "47K" V 6700 1550 50  0000 C CNN
F 2 "Resistors_SMD:R_1206_HandSoldering" V 6630 1550 50  0001 C CNN
F 3 "" H 6700 1550 50  0001 C CNN
	1    6700 1550
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:R R26
U 1 1 5B8EEDD2
P 6500 1550
F 0 "R26" H 6400 1550 50  0000 C CNN
F 1 "47K" V 6500 1550 50  0000 C CNN
F 2 "Resistors_SMD:R_1206_HandSoldering" V 6430 1550 50  0001 C CNN
F 3 "" H 6500 1550 50  0001 C CNN
	1    6500 1550
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:+3.3V #PWR054
U 1 1 5B8EEDDD
P 6600 1200
F 0 "#PWR054" H 6600 1050 50  0001 C CNN
F 1 "+3.3V" H 6600 1340 50  0000 C CNN
F 2 "" H 6600 1200 50  0001 C CNN
F 3 "" H 6600 1200 50  0001 C CNN
	1    6600 1200
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:R R23
U 1 1 5B8EEDE8
P 5900 1550
F 0 "R23" H 5800 1550 50  0000 C CNN
F 1 "560R" V 5900 1550 50  0000 C CNN
F 2 "Resistors_SMD:R_1206_HandSoldering" V 5830 1550 50  0001 C CNN
F 3 "" H 5900 1550 50  0001 C CNN
	1    5900 1550
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:R R24
U 1 1 5B8EEDEF
P 6100 1550
F 0 "R24" H 6200 1550 50  0000 C CNN
F 1 "560R" V 6100 1550 50  0000 C CNN
F 2 "Resistors_SMD:R_1206_HandSoldering" V 6030 1550 50  0001 C CNN
F 3 "" H 6100 1550 50  0001 C CNN
	1    6100 1550
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:+3.3V #PWR055
U 1 1 5B8EEDF6
P 6000 800
F 0 "#PWR055" H 6000 650 50  0001 C CNN
F 1 "+3.3V" H 6000 940 50  0000 C CNN
F 2 "" H 6000 800 50  0001 C CNN
F 3 "" H 6000 800 50  0001 C CNN
	1    6000 800 
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:+3.3V #PWR056
U 1 1 5B8EEE07
P 7400 1100
F 0 "#PWR056" H 7400 950 50  0001 C CNN
F 1 "+3.3V" H 7400 1240 50  0000 C CNN
F 2 "" H 7400 1100 50  0001 C CNN
F 3 "" H 7400 1100 50  0001 C CNN
	1    7400 1100
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:C_Small C16
U 1 1 5B8EEE0D
P 7600 1300
F 0 "C16" V 7550 1350 50  0000 L CNN
F 1 "100n" V 7650 1350 50  0000 L CNN
F 2 "Capacitors_SMD:C_1206_HandSoldering" H 7600 1300 50  0001 C CNN
F 3 "" H 7600 1300 50  0001 C CNN
	1    7600 1300
	0    1    1    0   
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:GND #PWR057
U 1 1 5B8EEE19
P 7400 2700
F 0 "#PWR057" H 7400 2450 50  0001 C CNN
F 1 "GND" H 7400 2550 50  0000 C CNN
F 2 "" H 7400 2700 50  0001 C CNN
F 3 "" H 7400 2700 50  0001 C CNN
	1    7400 2700
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:Resonator_Small Y3
U 1 1 5B8EEE20
P 1800 6900
F 0 "Y3" V 1575 6700 50  0000 L CNN
F 1 "12MHz" V 1575 6825 50  0000 L CNN
F 2 "Crystals:Resonator-3pin_w7.0mm_h2.5mm" H 1775 6900 50  0001 C CNN
F 3 "" H 1775 6900 50  0001 C CNN
	1    1800 6900
	0    1    1    0   
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:GND #PWR058
U 1 1 5B8EEE27
P 2300 7450
F 0 "#PWR058" H 2300 7200 50  0001 C CNN
F 1 "GND" H 2300 7300 50  0000 C CNN
F 2 "" H 2300 7450 50  0001 C CNN
F 3 "" H 2300 7450 50  0001 C CNN
	1    2300 7450
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:GND #PWR059
U 1 1 5B8EEE2D
P 1500 7000
F 0 "#PWR059" H 1500 6750 50  0001 C CNN
F 1 "GND" H 1500 6850 50  0000 C CNN
F 2 "" H 1500 7000 50  0001 C CNN
F 3 "" H 1500 7000 50  0001 C CNN
	1    1500 7000
	1    0    0    -1  
$EndComp
NoConn ~ 2000 6600
NoConn ~ 2800 7100
NoConn ~ 2800 7000
NoConn ~ 2800 6900
NoConn ~ 2800 6800
NoConn ~ 2800 6600
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:+3.3V #PWR060
U 1 1 5B8EEE3E
P 2900 5200
F 0 "#PWR060" H 2900 5050 50  0001 C CNN
F 1 "+3.3V" H 2900 5340 50  0000 C CNN
F 2 "" H 2900 5200 50  0001 C CNN
F 3 "" H 2900 5200 50  0001 C CNN
	1    2900 5200
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:GND #PWR061
U 1 1 5B8EEE54
P 900 6900
F 0 "#PWR061" H 900 6650 50  0001 C CNN
F 1 "GND" H 900 6750 50  0000 C CNN
F 2 "" H 900 6900 50  0001 C CNN
F 3 "" H 900 6900 50  0001 C CNN
	1    900  6900
	1    0    0    -1  
$EndComp
NoConn ~ 1200 6500
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:C_Small C11
U 1 1 5B8EEE5C
P 2000 5800
F 0 "C11" V 1950 5850 50  0000 L CNN
F 1 "100n" V 2050 5850 50  0000 L CNN
F 2 "Capacitors_SMD:C_1206_HandSoldering" H 2000 5800 50  0001 C CNN
F 3 "" H 2000 5800 50  0001 C CNN
	1    2000 5800
	0    1    1    0   
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:GND #PWR062
U 1 1 5B8EEE63
P 1800 5900
F 0 "#PWR062" H 1800 5650 50  0001 C CNN
F 1 "GND" H 1800 5750 50  0000 C CNN
F 2 "" H 1800 5900 50  0001 C CNN
F 3 "" H 1800 5900 50  0001 C CNN
	1    1800 5900
	1    0    0    -1  
$EndComp
Text Label 2900 6300 0    60   ~ 0
USB2-TxD
Text Label 2900 6400 0    60   ~ 0
USB2-RxD
Text Label 2400 2700 0    60   ~ 0
UC2-XTAL1
Text Label 2400 1800 0    60   ~ 0
UC2-RST
Text Label 2500 3800 0    60   ~ 0
UC2-nSS
Text Label 2500 3900 0    60   ~ 0
UC2-SCK
Text Label 2500 4000 0    60   ~ 0
UC2-MOSI
Text Label 2500 4100 0    60   ~ 0
UC2-MISO
Text Label 7200 5800 0    60   ~ 0
UC2-MISO
Text Label 7200 5900 0    60   ~ 0
UC2-SCK
Text Label 7200 6000 0    60   ~ 0
UC2-RST
Text Label 8700 5900 0    60   ~ 0
UC2-MOSI
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:GND #PWR063
U 1 1 5B8EEE7E
P 8700 6200
F 0 "#PWR063" H 8700 5950 50  0001 C CNN
F 1 "GND" H 8700 6050 50  0000 C CNN
F 2 "" H 8700 6200 50  0001 C CNN
F 3 "" H 8700 6200 50  0001 C CNN
	1    8700 6200
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:+3.3V #PWR064
U 1 1 5B8EEE86
P 8700 5600
F 0 "#PWR064" H 8700 5450 50  0001 C CNN
F 1 "+3.3V" H 8700 5740 50  0000 C CNN
F 2 "" H 8700 5600 50  0001 C CNN
F 3 "" H 8700 5600 50  0001 C CNN
	1    8700 5600
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:D_Schottky D10
U 1 1 5B8EEE91
P 2600 1050
F 0 "D10" H 2600 1150 50  0000 C CNN
F 1 "D_Schottky" H 2600 950 50  0001 C CNN
F 2 "Diodes_SMD:D_0805" H 2600 1050 50  0001 C CNN
F 3 "" H 2600 1050 50  0001 C CNN
	1    2600 1050
	0    1    1    0   
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:SOLDERBRDIGE-3 J19
U 1 1 5B8EEE9F
P 1600 1400
F 0 "J19" H 1650 1600 50  0000 C CNN
F 1 "SOLDERBRDIGE-3" H 1650 1201 50  0001 C CNN
F 2 "Project:SOLDER-JUMPER_2-WAY" H 1600 1400 50  0001 C CNN
F 3 "" H 1600 1400 60  0001 C CNN
	1    1600 1400
	1    0    0    -1  
$EndComp
Text Label 900  1500 0    60   ~ 0
~USB2-DTR~
Text Label 2900 6700 0    60   ~ 0
~USB2-DTR~
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:Conn_02x03_Odd_Even J24
U 1 1 5B8EEEB5
P 6100 6200
F 0 "J24" H 6150 6000 50  0000 C CNN
F 1 "Conn_02x03_Odd_Even" H 6150 6000 50  0001 C CNN
F 2 "Pin_Headers:Pin_Header_Straight_2x03_Pitch2.54mm" H 6100 6200 50  0001 C CNN
F 3 "" H 6100 6200 50  0001 C CNN
	1    6100 6200
	-1   0    0    1   
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:SOLDERBRDIGE-2 J22
U 1 1 5B8EEEBF
P 3900 6400
F 0 "J22" V 4000 6400 50  0000 C CNN
F 1 "SOLDERBRDIGE-2" H 4000 6251 50  0001 C CNN
F 2 "Project:SOLDER-JUMPER_1-WAY" H 3900 6400 50  0001 C CNN
F 3 "" H 3900 6400 60  0001 C CNN
	1    3900 6400
	0    1    1    0   
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:R R25
U 1 1 5B8EEECF
P 6200 5250
F 0 "R25" H 6300 5250 50  0000 C CNN
F 1 "47K" V 6200 5250 50  0000 C CNN
F 2 "Resistors_SMD:R_1206_HandSoldering" V 6130 5250 50  0001 C CNN
F 3 "" H 6200 5250 50  0001 C CNN
	1    6200 5250
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:+3.3V #PWR065
U 1 1 5B8EEED6
P 6200 5000
F 0 "#PWR065" H 6200 4850 50  0001 C CNN
F 1 "+3.3V" H 6200 5140 50  0000 C CNN
F 2 "" H 6200 5000 50  0001 C CNN
F 3 "" H 6200 5000 50  0001 C CNN
	1    6200 5000
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:LED D13
U 1 1 5B8EEEE8
P 5700 2950
F 0 "D13" V 5700 3100 50  0000 C CNN
F 1 "LED" H 5700 2850 50  0001 C CNN
F 2 "LEDs:LED_0805_HandSoldering" H 5700 2950 50  0001 C CNN
F 3 "" H 5700 2950 50  0001 C CNN
	1    5700 2950
	0    1    1    0   
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:LED D12
U 1 1 5B8EEEEF
P 5500 2950
F 0 "D12" H 5650 3000 50  0000 C CNN
F 1 "LED" H 5500 2850 50  0001 C CNN
F 2 "LEDs:LED_0805_HandSoldering" H 5500 2950 50  0001 C CNN
F 3 "" H 5500 2950 50  0001 C CNN
	1    5500 2950
	0    1    1    0   
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:LED D11
U 1 1 5B8EEEF6
P 5300 2950
F 0 "D11" V 5300 2800 50  0000 C CNN
F 1 "LED" H 5300 2850 50  0001 C CNN
F 2 "LEDs:LED_0805_HandSoldering" H 5300 2950 50  0001 C CNN
F 3 "" H 5300 2950 50  0001 C CNN
	1    5300 2950
	0    1    1    0   
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:R R21
U 1 1 5B8EEEFD
P 5500 3350
F 0 "R21" H 5600 3200 50  0000 C CNN
F 1 "560R" V 5500 3350 50  0000 C CNN
F 2 "Resistors_SMD:R_1206_HandSoldering" V 5430 3350 50  0001 C CNN
F 3 "" H 5500 3350 50  0001 C CNN
	1    5500 3350
	-1   0    0    1   
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:R R22
U 1 1 5B8EEF04
P 5700 3350
F 0 "R22" H 5600 3200 50  0000 C CNN
F 1 "560R" V 5700 3350 50  0000 C CNN
F 2 "Resistors_SMD:R_1206_HandSoldering" V 5630 3350 50  0001 C CNN
F 3 "" H 5700 3350 50  0001 C CNN
	1    5700 3350
	-1   0    0    1   
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:R R20
U 1 1 5B8EEF0B
P 5300 3350
F 0 "R20" H 5400 3200 50  0000 C CNN
F 1 "560R" V 5300 3350 50  0000 C CNN
F 2 "Resistors_SMD:R_1206_HandSoldering" V 5230 3350 50  0001 C CNN
F 3 "" H 5300 3350 50  0001 C CNN
	1    5300 3350
	-1   0    0    1   
$EndComp
Text Label 9900 1500 0    60   ~ 0
Modbus3-A
Text Label 9900 2500 0    60   ~ 0
Modbus3-B
Text Label 9900 5650 0    60   ~ 0
GND
Text Label 900  4400 0    60   ~ 0
GND
Text Label 900  4500 0    60   ~ 0
UC2-RxD0
Text Label 900  4600 0    60   ~ 0
UC2-TxD0
Text Label 5300 1900 0    60   ~ 0
UC2-RxD1
Text Label 5300 2200 0    60   ~ 0
UC2-TxD1
Text Label 5300 2100 0    60   ~ 0
MODBUS3-DE
Text Label 5300 2000 0    60   ~ 0
~MODBUS3-RE~
Text Label 2050 4500 0    60   ~ 0
UC2-RxD1
Text Label 2050 4600 0    60   ~ 0
UC2-TxD1
Text Label 900  4700 0    60   ~ 0
MODBUS2-DE
Text Label 900  4800 0    60   ~ 0
~MODBUS2-RE~
NoConn ~ 5000 5000
NoConn ~ 5000 4900
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:PRJ-UC2-ATMEGA324P-20AU U2
U 1 1 5B8EAA09
P 4000 3400
F 0 "U2" H 3200 5300 50  0000 L BNN
F 1 "PRJ-UC2-ATMEGA324P-20AU" H 4050 1350 50  0000 L BNN
F 2 "Project:TQFP-44_10x10mm_Pitch0.8mm_Handsolded" H 4000 3450 50  0001 C CIN
F 3 "" H 4000 3450 50  0001 C CNN
	1    4000 3400
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:SN65HVD11 U7
U 1 1 5B8F7D85
P 7400 4300
F 0 "U7" H 7160 4750 50  0000 C CNN
F 1 "SN65HVD11" H 7450 3750 50  0000 L CNN
F 2 "Project:SOIC-8_3.9x4.9mm_Pitch1.27mm_Handsolded" H 7400 3600 50  0001 C CNN
F 3 "" H 7400 4350 50  0001 C CNN
	1    7400 4300
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:Screw_Terminal_01x02 J36
U 1 1 5B8F7D8C
P 10800 4300
F 0 "J36" H 10800 4400 50  0000 C CNN
F 1 "Screw_Terminal_01x02" H 10800 4100 50  0001 C CNN
F 2 "Project:Terminalblock-2x-5mm" H 10800 4300 50  0001 C CNN
F 3 "" H 10800 4300 50  0001 C CNN
	1    10800 4300
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:D_TVS_x2_AAC-RESCUE-rpi-atmega324-modbus-x3-gateway D17
U 1 1 5B8F7D93
P 9800 4300
F 0 "D17" V 9800 4450 50  0000 C CNN
F 1 "D_TVS_x2_AAC" H 9800 4400 50  0001 C CNN
F 2 "TO_SOT_Packages_SMD:SOT-23_Handsoldering" H 9650 4300 50  0001 C CNN
F 3 "" H 9650 4300 50  0001 C CNN
	1    9800 4300
	0    -1   -1   0   
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:Conn_01x02 J32
U 1 1 5B8F7D9A
P 9800 3500
F 0 "J32" H 9800 3600 50  0000 C CNN
F 1 "Conn_01x02" H 9800 3300 50  0001 C CNN
F 2 "Pin_Headers:Pin_Header_Straight_1x02_Pitch2.54mm" H 9800 3500 50  0001 C CNN
F 3 "" H 9800 3500 50  0001 C CNN
	1    9800 3500
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:Conn_01x02 J33
U 1 1 5B8F7DA1
P 9800 5000
F 0 "J33" H 9800 5100 50  0000 C CNN
F 1 "Conn_01x02" H 9800 4800 50  0001 C CNN
F 2 "Pin_Headers:Pin_Header_Straight_1x02_Pitch2.54mm" H 9800 5000 50  0001 C CNN
F 3 "" H 9800 5000 50  0001 C CNN
	1    9800 5000
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:Conn_01x02 J29
U 1 1 5B8F7DA8
P 9300 4100
F 0 "J29" H 9300 4200 50  0000 C CNN
F 1 "Conn_01x02" H 9300 3900 50  0001 C CNN
F 2 "Pin_Headers:Pin_Header_Straight_1x02_Pitch2.54mm" H 9300 4100 50  0001 C CNN
F 3 "" H 9300 4100 50  0001 C CNN
	1    9300 4100
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:R R40
U 1 1 5B8F7DAF
P 9350 3500
F 0 "R40" V 9250 3500 50  0000 C CNN
F 1 "330R" V 9350 3500 50  0000 C CNN
F 2 "Resistors_SMD:R_1206_HandSoldering" V 9280 3500 50  0001 C CNN
F 3 "" H 9350 3500 50  0001 C CNN
	1    9350 3500
	0    1    1    0   
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:+3.3V #PWR066
U 1 1 5B8F7DB6
P 9100 3400
F 0 "#PWR066" H 9100 3250 50  0001 C CNN
F 1 "+3.3V" H 9100 3540 50  0000 C CNN
F 2 "" H 9100 3400 50  0001 C CNN
F 3 "" H 9100 3400 50  0001 C CNN
	1    9100 3400
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:GND #PWR067
U 1 1 5B8F7DCA
P 10100 4400
F 0 "#PWR067" H 10100 4150 50  0001 C CNN
F 1 "GND" H 10100 4250 50  0000 C CNN
F 2 "" H 10100 4400 50  0001 C CNN
F 3 "" H 10100 4400 50  0001 C CNN
	1    10100 4400
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:R R41
U 1 1 5B8F7DD0
P 9350 5100
F 0 "R41" V 9250 5100 50  0000 C CNN
F 1 "330R" V 9350 5100 50  0000 C CNN
F 2 "Resistors_SMD:R_1206_HandSoldering" V 9280 5100 50  0001 C CNN
F 3 "" H 9350 5100 50  0001 C CNN
	1    9350 5100
	0    1    1    0   
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:R R37
U 1 1 5B8F7DD7
P 9000 4450
F 0 "R37" H 9100 4450 50  0000 C CNN
F 1 "150R" V 9000 4450 50  0000 C CNN
F 2 "Resistors_SMD:R_1206_HandSoldering" V 8930 4450 50  0001 C CNN
F 3 "" H 9000 4450 50  0001 C CNN
	1    9000 4450
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:R R34
U 1 1 5B8F7DDE
P 8450 4200
F 0 "R34" V 8350 4200 50  0000 C CNN
F 1 "10R" V 8450 4200 50  0000 C CNN
F 2 "Resistors_SMD:R_1206_HandSoldering" V 8380 4200 50  0001 C CNN
F 3 "" H 8450 4200 50  0001 C CNN
	1    8450 4200
	0    1    1    0   
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:R R35
U 1 1 5B8F7DE5
P 8450 4500
F 0 "R35" V 8550 4500 50  0000 C CNN
F 1 "10R" V 8450 4500 50  0000 C CNN
F 2 "Resistors_SMD:R_1206_HandSoldering" V 8380 4500 50  0001 C CNN
F 3 "" H 8450 4500 50  0001 C CNN
	1    8450 4500
	0    1    1    0   
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:Conn_01x03 J27
U 1 1 5B8F7DEC
P 8000 3300
F 0 "J27" V 8100 3400 50  0000 C CNN
F 1 "Conn_01x03" H 8000 3100 50  0001 C CNN
F 2 "Pin_Headers:Pin_Header_Straight_1x03_Pitch2.54mm" H 8000 3300 50  0001 C CNN
F 3 "" H 8000 3300 50  0001 C CNN
	1    8000 3300
	0    -1   -1   0   
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:GND #PWR068
U 1 1 5B8F7DF8
P 9100 5200
F 0 "#PWR068" H 9100 4950 50  0001 C CNN
F 1 "GND" H 9100 5050 50  0000 C CNN
F 2 "" H 9100 5200 50  0001 C CNN
F 3 "" H 9100 5200 50  0001 C CNN
	1    9100 5200
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:GND #PWR069
U 1 1 5B8F7E15
P 7900 3700
F 0 "#PWR069" H 7900 3450 50  0001 C CNN
F 1 "GND" H 7900 3550 50  0000 C CNN
F 2 "" H 7900 3700 50  0001 C CNN
F 3 "" H 7900 3700 50  0001 C CNN
	1    7900 3700
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:R R30
U 1 1 5B8F7E26
P 6800 4850
F 0 "R30" H 6950 4850 50  0000 C CNN
F 1 "47K" V 6800 4850 50  0000 C CNN
F 2 "Resistors_SMD:R_1206_HandSoldering" V 6730 4850 50  0001 C CNN
F 3 "" H 6800 4850 50  0001 C CNN
	1    6800 4850
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:GND #PWR070
U 1 1 5B8F7E2D
P 6800 5100
F 0 "#PWR070" H 6800 4850 50  0001 C CNN
F 1 "GND" H 6800 4950 50  0000 C CNN
F 2 "" H 6800 5100 50  0001 C CNN
F 3 "" H 6800 5100 50  0001 C CNN
	1    6800 5100
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:R R31
U 1 1 5B8F7E36
P 6300 3850
F 0 "R31" H 6450 3850 50  0000 C CNN
F 1 "47K" V 6300 3850 50  0000 C CNN
F 2 "Resistors_SMD:R_1206_HandSoldering" V 6230 3850 50  0001 C CNN
F 3 "" H 6300 3850 50  0001 C CNN
	1    6300 3850
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:R R28
U 1 1 5B8F7E3D
P 6100 3850
F 0 "R28" H 5950 3850 50  0000 C CNN
F 1 "47K" V 6100 3850 50  0000 C CNN
F 2 "Resistors_SMD:R_1206_HandSoldering" V 6030 3850 50  0001 C CNN
F 3 "" H 6100 3850 50  0001 C CNN
	1    6100 3850
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:+3.3V #PWR071
U 1 1 5B8F7E48
P 6200 3500
F 0 "#PWR071" H 6200 3350 50  0001 C CNN
F 1 "+3.3V" H 6200 3640 50  0000 C CNN
F 2 "" H 6200 3500 50  0001 C CNN
F 3 "" H 6200 3500 50  0001 C CNN
	1    6200 3500
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:+3.3V #PWR072
U 1 1 5B8F7E54
P 7400 3400
F 0 "#PWR072" H 7400 3250 50  0001 C CNN
F 1 "+3.3V" H 7400 3540 50  0000 C CNN
F 2 "" H 7400 3400 50  0001 C CNN
F 3 "" H 7400 3400 50  0001 C CNN
	1    7400 3400
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:C_Small C17
U 1 1 5B8F7E5A
P 7600 3600
F 0 "C17" V 7550 3650 50  0000 L CNN
F 1 "100n" V 7650 3650 50  0000 L CNN
F 2 "Capacitors_SMD:C_1206_HandSoldering" H 7600 3600 50  0001 C CNN
F 3 "" H 7600 3600 50  0001 C CNN
	1    7600 3600
	0    1    1    0   
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:GND #PWR073
U 1 1 5B8F7E67
P 7400 5000
F 0 "#PWR073" H 7400 4750 50  0001 C CNN
F 1 "GND" H 7400 4850 50  0000 C CNN
F 2 "" H 7400 5000 50  0001 C CNN
F 3 "" H 7400 5000 50  0001 C CNN
	1    7400 5000
	1    0    0    -1  
$EndComp
Text Label 9900 3800 0    60   ~ 0
Modbus2-A
Text Label 9900 4800 0    60   ~ 0
Modbus2-B
Text Label 5300 4400 0    60   ~ 0
MODBUS2-DE
Text Label 5300 4300 0    60   ~ 0
~MODBUS2-RE~
Text Label 5300 4200 0    60   ~ 0
UC2-RxD0
Text Label 5300 4500 0    60   ~ 0
UC2-TxD0
Text Label 5100 2400 0    60   ~ 0
UC2-PA0
Text Label 5100 2500 0    60   ~ 0
UC2-PA1
Text Label 5100 2600 0    60   ~ 0
UC2-PA2
NoConn ~ 5000 3100
NoConn ~ 5000 2900
NoConn ~ 5000 2800
NoConn ~ 5000 2700
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:GND #PWR074
U 1 1 5B9025AE
P 6050 2800
F 0 "#PWR074" H 6050 2550 50  0001 C CNN
F 1 "GND" H 6050 2650 50  0000 C CNN
F 2 "" H 6050 2800 50  0001 C CNN
F 3 "" H 6050 2800 50  0001 C CNN
	1    6050 2800
	1    0    0    -1  
$EndComp
Text Label 9900 5750 0    60   ~ 0
UC2-PA0
Text Label 9900 5850 0    60   ~ 0
UC2-PA1
Text Label 9900 5950 0    60   ~ 0
UC2-PA2
Text Label 2050 4700 0    60   ~ 0
MODBUS3-DE
Text Label 2050 4800 0    60   ~ 0
~MODBUS3-RE~
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:PRJ_USB_MINI J17
U 1 1 5B8EB056
P 900 6300
F 0 "J17" H 700 6750 50  0000 L CNN
F 1 "PRJ_USB_MINI" H 700 6650 50  0000 L CNN
F 2 "Project:USB_Mini-B-THT" H 1050 6250 50  0001 C CNN
F 3 "" H 1050 6250 50  0001 C CNN
	1    900  6300
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:GND #PWR075
U 1 1 5B8EB6F2
P 5400 7100
F 0 "#PWR075" H 5400 6850 50  0001 C CNN
F 1 "GND" H 5400 6950 50  0000 C CNN
F 2 "" H 5400 7100 50  0001 C CNN
F 3 "" H 5400 7100 50  0001 C CNN
	1    5400 7100
	1    0    0    -1  
$EndComp
Text HLabel 1000 5450 0    60   Output ~ 0
USB-5V
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:SOLDERBRDIGE-3 J21
U 1 1 5B8F929B
P 2600 5500
F 0 "J21" H 2650 5700 50  0000 C CNN
F 1 "SOLDERBRDIGE-3" H 2650 5301 50  0001 C CNN
F 2 "Project:SOLDER-JUMPER_2-WAY" H 2600 5500 50  0001 C CNN
F 3 "" H 2600 5500 60  0001 C CNN
	1    2600 5500
	-1   0    0    1   
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:PWR_FLAG #FLG076
U 1 1 5B8FFFC2
P 2300 5200
F 0 "#FLG076" H 2300 5275 50  0001 C CNN
F 1 "PWR_FLAG" H 2300 5350 50  0000 C CNN
F 2 "" H 2300 5200 50  0001 C CNN
F 3 "" H 2300 5200 50  0001 C CNN
	1    2300 5200
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:LED D19
U 1 1 5B9065D3
P 6700 3550
F 0 "D19" V 6700 3700 50  0000 C CNN
F 1 "LED" H 6700 3450 50  0001 C CNN
F 2 "LEDs:LED_0805_HandSoldering" H 6700 3550 50  0001 C CNN
F 3 "" H 6700 3550 50  0001 C CNN
	1    6700 3550
	0    -1   -1   0   
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:LED D20
U 1 1 5B9065DA
P 6900 3550
F 0 "D20" V 6900 3400 50  0000 C CNN
F 1 "LED" H 6900 3450 50  0001 C CNN
F 2 "LEDs:LED_0805_HandSoldering" H 6900 3550 50  0001 C CNN
F 3 "" H 6900 3550 50  0001 C CNN
	1    6900 3550
	0    -1   -1   0   
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:R R42
U 1 1 5B9065E1
P 6700 3950
F 0 "R42" H 6600 3800 50  0000 C CNN
F 1 "560R" V 6700 3950 50  0000 C CNN
F 2 "Resistors_SMD:R_1206_HandSoldering" V 6630 3950 50  0001 C CNN
F 3 "" H 6700 3950 50  0001 C CNN
	1    6700 3950
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:R R43
U 1 1 5B9065E8
P 6900 3950
F 0 "R43" H 7000 4100 50  0000 C CNN
F 1 "560R" V 6900 3950 50  0000 C CNN
F 2 "Resistors_SMD:R_1206_HandSoldering" V 6830 3950 50  0001 C CNN
F 3 "" H 6900 3950 50  0001 C CNN
	1    6900 3950
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:+3.3V #PWR077
U 1 1 5B9065EF
P 6800 3200
F 0 "#PWR077" H 6800 3050 50  0001 C CNN
F 1 "+3.3V" H 6800 3340 50  0000 C CNN
F 2 "" H 6800 3200 50  0001 C CNN
F 3 "" H 6800 3200 50  0001 C CNN
	1    6800 3200
	1    0    0    -1  
$EndComp
Wire Wire Line
	3700 1300 4200 1300
Connection ~ 3800 1300
Wire Wire Line
	3900 1300 3900 1400
Wire Wire Line
	3800 1400 3800 1300
Wire Wire Line
	4200 1300 4200 1400
Connection ~ 3900 1300
Connection ~ 3700 1300
Wire Wire Line
	2800 3400 2800 3350
Wire Wire Line
	1000 3800 3000 3800
Wire Wire Line
	1000 3900 3000 3900
Wire Wire Line
	1000 4000 3000 4000
Wire Wire Line
	1000 4100 3000 4100
Wire Wire Line
	3700 5500 3700 5700
Wire Wire Line
	3700 5600 4000 5600
Wire Wire Line
	4000 5600 4000 5500
Connection ~ 3700 5600
Wire Wire Line
	3900 5500 3900 5600
Connection ~ 3900 5600
Wire Wire Line
	3800 5500 3800 5600
Connection ~ 3800 5600
Wire Wire Line
	3700 700  3700 1400
Wire Wire Line
	3700 800  4800 800 
Wire Wire Line
	4800 800  4800 900 
Connection ~ 3700 800 
Wire Wire Line
	4500 900  4500 800 
Connection ~ 4500 800 
Wire Wire Line
	4200 900  4200 800 
Connection ~ 4200 800 
Wire Wire Line
	3900 900  3900 800 
Connection ~ 3900 800 
Wire Wire Line
	3900 1100 3900 1200
Wire Wire Line
	3900 1200 4800 1200
Wire Wire Line
	4800 1100 4800 1300
Connection ~ 4800 1200
Wire Wire Line
	4500 1200 4500 1100
Connection ~ 4500 1200
Wire Wire Line
	4200 1200 4200 1100
Connection ~ 4200 1200
Wire Wire Line
	2300 2500 3000 2500
Wire Wire Line
	2300 2700 3000 2700
Wire Wire Line
	2000 2600 1900 2600
Wire Wire Line
	1900 2600 1900 2700
Wire Wire Line
	1800 1800 1600 1800
Wire Wire Line
	1600 1800 1600 1900
Wire Wire Line
	2300 700  2300 900 
Wire Wire Line
	1800 1400 1900 1400
Wire Wire Line
	2300 1400 2100 1400
Connection ~ 2300 1400
Wire Wire Line
	2300 1200 2300 1800
Connection ~ 2300 1800
Wire Wire Line
	10600 2000 10500 2000
Wire Wire Line
	10500 2000 10500 1500
Wire Wire Line
	10500 1500 8700 1500
Wire Wire Line
	9800 1500 9800 1600
Wire Wire Line
	10600 2100 10500 2100
Wire Wire Line
	10500 2100 10500 2500
Wire Wire Line
	10500 2500 8700 2500
Wire Wire Line
	9800 2500 9800 2400
Wire Wire Line
	9500 1300 9600 1300
Connection ~ 9800 2500
Wire Wire Line
	9600 1200 9500 1200
Wire Wire Line
	9500 2700 9600 2700
Connection ~ 9800 1500
Wire Wire Line
	9000 1500 9000 1800
Wire Wire Line
	9000 1800 9100 1800
Wire Wire Line
	9000 2500 9000 2300
Wire Wire Line
	9000 2000 9000 1900
Wire Wire Line
	9000 1900 9100 1900
Wire Wire Line
	10000 2000 10100 2000
Wire Wire Line
	10100 2000 10100 2100
Wire Wire Line
	9500 1300 9500 1500
Connection ~ 9500 1500
Wire Wire Line
	9500 2700 9500 2500
Connection ~ 9500 2500
Wire Wire Line
	8700 1500 8700 1900
Wire Wire Line
	8700 1900 8600 1900
Connection ~ 9000 1500
Wire Wire Line
	8700 2500 8700 2200
Wire Wire Line
	8700 2200 8600 2200
Connection ~ 9000 2500
Wire Wire Line
	8100 1200 8100 2200
Wire Wire Line
	7800 2200 8300 2200
Wire Wire Line
	7800 1900 8300 1900
Wire Wire Line
	8000 1900 8000 1200
Wire Wire Line
	7900 1200 7900 1400
Connection ~ 8000 1900
Connection ~ 8100 2200
Wire Wire Line
	5000 1900 7000 1900
Wire Wire Line
	5000 2000 7000 2000
Wire Wire Line
	5000 2100 7000 2100
Wire Wire Line
	5000 2200 7000 2200
Wire Wire Line
	6600 2400 6600 2100
Connection ~ 6600 2100
Wire Wire Line
	6600 2800 6600 2700
Wire Wire Line
	6700 2000 6700 1700
Connection ~ 6700 2000
Wire Wire Line
	6500 2200 6500 1700
Connection ~ 6500 2200
Wire Wire Line
	6500 1400 6500 1300
Wire Wire Line
	6500 1300 6700 1300
Wire Wire Line
	6600 1300 6600 1200
Wire Wire Line
	6700 1300 6700 1400
Connection ~ 6600 1300
Wire Wire Line
	5900 1000 5900 900 
Wire Wire Line
	5900 900  6100 900 
Wire Wire Line
	6000 900  6000 800 
Wire Wire Line
	6100 900  6100 1000
Connection ~ 6000 900 
Wire Wire Line
	5900 1300 5900 1400
Wire Wire Line
	6100 1300 6100 1400
Wire Wire Line
	5900 1700 5900 1900
Connection ~ 5900 1900
Wire Wire Line
	6100 1700 6100 2200
Connection ~ 6100 2200
Wire Wire Line
	7400 1100 7400 1500
Wire Wire Line
	7500 1300 7400 1300
Connection ~ 7400 1300
Wire Wire Line
	7700 1300 7900 1300
Connection ~ 7900 1300
Wire Wire Line
	7400 2700 7400 2600
Wire Wire Line
	2000 6800 1900 6800
Wire Wire Line
	2000 7000 1900 7000
Wire Wire Line
	1600 6900 1500 6900
Wire Wire Line
	1500 6900 1500 7000
Wire Wire Line
	2300 7400 2300 7450
Wire Wire Line
	2300 5200 2300 5900
Connection ~ 2300 5800
Wire Wire Line
	900  6700 900  6900
Wire Wire Line
	2800 6300 5800 6300
Wire Wire Line
	2800 6400 3700 6400
Wire Wire Line
	7700 6000 7100 6000
Wire Wire Line
	7700 5900 7100 5900
Wire Wire Line
	7700 5800 7100 5800
Wire Wire Line
	8600 6000 8700 6000
Wire Wire Line
	8700 6000 8700 6200
Wire Wire Line
	8600 5800 8700 5800
Wire Wire Line
	8700 5800 8700 5600
Wire Wire Line
	800  6700 800  6800
Wire Wire Line
	800  6800 900  6800
Connection ~ 900  6800
Wire Wire Line
	2600 900  2600 800 
Wire Wire Line
	2600 800  2300 800 
Connection ~ 2300 800 
Wire Wire Line
	2600 1200 2600 1300
Wire Wire Line
	2600 1300 2300 1300
Connection ~ 2300 1300
Wire Wire Line
	1400 1300 1000 1300
Wire Wire Line
	1400 1500 900  1500
Wire Wire Line
	2800 6700 3400 6700
Wire Wire Line
	6200 5100 6200 5000
Wire Wire Line
	6200 5400 6200 5500
Wire Wire Line
	10500 5650 9900 5650
Wire Wire Line
	1500 4400 900  4400
Wire Wire Line
	1500 4500 900  4500
Wire Wire Line
	1500 4600 900  4600
Wire Wire Line
	1500 4700 900  4700
Wire Wire Line
	1500 4800 900  4800
Wire Wire Line
	9500 2800 9600 2800
Wire Wire Line
	9200 1200 9100 1200
Wire Wire Line
	9100 1200 9100 1100
Wire Wire Line
	10600 4300 10500 4300
Wire Wire Line
	10500 4300 10500 3800
Wire Wire Line
	10500 3800 8700 3800
Wire Wire Line
	9800 3800 9800 3900
Wire Wire Line
	10600 4400 10500 4400
Wire Wire Line
	10500 4400 10500 4800
Wire Wire Line
	10500 4800 8700 4800
Wire Wire Line
	9800 4800 9800 4700
Wire Wire Line
	9500 3600 9600 3600
Connection ~ 9800 4800
Wire Wire Line
	9600 3500 9500 3500
Wire Wire Line
	9500 5000 9600 5000
Connection ~ 9800 3800
Wire Wire Line
	9000 3800 9000 4100
Wire Wire Line
	9000 4100 9100 4100
Wire Wire Line
	9000 4800 9000 4600
Wire Wire Line
	9000 4300 9000 4200
Wire Wire Line
	9000 4200 9100 4200
Wire Wire Line
	10000 4300 10100 4300
Wire Wire Line
	10100 4300 10100 4400
Wire Wire Line
	9500 3600 9500 3800
Connection ~ 9500 3800
Wire Wire Line
	9500 5000 9500 4800
Connection ~ 9500 4800
Wire Wire Line
	8700 3800 8700 4200
Wire Wire Line
	8700 4200 8600 4200
Connection ~ 9000 3800
Wire Wire Line
	8700 4800 8700 4500
Wire Wire Line
	8700 4500 8600 4500
Connection ~ 9000 4800
Wire Wire Line
	8100 3500 8100 4500
Wire Wire Line
	7800 4500 8300 4500
Wire Wire Line
	7800 4200 8300 4200
Wire Wire Line
	8000 4200 8000 3500
Wire Wire Line
	7900 3500 7900 3700
Connection ~ 8000 4200
Connection ~ 8100 4500
Wire Wire Line
	5000 4300 7000 4300
Wire Wire Line
	5000 4400 7000 4400
Wire Wire Line
	5000 4500 7000 4500
Wire Wire Line
	6800 5100 6800 5000
Wire Wire Line
	6100 3700 6100 3600
Wire Wire Line
	6100 3600 6300 3600
Wire Wire Line
	6200 3600 6200 3500
Wire Wire Line
	6300 3600 6300 3700
Connection ~ 6200 3600
Wire Wire Line
	7400 3400 7400 3800
Wire Wire Line
	7500 3600 7400 3600
Connection ~ 7400 3600
Wire Wire Line
	7700 3600 7900 3600
Connection ~ 7900 3600
Wire Wire Line
	7400 5000 7400 4900
Wire Wire Line
	9100 5200 9100 5100
Wire Wire Line
	9100 5100 9200 5100
Wire Wire Line
	9500 5100 9600 5100
Wire Wire Line
	9200 3500 9100 3500
Wire Wire Line
	9100 3500 9100 3400
Wire Wire Line
	9200 2800 9100 2800
Wire Wire Line
	9100 2800 9100 2900
Wire Wire Line
	8600 5900 9200 5900
Wire Wire Line
	2200 1800 2900 1800
Wire Wire Line
	2000 6400 1200 6400
Wire Wire Line
	2000 6300 1200 6300
Wire Wire Line
	4100 6400 5400 6400
Wire Wire Line
	5400 4500 5400 6700
Connection ~ 5400 4500
Wire Wire Line
	5000 4200 6400 4200
Wire Wire Line
	5300 6800 5500 6800
Wire Wire Line
	5500 6800 5500 6100
Wire Wire Line
	5500 6100 5800 6100
Wire Wire Line
	6600 4200 7000 4200
Wire Wire Line
	6600 4200 6600 6500
Wire Wire Line
	6600 6500 5700 6500
Wire Wire Line
	5700 6500 5700 6200
Wire Wire Line
	5700 6200 5800 6200
Wire Wire Line
	6400 6100 6300 6100
Wire Wire Line
	6400 4200 6400 6300
Wire Wire Line
	6400 6200 6300 6200
Connection ~ 6400 6100
Wire Wire Line
	6400 6300 6300 6300
Connection ~ 6400 6200
Wire Wire Line
	6200 5500 6400 5500
Connection ~ 6400 5500
Wire Wire Line
	5000 2400 5500 2400
Wire Wire Line
	5000 2500 5500 2500
Wire Wire Line
	5000 2600 5500 2600
Wire Wire Line
	9900 5750 10500 5750
Wire Wire Line
	9900 5850 10500 5850
Wire Wire Line
	9900 5950 10500 5950
Wire Wire Line
	2700 4700 2050 4700
Wire Wire Line
	2700 4800 2050 4800
Wire Wire Line
	5400 7100 5400 6900
Wire Wire Line
	5400 6900 5300 6900
Wire Wire Line
	5400 6700 5300 6700
Connection ~ 5400 6400
Wire Wire Line
	2300 5800 2100 5800
Wire Wire Line
	1900 5800 1800 5800
Wire Wire Line
	1800 5800 1800 5900
Wire Wire Line
	2500 5900 2500 5800
Wire Wire Line
	2500 5800 3000 5800
Wire Wire Line
	2900 5200 2900 5400
Wire Wire Line
	2900 5800 2900 5600
Wire Wire Line
	2400 5500 2300 5500
Connection ~ 2300 5500
Wire Wire Line
	2900 5600 2800 5600
Wire Wire Line
	2900 5400 2800 5400
Wire Wire Line
	6700 3400 6700 3300
Wire Wire Line
	6700 3300 6900 3300
Wire Wire Line
	6800 3300 6800 3200
Wire Wire Line
	6900 3300 6900 3400
Connection ~ 6800 3300
Wire Wire Line
	6700 3700 6700 3800
Wire Wire Line
	6900 3700 6900 3800
Wire Wire Line
	3000 1700 2900 1700
Wire Wire Line
	2900 1700 2900 1800
Wire Wire Line
	3000 3100 2800 3100
Wire Wire Line
	2800 3100 2800 3150
Wire Wire Line
	5000 3600 5300 3600
Wire Wire Line
	5300 3600 5300 3500
Wire Wire Line
	5000 3700 5500 3700
Wire Wire Line
	5500 3700 5500 3500
Wire Wire Line
	5000 3800 5700 3800
Wire Wire Line
	5700 3800 5700 3500
Wire Wire Line
	5300 3200 5300 3100
Wire Wire Line
	5500 3200 5500 3100
Wire Wire Line
	5700 3200 5700 3100
Wire Wire Line
	5300 2800 5300 2700
Wire Wire Line
	5300 2700 6050 2700
Wire Wire Line
	6050 2700 6050 2800
Wire Wire Line
	5500 2800 5500 2700
Connection ~ 5500 2700
Wire Wire Line
	5700 2800 5700 2700
Connection ~ 5700 2700
Wire Wire Line
	6700 4100 6700 4200
Connection ~ 6700 4200
Wire Wire Line
	6900 4100 6900 4500
Connection ~ 6900 4500
Wire Wire Line
	6100 4000 6100 4500
Connection ~ 6100 4500
Wire Wire Line
	6300 4000 6300 4300
Connection ~ 6300 4300
Wire Wire Line
	6800 4700 6800 4400
Connection ~ 6800 4400
Text Label 1350 6300 0    60   ~ 0
USB2-DP
Text Label 1350 6400 0    60   ~ 0
USB2-DM
Wire Wire Line
	1000 5450 1100 5450
Wire Wire Line
	1400 5450 1650 5450
Wire Wire Line
	1650 5450 1650 6100
Wire Wire Line
	1650 6100 1200 6100
Text Label 1200 6100 0    60   ~ 0
USB2-5V
Text Label 2900 5650 0    60   ~ 0
USB2_V3
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:Conn_01x04 J34
U 1 1 5B9D285C
P 10700 5750
F 0 "J34" H 10700 5950 50  0000 C CNN
F 1 "Conn_01x04" H 10700 5450 50  0001 C CNN
F 2 "Pin_Headers:Pin_Header_Straight_1x04_Pitch2.54mm" H 10700 5750 50  0001 C CNN
F 3 "" H 10700 5750 50  0001 C CNN
	1    10700 5750
	1    0    0    -1  
$EndComp
Wire Wire Line
	2450 2700 2450 3050
Connection ~ 2450 2700
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:Conn_01x02 J39
U 1 1 5B9D84A5
P 1150 3150
F 0 "J39" H 1150 2950 50  0000 C CNN
F 1 "Conn_01x02" H 1150 2950 50  0001 C CNN
F 2 "Pin_Headers:Pin_Header_Straight_1x02_Pitch2.54mm" H 1150 3150 50  0001 C CNN
F 3 "" H 1150 3150 50  0001 C CNN
	1    1150 3150
	-1   0    0    1   
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:GND #PWR078
U 1 1 5B9D84AC
P 1500 3250
F 0 "#PWR078" H 1500 3000 50  0001 C CNN
F 1 "GND" H 1500 3100 50  0000 C CNN
F 2 "" H 1500 3250 50  0001 C CNN
F 3 "" H 1500 3250 50  0001 C CNN
	1    1500 3250
	1    0    0    -1  
$EndComp
Wire Wire Line
	1350 3150 1500 3150
Wire Wire Line
	1500 3150 1500 3250
Wire Wire Line
	2450 3050 1350 3050
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:Conn_01x05 J18
U 1 1 5B9E1D72
P 2900 4600
F 0 "J18" H 2900 4900 50  0000 C CNN
F 1 "Conn_01x05" H 2900 4300 50  0001 C CNN
F 2 "Pin_Headers:Pin_Header_Straight_1x05_Pitch2.54mm" H 2900 4600 50  0001 C CNN
F 3 "" H 2900 4600 50  0001 C CNN
	1    2900 4600
	1    0    0    -1  
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:Conn_01x05 J20
U 1 1 5B9E2117
P 1700 4600
F 0 "J20" H 1700 4900 50  0000 C CNN
F 1 "Conn_01x05" H 1700 4300 50  0001 C CNN
F 2 "Pin_Headers:Pin_Header_Straight_1x05_Pitch2.54mm" H 1700 4600 50  0001 C CNN
F 3 "" H 1700 4600 50  0001 C CNN
	1    1700 4600
	1    0    0    -1  
$EndComp
Wire Wire Line
	2700 4400 2050 4400
Wire Wire Line
	2700 4500 2050 4500
Wire Wire Line
	2050 4600 2700 4600
Text Label 2050 4400 0    60   ~ 0
GND
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:C_Small C22
U 1 1 5B9F4568
P 3100 5800
F 0 "C22" V 3050 5850 50  0000 L CNN
F 1 "100n" V 3150 5850 50  0000 L CNN
F 2 "Capacitors_SMD:C_1206_HandSoldering" H 3100 5800 50  0001 C CNN
F 3 "" H 3100 5800 50  0001 C CNN
	1    3100 5800
	0    1    1    0   
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:GND #PWR079
U 1 1 5B9F4880
P 3400 5900
F 0 "#PWR079" H 3400 5650 50  0001 C CNN
F 1 "GND" H 3400 5750 50  0000 C CNN
F 2 "" H 3400 5900 50  0001 C CNN
F 3 "" H 3400 5900 50  0001 C CNN
	1    3400 5900
	1    0    0    -1  
$EndComp
Connection ~ 2900 5800
Wire Wire Line
	3200 5800 3400 5800
Wire Wire Line
	3400 5800 3400 5900
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:C_Small C21
U 1 1 5B9F4CB6
P 1800 5300
F 0 "C21" H 1650 5200 50  0000 L CNN
F 1 "100n" H 1850 5200 50  0000 L CNN
F 2 "Capacitors_SMD:C_1206_HandSoldering" H 1800 5300 50  0001 C CNN
F 3 "" H 1800 5300 50  0001 C CNN
	1    1800 5300
	-1   0    0    1   
$EndComp
$Comp
L rpi-atmega324-modbus-x3-gateway-rescue:GND #PWR080
U 1 1 5B9F508D
P 1800 5500
F 0 "#PWR080" H 1800 5250 50  0001 C CNN
F 1 "GND" H 1800 5350 50  0000 C CNN
F 2 "" H 1800 5500 50  0001 C CNN
F 3 "" H 1800 5500 50  0001 C CNN
	1    1800 5500
	1    0    0    -1  
$EndComp
Wire Wire Line
	1500 5450 1500 5050
Wire Wire Line
	1500 5050 1800 5050
Wire Wire Line
	1800 5050 1800 5200
Connection ~ 1500 5450
Wire Wire Line
	1800 5500 1800 5400
Text Label 7800 1900 0    60   ~ 0
B3-A
Text Label 7800 2200 0    60   ~ 0
B3-B
Text Label 7800 4200 0    60   ~ 0
B2-A
Text Label 7800 4500 0    60   ~ 0
B2-B
$EndSCHEMATC
