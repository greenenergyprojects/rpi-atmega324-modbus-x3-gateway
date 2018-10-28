/****************************************************************
* Bootloader for Atmega
* Author: Manfred Steiner (SX)
* Code based on Bootloader from Walter Steiner (SN)
*************************************************************** */

// Include-Dateien
#include <avr/io.h>
//#include "iom88p_ok.h"
#include <avr/boot.h>
#include <util/delay.h>
#include <avr/pgmspace.h>
#include <avr/interrupt.h>
#include <avr/wdt.h>

// Makros
#define setBit(adr,bit) (adr |= 1 << bit)
#define clrBit(adr,bit) (adr &= ~(1 << bit))
#define invBit(adr,bit) (adr ^= 1 << bit)
#define isBit(adr,bit) (adr &(1 << bit))

#define SPI_MASTER
#define SPI_CHANNEL 0
#define SPI_SLAVES 1

//typedef unsigned char  uint8_t;
//typedef signed   char  int8_t;
//typedef unsigned int   uint16_t;
//typedef signed   int   int16_t;


// Definitionen
#ifndef F_CPU
    #error "Missing define F_CPU (option -DF_CPU=...)"
#endif

#ifndef BAUDRATE
    #error "Missing define BAUDRATE (option -DBAUDRATE=...)"
#endif

#ifndef BOOTADR
    #error "Missing define BOOTADR (option -DBOOTADR=...)"
#endif

typedef void (*pFunc)(char);
typedef struct Table {
    const char *welcomeMsg;
    uint8_t     mainVersion;
    uint8_t     subVersion;
    uint16_t    magic;
} Table;

#if SPM_PAGESIZE == 128
    const char __attribute__ ((section (".table"))) welcomeMsg[54] =
        "#0(atmega324p 128 uc1-bootloader V0.01 2018-10-16 sx)";
#endif

const struct Table __attribute__ ((section (".table"))) table = {
    welcomeMsg,
    0x02,
    0x0,
    0x1234
};

void (*startApplication)( void ) = (void *)0x0000;
void (*startBootloader)( void ) = (void *)BOOTADR;


// buffer for receiving bytes via UART
// channel(1)  + { address(4=32bit) + page content as Base64} + fill-bytes(4) + zero(1)
char recBuffer[ 1 + (4 + SPM_PAGESIZE) * 4 / 3 + 5];
uint8_t channel = 0;


char byteToBase64 (uint8_t b) {
    b &= 0x3f;
    if (b < 26) {
        return b + 'A';
    } else if (b < 52) {
        return b - 26 + 'a';
    } else if (b < 62) {
        return b - 52 + '0';
    } else if (b == 62) {
        return '+';
    } else {
        return '/';
    }
}

int8_t base64ToByte (char c) {
    if (c == '/') {
        return 63;
    } else if (c == '+') {
        return 62;
    } else if (c >= 'A' && c <= 'Z') {
        return c - 'A';
    } else if (c >= 'a' && c <= 'z') {
        return c - 'a' + 26;
    } else if (c >= '0' && c <= '9') {
        return c - '0' + 52;
    } else {
        return -1;  // error
    }
}

int16_t recBufferBase64ToBin (char p[]) {
    uint8_t i = 0;
    uint8_t j = 0;
    uint8_t b = 0;
    char *pDest = p;

    while (j < sizeof recBuffer && p[i] != 0) {
        int8_t v = base64ToByte(p[i]);
        if (v < 0) { return -(i + 1); }
        switch (i++ % 4) {
            case 0: {
                b = v << 2;
                break;
            }
            case 1: {
                b |= v >> 4;
                pDest[j++] = b;
                b = v << 4;
                break;
            }
            case 2: {
                b |= v >> 2;
                pDest[j++] = b;
                b = v << 6;
                break;
            }
            case 3: {
                b |= v;
                pDest[j++] = b;
                break;
            }
        }
    }
    if (p[i] != 0) {
        return -(i + 1);
    }
    return j;
}


void sendUartByte (char ch) {
    UDR0 = ch;
    while ((UCSR0A & 0x20) == 0x00) {
    }
}

void sendLineFeed () {
    sendUartByte(13);
    sendUartByte(10);
}

void sendStr (const char *s) {
    while (*s) {
        sendUartByte(*s++);
    }
}

