#ifndef BRIDGE_HPP_
#define BRIDGE_HPP_

#include <inttypes.h>

namespace bridge {

    void    init();
    void    doInBackground ();
    uint8_t spiMasterToSlave (uint8_t b);
    int     sendStringToUc1Uart0 (int bps, const uint8_t *frame, int length);
    int     sendBufferToUc1Uart1 (int bps, const uint8_t buffer[], int size);
    int     receiveBufferFromUc1Uart1 (const uint8_t buffer[], int size);
    int     receiveBufferFromUc2Uart0 (const uint8_t buffer[], int size);
    int     receiveBufferFromUc2Uart1 (const uint8_t buffer[], int size);
    bool    handle_U1UartXIsr (uint64_t time);
    bool    handle_U2UartXIsr (uint64_t time);
    bool    handle_U1SpiIsr (uint64_t timeMicros);
}

#endif // BRIDGE_HPP_