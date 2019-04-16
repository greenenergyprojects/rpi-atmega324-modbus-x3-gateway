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
        uint8_t rbuffer_u8[GLOBAL_UC1_SYS_UART0_BITRATE];
    };

    struct Sys {
        uint8_t flags;
        uint8_t taskErr_u8;
        Sys_Event  eventFlag;
        struct Sys_Uart uart;
        struct Sys_Modbus modbus[1];
    };

    struct SysResorces {
        pthread_mutex_t lock;
        uint8_t ledGreen;
        uint8_t ledRed;
        uint8_t ledYellow;
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



    extern struct Sys sys;
    extern struct SysResorces res;

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

#endif // UC1_SYS_H_
