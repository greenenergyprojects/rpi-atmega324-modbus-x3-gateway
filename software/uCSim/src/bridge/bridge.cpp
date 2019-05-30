#include "bridge.hpp"

#include "../uc1/sys.hpp"
#include "../uc2/sys.hpp"
#include "../uc1/app.hpp"
#include "../uc2/app.hpp"
#include "../gui/gui.hpp"

#include "stdint.h"
#include <iostream>
#include <list> 
#include <iterator> 
#include <pthread.h>
#include <sys/time.h>



struct UXUartData {
    uint8_t *data;
    int length;
    int index;
};

struct ModbusResponse {
    uint8_t size;
    uint8_t buffer[256];
};

namespace bridge {

    pthread_mutex_t lock;
    std::list <struct UXUartData *> u1Uart0List;
    std::list <struct UXUartData *> u1Uart1List;
    std::list <struct UXUartData *> u2Uart0List;
    std::list <struct UXUartData *> u2Uart1List;



    void init () {
        if (pthread_mutex_init(&lock, NULL) != 0) {
            std::cout << "BR Error: unable to create mutex," << std::endl;
            exit(1);
        }
        // pthread_t tid;
        // int rc = pthread_create(&tid, NULL, callback_U1Uart0Isr, NULL);
        // if (rc) {
        //     std::cout << "BR Error: unable to create thread," << rc << std::endl;
        //     exit(1);
        // }
    }

    void doInBackground () {
        struct timeval te; 
        gettimeofday(&te, NULL);
        uint64_t startMicros = te.tv_sec * 1000000 + te.tv_usec;
        uint64_t lastTurnMicros = startMicros;
        uint64_t last500usStep = startMicros;

        uc1_sys::init();
        uc2_sys::init();
        uc1_app::init();
        uc2_app::init();

        while (true) {
            bool idle = true;
            try {
                uc1_sys::main();
                uc2_sys::main();
                uc1_app::main();
                uc2_app::main();
            
            } catch (...) {
                std::cout << "Error doInBackground";
            }
            
            
            gettimeofday(&te, NULL);
            uint64_t t = te.tv_sec * 1000000 + te.tv_usec;
            uint64_t dt = t - lastTurnMicros;
            if (dt > 1000000) {
                std::cout << "doInBackground: delay>1s -> Debugging? Resetting µC system time" << std::endl;
                startMicros = t;
                last500usStep = t;
            }
            if ((t - last500usStep) > 500) {
                uc1_sys::timer0_isr();
                uc2_sys::timer0_isr();
                last500usStep += 500;
                idle = false;
            }
            
            // In real time SPI faster than UART -> call of spi before and after Uart, otherwise loss of spi byte possible
            idle = idle && bridge::handle_U1SpiIsr(t);
            idle = idle && bridge::handle_U1UartXIsr(t);
            idle = idle && bridge::handle_U1SpiIsr(t);
            idle = idle && bridge::handle_U2UartXIsr(t);

            lastTurnMicros = t;

            if (idle) {
                struct timeval tm;
                tm.tv_sec = 0;
                tm.tv_usec = 1;
                select(0 ,NULL, NULL, NULL, &tm);
            }
        }
    }

