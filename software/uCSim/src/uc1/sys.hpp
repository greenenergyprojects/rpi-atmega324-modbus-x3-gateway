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

    struct SysCpu {
        int sfirq;
        int udr0;
        int udr1;
    };

    struct SysResorces {
        pthread_mutex_t lock;
        struct SysCpu cpu;
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

    void      saveSei ();
    void      saveCli ();

    Sys_Event setEvent (Sys_Event event);
    Sys_Event clearEvent (Sys_Event event);
    Sys_Event isEventPending (Sys_Event event);

    void      setLedRed (uint8_t on);
    void      setLedGreen (uint8_t on);
    void      setLedYellow (uint8_t on);
    void      toggleLedRed ();
    void      toggleLedGreen ();
    void      toggleLedYellow ();

    void      sendViaUart0 (uint8_t typ, uint8_t buf[], uint8_t size);
    void      sendViaUart1 (uint8_t buf[], uint8_t size);

    void      uart0_isr (uint8_t receivedByte);
    void      uart1_isr (uint8_t receivedByte);
    void      uart1_timeout ();

    

}

#endif // UC1_SYS_H_
