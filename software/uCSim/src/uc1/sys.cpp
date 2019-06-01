#include "global.h"
#include "../bridge/bridge.hpp"
#include "sys.hpp"
#include "app.hpp"

#include "../gui/gui.hpp"

#include <iostream>
#include <pthread.h>
#include <sys/signal.h>

#define F_CPU 12000000L
#define TXEN1  3
#define RXEN1  4
#define TXCIE1 6
#define RXCIE1 7
#define UCSZ10 1
#define UCSZ11 2
#define CS11   1

namespace uc1_sys {

    void lock ();
    void unlock ();
    void *timer0_isr (void * threadid);
    void *spi_master_isr (void *threadid);
    
    struct Sys sys;
    struct SysResorces res;


    pthread_t tid_timer0;
    pthread_t tid_spiMaster;

    // ********************************************************

    void lock () {
        int status = pthread_mutex_lock(&res.lock);
        if (status != 0) {
            perror("Lock mutex error");
            exit(1);
        } 
    }

    void unlock () {
        int status = pthread_mutex_unlock(&res.lock);
        if (status != 0) {
            perror("Lock mutex error");
            exit(1);
        } 
    }

    // ********************************************************

    void init () {
        memset(&sys, 0, sizeof sys);
        memset(&res, 0, sizeof res);
        
        res.lock = PTHREAD_MUTEX_INITIALIZER;
        res.cpu.sfirq = 1;
        res.cpu.udr0 = -1;
        res.cpu.udr1 = -1;

        // int rc = pthread_create(&tid_timer0, NULL, timer0_isr, NULL);
        // if (rc) {
        //     std::cout << "Error:unable to create thread," << rc << std::endl;
        //     exit(-1);
        // }
        // rc = pthread_create(&tid_spiMaster, NULL, spi_master_isr, NULL);
        // if (rc) {
        //     std::cout << "Error:unable to create thread," << rc << std::endl;
        //     exit(-1);
        // }

    }

    void initUart1(uint16_t baudrate, uint8_t t35x10) {
        lock(); {
            res.cpu.ubrr1h = 0;
            res.cpu.ubrr1l = (F_CPU / baudrate + 4) / 8 - 1;
            res.cpu.ucsr1c = (1 << UCSZ11) | (1 << UCSZ10); // 8N1 mode
            res.cpu.ocr1a = (uint16_t)(F_CPU / 8 / baudrate * t35x10); // 5468;
            res.cpu.tccr1b = (1 << CS11);  // Timer 1 f = 12MHz / 8
        }
        unlock();
    }

    void main () {
        // printf("uc2_sys::main() done\n");
    }

    uint8_t inc8BitCnt (uint8_t count) {
        if (count < 0xff) {
            count++;
        }
        return count;
    }

    uint16_t inc16BitCnt (uint16_t count) {
        if (count < 0xffff) {
            count++;
        }
        return count;
    }

    void saveSei () {
        int uart0Byte = -1;
        int uart1Byte = -1;
        
        lock(); {
            res.cpu.sfirq = 1;
            uart0Byte = res.cpu.udr0;
            res.cpu.udr0 = -1;
            uart1Byte = res.cpu.udr1;
            res.cpu.udr1 = -1;
        }
        unlock();
        
        if (uart0Byte >= 0) {
           uc1_app::handleUart0Byte((uint8_t)uart0Byte);
        }
        if (uart1Byte >= 0) {
           uc1_app::handleUart0Byte((uint8_t)uart1Byte);
        }

    }

    void saveCli () {
        lock(); {
            res.cpu.sfirq = 0;
        } 
        unlock();
    }

    
    //****************************************************************************
    // Event Handling
    //****************************************************************************

    Sys_Event setEvent (Sys_Event event) {
        saveCli();
        uint8_t eventIsPending = ((sys.eventFlag & event) != 0);
        sys.eventFlag |= event;
        saveSei();
        return eventIsPending;
    }


