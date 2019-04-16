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

        if (timer % 2 == 1) {
            uc2_sys::toggleLedGreen();
        } 
        if (timer % 4 == 0 ) {
            uc2_sys::toggleLedRed();
        }
        
    }

    void app_handleUart0Byte (uint8_t b) {

    }

    void app_handleUart1Byte (uint8_t b) {

    }

    void app_handleSpiByte (uint8_t b) {
        
    }

}