    bool handle_U1UartXIsr (uint64_t timeMicros) {

        static uint64_t uart0LastSentMicros = 0;
        static uint64_t uart1LastSentMicros = 0;
        static uint64_t uart1TimeoutMicros = 0;

        bool rv = true;        

        if (timeMicros > (uart0LastSentMicros + 1000000 / 115200 * 10 )) {
            int16_t b = -1;    
            pthread_mutex_lock(&lock); {
                if (!u1Uart0List.empty()) {
                    struct UXUartData *p = u1Uart0List.front();
                    b = p->data[p->index++];
                    if (p->index >= p->length) {
                        free(p->data); p->data = NULL;
                        u1Uart0List.pop_front();
                        free(p);
                    }
                }
            }
            pthread_mutex_unlock(&lock);
            if (b >= 0 && b <= 255) {
                uc1_sys::uart0_isr((uint8_t)b);
                uart0LastSentMicros = timeMicros;
                rv = false;
            }
        }
        
        if (timeMicros > (uart1LastSentMicros + 1000000 / 19200 * 10 )) {
            int16_t b = -1;
            bool lastByte = false;
            pthread_mutex_lock(&lock); {
                if (!u1Uart1List.empty()) {
                    struct UXUartData *p = u1Uart1List.front();
                    b = p->data[p->index++];
                    if (p->index >= p->length) {
                        free(p->data); p->data = NULL;
                        u1Uart1List.pop_front();
                        free(p);
                        lastByte = true;
                    }
                }
            }
            pthread_mutex_unlock(&lock);
            if (b >= 0 && b <= 255) {
                uc1_sys::uart1_isr(b);
                uart1LastSentMicros = timeMicros;
                uart1TimeoutMicros = lastByte ? timeMicros : 0;
                rv = false;
            }
        }

        if (uart1TimeoutMicros != 0 && uart1LastSentMicros < timeMicros) {
            uart1TimeoutMicros = 0;
            uc1_sys::uart1_timeout();
            rv = false;
        }

        return rv;
    }


    bool handle_U2UartXIsr (uint64_t timeMicros) {

        static uint64_t uart0LastSentMicros = 0;
        static uint64_t uart1LastSentMicros = 0;
        static uint64_t uart0TimeoutMicros = 0;
        static uint64_t uart1TimeoutMicros = 0;

        bool rv = true;        

        if (timeMicros > (uart0LastSentMicros + 1000000 / 115200 * 10 )) {
            int16_t b = -1;   
            bool lastByte = false; 
            pthread_mutex_lock(&lock); {
                if (!u2Uart0List.empty()) {
                    struct UXUartData *p = u2Uart0List.front();
                    b = p->data[p->index++];
                    if (p->index >= p->length) {
                        free(p->data); p->data = NULL;
                        u2Uart0List.pop_front();
                        free(p);
                        lastByte = true;
                    }
                }
            }
            pthread_mutex_unlock(&lock);
            if (b >= 0 && b <= 255) {
                uc2_sys::uart0_isr((uint8_t)b);
                uart0LastSentMicros = timeMicros;
                uart0TimeoutMicros = lastByte ? timeMicros : 0;
                rv = false;
            }
        }
        
        if (timeMicros > (uart1LastSentMicros + 1000000 / 19200 * 10 )) {
            int16_t b = -1;
            bool lastByte = false;
            pthread_mutex_lock(&lock); {
                if (!u2Uart1List.empty()) {
                    struct UXUartData *p = u2Uart1List.front();
                    b = p->data[p->index++];
                    if (p->index >= p->length) {
                        free(p->data); p->data = NULL;
                        u2Uart1List.pop_front();
                        free(p);
                        lastByte = true;
                    }
                }
            }
            pthread_mutex_unlock(&lock);
            if (b >= 0 && b <= 255) {
                uc2_sys::uart1_isr(b);
                uart1LastSentMicros = timeMicros;
                uart1TimeoutMicros = lastByte ? timeMicros : 0;
                rv = false;
            }
        }

        if (uart0TimeoutMicros != 0 && uart0LastSentMicros < timeMicros) {
            uart0TimeoutMicros = 0;
            uc2_sys::uart0_timeout();
            rv = false;
        }

        if (uart1TimeoutMicros != 0 && uart1LastSentMicros < timeMicros) {
            uart1TimeoutMicros = 0;
            uc2_sys::uart1_timeout();
            rv = false;
        }

        return rv;
    }    

    bool handle_U1SpiIsr (uint64_t timeMicros) {
        static uint64_t spiLastSentMicros = 0;
        
        if (timeMicros < (spiLastSentMicros + 30)) {
            return true;
        }
        
        uc1_sys::spi_master_isr();
        spiLastSentMicros = timeMicros;

        return false;
    }