void sendStrPgm (const char *s) {
    uint8_t byte;

    while (1) {
        byte = pgm_read_byte(s++);
        if (!byte) {
            break;
        }
        sendUartByte(byte);
    }
}

void sendHexByte (uint8_t b) {
    for (int i = 0; i < 2; i++) {
        uint8_t x = b >> 4;
        if (x < 10) { sendUartByte('0' + x); }
        else { sendUartByte('a' + x - 10); }
        b = b << 4;
    }
}

// void send16BitValueAsBase64 (uint16_t v) {
//     sendUartByte(byteToBase64((uint8_t)(v >> 10)));
//     sendUartByte(byteToBase64((uint8_t)(v >> 6)));
//     sendUartByte(byteToBase64((uint8_t)v));
// }

char sendByte (char c) {
    char rv = c;
    // sendStr("<channel "); sendUartByte('0' + channel); sendUartByte('>');
    if (SPI_SLAVES > 0) {
        PORTB &= ~(1 << PB4);
        for (uint8_t i = 0; i <= SPI_SLAVES; i++) {
            SPDR0 = i == SPI_SLAVES ? 0xff : c;
            while (!(SPSR0 & (1 << SPIF0))) {}
            if (channel > 0 && i == channel) {
                rv = SPDR0;
                // sendStr("<rv "); sendHexByte(rv); sendUartByte('>');
            }
        }
        PORTB |= (1 << PB4);
    }
    sendUartByte(rv == 0xff ? '?' : rv);
    return rv;
}


void sendResponse (uint8_t buf[], uint16_t length) {
    sendUartByte('$');
    uint8_t b = 0;
    uint8_t i;
    for (i = 0; length > 0; length--) {
        uint8_t x = b;
        b = *buf++;
        switch (i) {
            case 0: {
                sendUartByte(byteToBase64(b >> 2));
                b = b << 4;
                break;
            }
            case 1: {
                sendUartByte(byteToBase64(x | b >> 4));
                b = b << 2;
                break;
            }
            case 2: {
                sendUartByte(byteToBase64(x | b >> 6));
                sendUartByte(byteToBase64(b));
                break;
            }
        }
        if (++i >= 3) {
            i = 0;
        }
    }
    switch (i) {
        case 0: break;
        case 1: {
            sendUartByte(byteToBase64(b));
            sendStr("==");
            break;
        }
        case 2: {
            sendUartByte(b);
            sendStr("=");
            break;
        }
    }
    sendLineFeed();
}


void sendResponseStatus (uint8_t status) {
    sendResponse(&status, 1);
}

uint8_t readSerial (char *c) {
    if ((UCSR0A & 0x80) == 0) {
        return 0;
    } else {
        *c = UDR0;
        return 1;
    }
}

void boot_program_page (uint32_t addr, uint8_t buf[]) {
    uint16_t i;
    eeprom_busy_wait ();
    boot_page_erase (addr);
    boot_spm_busy_wait ();      // Wait until the memory is erased.
    for (i = 0; i < SPM_PAGESIZE; i += 2) {
        // Set up little-endian word.
        uint16_t w = *buf++;
        w += (*buf++) << 8;
        boot_page_fill (addr + i, w);
    }
    boot_page_write (addr);  // Store buffer in flash page.
    boot_spm_busy_wait();    // Wait until the memory is written.
    // Reenable RWW-section again. We need this if we want to jump back
    // to the application after bootloading.
    boot_rww_enable ();
}

uint8_t verifyPage (uint32_t addr, uint8_t buf[]) {
    // sendStr(" -> ");
    for (uint16_t i = 0; i < SPM_PAGESIZE; i++) {
        uint8_t bFlash = pgm_read_byte(addr + i);
        uint8_t bProg = *buf++;
        // sendHexByte(bFlash);
        // sendUartByte(':');
        // sendHexByte(bProg);
        // sendUartByte(' ');
        if (bFlash != bProg) {
           return 0;  // error
        }
    }
    return 1;
}

void readFlashSegment () {
    uint8_t *p = (uint8_t *)(&recBuffer[1]);
    int16_t size = recBufferBase64ToBin((char *)p);
    if (size != 3) {
        sendResponseStatus(4);  // status 4: error - illegal size
        return;
    }
    uint16_t addr = (p[2] << 8) | p[3];
    if (p[0] != 0 || p[1] != 0) {
        sendResponseStatus(5);  // status 5: error - illegal address
        return;
    }
    for (uint16_t i = 0; i < SPM_PAGESIZE; i++) {
        recBuffer[i + 4] = pgm_read_byte(addr + i);
    }
    recBuffer[0] = 0;
    sendResponse((uint8_t *)recBuffer, SPM_PAGESIZE + 4);
}

