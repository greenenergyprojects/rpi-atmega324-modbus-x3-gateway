#include "global.h"
#include "sys.hpp"
#include "app.hpp"

#include <string.h>

namespace uc1_app {

    struct App app;

    // defines

    // declarations and definations
    char dec2Hex (uint8_t dec);


    // ------------------------------------------------------------------------

    void init (void) {
        memset(&app, 0, sizeof app);
        app.uart0State = CHECK_UART0;
        app.modbus.localAddress = UC1_APP_MODBUS_DEVICE_ADDRESS;
        // local modbus device address
        app.modbus.addresses[0] = dec2Hex(app.modbus.localAddress >> 4);
        app.modbus.addresses[1] = dec2Hex(app.modbus.localAddress & 0x0f);
        
        // device addresses for Modbus B1 (UART1)
        app.modbus.addresses[2] = dec2Hex(UC1_B1_MODBUS_DEVICE_ADDRESS >> 4);
        app.modbus.addresses[3] = dec2Hex(UC1_B1_MODBUS_DEVICE_ADDRESS & 0x0f);
        app.modbus.addresses[4] = 'A'; app.modbus.addresses[5] = '0';

        uc1_sys::initUart1(9600, 35);
    }

    // pCnt == NULL -> add id to errorIds
    void incErrCnt8 (uint8_t id, uint8_t *pCnt) {
        if (pCnt != NULL) {
            if (app.errCnt < 0xffff) {
                app.errCnt++;
            }
            if (*pCnt < 0xff) {
                (*pCnt)++;
            }
        }
        if (app.debug.errorIdsIndex < sizeof(app.debug.errorIds)) {
            app.debug.errorIds[app.debug.errorIdsIndex++] = id;
        }
    }


    void setState (struct ModbusBuffer *p, ModbusBufferState newState) {
        // ("U1: U2: modbus state = %d\n", newState);
        p->state = newState;
    }

    int8_t hex2Dec (uint8_t hex) {
        if (hex >= '0' && hex <= '9') {
            return hex - '0';
        } else if (hex >= 'A' && hex <= 'F') {
            return hex - 'A' + 10;
        } else {
            return -1;
        }
    }

    char dec2Hex (uint8_t dec) {
        if (dec >= 0 && dec <= 9) {
            return dec + '0';
        } else if (dec <= 15) {
            return dec - 10 + 'A';
        } else {
            return 0;
        }
    }


    uint16_t modbusUpdateCRC (uint8_t b, uint16_t crc) {
        uint8_t i;
 
        crc = crc ^ (uint16_t)b;
        for (i=0; i<8; i++) {
            if (crc & 0x0001) {
                crc = (crc >> 1) ^ 0xa001;
            } else {
                crc = crc >> 1;
            }
        }
        
        return crc;
    }