    Sys_Event clearEvent (Sys_Event event) {
        saveCli();
        uint8_t eventIsPending = ((sys.eventFlag & event) != 0);
        sys.eventFlag &= ~event;
        saveSei();
        return eventIsPending;
    }


    Sys_Event isEventPending (Sys_Event event) {
        return (sys.eventFlag & event) != 0;
    }


    //****************************************************************************
    // LED Handling
    //****************************************************************************

    void setLedGreen (uint8_t on) {
        lock(); {
            res.ledGreen = on;
        }
        unlock();
        gui->setU1LedGreen(on);
    }

    void setLedYellow (uint8_t on) {
        lock(); {
            res.ledYellow = on;
        }
        unlock();
        gui->setU1LedYellow(on);
    }

    void setLedRed (uint8_t on) {
        lock(); {
            res.ledRed = on;
        }
        unlock();
        gui->setU1LedRed(on);
    }

    void setPortA (uint8_t index) {
        lock(); {
            res.cpu.porta |= (1 << index);
        }
        unlock();
    }

    void clrPortA (uint8_t index) {
        lock(); {
            res.cpu.porta &= ~(1 << index);
        }
        unlock();
    }

    void toggleLedGreen () {
        bool on;
        lock(); {
            res.ledGreen = !res.ledGreen;
            on = res.ledGreen;
        }
        unlock();
        gui->setU1LedGreen(res.ledGreen);
        // gui->appendU1Text("toggle Green U1\n");
    }

    void toggleLedYellow () {
        bool on;
        lock(); {
            res.ledYellow = !res.ledYellow;
            on = res.ledYellow;
        }
        unlock();
        gui->setU1LedYellow(on);
    }

    void toggleLedRed () {
        bool on;
        lock(); {
            res.ledRed = !res.ledRed;
            on = res.ledRed;
        }
        unlock();
        gui->setU1LedRed(on);
    }

    void togglePortA (uint8_t index) {
        lock(); {
            res.cpu.porta ^= (1 << index);
        }
        unlock();
    }

    void setUart0Mode (enum Uart0Mode mode) {
        lock(); {
            res.uart0Mode = mode;
        }
        unlock();
    }

    void setUart1Ubrr1 (uint16_t ubrr1) {
        lock(); {
            res.cpu.ubrr1h = ubrr1 >> 8;
            res.cpu.ubrr1l = ubrr1 & 0xff;
        }
        unlock();
    }

    void setUart1Ucsr1b (uint8_t ucsr1b) {
        lock(); {
            res.cpu.ucsr1b = ucsr1b;
        }
        unlock();
    }

    void setUart1Ucsr1c (uint8_t ucsr1c) {
        lock(); {
            res.cpu.ucsr1c = ucsr1c;
        }
        unlock();
    }    

    void setUart1Ocr1a (uint16_t ocr1a) {
        lock(); {
            res.cpu.ocr1a = ocr1a;
        }
        unlock();
    }

    void setUart1Tccr1b (uint8_t tccr1b) {
        lock(); {
            res.cpu.tccr1b = tccr1b;
        }
        unlock();
    }  

    enum Uart0Mode getUart0Mode () {
        enum Uart0Mode rv;
        lock(); {
            rv = res.uart0Mode;
        }
        unlock();
        return rv;
    }

    uint16_t getUart1Ubrr1 () {
        uint16_t rv;
        lock(); {
            rv = ((res.cpu.ubrr1h & 0xff) << 8) | (res.cpu.ubrr1l & 0xff);
        }
        unlock();
        return rv;
    }

    uint8_t getUart1Ucsr1b () {
        uint8_t rv;
        lock(); {
            rv = res.cpu.ucsr1b;
        }
        unlock();
        return rv;
    }

    uint8_t getUart1Ucsr1c () {
        uint8_t rv;
        lock(); {
            rv = res.cpu.ucsr1c;
        }
        unlock();
        return rv;
    }

    uint16_t getUart1Ocr1a () {
        uint16_t rv;
        lock(); {
            rv = res.cpu.ocr1a;
        }
        unlock();
        return rv;
    }