void writeFlashSegment () {
    uint8_t *p = (uint8_t *)(&recBuffer[1]);
    int16_t size = recBufferBase64ToBin((char *)p);
    if (size < 4) {
        sendResponseStatus(4);  // status 4: error - illegal size
        return;
    }
    uint16_t addr = (p[2] << 8) | p[3];
    if (p[0] != 0 || p[1] != 0 || addr > BOOTADR) {
        sendResponseStatus(5);  // status 5: error - illegal address
        return;
    }
    for (uint16_t i = size; i < SPM_PAGESIZE + 4; i++) {
        p[i] = 0xff;  // fill bytes
    }
    boot_program_page(addr, (uint8_t *)&p[4]);

    if (verifyPage(addr, (uint8_t *)&p[4])) {
        recBuffer[0] = 0;  // status 0: OK
    } else {
        recBuffer[0] = 3;  // status 3: error - verfication fails
    }
    sendResponse((uint8_t*)recBuffer, 4);
}

uint8_t executeCommand () {
    char c = 0;
    uint16_t len = 0;

    while (1) {
        if (readSerial(&c)) {
            if (c == '@') {
               return 1;

            } else if (channel != 0) {
                c = sendByte(c);
                if (c == 0 || c == 0xff) {
                    return 0;
                }

            } else {
                if (c == '\n' || c == '\r') {
                    c = 0;
                }
                if (c != 0 && len < (sizeof(recBuffer) - 1) ) {
                   recBuffer[len++] = c;
                   sendByte(c);
                }
                if (c == 0) {
                    recBuffer[len] = 0;
                    switch (recBuffer[0]) {
                        case 'w': {
                            if ((len % 4) == 1) {
                                writeFlashSegment();
                            } else {
                                sendResponseStatus(2);
                            }
                            break;
                        }

                        case 'r': {
                            if (len == 5) {
                                readFlashSegment();
                            } else {
                                sendResponseStatus(2);
                            }
                            break;
                        }

                        case 'x': {
                            sendResponseStatus(0);
                            startApplication();
                            break;
                        }

                        case 'b': {
                            sendResponseStatus(0);
                            wdt_enable(WDTO_15MS);
                            while (1) {}
                            break;
                        }

                        default:  sendResponseStatus(1); break;
                    }
                    return 0;
                }
            }
        }
    }
    return 0;
}

int main () {
    // init I/O-register
    MCUSR = 0;     // first step to turn off WDT
    wdt_disable(); // second step to turn off WDT
    UCSR0A = 0x02; // double the UART speed
    UCSR0B = 0x18; // RX + TX enable
    UBRR0H = 0;
    UBRR0L = (F_CPU / BAUDRATE + 4) / 8 - 1;
    #ifdef SPI_MASTER 
        DDRB |= (1 << PB7) | (1 << PB5) | (1 << PB4);  // SCLK, MOSI, nSS
        PORTB |= (1 << PB4);
        SPCR0 = (1 << SPE0) | (1 << MSTR0);
    #endif

    sendLineFeed();
    sendStrPgm(welcomeMsg);
    sendLineFeed();

    uint8_t timer = 0;
    uint8_t atReceived = 0;

    do {
        char c = 0;
        uint8_t byteReceived = 0;
        for (volatile uint16_t i = 0; i < 0x3000 && !byteReceived; i++) {
            byteReceived = readSerial(&c);
        }
        if (byteReceived) {
            if (c == '\n' || c == '\r' || c == 0) {
                atReceived = 0;
            } else if (c == '@') {
                atReceived = 1;
            } else if (atReceived && (c < '0' || c > '1')) {
                atReceived = 0;
            } else {
                channel = c - '0';
                sendByte(c);
                atReceived = executeCommand();
                timer = 0;
            }
            if (atReceived) {
                timer = 0;
                channel  = 0;
                sendByte('@');
            }

        }
        if (!atReceived) {
            sendStr(".");
        }
        timer++;
    } while (timer < 100);

    startApplication();
}