    uint8_t modbusAsciToRtu (uint8_t buf[], uint8_t maxSize) {
        if (buf[0] != ':') {
            return 0;
        }

        uint8_t index = 0;
        uint8_t lrc = 0;
        uint16_t crc = 0xffff;

        for (uint8_t i = 1; i < maxSize; i += 2) {
            uint8_t bh = buf[i];
            uint8_t bl = buf[i+1];
            int8_t h = hex2Dec(bh);
            int8_t l = hex2Dec(bl);
            if (h < 0 || l < 0) { return 0; }
            uint8_t b = h * 16  + l;
            
            if (buf[i + 2] == '\r') {
                if (buf[i + 3] == '\n') {
                    lrc = (uint8_t)( -(int8_t)lrc);
                    if (lrc != b) {
                        return 0; // LRC error
                    }
                    buf[index++] = crc & 0xff;
                    buf[index++] = crc >> 8;
                    return index;
                }
                return 0;
            
            } else {
                buf[index++] = b;
                lrc = lrc + bh + bl;
                crc = modbusUpdateCRC(b, crc);
            }
        }

        return 0;
    }

    
    uint8_t modbusRtuToAscii (uint8_t buf[], uint8_t size, uint8_t maxSize, uint8_t checkCrc) {
        if ((2 * size) > maxSize) { return 0; }
        uint8_t lrc = 0;
        
        uint16_t crc = 0xffff;
        if (checkCrc) {
            for (uint8_t i = 0; i < size; i++) {  
               crc = modbusUpdateCRC(buf[i], crc);
            }
        } else {
            crc = 0x0000;
        }

        for (uint8_t i = size - 2; i > 0; i--) {
            uint8_t b = buf[i - 1];
            char bl = dec2Hex(b & 0x0f);
            char bh = dec2Hex(b >> 4);
            lrc = lrc + bl + bh;
            buf[i * 2] = bl;
            buf[i * 2 - 1] = bh;
        }
        lrc = (uint8_t)(-(int8_t)lrc);

        if (crc != 0x0000) {
            lrc++;
        }

        buf[0] = ':';
        uint8_t i = size * 2 - 3;
        buf[i++] = dec2Hex(lrc >> 4);
        buf[i++] = dec2Hex(lrc & 0x0f);
        buf[i++] = '\r';
        buf[i++] = '\n';
        
        return i;
    }


    uint8_t modbusRTUToMei (struct ModbusBuffer *p) {
        if (p->size < 4) {
            return 0;
        }
        uint8_t *buf = p->buffer;
        p->mei.functionCode = 0;
        if (p->buffer[1] == 43) { // Function code 43 = 0x2b -> Encapsulated Interface Transport
            if (p->buffer[2] == 1) { // AE Conversion protocol
                p->mei.deviceAddress = p->buffer[0];
                p->mei.functionCode = p->buffer[1];
                p->mei.meiType = 1;
                for (uint8_t i = 0; i < (p->size - 5); i++) {
                    p->buffer[i] = p->buffer[i + 3];
                }
                p->size = p->size - 5;
            }
        }
        return p->size;
    }

    uint8_t modbusMei2ModbusRtu (struct ModbusBuffer *p, uint8_t maxSize) {
        if (p->mei.functionCode != 43) {
            return p->size;
        }

        printf("  -> MEI: ");
        for (uint8_t i = 0; i < p->size; i++) {
            printf(" %02x", p->buffer[i]);
        }
        printf("\r\n");
        printf(" U1 MEI  -> ");
        uint8_t space = 0;
        for (uint8_t i = 0; i < p->size - 2; i++) {
            char c = p->buffer[i];
            if (c < ' ' || c > 126) { c = '.'; }
            // if (c != ' ' || space == 0) {
            //     printf("%c", c);
            // }
            printf("%c", c);
            space = (c == ' ') ? space + 1 : 0;
        }
        printf("\r\n");

        if (maxSize < (p->size + 5)) {
            p->buffer[0] = p->mei.deviceAddress;
            p->buffer[1] = p->mei.functionCode | 0x80;
            p->buffer[2] = 0x05; // Exception code for "out of memory";
            return 3;
        }
        for (uint8_t i = p->size; i > 0; i--) {
            p->buffer[i + 3] = p->buffer[i];
        }
        p->buffer[3] = p->buffer[0];
        p->buffer[2] = p->mei.meiType;
        p->buffer[1] = p->mei.functionCode;
        p->buffer[0] = p->mei.deviceAddress;
        
        p->size = p->size + 3;
        uint16_t crc = 0xffff;
        for (uint8_t i = 0; i < p->size; i++) {
            crc = modbusUpdateCRC(p->buffer[i], crc);
        }
        p->buffer[p->size++] = crc & 0xff;
        p->buffer[p->size++] = crc >> 8;
        return p->size; 
    }


