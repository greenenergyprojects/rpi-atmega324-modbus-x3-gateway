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
    typedef unsigned long long uint64_t;
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

namespace uc2_sys {

    typedef uint8_t Sys_Event;

    enum Uart0Mode { OFF = 0, ModbusRTU = 1, STDOUT = 2, DEBUG = 4, MIXED = 8 };
    enum SpiMode { SPIMODE_MODBUS = 0, SPIMODE_STDOUT = 1, SPIMODE_MIXED = 2 };

    struct Spi {
        enum SpiMode mode;
        uint8_t toSendFromStdout;
    };

    struct Sys {
        uint8_t flags;
        uint8_t taskErr_u8;
        Sys_Event  eventFlag;
        struct Spi spi;
        enum Uart0Mode uart0Mode;
        uint8_t *uart0Buf;
        uint8_t  uart0Size;
        uint8_t  uart0Typ;
        uint8_t  uart0DebugByte;
        uint8_t  tccr1bInit;
        uint16_t ocr1aInit;
        uint8_t *uart1Buf;
        uint8_t  uart1Size;
        uint8_t  tccr2bInit;
        uint8_t  ocr2aInit;
        

    };


    // declaration and definations



    // defines

    // SYS_FLAG_SREG_I must have same position as I-Bit in Status-Register!!
    #define SYS_FLAG_SREG_I          0x80

    extern volatile struct Sys sys;

    // functions

    void init ();
    void initSpi(enum SpiMode mode);
    void initUart0(enum Uart0Mode mode, uint32_t baudrate, uint8_t t35x10);
    void initUart1(uint16_t baudrate, uint8_t t35x10);
    void main ();

    void saveSei ();
    void saveCli ();

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

    void setUart0Ubrr0 (uint16_t ubrr0);
    void setUart0Ucsr0b (uint8_t ucsr0b);
    void setUart0Ucsr0c (uint8_t ucsr0c);
    void setUart0Ocr1a (uint16_t ocr1a);
    void setUart0Tccr1b (uint8_t tccr1b);
    void setUart1Ubrr1 (uint16_t ubrr1);
    void setUart1Ucsr1b (uint8_t ucsr1b);
    void setUart1Ucsr1c (uint8_t ucsr1c);
    void setUart1Ocr2a (uint8_t ocr2a);
    void setUart1Tccr2b (uint8_t tccr2b);

    uint16_t getUart0Ubrr0 ();
    uint8_t getUart0Ucsr0b ();
    uint8_t getUart0Ucsr0c ();
    uint16_t getUart0Ocr1a ();
    uint8_t getUart0Tccr1b ();
    uint16_t getUart1Ubrr1 ();
    uint8_t getUart1Ucsr1b ();
    uint8_t getUart1Ucsr1c ();
    uint8_t getUart1Ocr2a ();
    uint8_t getUart1Tccr2b ();

    void  sendViaUart0 (uint8_t buf[], uint8_t size);
    void  sendViaUart1 (uint8_t buf[], uint8_t size);
}

#endif // SYS_H_
