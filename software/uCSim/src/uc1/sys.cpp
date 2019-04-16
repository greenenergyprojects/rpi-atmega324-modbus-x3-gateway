#include "global.h"
#include "sys.hpp"
#include "app.hpp"

#include "../gui/gui.hpp"

#include <iostream>
#include <pthread.h>
#include <sys/signal.h>


namespace uc1_sys {

    void *timer0_isr (void * threadid);
    
    struct Sys sys;
    struct SysResorces res;


    pthread_t tid[1];

    void init () {
      memset(&sys, 0, sizeof sys);
      memset(&res, 0, sizeof res);
      res.lock = PTHREAD_MUTEX_INITIALIZER;
      int rc = pthread_create(&tid[0], NULL, timer0_isr, NULL);
      if (rc) {
         std::cout << "Error:unable to create thread," << rc << std::endl;
         exit(-1);
      }
      printf("uc2_sys::init() done\n");
    }

    void main () {
        // printf("uc2_sys::main() done\n");
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

    void toggleLedGreen () {
        bool on;
        lock(); {
            res.ledGreen = !res.ledGreen;
            on = res.ledGreen;
        }
        unlock();
        gui->setU1LedGreen(res.ledGreen);
        gui->appendU1Text("toggle Green U1\n");
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
            std::cout << "Thread starting..." << std::endl;
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

        }
        pthread_exit(NULL);
    }

}