    uint8_t executeModbusReadHoldRegisters (uint8_t buf[]) {
        app.modbus.unlocked = 0;
        uint8_t rv = 3;
        uint16_t addr = ((uint16_t)buf[2] << 8) + buf[3];
        uint16_t quantity  = ((uint16_t)buf[4] << 8) + buf[5];
        if (quantity < 1 || quantity > 0x7d) {
            buf[1] |= 0x80;
            buf[2] = 0x03; // Exception code: quantity out of range
            return 3;
        }
        buf[2] = quantity * 2;
        uint8_t i;

        for (i = 3; quantity > 0; quantity--, addr++, i++) {
            switch (addr) {
                case 0: {
                    buf[i++] = APP_VERSION_MAJOR;
                    buf[i]  = APP_VERSION_MINOR;
                    break;
                }

                case 1: {
                    buf[i++] = uc1_sys::sys.taskErr_u8;
                    buf[i] = app.errCnt;
                    break;
                }

                case 2: {
                    buf[i++] = 0;
                    buf[i] = app.modbus.errCnt;
                    break;
                }
                
                case 3: {
                    buf[i++] = 0;
                    buf[i] = app.modbus.local.buffer.errCnt;
                    break;
                }

                case 4: {
                    buf[i++] = 0;
                    buf[i] = app.modbus.uart1.buffer.errCnt;
                    break;
                }

                case 10: {
                    buf[i++] = 0;
                    buf[i] = uc1_sys::getUart0Mode();
                    break;
                }

                case 11: {
                    buf[i++] = uc1_sys::getUart1Ucsr1c(); // app.modbus.uart1Config.ucsr1c;
                    buf[i] = uc1_sys::getUart1Ubrr1() & 0xff; //app.modbus.uart1Config.ubrr1l;
                    break;
                }

                case 12: {
                    uint16_t ocr1a = uc1_sys::getUart1Ocr1a();
                    buf[i++] = ocr1a >> 8; // app.modbus.uart1Config.ocr1a;
                    buf[i] = ocr1a & 0xff; // app.modbus.uart1Config.tccr1b;
                    break;                     
                }

                case 13: {
                    buf[i++] = 0;
                    buf[i] = uc1_sys::getUart1Tccr1b(); // app.modbus.uart1Config.tccr1b;
                    break;                     
                }


                case 18: case 19: case 20: {
                    uint8_t index = (addr - 18) * 2;
                    buf[i++] = app.modbus.addresses[index];
                    buf[i] = app.modbus.addresses[index + 1];
                    break;
                }

                default: {
                    if (addr > 20) {
                        buf[1] |= 0x80;
                        buf[2] = 0x02; // Exception code: address out of range
                        return 3;
                    } else {
                        buf[i++] = 0;
                        buf[i] = 0;
                    }
                }
            }
            rv += 2;
        }
        return rv;
    }

