/****************************************************************
* Bootloader for Atmega324P - SPI Master
* Author: Manfred Steiner (SX)
*************************************************************** */

// Include-Dateien
#include <avr/io.h>
//#include "iom88p_ok.h"
#include <avr/boot.h>
#include <util/delay.h>
#include <avr/interrupt.h>
#include <avr/wdt.h>

// Makros
#define setBit(adr,bit) (adr |= 1 << bit)
#define clrBit(adr,bit) (adr &= ~(1 << bit))
#define invBit(adr,bit) (adr ^= 1 << bit)
#define isBit(adr,bit) (adr &(1 << bit))


// Workarround for Visual Studio Code C intelliSenseMode bugs
#ifndef COMPILE
    typedef unsigned char uint8_t;
    typedef unsigned short uint16_t;
    typedef unsigned long uint32_t;
    typedef signed char int8_t;
    typedef signed short int16_t;
    typedef signed long int32_t;
    #define pgm_read_byte(address_short) address_short
    #define boot_page_erase(address_short) address_short
    #define boot_page_write(address_short) address_short
    #define boot_page_fill(address_short, value) address_short
#else 
    #include <avr/pgmspace.h>
#endif

#if defined(UART0) || defined(UART0_DEBUG)
   #define UDR   UDR0
   #define UCSRA UCSR0A
   #define UCSRB UCSR0B
   #define UCSRC UCSR0C
   #define UBRRL UBRR0L
   #define UBRRH UBRR0H
#endif
#ifdef UART1
   #define UDR   UDR1
   #define UCSRA UCSR1A
   #define UCSRB UCSR1B
   #define UCSRC UCSR1C
   #define UBRRL UBRR1L
   #define UBRRH UBRR1H
#endif



#define SPI_MASTER
#define SPI_CHANNEL 0

#if !defined(UART0) && !defined(UART1)
    #define UART0
#endif

// Definitionen
#ifndef F_CPU
    #warning "Missing define F_CPU (option -DF_CPU=...)"
    #define F_CPU 12000000
#endif

#ifndef BAUDRATE
    #warning "Missing define BAUDRATE (option -DBAUDRATE=...)"
    #define BAUDRATE 115200
#endif

#ifndef BOOTADR
    #warning "Missing define BOOTADR (option -DBOOTADR=...)"
    #define BOOTADR 0x7000
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
            "#0(atmega324p 128 uc1-bootloader V0.01 2019-03-17 sx)";
#else
    #error "Wrong SPM_PAGESIZE"
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
char recBuffer[ 3 + (4 + SPM_PAGESIZE) * 4 / 3 + 5];
int8_t channel;

struct Spi {
    uint8_t toSend;
    uint8_t toSendShadow;
    uint8_t received;
    uint8_t skipUart;
} spi;


uint16_t t0Timer;


void setLedGreen (int8_t on) {
    if (on < 0) {
        PORTC ^= (1 << PC5);
    } else if (on > 0) {
        PORTC |= (1 << PC5);
    } else {
        PORTC &= (1 << PC5);
    }
}

void setLedYellow (int8_t on) {
    if (on < 0) {
        PORTC ^= (1 << PC4);
    } else if (on > 0) {
        PORTC |= (1 << PC4);
    } else {
        PORTC &= (1 << PC4);
    }
}

void setLedRed (int8_t on) {
    if (on < 0) {
        PORTC ^= (1 << PC3);
    } else if (on > 0) {
        PORTC |= (1 << PC3);
    } else {
        PORTC &= (1 << PC3);
    }
}


void prepareApplicationStart () {
    cli();
    DDRA = 0;
    DDRB = 0;
    TCCR0B = 0;
    TIMSK0 = 0;
    SPCR0 = 0;
    MCUCR = (1 << IVCE);
    MCUCR = 0; 

}

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

    while (j < sizeof recBuffer && p[i] != 10) {
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
    if (p[i] != 10) {
        return -(i + 1);
    }
    return j;
}


uint8_t readSerial (char *c) {
    #ifdef UART0    
        if ((UCSR0A & 0x80) != 0) {
            *c = UDR0;
            return 1;
        }
    #endif
    #ifdef UART1
        if ((UCSR1A & 0x80) != 0) {
            *c = UDR1;
            return 1;
        }
    #endif 
    return 0;
}


