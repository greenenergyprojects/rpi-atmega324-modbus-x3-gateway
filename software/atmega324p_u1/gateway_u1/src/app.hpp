#ifndef UC1_APP_H_
#define UC1_APP_H_


#include "sys.hpp"

// declarations

// defines

#define APP_VERSION_MAJOR 1
#define APP_VERSION_MINOR 0

#define UC1_APP_MODBUS_DEVICE_ADDRESS 128
#define UC1_B1_MODBUS_DEVICE_ADDRESS  1

#define UC1_APP_EVENT_0   0x01
#define UC1_APP_EVENT_1   0x02
#define UC1_APP_EVENT_2   0x04
#define UC1_APP_EVENT_3   0x08
#define UC1_APP_EVENT_4   0x10
#define UC1_APP_EVENT_5   0x20
#define UC1_APP_EVENT_6   0x40
#define UC1_APP_EVENT_7   0x80



// functions
namespace uc1_app {

    enum Uart0State { DISABLED = 0, CHECK_UART0 = 1, CHECK_UART1 = 2, CHECK_UART23 = 3, SEND_UART0 = 5, SEND_UART1 = 6, SEND_UART23 = 7 };
    enum ModbusBufferState { 
        Idle = 0,
        RequestInProgress = 1,
        RequestReady = 2,
        WaitForResponse = 4,
        ResponseInProgress = 8,
        ResponseReady = 16
    };


    struct Spi {
        uint8_t timerLed;
        uint8_t cntSent;
        uint8_t toSend;
    };

    struct ModbusBuffer {
        uint8_t errCnt;
        enum ModbusBufferState state;
        uint8_t size;
        uint8_t buffer[];
    };

    struct ModbusBufferLocal {
        uint8_t errCnt;
        enum ModbusBufferState state;
        uint8_t size;
        uint8_t buffer[29];
    };
    
    struct ModbusBufferUart1 {
        uint8_t errCnt;
        enum ModbusBufferState state;
        uint8_t size;
        uint8_t buffer[254];
    };

    struct ModbusBufferSpi {
        uint8_t errCnt;
        enum ModbusBufferState state;
        uint8_t size;
        uint8_t buffer[254];
    };

    struct ModbusLocal {
        struct ModbusBufferLocal buffer;
    };

    struct ModbusUart1 {
        struct ModbusBufferUart1 buffer;
    };

    struct ModbusSpi {
        struct ModbusBufferSpi buffer;
    };

    struct Modbus {
        uint8_t localAddress;
        uint8_t unlocked;
        uint8_t rIndex;
        uint8_t rAddr[2];
        uint8_t addresses[6];
        uint8_t errCnt;
        uint8_t ocr1a;
        
        struct ModbusLocal local;
        struct ModbusUart1 uart1;
        struct ModbusSpi   spi;
    };


    struct App {
        uint8_t         errCnt;
        struct Spi      spi;
        struct Modbus   modbus;
        enum Uart0State uart0State;
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

    void    uart0ReadyToSent (uint8_t typ, uint8_t err);
    void    uart1ReadyToSent (uint8_t err);
    void    handleUart0Byte (uint8_t b);
    void    handleUart1Byte (int16_t b);
    uint8_t handleSpiByte (uint8_t b);

}

#endif  // UC1_APP_H_