    uint8_t executeModbusWriteHoldRegister (uint8_t buf[]) {
        uint8_t rv = 5;
        uint16_t addr = ((uint16_t)buf[2] << 8) + buf[3];
        uint8_t valueHigh = buf[4];
        uint8_t valueLow = buf[5];
        uint8_t unlocked = app.modbus.unlocked;
        app.modbus.unlocked = 0;
        uint8_t i;

        switch (addr) {
            case 0: {
                uc1_sys::sys.taskErr_u8 = 0;
                app.errCnt = 0;
                app.modbus.errCnt = 0;
                app.modbus.local.buffer.errCnt = 0;
                app.modbus.uart1.buffer.errCnt = 0;
                if (valueHigh == 0x34 && valueLow == 0x12) {
                    app.modbus.unlocked = 1;
                }
                break;
            }

            case 1: {
                uc1_sys::sys.taskErr_u8 = 0;
                app.errCnt = 0;
                break;
            }

            case 2: {
                app.modbus.errCnt = 0;
                break;
            }

            case 3: {
                app.modbus.local.buffer.errCnt = 0;
                break;
            }

            case 4: {
                app.modbus.uart1.buffer.errCnt = 0;
                break;
            }

            case 10: {
                uc1_sys::setUart0Mode((uc1_sys::Uart0Mode) valueLow);
                break;
            }

            case 11: {
                uc1_sys::setUart1Ucsr1c(valueHigh);
                uc1_sys::setUart1Ubrr1(valueLow);
                break;
            }

            case 12: {
                uc1_sys::setUart1Ocr1a(valueHigh << 8 | valueLow);
                break;                     
            }

            case 13: {
                uc1_sys::setUart1Tccr1b(valueLow);
                break;                     
            }

            case 18: {
                // local address change not allowed
                // if (unlocked) {
                //     app.modbus.addresses[0] = valueLow;
                //     app.modbus.addresses[1] = valueHigh;
                // }
                break;
            }

            case 19: case 20: {
                uint8_t index = (addr - 18) * 2;
                if (unlocked) {
                    app.modbus.addresses[index + 1] = valueLow;
                    app.modbus.addresses[index] = valueHigh;
                }
                break;
            }
            

            default: {
                buf[1] |= 0x80;
                buf[2] = 0x02; // Exception code: address out of range
                return 3;
            }
        }

        return rv;
    }


    uint8_t parseModbusRequest (uint8_t buf[], uint8_t size) {
        if (buf[0] != app.modbus.localAddress) {
            return 0;
        }
        uint8_t rv = 0;
        switch (buf[1]) {
            case 0x03: {
                if (size == 8) {
                    rv = executeModbusWriteHoldRegister (buf);
                }
                break;
            }

            case 0x06: {
                if (size == 8) {
                    rv = executeModbusReadHoldRegisters (buf);
                }
                break;
            }

            default: {
                buf[1] = buf[1] | 0x80;
                buf[2] = 0x01; // Exception code: Function code not supported
                rv = 3;
                break;
            }
        }
        return rv;
    }