    uint8_t getUart1Tccr1b () {
        uint8_t rv;
        lock(); {
            rv = res.cpu.tccr1b;
        }
        unlock();
        return rv;
    }


    
    // **************************************************

    void sendViaUart0 (uint8_t typ, uint8_t buf[], uint8_t size) {
        gui->appendU1Text("U1-UART0 -> PI:  ");
        char s[2];
        s[1] = 0;
        for (uint8_t i = 0; i < size; i++) {
            char c = buf[i];
            s[0] = c;
            if (c == ':' || (c >= '0' && c <= '9') || (c >= 'A' && c <= 'F')) {
                gui->appendU1Text(s);
            } else if (c == '\r') {
                gui->appendU1Text("\\r");
            } else if (c == '\n') {
                gui->appendU1Text("\\n");
            } else {
                gui->appendU1Text("?");
            }
        }
        gui->appendU1Text("\n");
        uc1_app::uart0ReadyToSent(typ, 0);
    }

    void sendViaUart1 (uint8_t buf[], uint8_t size) {
        lock(); {
            res.uart1Sent.timer500usCnt = size * 2;
            res.uart1Sent.handler = bridge::receiveBufferFromUc1Uart1;
            res.uart1Sent.done = uc1_app::uart1ReadyToSent;
            res.uart1Sent.buffer = (uint8_t *)malloc(size);
            res.uart1Sent.size = size;
            for (int i = 0; i < size; i++) {
                res.uart1Sent.buffer[i] = buf[i];
            }
        };
        unlock();


        // bridge::receiveBufferFromUc1Uart1(buf, size);
        // uc1_app::uart1ReadyToSent(0);
    }

    // **************************************************

    void timer0_isr () {
        static uint8_t cnt500us = 0;
        cnt500us++;
        if      (cnt500us & 0x01) uc1_app::task_1ms();
        else if (cnt500us & 0x02) uc1_app::task_2ms();
        else if (cnt500us & 0x04) uc1_app::task_4ms();
        else if (cnt500us & 0x08) uc1_app::task_8ms();
        else if (cnt500us & 0x10) uc1_app::task_16ms();
        else if (cnt500us & 0x20) uc1_app::task_32ms();
        else if (cnt500us & 0x40) uc1_app::task_64ms();
        else if (cnt500us & 0x80) uc1_app::task_128ms();

        struct UartSent x;
        int expired = 0;
        lock(); {
            struct UartSent *p = &res.uart1Sent;
            if (p->timer500usCnt > 0) {
                p->timer500usCnt--;
                if (p->timer500usCnt == 0) {
                    x = *p;
                    p->handler = NULL;
                    p->done = NULL;
                    p->buffer = NULL;
                    p->size = 0;
                    expired = 1;
                }
            }
        }
        unlock();
        if (expired) {
            if (x.handler != NULL) {
                if (x.done != NULL) {
                    (*x.done)(0);
                }
                int err = (x.handler)(x.buffer, x.size);
                if (x.buffer != NULL) {
                    free(x.buffer);
                }
            }
        }
    }

    void spi_master_isr () {
        static uint8_t nextByte = 0;
        uint8_t b = bridge::spiMasterToSlave(nextByte);
        nextByte = uc1_app::handleSpiByte(b);
    }

    void uart0_isr (uint8_t receivedByte) {
        int16_t b = -1;
        lock(); {
            if (res.cpu.sfirq) {
                b = receivedByte;
            } else {
                res.cpu.udr0 = receivedByte;
            }
        }
        unlock();
        if (b >= 0) {
            uc1_app::handleUart0Byte((uint8_t)b);
        }
    }

    void uart1_isr (uint8_t receivedByte) {
        int16_t b = -1;
        lock(); {
            if (res.cpu.sfirq) {
                b = receivedByte;
            } else {
                res.cpu.udr1 = receivedByte;
            }
        }
        unlock();
        if (b >= 0) {
            uc1_app::handleUart1Byte(b);
        }
    }

    void uart1_timeout () {
        uc1_app::handleUart1Byte(-1);
    }

}