    uint8_t spiMasterToSlave (uint8_t b) {
        if (b != 0) {
            char s[5];
            if (b == '\n') {
                snprintf(s, sizeof s, "%02x\n", b);
            } else {
                snprintf(s, sizeof s, "%02x ", b);
            }
            gui->appendSpiTextU1toU2(s);
        }

        uint8_t rv = uc2_sys::spi_slave_isr(b);

        b = rv;
        if (b != 0 && b < 0x80) {
            char s[5];
            if (b == '\n') {
                snprintf(s, sizeof s, "%02x\n", b);
            } else {
                snprintf(s, sizeof s, "%02x ", b);
            }
            gui->appendSpiTextU2toU1(s);
        }

        if (b > 0x80 && b < 0xff) {
            b = b & 0x7f;
            if (b >= ' ' && b < 0x7f) {
                char s[2];
                s[0] = b;
                s[1] = 0;
                gui->appendSpiTextU2toU1(s);
            }

        }

        return rv;
    }

    int sendStringToUc1Uart0 (int bps, const uint8_t *frame, int length) {
        if (frame != NULL && length > 0) {
            struct UXUartData *p = (struct UXUartData *)calloc(sizeof(struct UXUartData), 1);
            p->data = (uint8_t *)calloc(1, length);
            memcpy(p->data, frame, length);
            p->index = 0;
            p->length = length;
            pthread_mutex_lock(&lock); {
                u1Uart0List.push_back(p);
            }
            pthread_mutex_unlock(&lock);
        }
    }