    void main (void) {
        if (app.modbus.local.buffer.state == RequestReady) {
            struct ModbusBuffer *p = (struct ModbusBuffer *)&app.modbus.local.buffer;
            uint8_t size = modbusAsciToRtu(p->buffer, sizeof app.modbus.local.buffer.buffer);
            if (size > 0) {
                // size = modbusRtuToAscii(app.modbus.local.buffer.buffer, size, sizeof app.modbus.local.buffer.buffer, 1);
                setState(p, ResponseInProgress);
                size = parseModbusRequest(p->buffer, size);
            }
            if (size > 0) {
                size = modbusRtuToAscii(p->buffer, size + 2, sizeof app.modbus.local.buffer.buffer, 0);
            }
            if (size >0) {
                setState(p, ResponseReady);
                uc1_sys::sendViaUart0(0, app.modbus.local.buffer.buffer, size);
            } else {
                incErrCnt8(0x11, &p->errCnt);
                p->size = 0;
                setState(p, Idle);
            }

        } else if (app.modbus.uart1.buffer.state == RequestReady) {
            struct ModbusBuffer *p = (struct ModbusBuffer *)&app.modbus.uart1.buffer;
            p->size = modbusAsciToRtu(p->buffer, sizeof app.modbus.uart1.buffer.buffer);
            uint8_t size = modbusRTUToMei(p);    
            if (size < 4) {
                incErrCnt8(0x21, &p->errCnt);
                p->size = 0;
                setState(p, Idle);

            } else {
                // for (uint8_t i = 0; i < size; i++) {
                //     printf("%02x ", app.modbus.uart1.buffer.buffer[i]);
                // }
                // printf(" -> ");
                uc1_sys::sendViaUart1(p->buffer, size);
                setState(p, SendingRequest);
            }

        } else if (app.modbus.uart1.buffer.state == ResponseReady) {
            struct ModbusBuffer *p = (struct ModbusBuffer *)&app.modbus.uart1.buffer;
            // printf("size=%d = ", p->size);
            // for (uint8_t i = 0; i < p->size; i++) {
            //     printf("%02x ", app.modbus.uart1.buffer.buffer[i]);
            // }
            // printf(" -> ");

            uint8_t size = modbusMei2ModbusRtu(p, sizeof app.modbus.uart1.buffer.buffer);
            size = modbusRtuToAscii(p->buffer, size, sizeof app.modbus.uart1.buffer.buffer, 1);
            if (size == 0) {
                incErrCnt8(0x31, &p->errCnt);
                p->size = 0;
                setState(p, Idle);
            } else {
                // for (uint8_t i = 0; i < size; i++) {
                //     printf("%c", app.modbus.uart1.buffer.buffer[i]);
                // }
                // printf("\r\n");
                uc1_sys::sendViaUart0(1, p->buffer, size);
                setState(p, SendingRequest);
            }
            
        } else if (app.modbus.uart1.buffer.state == RequestForTest) {
            struct ModbusBuffer *p = (struct ModbusBuffer *)&app.modbus.uart1.buffer;
            printf(" TEST: size=%d ->", p->size);
            for (uint8_t i = 0; i < p->size; i++) {
                uint8_t b = p->buffer[i];
                printf(" %02x ", b);
            }
            printf(" = '");
            for (uint8_t i = 0; i < p->size; i++) {
                uint8_t b = p->buffer[i];
                char c = '.';
                if (b >= 32 && b < 127) {
                    c = (char)b;
                }
                printf("%c", c);
            }
            printf("'\r\n");

            uc1_sys::sendViaUart1(app.modbus.uart1.buffer.buffer, p->size);
            setState(p, SendingRequest);

        } else if (app.modbus.spi.buffer.state == ResponseReady) {
            struct ModbusBuffer *p = (struct ModbusBuffer *)&app.modbus.spi.buffer;
            if (p->size == 0) {
                incErrCnt8(0x41, &p->errCnt);
                p->size = 0;
                setState(p, Idle);
            } else {
                printf("SPI Response Ready: ");
                for (uint8_t i = 0; i < p->size; i++) {
                    printf(" %02x", p->buffer[i]);
                }
                printf("\n\r");
                uc1_sys::sendViaUart0(2, p->buffer, p->size);
                setState(p, SendingRequest);                
            }
        }

        if (uc1_sys::clearEvent(APP_EVENT_PRINTSTATUS)) {
        //     printf("\n\n\rStatus:\n\r");
        //     printf("  sysTime: %ddays %dhrs %dmin %dsecs %dms\n\r", 
        //         app.sysTime.day, app.sysTime.hour, app.sysTime.min, app.sysTime.sec, app.sysTime.ms );
        //     printf("  app.errCnt: %04x\n\r", app.errCnt);
        //     printf("  app.modbus.errCnt: %02x\n\r", app.modbus.errCnt); app.modbus.errCnt = 0;
        //     for (uint8_t i = 0; i < 3; i++) {
        //         struct ModbusBuffer *p;
        //         switch (i) {
        //             case 0: printf("  modbus.local: "); p = (struct ModbusBuffer *) &app.modbus.local.buffer; break;
        //             case 1: printf("  modbus.uart1: "); p = (struct ModbusBuffer *) &app.modbus.uart1.buffer; break;
        //             case 2: printf("  modbus.spi: "); p = (struct ModbusBuffer *) &app.modbus.spi.buffer; break;
        //         }
        //         printf("errCnt=%02x ", p->errCnt); p->errCnt = 0;
        //         printf("frameCnt=%02x ", p->frameCnt);
        //         printf("state=%02x ", p->state);
        //         printf("size=%02x ", p->size);
        //         printf("\n\r");
        //     }
            // if (app.debug.errorIdsIndex > 0) {
            //     printf("  error Ids: ");
            //     for (uint8_t i = 0; i < app.debug.errorIdsIndex; i++) {
            //         printf("%02x ", app.debug.errorIds[i]);
            //     }
            //     app.debug.errorIdsIndex = 0;
            //     printf("\n\r");
            // }
        }

        // if (uc1_sys::clearEvent(APP_EVENT_DEBUG)) {
        //     if (app.debug.index > 0) {
        //         printf("SPI (%d):", app.debug.index);
        //         for (uint8_t i = 0; i < app.debug.index; i++) {
        //             printf(" %02x", app.debug.buffer[i]);
        //         }
        //         printf("\n\r");
        //         app.debug.index = 0;
        //     }
        // }


    }


