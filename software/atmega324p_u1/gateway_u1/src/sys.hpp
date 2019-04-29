#ifndef SYS_H_
#define SYS_H_

#include "global.h"

#define F_CPU 12000000UL
#ifndef __AVR_ATmega324P__
    #define __AVR_ATmega324P__
#endif

#if GLOBAL_UC2_SYS_UART0_RECBUFSIZE > 255
  #error "Error: GLOBAL_UC2_SYS_UART0_RECBUFSIZE value over maximum (255)"
#endif

#if !defined(COMPILE)
    typedef unsigned char uint8_t;
    typedef unsigned short uint16_t;
    typedef unsigned long uint32_t;
    typedef signed char int8_t;
    typedef signed short int16_t;
    typedef signed long int32_t;
    #define pgm_read_byte(address_short) address_short
    #define boot_page_erase(address_short) address_short
    #define boot_page_write(address_short) address_short
    #define boot_page_fill(address_short, value) address_short
    // #define FDEV_SETUP_STREAM(handler, mem, type) {}
    #define fdev_setup_stream(stream, put, get, rwflag)
    #include <stdio.h>
    #include <string.h>
    // #include <ctype.h>
    // #include <stdlib.h>
    #include <avr/io.h>
    #include <avr/interrupt.h>
    #include <avr/wdt.h>
    #include <util/delay.h>
#else 
    #include <stdio.h>
    #include <string.h>
    #include <avr/io.h>
    #include <avr/interrupt.h>
    #include <avr/wdt.h>
    #include <util/delay.h>
    #include <avr/pgmspace.h>
#endif




// declarations

namespace uc1_sys {

    typedef uint8_t Sys_Event;

    enum Uart0Mode { OFF = 0, ModbusASCII = 1, STDOUT = 2, DEBUG = 4, MIXED = 8 };

    struct Sys {
        uint8_t flags;
        uint8_t taskErr_u8;
        Sys_Event  eventFlag;
        enum Uart0Mode uart0Mode;
        uint8_t *uart0Buf;
        uint8_t  uart0Size;
        uint8_t  uart0Typ;
        uint8_t  uart0DebugByte;
        uint8_t *uart1Buf;
        uint8_t  uart1Size;
        uint8_t  tccr1bInit;
        uint16_t ocr1aInit;
    };


    // declaration and definations



    // defines

    // SYS_FLAG_SREG_I must have same position as I-Bit in Status-Register!!
    #define SYS_FLAG_SREG_I          0x80

    // #define SYS_MODBUS_STATUS_ERR7      7
    // #define SYS_MODBUS_STATUS_ERR6      6
    // #define SYS_MODBUS_STATUS_ERR5      5
    // #define SYS_MODBUS_STATUS_ERR_FRAME 1
    // #define SYS_MODBUS_STATUS_NEWFRAME  0



    extern volatile struct Sys sys;

    // functions

    void init ();
    void initUart1(uint16_t baudrate, uint8_t t35x10);
    void main ();

    void saveSei ();
    void saveCli ();

    uint8_t   inc8BitCnt (uint8_t count);
    uint16_t  inc16BitCnt (uint16_t count);

    Sys_Event setEvent (Sys_Event event);
    Sys_Event clearEvent (Sys_Event event);
    Sys_Event isEventPending (Sys_Event event);

    void setLedRed (uint8_t on);
    void setLedGreen (uint8_t on);
    void setLedYellow (uint8_t on);
    void setPortA (uint8_t index);
    void clrPortA (uint8_t index);
    void toggleLedRed ();
    void toggleLedGreen ();
    void toggleLedYellow ();
    void togglePortA (uint8_t index);

    void setUart0Mode (enum Uart0Mode mode);
    void setUart1Ubrr1 (uint16_t ubrr1);
    void setUart1Ucsr1b (uint8_t ucsr1b);
    void setUart1Ucsr1c (uint8_t ucsr1c);
    void setUart1Ocr1a (uint16_t ocr1a);
    void setUart1Tccr1b (uint8_t tccr1b);
    
    enum Uart0Mode getUart0Mode ();
    uint16_t getUart1Ubrr1 ();
    uint8_t getUart1Ucsr1b ();
    uint8_t getUart1Ucsr1c ();
    uint16_t getUart1Ocr1a ();
    uint8_t getUart1Tccr1b ();

    void sendViaUart0 (uint8_t typ, uint8_t buf[], uint8_t size);
    void sendViaUart1 (uint8_t buf[], uint8_t size);

}

#endif // SYS_H_