    int sendBufferToUc1Uart1 (int bps, const uint8_t buffer[], int size) {
        if (buffer != NULL && size > 0) {
            struct UXUartData *p = (struct UXUartData *)calloc(sizeof(struct UXUartData), 1);
            p->data = (uint8_t *)calloc(1, size);
            memcpy(p->data, buffer, size);
            p->index = 0;
            p->length = size;
            pthread_mutex_lock(&lock); {
                u1Uart1List.push_back(p);
            }
            pthread_mutex_unlock(&lock);
        }
    }

    
    int sendBufferToUc2Uart0 (int bps, const uint8_t buffer[], int size) {
        if (buffer != NULL && size > 0) {
            struct UXUartData *p = (struct UXUartData *)calloc(sizeof(struct UXUartData), 1);
            p->data = (uint8_t *)calloc(1, size);
            memcpy(p->data, buffer, size);
            p->index = 0;
            p->length = size;
            pthread_mutex_lock(&lock); {
                u2Uart0List.push_back(p);
            }
            pthread_mutex_unlock(&lock);
        }
    }

    
    int sendBufferToUc2Uart1 (int bps, const uint8_t buffer[], int size) {
        if (buffer != NULL && size > 0) {
            struct UXUartData *p = (struct UXUartData *)calloc(sizeof(struct UXUartData), 1);
            p->data = (uint8_t *)calloc(1, size);
            memcpy(p->data, buffer, size);
            p->index = 0;
            p->length = size;
            pthread_mutex_lock(&lock); {
                u2Uart1List.push_back(p);
            }
            pthread_mutex_unlock(&lock);
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

    struct ModbusResponse modbusB1HandleRequest(const uint8_t buffer[], uint8_t size) {
        struct ModbusResponse rv;
        rv.size = 0;
        if (size < 4) {
            gui->appendU1Text("B1: Frame to short\n");
            return rv;
        }
        rv.buffer[0] = buffer[0];
        rv.buffer[1] = buffer[1];
        
        uint16_t crc = 0xffff;
        for (uint i = 0; i < size; i++) {
            crc = modbusUpdateCRC(buffer[i], crc);
        }
        if (crc != 0x0) {
            gui->appendU1Text("B1: CRC Error\n");
            return rv;
        }
        if (buffer[0] != 1) {
            gui->appendU1Text("\nB1: wrong address, frame not for this device\n");
            return rv;
        }
        switch (buffer[1]) {
            case 3: {
                if (size < 8) {
                    rv.buffer[1] |= 0x80;
                    rv.buffer[2] = 0x01;
                    rv.size = 3;
                    break;
                }
                int address = buffer[2] << 8 | buffer[3]; 
                int quantity = buffer[4] << 8 | buffer[5];
                if (quantity < 1 || quantity > 0x7d) {
                    rv.buffer[1] |= 0x80;
                    rv.buffer[2] = 0x03;
                    rv.size = 3;
                    break;
                }
                rv.buffer[2] = quantity * 2;
                rv.size = 3;
                int i = 3;
                int mem[] = { 
                    0x0000, 0x0027, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000,
                    0x0000, 0x0005, 0x0000, 0x0022, 0x08B7, 0x0000, 0x0000, 0x0000,
                    0x03E8, 0x1389, 0x0000, 0x0000, 0x0000, 0x0101
                };

                for (int a = address; quantity > 0; quantity--, a++ ) {
                    int v = 0;
                    if (a < sizeof(mem) / sizeof(int)) {
                        v = mem[a];
                    }
                    rv.buffer[i++] = (v >> 8) & 0xff;
                    rv.buffer[i++] = v & 0xff;
                    rv.size += 2;
                }
                break;
            }

            default: {
                rv.buffer[1] |= 0x80;
                rv.buffer[2] = 0x01;
                rv.size = 3;
                break;
            }

        }
        
        crc = 0xffff;
        uint8_t i;
        for ( i = 0; i < rv.size; i++) {
            crc = modbusUpdateCRC(rv.buffer[i], crc);
        }
        rv.buffer[i] = crc & 0xff;
        rv.buffer[i + 1] = crc >> 8;
        rv.size += 2;
        return rv;
    }


    struct ModbusResponse modbusB2HandleRequest(const uint8_t buffer[], uint8_t size) {
        struct ModbusResponse rv;
        rv.size = 0;
        if (size < 4) {
            gui->appendU2Text("B2: Frame to short\n");
            return rv;
        }
        rv.buffer[0] = buffer[0];
        rv.buffer[1] = buffer[1];
        
        uint16_t crc = 0xffff;
        for (uint i = 0; i < size; i++) {
            crc = modbusUpdateCRC(buffer[i], crc);
        }
        if (crc != 0x0) {
            gui->appendU2Text("B2: CRC Error\n");
            return rv;
        }
        if (buffer[0] != 1) {
            gui->appendU2Text("\nB2: wrong address, frame not for this device\n");
            return rv;
        }
        switch (buffer[1]) {
            case 3: {
                if (size < 8) {
                    rv.buffer[1] |= 0x80;
                    rv.buffer[2] = 0x01;
                    rv.size = 3;
                    break;
                }
                int address = buffer[2] << 8 | buffer[3]; 
                int quantity = buffer[4] << 8 | buffer[5];
                if (quantity < 1 || quantity > 0x7d) {
                    rv.buffer[1] |= 0x80;
                    rv.buffer[2] = 0x03;
                    rv.size = 3;
                    break;
                }
                rv.buffer[2] = quantity * 2;
                rv.size = 3;
                int i = 3;
                int mem[] = { 
                    0x0000, 0x0027, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000,
                    0x0000, 0x0005, 0x0000, 0x0022, 0x08B7, 0x0000, 0x0000, 0x0000,
                    0x03E8, 0x1389, 0x0000, 0x0000, 0x0000, 0x0101
                };

                for (int a = address; quantity > 0; quantity--, a++ ) {
                    int v = 0;
                    if (a < sizeof(mem) / sizeof(int)) {
                        v = mem[a];
                    }
                    rv.buffer[i++] = (v >> 8) & 0xff;
                    rv.buffer[i++] = v & 0xff;
                    rv.size += 2;
                }
                break;
            }

            default: {
                rv.buffer[1] |= 0x80;
                rv.buffer[2] = 0x01;
                rv.size = 3;
                break;
            }

        }
        
        crc = 0xffff;
        uint8_t i;
        for ( i = 0; i < rv.size; i++) {
            crc = modbusUpdateCRC(rv.buffer[i], crc);
        }
        rv.buffer[i] = crc & 0xff;
        rv.buffer[i + 1] = crc >> 8;
        rv.size += 2;
        return rv;
    }


    struct ModbusResponse modbusB3HandleRequest(const uint8_t buffer[], uint8_t size) {
        struct ModbusResponse rv;
        rv.size = 0;
        if (size < 4) {
            gui->appendU2Text("B3: Frame to short\n");
            return rv;
        }
        rv.buffer[0] = buffer[0];
        rv.buffer[1] = buffer[1];
        
        uint16_t crc = 0xffff;
        for (uint i = 0; i < size; i++) {
            crc = modbusUpdateCRC(buffer[i], crc);
        }
        if (crc != 0x0) {
            gui->appendU2Text("B3: CRC Error\n");
            return rv;
        }
        if (buffer[0] != 1) {
            gui->appendU2Text("\nB3: wrong address, frame not for this device\n");
            return rv;
        }
        switch (buffer[1]) {
            case 3: {
                if (size < 8) {
                    rv.buffer[1] |= 0x80;
                    rv.buffer[2] = 0x01;
                    rv.size = 3;
                    break;
                }
                int address = buffer[2] << 8 | buffer[3]; 
                int quantity = buffer[4] << 8 | buffer[5];
                if (quantity < 1 || quantity > 0x7d) {
                    rv.buffer[1] |= 0x80;
                    rv.buffer[2] = 0x03;
                    rv.size = 3;
                    break;
                }
                rv.buffer[2] = quantity * 2;
                rv.size = 3;
                int i = 3;
                int mem[] = { 
                    0x0000, 0x0027, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000,
                    0x0000, 0x0005, 0x0000, 0x0022, 0x08B7, 0x0000, 0x0000, 0x0000,
                    0x03E8, 0x1389, 0x0000, 0x0000, 0x0000, 0x0101
                };

                for (int a = address; quantity > 0; quantity--, a++ ) {
                    int v = 0;
                    if (a < sizeof(mem) / sizeof(int)) {
                        v = mem[a];
                    }
                    rv.buffer[i++] = (v >> 8) & 0xff;
                    rv.buffer[i++] = v & 0xff;
                    rv.size += 2;
                }
                break;
            }

            default: {
                rv.buffer[1] |= 0x80;
                rv.buffer[2] = 0x01;
                rv.size = 3;
                break;
            }

        }
        
        crc = 0xffff;
        uint8_t i;
        for ( i = 0; i < rv.size; i++) {
            crc = modbusUpdateCRC(rv.buffer[i], crc);
        }
        rv.buffer[i] = crc & 0xff;
        rv.buffer[i + 1] = crc >> 8;
        rv.size += 2;
        return rv;
    }

    struct ModbusResponse aeConversionHandleRequest(const uint8_t buf[], uint8_t size) {
        struct ModbusResponse rv;
        rv.size = 0;
        rv.buffer[rv.size++] = '\n';

        if (size != 5) {
            gui->appendU1Text("\nB1 (AEConv): Frame to short\n");
            return rv;
        }
        if (buf[0] != '#' || buf[4] != '\r') {
            gui->appendU1Text("\nB1 (AEConv): illegal frame\n");
            return rv;
        }

        int chksum = 0;
        rv.buffer[rv.size++] = '*';    chksum += '*';
        rv.buffer[rv.size++] = buf[1]; chksum += buf[1];
        rv.buffer[rv.size++] = buf[2]; chksum += buf[2];
        switch (buf[3]) {
            case '9': {
                char resp[] = "*XX9 500-90 ";
                for (int i = 3; i < strlen(resp); i++) {
                    chksum += resp[i];
                    rv.buffer[rv.size++] = (uint8_t)resp[i];
                }
                break;
            }
            
            default: {
                gui->appendU1Text("\nB1 (AEConv): illegal frame\n");
                return rv;
            }
        }

        rv.buffer[rv.size++] = chksum & 0xff;
        rv.buffer[rv.size++] = '\r';
        chksum = chksum & 0xff;
        return rv;
    }

    int receiveBufferFromUc1Uart1 (const uint8_t buffer[], int size) {
        gui->appendU1Text("U1-UART1 -> B1:  ");
        char s[4];
        for (uint8_t i = 0; i < size; i++) {
            uint8_t b = buffer[i];
            snprintf(s, 4, " %02x", b);
            gui->appendU1Text(s);
        }
        // struct ModbusResponse modbusResponse = modbusB1HandleRequest(buffer, size);
        struct ModbusResponse modbusResponse = aeConversionHandleRequest(buffer, size);
        gui->appendU1Text("\n");
        if (modbusResponse.size > 0) {
            gui->appendU1Text("B1 -> U1-UART1: ");
            char s[4];
            for (uint8_t i = 0; i < modbusResponse.size; i++) {
                uint8_t b = modbusResponse.buffer[i];
                snprintf(s, 4, " %02x", b);
                gui->appendU1Text(s);
            }
            gui->appendU1Text("\n");
            sendBufferToUc1Uart1(19200, modbusResponse.buffer, modbusResponse.size);
        }
        return 0;
    }


    int receiveBufferFromUc2Uart0 (const uint8_t buffer[], int size) {
        gui->appendU2Text("U2-UART0 -> B2:  ");
        char s[4];
        for (uint8_t i = 0; i < size; i++) {
            uint8_t b = buffer[i];
            snprintf(s, 4, " %02x", b);
            gui->appendU2Text(s);
        }
        struct ModbusResponse modbusResponse = modbusB2HandleRequest(buffer, size);
        // struct ModbusResponse modbusResponse = aeConversionHandleRequest(buffer, size);
        gui->appendU2Text("\n");
        if (modbusResponse.size > 0) {
            gui->appendU1Text("B2 -> U2-UART0: ");
            char s[4];
            for (uint8_t i = 0; i < modbusResponse.size; i++) {
                uint8_t b = modbusResponse.buffer[i];
                snprintf(s, 4, " %02x", b);
                gui->appendU2Text(s);
            }
            gui->appendU2Text("\n");
            sendBufferToUc2Uart0(19200, modbusResponse.buffer, modbusResponse.size);
        }
        return 0;
    }


    int receiveBufferFromUc2Uart1 (const uint8_t buffer[], int size) {
        gui->appendU2Text("U2-UART1 -> B3:  ");
        char s[4];
        for (uint8_t i = 0; i < size; i++) {
            uint8_t b = buffer[i];
            snprintf(s, 4, " %02x", b);
            gui->appendU2Text(s);
        }
        struct ModbusResponse modbusResponse = modbusB3HandleRequest(buffer, size);
        // struct ModbusResponse modbusResponse = aeConversionHandleRequest(buffer, size);
        gui->appendU2Text("\n");
        if (modbusResponse.size > 0) {
            gui->appendU1Text("B3 -> U2-UART1: ");
            char s[4];
            for (uint8_t i = 0; i < modbusResponse.size; i++) {
                uint8_t b = modbusResponse.buffer[i];
                snprintf(s, 4, " %02x", b);
                gui->appendU2Text(s);
            }
            gui->appendU2Text("\n");
            sendBufferToUc2Uart1(19200, modbusResponse.buffer, modbusResponse.size);
        }
        return 0;

    }


    


}