void sendUartByte (char ch) {
    #if defined(UART0) || defined(UART0_DEBUG)
        while ((UCSR0A & 0x20) == 0x00) {}
        UDR0 = ch;
    #endif    
    #ifdef UART1
        while ((UCSR1A & 0x20) == 0x00) {}
        UDR1 = ch;
    #endif    
}


void sendSpiByte (char c) {
    spi.toSend = c;
}


uint8_t readByte (char *c) {
    return readSerial(c);
}


void sendByte (char c) {
    #if defined(UART0) || defined(UART0_DEBUG)
        sendUartByte(c);
    #endif
    #ifdef UART1
        sendUartByte(c);
    #endif
}

void sendLineFeed () {
    sendByte(13);
    sendByte(10);
}

void sendStr (const char *s) {
    while (*s) {
        sendByte(*s++);
    }
}

void sendStrPgm (const char *s) {
    uint8_t byte;

    while (1) {
        byte = pgm_read_byte(s++);
        if (!byte) {
            break;
        }
        sendByte(byte);
    }
}

void sendHexByte (uint8_t b) {
    for (int i = 0; i < 2; i++) {
        uint8_t x = b >> 4;
        if (x < 10) { sendByte('0' + x); }
        else { sendByte('a' + x - 10); }
        b = b << 4;
    }
}

// void send16BitValueAsBase64 (uint16_t v) {
//     sendUartByte(byteToBase64((uint8_t)(v >> 10)));
//     sendUartByte(byteToBase64((uint8_t)(v >> 6)));
//     sendUartByte(byteToBase64((uint8_t)v));
// }




