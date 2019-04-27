#include "global.h"
#include "sys.hpp"
#include "app.hpp"

// defines


// #define SYS_UART_BYTE_RECEIVED (UCSR0A & (1 << RXC0))
// #define SYS_UART_UDR_IS_EMPTY (UCSR0A & (1 << UDRE0))
// #define SYS_UDR UDR0
// #define SYS_UART_RECEIVE_VECTOR USART0_RX_vect
// #define SYS_TIMER0_VECTOR TIMER0_COMPA_vect


namespace uc1_sys {

    // declarations and definations

    volatile struct Sys sys;

    // functions

    int uart_putch (char c, FILE *f);
    int uart_getch (FILE *f);

    // static FILE sys_stdout = fdev_setup_stream(sys_uart_putch, NULL, _FDEV_SETUP_WRITE);
    // static FILE sys_stdin = fdev_setup_stream(NULL, sys_uart_getch, _FDEV_SETUP_READ);

    static FILE sys_stdout;
    // static FILE sys_stdin;

    void init () {
        fdev_setup_stream(&sys_stdout, uart_putch, NULL, _FDEV_SETUP_WRITE);
        // fdev_setup_stream(&sys_stdin, NULL, uart_getch, _FDEV_SETUP_READ);
        memset((void *)&sys, 0, sizeof(sys));
        uc1_sys::sys.uart0Typ = 0xff;
        _delay_ms(1);

        DDRA |= 0x07;

        DDRB |= 0x0f;  // Debug
        PORTB = 0;

        DDRC = 0x38;    // LED D7,D8,D9
        PORTC |= 0x80;  // Pullup switch 2 (PC7)

        PORTD |= ((1 << PD7) | (1 << PD5));
        PORTD &= ~(1 << PD6);
        PORTD &= ~(1 << PD4);
        DDRD |= 0xf0;  // PD7=nRE1, PD6=DE1, PD5=nRE2, PD4=DE2

        // Timer 0 for task machine
        OCR0A  = (F_CPU + 4) / 8 / 10000 - 1;
        TCCR0A = (1 << WGM01);
        TCCR0B = (1 << CS01);
        TIMSK0 = (1 << OCIE0A);
        TIFR0  = (1 << OCF0A);

        // Timer 1 for Modbus-RTU timing measurments
        TCCR1A = 0;
        TCCR1B = (1 << CS11);  // f=12MHz/8
        OCR1A  = 2734; // 35 * 12000000L / 8 / 19200; // 2734; 
        TIMSK1 = (1 << OCIE1A);

        // UART0
        UBRR0L = (F_CPU/GLOBAL_UC1_SYS_UART0_BITRATE + 4)/8 - 1;
        UBRR0H = 0x00;
        UCSR0A = (1 << U2X0);
        UCSR0C = (1 << UCSZ01) | (1 << UCSZ00);
        UCSR0B = (1 << RXCIE0) | (1 << TXEN0) | (1 << RXEN0);

        // UART1
        UBRR1L = 0;
        UBRR1H = 0;
        UCSR1A = (1 << U2X1);
        // UCSR1C = (1 << UPM11) | (1 << UCSZ11) | (1 << UCSZ10);
        // UCSR1C = (1 << UCSZ11) | (1 << UCSZ10); // 8 Bit mode
        // UCSR1B = (1 << RXCIE1) | (1 << TXCIE1) | (1 << TXEN1) | (1 << RXEN1);
        // OCR1A = sys.modbus[0].dT1_35;

        // SPI Master
        DDRB  |= (1 << PB7) | (1 << PB5) | (1 << PB4);  // SCLK, MOSI, nSS
        PORTB |= (1 << PB4);
        // SPSR0 |= (1 << SPI2X0);
        SPCR0  = (1 << SPE0) | (1 << MSTR0) | (1 << SPIE0) | (1 << SPR10);
        PORTB &= ~(1 << PB4);
        SPDR0 = 0x00;
        
        // connect libc functions printf(), gets()... to UART
        // fdevopen(sys_monitor_putch, sys_monitor_getch);
        stdout = &sys_stdout;
        stderr = &sys_stdout;
        // stdin  = &sys_stdin;
    }


    void main () {
    }

    //----------------------------------------------------------------------------

    uint8_t inc8BitCnt (uint8_t count) {
        return count < 0xff ? count + 1 : count;
    }


