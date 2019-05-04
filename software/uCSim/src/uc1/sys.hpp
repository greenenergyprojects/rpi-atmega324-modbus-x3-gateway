#ifndef UC1_SYS_H_
#define UC1_SYS_H_

#if GLOBAL_UC1_SYS_UART0_RECBUFSIZE > 255
  #error "Error: GLOBAL_UC1_SYS_UART0_RECBUFSIZE value over maximum (255)"
#endif

#include <stdio.h>
#include <string.h>
#include <inttypes.h>
#include <pthread.h>
#include "global.h"

// declarations

namespace uc1_sys {

    typedef uint8_t Sys_Event;

    enum Uart0Mode { OFF = 0, ModbusASCII = 1, STDOUT = 2, DEBUG = 4, MIXED = 8 };

    struct Sys {
        uint8_t flags;
        uint8_t taskErr_u8;
        Sys_Event  eventFlag;
        // struct Sys_Uart uart;
    };

    struct SysCpu {
        int sfirq;
        int udr0;
        int udr1;
        uint8_t porta;
        uint16_t ocr1a;
        uint8_t tccr1b;
        uint8_t ubrr1h;
        uint8_t ubrr1l;
        uint8_t ucsr1a;
        uint8_t ucsr1b;
        uint8_t ucsr1c;
    };

    struct UartSent {
        uint16_t timer500usCnt;
        int (*handler)(const uint8_t *, int);
        void (*done)(uint8_t);
        uint16_t size;
        uint8_t *buffer;
    };

    struct SysResorces {
        pthread_mutex_t lock;
        struct SysCpu cpu;
        uint8_t ledGreen;
        uint8_t ledRed;
        uint8_t ledYellow;
        enum Uart0Mode uart0Mode;
        struct UartSent uart0Sent;
        struct UartSent uart1Sent;
    };


    // declaration and definations



    // defines

    // SYS_FLAG_SREG_I must have same position as I-Bit in Status-Register!!
    #define SYS_FLAG_SREG_I  0x80

    extern struct Sys sys;
    extern struct SysResorces res;

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

    void  sendViaUart0 (uint8_t typ, uint8_t buf[], uint8_t size);
    void  sendViaUart1 (uint8_t buf[], uint8_t size);

    // for simulation
    void  uart0_isr (uint8_t receivedByte);
    void  uart1_isr (uint8_t receivedByte);
    void  uart1_timeout ();
}

#endif // UC1_SYS_H_
