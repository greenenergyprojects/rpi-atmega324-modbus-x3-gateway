#include "global.h"
#include "../bridge/bridge.hpp"
#include "sys.hpp"
#include "app.hpp"

#include "../gui/gui.hpp"

#include <iostream>
#include <pthread.h>
#include <sys/signal.h>


namespace uc2_sys {

    void *timer0_isr (void * threadid);
    
    struct Sys sys;
    struct SysResorces res;


    pthread_t tid_timer0;

    void init () {
        memset(&sys, 0, sizeof sys);
        memset(&res, 0, sizeof res);
        res.lock = PTHREAD_MUTEX_INITIALIZER;
        res.cpu.sfirq = 1;
        res.cpu.udr0 = -1;
        res.cpu.udr1 = -1;
    }

    void initUart0(enum Uart0Mode mode, uint16_t baudrate, uint8_t t35x10) {

    }

    void initUart1(uint16_t baudrate, uint8_t t35x10) {
        
    }

    void main () {

    }

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

    void setLedGreen (uint8_t on) {
        lock(); {
            res.ledGreen = on;
        }
        unlock();
        gui->setU2LedGreen(on);
    }

    void setLedYellow (uint8_t on) {
        lock(); {
            res.ledYellow = on;
        }
        unlock();
        gui->setU2LedYellow(on);
    }

    void setLedYRed (uint8_t on) {
        lock(); {
            res.ledRed = on;
        }
        unlock();
        gui->setU2LedRed(on);
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
        gui->setU2LedGreen(res.ledGreen);
        // gui->appendU2Text("toggle Green U2\n");
    }

    void toggleLedYellow () {
        bool on;
        lock(); {
            res.ledYellow = !res.ledYellow;
            on = res.ledYellow;
        }
        unlock();
        gui->setU2LedYellow(on);
    }

    void toggleLedRed () {
        bool on;
        lock(); {
            res.ledRed = !res.ledRed;
            on = res.ledRed;
        }
        unlock();
        gui->setU2LedRed(on);
    }

    void togglePortA (uint8_t index) {
        lock(); {
            res.cpu.porta ^= (1 << index);
        }
        unlock();
    }


    void setUart0Ubrr0 (uint16_t ubrr0) {
        lock(); {
            res.cpu.ubrr0h = ubrr0 >> 8;
            res.cpu.ubrr0l = ubrr0 & 0xff;
        }
        unlock();
    }

    void setUart0Ucsr0b (uint8_t ucsr0b) {
        lock(); {
            res.cpu.ucsr0b = ucsr0b;
        }
        unlock();
    }

    void setUart0Ucsr0c (uint8_t ucsr0c) {
        lock(); {
            res.cpu.ucsr0c = ucsr0c;
        }
        unlock();
    }    

    void setUart0Ocr1a (uint16_t ocr1a) {
        lock(); {
            res.cpu.ocr1a = ocr1a;
        }
        unlock();
    }

    void setUart0Tccr1b (uint8_t tccr1b) {
        lock(); {
            res.cpu.tccr1b = tccr1b;
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

    void setUart1Ocr2a (uint8_t ocr2a) {
        lock(); {
            res.cpu.ocr2a = ocr2a;
        }
        unlock();
    }

    void setUart1Tccr2b (uint8_t tccr2b) {
        lock(); {
            res.cpu.tccr2b = tccr2b;
        }
        unlock();
    }  

    
    uint16_t getUart0Ubrr0 () {
        uint16_t rv;
        lock(); {
            rv = ((res.cpu.ubrr0h & 0xff) << 8) | (res.cpu.ubrr0l & 0xff);
        }
        unlock();
        return rv;
    }

    uint8_t getUart0Ucsr0b () {
        uint8_t rv;
        lock(); {
            rv = res.cpu.ucsr0b;
        }
        unlock();
        return rv;
    }

    uint8_t getUart0Ucsr0c () {
        uint8_t rv;
        lock(); {
            rv = res.cpu.ucsr0c;
        }
        unlock();
        return rv;
    }

    uint16_t getUart0Ocr1a () {
        uint16_t rv;
        lock(); {
            rv = res.cpu.ocr1a;
        }
        unlock();
        return rv;
    }

    uint8_t getUart0Tccr1b () {
        uint8_t rv;
        lock(); {
            rv = res.cpu.tccr1b;
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

    uint8_t getUart1Ocr2a () {
        uint16_t rv;
        lock(); {
            rv = res.cpu.ocr2a;
        }
        unlock();
        return rv;
    }

    uint8_t getUart1Tccr2b () {
        uint8_t rv;
        lock(); {
            rv = res.cpu.tccr2b;
        }
        unlock();
        return rv;
    }


    // **************************************************


    void sendViaUart0 (uint8_t buf[], uint8_t size) {
        lock(); {
            res.uart0Sent.timer500usCnt = size * 2;
            res.uart0Sent.handler = bridge::receiveBufferFromUc2Uart0;
            res.uart0Sent.done = uc2_app::uart0ReadyToSent;
            res.uart0Sent.buffer = (uint8_t *)malloc(size);
            res.uart0Sent.size = size;
            for (int i = 0; i < size; i++) {
                res.uart0Sent.buffer[i] = buf[i];
            }
        };
        unlock();

    }

    void sendViaUart1 (uint8_t buf[], uint8_t size) {
        lock(); {
            res.uart1Sent.timer500usCnt = size * 2;
            res.uart1Sent.handler = bridge::receiveBufferFromUc2Uart1;
            res.uart1Sent.done = uc2_app::uart1ReadyToSent;
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
        if (cnt500us & 0x01) uc2_app::task_1ms();
        else if (cnt500us & 0x02) uc2_app::task_2ms();
        else if (cnt500us & 0x04) uc2_app::task_4ms();
        else if (cnt500us & 0x08) uc2_app::task_8ms();
        else if (cnt500us & 0x10) uc2_app::task_16ms();
        else if (cnt500us & 0x20) uc2_app::task_32ms();
        else if (cnt500us & 0x40) uc2_app::task_64ms();
        else if (cnt500us & 0x80) uc2_app::task_128ms();

        for (uint8_t i = 0; i < 2; i++) {
            struct UartSent *p = i == 0 ? &res.uart0Sent : &res.uart1Sent;
            struct UartSent x;
            int expired = 0;
            lock(); {
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

    }

    uint8_t spi_slave_isr (uint8_t b) {
        return uc2_app::handleSpiByte(b);
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
            uc2_app::handleUart0Byte((uint8_t)b);
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
            uc2_app::handleUart1Byte(b);
        }
    }


    void uart0_timeout () {
        uc2_app::handleUart0Byte(-1);
    }

    void uart1_timeout () {
        uc2_app::handleUart1Byte(-1);
    }


}
