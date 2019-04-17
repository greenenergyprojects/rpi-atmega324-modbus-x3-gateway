#include "bridge.hpp"

#include "../uc1/sys.hpp"
#include "../uc2/sys.hpp"

#include "stdint.h"
#include <iostream>
#include <list> 
#include <iterator> 
#include <pthread.h>

struct U1UartData {
    uint8_t *data;
    int length;
    int index;
};

namespace bridge {

    pthread_mutex_t lock;
    std::list <struct U1UartData *> u1Uart0List;

    void *callback_U1Uart0Isr (void *tid) {
        try {
            std::cout << "BR Info: start of thread callback_U1Uart0Isr" << std::endl;
            while (true) {
                struct timeval tm;
                tm.tv_sec = 0;
                tm.tv_usec = 96;
                select(0 ,NULL, NULL, NULL, &tm);
                int16_t b = -1;
                pthread_mutex_lock(&lock); {
                    if (!u1Uart0List.empty()) {
                        struct U1UartData *p = u1Uart0List.front();
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
                }
            }
        } catch (...) {
            std::cout << "BR Error: thread callback_U1Uart0Isr" << std::endl;
        }
        std::cout << "BR Info: end thread callback_U1Uart0Isr" << std::endl;
    }

    void init () {
        if (pthread_mutex_init(&lock, NULL) != 0) {
            std::cout << "BR Error: unable to create mutex," << std::endl;
            exit(1);
        }
        pthread_t tid;
        int rc = pthread_create(&tid, NULL, callback_U1Uart0Isr, NULL);
        if (rc) {
            std::cout << "BR Error: unable to create thread," << rc << std::endl;
            exit(1);
        }
    }



    uint8_t spiMasterToSlave (uint8_t b) {
        b = uc2_sys::spi_slave_isr(b);
        return b;
    }

    int sendStringToUc1Uart0 (int bps, const uint8_t *frame, int length) {
        if (frame != NULL && length > 0) {
            struct U1UartData *p = (struct U1UartData *)calloc(sizeof(struct U1UartData), 1);
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

}