    // --------------------------------------------------------

    void task_1ms () {
        cli();
        struct SysTime *p = &app.sysTime;
        if (p->ms < 999) {
            p->ms++;
        } else if (p->sec < 59) {
            p->ms = 0;
            p->sec++;
        } else if (p->min < 59) {
            p->ms = 0;
            p->sec = 0;
            p->min++;
        } else if (p->hour < 23) {
            p->ms = 0;
            p->sec = 0;
            p->min = 0;
            p->hour++;
        } else {
            p->ms = 0;
            p->sec = 0;
            p->min = 0;
            p->hour = 0;
            p->day++;
        }
        sei();
    }

    void task_2ms () {}

    void task_4ms () {
        static uint8_t timer = 0;
        timer++;
        if (app.debug.errorIdsIndex == 0) {
            uc1_sys::setLedRed(0);
        } else {
            uc1_sys::setLedRed(timer >= 0xe0);
        }

        if (app.spi.timerLed > 0) {
            app.spi.timerLed--;
            uc1_sys::setLedYellow(app.spi.timerLed > 0x10);
        }
    }

    void task_8ms () {

    }

    void task_16ms () {}
    void task_32ms () {}
    void task_64ms () {}

    void task_128ms () {
        static uint8_t timer = 0;
        timer = timer >= 10 ? 0 : timer + 1;
        if (timer == 0) {
            uc1_sys::setEvent(APP_EVENT_PRINTSTATUS);
            uc1_sys::setLedGreen(1);
            // strcpy((char *)uc1_app::app.modbus.uart1.buffer.buffer, ":010300000004B8\r\n");
            // app.modbus.uart1.buffer.size = 17;
            // setState(&app.modbus.uart1.buffer, RequestReady);
            
            static uint8_t invAddr = 20;
            static uint8_t step = 0;
            static uint8_t repCnt = 0;
            uint8_t i = 0;
            char saddr[3];

            char cmd;
            switch (step) {
                case 0: cmd = '0'; break;
                case 1: cmd = '9'; break;
                case 2: cmd = 'P'; break;
                case 3: cmd = 'F'; break;
                default: cmd = '9'; step = 0; break;
            }
            sprintf(saddr, "%02d", (int)invAddr);
            uc1_app::app.modbus.uart1.buffer.mei.deviceAddress = 0x01;
            uc1_app::app.modbus.uart1.buffer.mei.functionCode = 43;
            uc1_app::app.modbus.uart1.buffer.mei.meiType = 0x01;
            uc1_app::app.modbus.uart1.buffer.buffer[i++] = '#';
            uc1_app::app.modbus.uart1.buffer.buffer[i++] = saddr[0];
            uc1_app::app.modbus.uart1.buffer.buffer[i++] = saddr[1];
            uc1_app::app.modbus.uart1.buffer.buffer[i++] = cmd;
            uc1_app::app.modbus.uart1.buffer.buffer[i++] = '\r';
            uc1_app::app.modbus.uart1.buffer.size = i;
            
            switch (invAddr) {
                // case 27: step++; break;  // West (South)
                // case 28: step++; break;  // Werst (Mid)
                // case 29: step++; break;  // West (North)
                // case 31: step++; break;  // East (North)
                // case 32: step++; break;  // East (South)
                default: step = 4; break;
                // default: step++; break;
            }
            if (step > 3) {
                repCnt++;
                if (repCnt >= 0) {
                    repCnt = 0;
                    invAddr++;
                }
                if (invAddr > 32) {
                    invAddr = 1;
                }
                step = 0;
            }
            setState((struct ModbusBuffer *)&uc1_app::app.modbus.uart1.buffer, uc1_app::RequestForTest);

            // 23  32  39  39  0d 
            // 0A 2A 32 39 39 20 35 30 30 2D 39 30 20 39 0D => \n*299 500-90 Chksum 39
            
            // 23  33  32  39  0d
            // 0A 2A 33 32 39 20 35 30 30 2D 39 30 20 33 0D => \n*329 500-90 Checksum 33


            // 0A 2A 32 38 30 20 20 20 30 20 20 20 30 2E 30 20 20 30 2E 30 30 20 20 20 20 20 30 20 20 37 33 2E 33 20 20 30 2E 30 31 20 20 20 20 20 30 20 20 35 30 20 20 20 20 20 20 30 20 9F 0D 60 
            //        2  8  0           0              .  0           .  0  0                 0        7  3  .  3        0  .  0  1                 0        5  0                    0
        } 
        if (timer == 1 ) {
            uc1_sys::setLedGreen(0);
        }

    }


