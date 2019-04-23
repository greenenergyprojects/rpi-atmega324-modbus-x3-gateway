#ifndef BRIDGE_HPP_
#define BRIDGE_HPP_

#include <inttypes.h>

namespace bridge {

    void    init();
    uint8_t spiMasterToSlave (uint8_t b);
    int     sendStringToUc1Uart0 (int bps, const uint8_t *frame, int length);
    int     sendBufferToUc1Uart1 (int bps, const uint8_t buffer[], int size);
    int     receiveBufferFromUc1Uart1 (const uint8_t buffer[], int size);
}

#endif // BRIDGE_HPP_