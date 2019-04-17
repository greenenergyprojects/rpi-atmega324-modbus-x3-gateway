#include "global.h"
#include "sys.hpp"
#include "app.hpp"

namespace uc2_app {

    // defines

    // declarations and definations



    // ------------------------------------------------------------------------

    void init (void) {
    }

    void main (void) {
    }

    //--------------------------------------------------------

    void task_1ms (void) {}
    void task_2ms (void) {}

    void task_4ms (void) {
    }

    void task_8ms (void) {
    }


    void task_16ms (void) {}
    void task_32ms (void) {}
    void task_64ms (void) {}

    void task_128ms (void) {
        static uint8_t timer = 0;
        timer = timer >= 8 ? 0 : timer + 1;

        if (timer == 0) {
            uc2_sys::setLedGreen(1);
        } 
        if (timer == 1 ) {
            uc2_sys::setLedGreen(0);
        }
        
    }

    void handleUart0Byte (uint8_t b) {

    }

    void handleUart1Byte (uint8_t b) {

    }

    uint8_t handleSpiByte (uint8_t b) {
        static uint16_t timer = 0;
        timer++;
        if (timer >= 4096) {
            uc2_sys::toggleLedYellow();
            timer = 0;
        }
        return ~b;
    }

}