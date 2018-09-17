# rpi-atmega324-modbus-x3-gateway

This project implements a Modbus Gateway.  

The device is a gateway between Modbus-TCP (via TCP/IP on Raspberry) to Modbus-RTU (RS-485).
Modbus-TCP frames are send via the Raspberry UART interface (115200 Bit/s) to one microcontroller as Modbus-ASCII frame.
The microcontroller converts the Modbus-ASCII to Modbus-RTU frame and is handling all real time needs of the
Modbus-RTU standard. Frames for the other two Modbus interfaces are send via SPI interface to the second microcontroller.

**Features:**

* 3 interfaces Modbus-RTU
* 2 Microcontrollers (Atmgea324P)
* Raspberry PI
* For DIN-rail housing [Camdenboss CBRPP-DR-CLR](https://www.camdenboss.com/camden-boss/cbrpi-dr-2-3-clr-pi-b%2c-p2%2c-p3-din-rail-enclosure/c-23/p-16101)  
(W x H x D = 88mm x 90mm x 58mm; 4.8 DIN rails units)

