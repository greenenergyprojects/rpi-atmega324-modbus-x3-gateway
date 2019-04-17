#ifndef UC2_APP_H_
#define UC2_APP_H_

// declarations

#include "sys.hpp"




// defines

#define APP_EVENT_0   0x01
#define APP_EVENT_1   0x02
#define APP_EVENT_2   0x04
#define APP_EVENT_3   0x08
#define APP_EVENT_4   0x10
#define APP_EVENT_5   0x20
#define APP_EVENT_6   0x40
#define APP_EVENT_7   0x80


// functions
namespace uc2_app {

    struct App {
        uint8_t flags_u8;
        char    modbus1_buffer[2];
    };

    extern struct App app;

    void init ();
    void main ();

    void task_1ms   ();
    void task_2ms   ();
    void task_4ms   ();
    void task_8ms   ();
    void task_16ms  ();
    void task_32ms  ();
    void task_64ms  ();
    void task_128ms ();

    void handleUart0Byte (uint8_t b);
    void handleUart1Byte (uint8_t b);
    uint8_t handleSpiByte (uint8_t b);

}

#endif  // UC2_APP_H_