    uint16_t inc16BitCnt (uint16_t count) {
        return count < 0xffff ? count + 1 : count;
    }


    void saveSei () {
        if (sys.flags & SYS_FLAG_SREG_I) {
            sei();
        }
    }


    void saveCli (void) {
        if (SREG & 0x80) {
            sys.flags |= SYS_FLAG_SREG_I;
        } else {
            sys.flags &= ~SYS_FLAG_SREG_I;
        }
        cli();
    }

    //****************************************************************************
    // Uart Handling
    //****************************************************************************

    int uart_putch (char c, FILE *f) {
        if (f != stdout) {
            return EOF;
        }

        if (sys.uart0Mode == STDOUT) {
            while (!(UCSR0A & (1 << UDRE0))) {}
            UDR0 = c;
        
        } else if (sys.uart0Mode != MIXED && sys.uart0Mode != DEBUG) {
            return EOF;
        
        } else {
           saveCli();
           if ( (UCSR0B & (1 << TXCIE0)) == 0) {
                UCSR0B |= (1 << TXCIE0) | (1 << TXEN0);
                UDR0 = sys.uart0Mode == DEBUG ? c : 0x80 | c;
                saveSei();

           } else {
                if (sys.uart0DebugByte == 0) {
                    sys.uart0DebugByte = c;
                    saveSei();
                } else {
                    saveSei();
                    while (sys.uart0DebugByte > 0);
                    uart_putch(c, f);
                }
           }
        }

        return (int)c;
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
        if (on) {
            PORTC |= (1 << PC5);
        } else {
            PORTC &= ~(1 << PC5);
        }
    }

    void setLedYellow (uint8_t on) {
        if (on) {
            PORTC |= (1 << PC4);
        } else {
            PORTC &= ~(1 << PC4);
        }
    }

    void setLedRed (uint8_t on) {
        if (on) {
            PORTC |= (1 << PC3);
        } else {
            PORTC &= ~(1 << PC3);
        }
    }

    void toggleLedGreen () {
        PORTC ^= (1 << PC5);
    }

    void toggleLedYellow () {
        PORTC ^= (1 << PC4);
    }

    void toggleLedRed () {
        PORTC ^= (1 << PC3);
    }

    void setUart0Mode (enum Uart0Mode mode) {
        sys.uart0Mode = mode;
    }

    void setUart1Config (uint8_t ubrr1l, uint8_t ucsr1c) {
        UCSR1B = 0;
        UBRR1L = ubrr1l;
        UCSR1C = ucsr1c;
        UCSR1B = (1 << RXCIE1) | (1 << TXCIE1) | (1 << TXEN1) | (1 << RXEN1);
    }
    
    void sendViaUart0 (uint8_t typ, uint8_t buf[], uint8_t size) {
        if (buf == NULL || size < 1) {
            uc1_app::uart0ReadyToSent(typ, 1);
        
        } else if (sys.uart0Size > 0) {
            sys.uart0Size = 0;
            uc1_app::uart0ReadyToSent(typ, 2);
        
        } else if (sys.uart0Mode != ModbusASCII && sys.uart0Mode != MIXED && sys.uart0Mode != DEBUG) {
            sys.uart0Size = 0;
            uc1_app::uart0ReadyToSent(typ, 3);
        
        } else {
            sys.uart0Buf = buf;
            sys.uart0Size = size - 1;
            UCSR0B = (1 << TXCIE0) | (1 << TXEN0);
            UDR0 = *sys.uart0Buf++;
        }
    }
    
    
    void sendViaUart1 (uint8_t buf[], uint8_t size) {
        if (buf == NULL || size < 1) {
            uc1_app::uart1ReadyToSent(1);
        }
        if (sys.uart1Size > 0) {
            sys.uart1Size = 0;
            uc1_app::uart1ReadyToSent(2);
        }
        sys.uart1Buf = buf;
        sys.uart1Size = size - 1;
        UCSR1B = (1 << TXCIE1) | (1 << TXEN1);
        PORTD |= (1 << PD6); // MODBUS1-DE = 1
        PORTD |= (1 << PD7); // MODBUS1-nRE = 1
        UDR1 = *sys.uart1Buf++;
    }

    

}   



// ------------------------------------
// Interrupt Service Routinen
// ------------------------------------

// Modbus ASCII to/from PI B1 -------------------

