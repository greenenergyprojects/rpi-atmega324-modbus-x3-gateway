#include "global.h"
#include "../bridge/bridge.hpp"
#include "sys.hpp"
#include "app.hpp"

#include "../gui/gui.hpp"

#include <iostream>
#include <pthread.h>
#include <sys/signal.h>


namespace uc1_sys {

    void lock ();
    void unlock ();
    void *timer0_isr (void * threadid);
    void *spi_master_isr (void *threadid);
    
    struct Sys sys;
    struct SysResorces res;


    pthread_t tid_timer0;
    pthread_t tid_spiMaster;

    void init () {
        memset(&sys, 0, sizeof sys);
        memset(&res, 0, sizeof res);
        
        res.lock = PTHREAD_MUTEX_INITIALIZER;
        res.cpu.sfirq = 1;
        res.cpu.udr0 = -1;
        res.cpu.udr0 = -1;

        int rc = pthread_create(&tid_timer0, NULL, timer0_isr, NULL);
        if (rc) {
            std::cout << "Error:unable to create thread," << rc << std::endl;
            exit(-1);
        }
        rc = pthread_create(&tid_spiMaster, NULL, spi_master_isr, NULL);
        if (rc) {
            std::cout << "Error:unable to create thread," << rc << std::endl;
            exit(-1);
        }

        printf("uc2_sys::init() done\n");

    }

    void main () {
        // printf("uc2_sys::main() done\n");
    }

    void sei () {
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

    void cli () {
        lock(); {
            res.cpu.sfirq = 0;
        } 
        unlock();
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
        gui->setU1LedGreen(on);
    }

    void setLedYellow (uint8_t on) {
        lock(); {
            res.ledYellow = on;
        }
        unlock();
        gui->setU1LedYellow(on);
    }

    void setLedYRed (uint8_t on) {
        lock(); {
            res.ledRed = on;
        }
        unlock();
        gui->setU1LedRed(on);
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

    // **************************************************

    void *timer0_isr (void * threadid) {
        static uint8_t cnt500us = 0;
        try {
            std::cout << "U1 Info: Thread timer0_isr starting..." << std::endl;
            while (true) {
                struct timeval tm;
                tm.tv_sec = 0;
                tm.tv_usec = 500;
                select(0 ,NULL, NULL, NULL, &tm);
                cnt500us++;
                if      (cnt500us & 0x01) uc1_app::task_1ms();
                else if (cnt500us & 0x02) uc1_app::task_2ms();
                else if (cnt500us & 0x04) uc1_app::task_4ms();
                else if (cnt500us & 0x08) uc1_app::task_8ms();
                else if (cnt500us & 0x10) uc1_app::task_16ms();
                else if (cnt500us & 0x20) uc1_app::task_32ms();
                else if (cnt500us & 0x40) uc1_app::task_64ms();
                else if (cnt500us & 0x80) uc1_app::task_128ms();
            }

        } catch (...) {
            std::cout << "U1 Error: Thread spi_master_isr" << std::endl;
        }
        std::cout << "U1 Info: Thread timer0_isr ends" << std::endl;
        pthread_exit(NULL);
    }

    void *spi_master_isr (void *threadid) {
        try {
            std::cout << "U1 Info: Thread spi_master_isr starting..." << std::endl;
            uint8_t b = 0;
            while (true) {
                struct timeval tm;
                tm.tv_sec = 0;
                tm.tv_usec = 45;
                select(0 ,NULL, NULL, NULL, &tm);
                b = bridge::spiMasterToSlave(b);
                b = uc1_app::handleSpiByte(b);
            }

        } catch (...) {
            std::cout << "U1 Error: Thread spi_master_isr error" << std::endl;
        }
        std::cout << "U1 Info: spi_master_isr ends" << std::endl;
        pthread_exit(NULL);
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
        uc1_app::handleUart1Byte(receivedByte);
    }

}
