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

    struct Sys_Modbus {
        uint16_t dT1_35;
        uint16_t dT1_15;
        uint16_t errorCnt;
        uint16_t receivedByteCnt;
    };

    struct Sys_Uart {
        uint8_t rpos_u8;
        uint8_t wpos_u8;
        uint8_t errcnt_u8;
        uint8_t rbuffer_u8[GLOBAL_UC1_SYS_UART0_RECBUFSIZE];
    };

    struct Sys {
        uint8_t flags;
        uint8_t taskErr_u8;
        Sys_Event  eventFlag;
        struct Sys_Uart uart;
        struct Sys_Modbus modbus[1];
    };


    // declaration and definations



    // defines

    // SYS_FLAG_SREG_I must have same position as I-Bit in Status-Register!!
    #define SYS_FLAG_SREG_I          0x80

    #define SYS_MODBUS_STATUS_ERR7      7
    #define SYS_MODBUS_STATUS_ERR6      6
    #define SYS_MODBUS_STATUS_ERR5      5
    #define SYS_MODBUS_STATUS_ERR_FRAME 1
    #define SYS_MODBUS_STATUS_NEWFRAME  0



    extern volatile struct Sys sys;

    // functions

    void      init ();
    void      main ();

    void      sysSEI ();
    void      sysCLI ();

    uint8_t   inc8BitCnt (uint8_t count);
    uint16_t  inc16BitCnt (uint16_t count);

    void      newline (void);

    Sys_Event setEvent (Sys_Event event);
    Sys_Event clearEvent (Sys_Event event);
    Sys_Event isEventPending (Sys_Event event);

    uint8_t   uart_available ();
    int16_t   uart_getBufferByte (uint8_t pos);
    void      uart_flush ();

    void      setLedRed (uint8_t on);
    void      setLedGreen (uint8_t on);
    void      setLedYellow (uint8_t on);
    void      toggleLedRed ();
    void      toggleLedGreen ();
    void      toggleLedYellow ();

}

#endif // SYS_H_