void sendResponse (uint8_t buf[], uint16_t length) {
    sendByte('$');
    uint8_t b = 0;
    uint8_t i;
    for (i = 0; length > 0; length--) {
        uint8_t x = b;
        b = *buf++;
        switch (i) {
            case 0: {
                sendByte(byteToBase64(b >> 2));
                b = b << 4;
                break;
            }
            case 1: {
                sendByte(byteToBase64(x | b >> 4));
                b = b << 2;
                break;
            }
            case 2: {
                sendByte(byteToBase64(x | b >> 6));
                sendByte(byteToBase64(b));
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
            sendByte(byteToBase64(b));
            sendStr("==");
            break;
        }
        case 2: {
            sendByte(b);
            sendStr("=");
            break;
        }
    }
    sendLineFeed();
}


void sendResponseStatus (uint8_t status) {
    sendResponse(&status, 1);
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

void writeFlashSegment (char buf[]) {
    uint8_t *p = (uint8_t *)(buf);
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
        buf[0] = 0;  // status 0: OK
    } else {
        buf[0] = 3;  // status 3: error - verfication fails
    }
    sendResponse((uint8_t*)buf, 4);
}


uint8_t send2Slave (uint16_t len) {
    char *pb = recBuffer;
    spi.received = 0;
    while (len > 0) {
        len--;
        uint8_t b = *pb++;
        PORTA ^= (1 << PA0);
        sendSpiByte(b);
        
        volatile int16_t timer = 0x100;
        while (timer > 0) {
            cli();
            if (spi.received != 0) {
                PORTA ^= (1 << PA1);
                if (b != spi.received) {
                    sei();
                    return 1; // status 1 - SPI communication error
                }
                if (len <= 1) {
                    spi.skipUart = 0;
                    PORTA ^= (1 << PA2);                                        
                }
                spi.received = 0;
                timer = 0;
            } else {
                timer--;
            }
            sei();
            
        }
    }
    return 0;
}



void executeBuffer (char buf[], uint16_t len) {
    switch (buf[0]) {
        case 'w': {
            // sendHexByte(len);
            if ((len % 4) == 2) {
                
                cli();
                writeFlashSegment(&buf[1]);
                sei();
                
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
            prepareApplicationStart();
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
}

uint8_t executeCommand () {
    char c = 0;
    uint16_t len = 2;
    int32_t timer = 0x100000;

    while (timer >= 0) {
        if (!readByte(&c)) {
            timer--;
        } else if (c != 0) {
            timer = 0x100000;
            if (c == '@') {
               return 1;

            } else {

                if (c != 0 && len < (sizeof(recBuffer) - 1) ) {
                    recBuffer[len++] = c;
                    sendUartByte(c);
                }
                if (c == '\n' || c == '\r') {
                    
                    recBuffer[len] = 0;
                    if (channel != SPI_CHANNEL) {
                        return send2Slave(len);
                    } else {
                        executeBuffer(&recBuffer[2], len - 2);
                    }
                    return 0;
                }
            }
        }
    }
    return 0;
}

ISR (SPI_STC_vect) {
    setLedYellow(-1);
    spi.received = SPDR0;
    if (spi.received != 0) {
        if (spi.skipUart == 0) {
            sendUartByte(spi.received);
        }
    }
    PORTB |= (1 << PB4); 
    spi.toSendShadow = spi.toSend;
    PORTB &= ~(1 << PB4);
    SPDR0 = spi.toSendShadow;
    spi.toSend = 0x00;
}


ISR (TIMER0_OVF_vect) {
    setLedGreen(-1);
    // overflow every 1.89ms
    if (t0Timer > 0) {
        t0Timer--;
    }
}

int main () {
    // init I/O-register
    MCUSR = 0;     // first step to turn off WDT
    wdt_disable(); // second step to turn off WDT

    channel = -1;
    DDRA |= 0x07;
    PORTA = 0;
    DDRC |= 0x38;
    PORTC &= ~0x38;

    for (uint8_t i = 0; i < sizeof spi; i++) {
        ((uint8_t *)&spi)[i] = 0;
    }
    
    TCCR0A = 0;
    TCCR0B = (1 << CS01) | (1 << CS00); // 73us
    TIMSK0 = (1 << TOIE0);



    #ifdef UART1
        UCSR1A = 0x02; // double the UART speed
        UCSR1B = 0x18; // RX + TX enable
        UCSR1C = (1 << UCSZ11) | (1 << UCSZ10); // 8 Bit
        UBRR1H = 0;
        UBRR1L = (F_CPU / BAUDRATE + 4) / 8 - 1;
    #endif

    #if defined(UART0) || defined(UART0_DEBUG)
        UCSR0A = 0x02; // double the UART speed
        UCSR0B = 0x18; // RX + TX enable
        UCSR0C = (1 << UCSZ01) | (1 << UCSZ00); // 8 Bit
        UBRR0H = 0;
        // UBRR0L = (F_CPU / BAUDRATE + 4) / 8 - 1;
        UBRR0L = (12000000L / 115200 + 4) / 8 - 1;
    #endif


    // SPI f = fcpu / 4 = 3MHz@12MHz
    DDRB  |= (1 << PB7) | (1 << PB5) | (1 << PB4);  // SCLK, MOSI, nSS
    PORTB |= (1 << PB4);
    // SPSR0 |= (1 << SPI2X0);
    
    
    SPCR0  = (1 << SPE0) | (1 << MSTR0) | (1 << SPIE0) | (1 << SPR10);
    PORTB |= (1 << PB4); 
    
    MCUCR = (1 << IVCE);
    MCUCR = (1 << IVSEL); 
    
    sei();
    PORTB &= ~(1 << PB4);
    SPDR0 = 0x00;

    sendLineFeed();
    sendStrPgm(welcomeMsg);
    // sendStr("  ");
    // sendByte(SPI_CHANNEL + '0');
    sendLineFeed();

    uint8_t timer = 0;
    uint8_t atReceived = 0;

    do {
        char c = 0;
        uint8_t byteReceived = 0;
        t0Timer = 50;
        while (t0Timer > 0 && !byteReceived) {
            byteReceived = readByte(&c);
        }
        if (byteReceived && c != 0) {
            timer = 0;
            sendUartByte(c);

            if (c == '\n' || c == '\r') {
                atReceived = 0;
                channel = -1;
            } else if (c == '@') {
                atReceived = 1;
                channel = -1;
                recBuffer[0] = c; 
                
            } else if (atReceived) {
                if (c < '0' || c > '9') {
                    atReceived = 0;
                } else {
                    channel = c - '0';
                    recBuffer[1] = c;
                    spi.skipUart = 1;
                    atReceived = executeCommand(c);
                    spi.skipUart = 0;
                }
            }

        }

        if (!atReceived && channel < 0) {
            sendUartByte('.');
        }

        timer++;
    } while (timer < 100);

    prepareApplicationStart();
    startApplication();
}