ISR (USART0_RX_vect) {
    static uint8_t lastChar;
    uint8_t c = UDR0;

    if (c == 'R' && lastChar == '@') {
        wdt_enable(WDTO_15MS);
        wdt_reset();
        while (1) {}
    }
    lastChar = c;

    uc1_app::handleUart0Byte(c);
}

ISR (USART0_TX_vect) {
    if (uc1_sys::sys.uart0DebugByte > 0) {
        UDR0 = uc1_sys::sys.uart0Mode == uc1_sys::DEBUG ? uc1_sys::sys.uart0DebugByte : 0x80 | uc1_sys::sys.uart0DebugByte;
        uc1_sys::sys.uart0DebugByte = 0;

    } else if (uc1_sys::sys.uart0Size > 0) {
        UDR0 = *uc1_sys::sys.uart0Buf++;
        uc1_sys::sys.uart0Size--;

    } else {
        if (uc1_sys::sys.uart0Typ == 0 || uc1_sys::sys.uart0Typ == 1) {
            uc1_app::uart0ReadyToSent(uc1_sys::sys.uart0Typ, 0);
        }
        uc1_sys::sys.uart0Typ = 0xff;
        UCSR0B &= ~((1 << TXCIE0) | (1 << TXEN0));
    }
}

// Modbus RTU B1 ------------------------------------

ISR (USART1_RX_vect) {
    uint8_t c = UDR1;
    uc1_sys::toggleLedRed();
    PORTA ^= (1 << PA1);
    TCNT1 = 0;
    // OCR1A  = 5870; // uc1_app::app.modbus.uart1Config.ocr1a; // 35 * 12000000L / 8 / 9600; // 5870; 
    OCR1A  = uc1_app::app.modbus.uart1Config.ocr1a; // 35 * 12000000L / 8 / 9600; // 5870; 
    TCCR1B = uc1_app::app.modbus.uart1Config.tccr1b; // (1 << CS11);  // Timer 1 f = 12MHz / 8
    PORTA = (1 << PA2);
    uc1_app::handleUart1Byte(c);
}

ISR (USART1_TX_vect) {
    if (uc1_sys::sys.uart1Size > 0) {
        UDR1 = *uc1_sys::sys.uart1Buf++;
        uc1_sys::sys.uart1Size--;
    } else {
        PORTD &= ~(1 << PD6); // MODBUS1-DE = 0
        PORTD &= ~(1 << PD7); // MODBUS1-nRE = 0
        UCSR1B |= (1 << RXCIE1) | (1 << RXEN1);
        UCSR1B &= ~((1 << TXCIE1) | (1 << TXEN1));
        uc1_app::uart1ReadyToSent(0);
    }
}

ISR (TIMER1_COMPA_vect) {
    TCCR1B = 0;  // disable timer 1
    TCNT1 = 0;
    uc1_app::handleUart1Byte(-1);
}

// ---------------------------------------------

// Timer 0 Output/Compare Interrupt
// called every 100us
ISR (TIMER0_COMPA_vect) {
    static uint8_t cnt100us = 0;
    static uint8_t cnt500us = 0;
    static uint8_t busy = 0;

    cnt100us++;
    if (cnt100us >= 5) {
        cnt100us = 0;
        cnt500us++;
        if (busy) {
            uc1_sys::sys.taskErr_u8 = uc1_sys::inc8BitCnt(uc1_sys::sys.taskErr_u8);
        } else {
            busy = 1;
            sei();
            if      (cnt500us & 0x01) uc1_app::task_1ms();
            else if (cnt500us & 0x02) uc1_app::task_2ms();
            else if (cnt500us & 0x04) uc1_app::task_4ms();
            else if (cnt500us & 0x08) uc1_app::task_8ms();
            else if (cnt500us & 0x10) uc1_app::task_16ms();
            else if (cnt500us & 0x20) uc1_app::task_32ms();
            else if (cnt500us & 0x40) uc1_app::task_64ms();
            else if (cnt500us & 0x80) uc1_app::task_128ms();
            busy = 0;
        }
    }
}


ISR (SPI_STC_vect) {
    PORTB |= (1 << PB4); 
    uint8_t toSend = uc1_app::handleSpiByte(SPDR0);
    PORTB &= ~(1 << PB4);
    SPDR0 = toSend;
}
