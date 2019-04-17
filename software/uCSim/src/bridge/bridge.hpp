#ifndef BRIDGE_HPP_
#define BRIDGE_HPP_

#include <inttypes.h>

namespace bridge {

    void    init();
    uint8_t spiMasterToSlave (uint8_t b);
    int     sendStringToUc1Uart0 (int bps, const uint8_t *frame, int length);
}

#endif // BRIDGE_HPP_