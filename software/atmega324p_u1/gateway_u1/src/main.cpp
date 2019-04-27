//***********************************************************************
// AIIT Template Level 3
// ----------------------------------------------------------------------
// Description:
//   UART-Support, Timer, Task-System, 7-Segment-Support, LCD-Support
// ----------------------------------------------------------------------
// Created: Aug 23, 2016 (SX)
//***********************************************************************

#include "global.h"
#include "sys.hpp"
#include "app.hpp"

// defines
// ...

// declarations and definations
// ...

// constants located in program flash and SRAM
const char MAIN_WELCOME[] = "\n\rmodbus-gateway";
const char MAIN_DATE[] = __DATE__;
const char MAIN_TIME[] = __TIME__;
const char MAIN_HELP[] = "\r\n";


int main () {
    uc1_sys::init();
    uc1_app::init();
    // uc1_sys::setUart0Mode(uc1_sys::STDOUT);
    printf("%s %s %s %s", MAIN_WELCOME, MAIN_DATE, MAIN_TIME, MAIN_HELP);
    printf("\r\n");
    
    uc1_sys::setUart0Mode(uc1_sys::ModbusASCII);
    // uc1_sys::setUart0Mode(uc1_sys::MIXED);
    // uc1_sys::setUart0Mode(uc1_sys::DEBUG);

    // enable interrupt system
    sei();

    while (1) {
        uc1_sys::main();
        uc1_app::main();
    }
    return 0;
}