    void uart0ReadyToSent (uint8_t typ, uint8_t err) {
        struct ModbusBuffer *p = NULL;
        switch (typ) {
            case 0: p = (struct ModbusBuffer *)&app.modbus.local.buffer; break;
            case 1: p = (struct ModbusBuffer *)&app.modbus.uart1.buffer; break;
            case 2: p = (struct ModbusBuffer *)&app.modbus.spi.buffer; break;
        }

        if (p != NULL) {
            if (err) {
                incErrCnt8(0x51, &p->errCnt); 
                incErrCnt8(err, NULL); 
            }
            p->size = 0;
            setState(p, Idle);
        }
    }


    void uart1ReadyToSent (uint8_t err) {
        struct ModbusBuffer *p = (struct ModbusBuffer *)&app.modbus.uart1.buffer;
        if (err) {
            incErrCnt8(0x61, &p->errCnt); 
            p->size = 0;
            setState(p, Idle);
        } else {
            setState(p, WaitForResponse);
        }
        p->size = 0;
    }


    int8_t addByteToModbusBuffer (uint8_t b, struct ModbusBuffer *pmb, uint8_t maxSize) {
        if (pmb->size >= maxSize) {
            incErrCnt8(0x71, &pmb->errCnt);
            return -1;
        }
        uint8_t index = pmb->size;
        if (index >= maxSize) {
            index = index - maxSize;
        }
        pmb->buffer[index] = b;
        pmb->size++;
        return 0;
    }


    void handleModbusByte (uint8_t b) {
        struct Modbus *pm = &app.modbus;
        struct ModbusBuffer *pmb = NULL;
        uint8_t maxSize = 0;

        if (b == ':') {
            // start of Modbus-ASCII frame
            if (pm->rIndex > 0) {
                incErrCnt8(0x81, &pm->errCnt);
            }
            pm->rIndex = 1;

        
        } else if (pm->rIndex > 0 && ((b >= '0' && b <= '9') || (b >= 'A' && b <= 'F') || b == '\r' || b == '\n')) {
            // Modbus-ASCII frame byte
            if (pm->rIndex < 3) {
                pm->rAddr[pm->rIndex - 1] = b;
            } else {

                for (uint8_t i = 0; i < sizeof pm->addresses; i += 2) {
                    if (pm->addresses[i + 1] == pm->rAddr[1] && pm->addresses[i] == pm->rAddr[0]) {
                        if (i == 0) {
                            pmb = (struct ModbusBuffer *)&pm->local.buffer;
                            maxSize = sizeof pm->local.buffer.buffer;
                        } else {
                            pmb = (struct ModbusBuffer *)&pm->uart1.buffer;
                            maxSize = sizeof pm->uart1.buffer.buffer;
                        }
                        break;
                    }
                }

                if (pmb != NULL) {
                    if (pm->rIndex == 3) {
                        if (pmb->state != Idle) {
                            incErrCnt8(0x82, &pm->errCnt);
                        }
                        setState(pmb, RequestInProgress);
                        pmb->size = 0;
                        addByteToModbusBuffer(':', pmb, maxSize); 
                        addByteToModbusBuffer(pm->rAddr[0], pmb, maxSize); 
                        addByteToModbusBuffer(pm->rAddr[1], pmb, maxSize); 
                    }
                    addByteToModbusBuffer(b, pmb, maxSize);
                }
            }

            if (b == '\n') {
                pm->rIndex = 0;
                if (pmb != NULL) {
                    setState(pmb, RequestReady);
                    // frame handling is done by main loop
                }
            
            } else if (pm->rIndex < 0xff) {
                pm->rIndex++;
            }


        } else {
            // Error: invalid byte value
            incErrCnt8(0x83, &pm->errCnt);
            pm->rIndex = 0;
        }
    }

    void handleDebugByte (uint8_t b) {

    }


    void handleUart0Byte (uint8_t b) {
        app.spi.toSend = b;
        if (app.spi.timerLed == 0 ) {
            app.spi.timerLed = 0xff;
        }
        if (b < 0x80) {
            handleModbusByte(b);
        } else {
            handleDebugByte(b & 0x7f);
        }
    }

    void handleUart1Byte (int16_t b) {
        struct ModbusBuffer *p = (struct ModbusBuffer *)&app.modbus.uart1.buffer; 
        if (p->state != WaitForResponse) {
            // printf("Error: handleUart1Byte %02x\n\r", b);
            incErrCnt8(0x91, &p->errCnt);
        } else if (b >= 0 && b <= 255){
            if (p->size >= sizeof app.modbus.uart1.buffer.buffer) {
                incErrCnt8(0x92, &p->errCnt);
            } else {
                p->buffer[p->size++] = (uint8_t)b;
            }
        } else {
            setState(p, ResponseReady);
        }
    }

    uint8_t handleSpiByte (uint8_t b) {
        if (b > 0) {
            
            struct ModbusBuffer *p = (struct ModbusBuffer *)&app.modbus.spi.buffer;
            if (b == ':') {
                if (p->size > 0) {
                    incErrCnt8(0xa1, &p->errCnt);
                }
                p->buffer[0] = b;
                p->size = 1;
            } else {
                if (p->size >= sizeof(app.modbus.spi.buffer.buffer)) {
                    incErrCnt8(0xa2, &p->errCnt);
                    p->buffer[p->size - 1] = b;
                } else {
                    p->buffer[p->size++] = b;
                }
                if (b == '\n') {
                    if (p->frameCnt < 0xff) {
                        p->frameCnt++;
                    }
                    setState(p, ResponseReady);
                }
            }
        }
        uint8_t rv = app.spi.toSend;
        app.spi.toSend = 0;
        if (rv > 0 && app.spi.cntSent < 0xff) {
           app.spi.cntSent++;
        }
        if (app.spi.timerLed == 0) {
            if (app.spi.cntSent > 0) {
                app.spi.cntSent = 0;
                app.spi.timerLed = 0xff;
            } else {
                app.spi.timerLed = 0x12;
            }
        }

        if (app.debug.index < sizeof(app.debug.buffer) ) {
            if (rv > 0) {
                app.debug.buffer[app.debug.index++] = rv;
            }
            if (rv == '\n') {
                uc1_sys::setEvent(APP_EVENT_DEBUG);
            }
        }

        return rv;
    }

}
