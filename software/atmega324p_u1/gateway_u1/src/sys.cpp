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
        _delay_ms(1);

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
        TCCR1B = (1 << CS11);  // f=12MHz
        OCR1A  = 0xffff;
        TIMSK1 = (1 << OCIE1A);

        // UART0
        UBRR0L = (F_CPU/GLOBAL_UC1_SYS_UART0_BITRATE + 4)/8 - 1;
        UBRR0H = 0x00;
        UCSR0A = (1 << U2X0);
        UCSR0C = (1 << UCSZ01) | (1 << UCSZ00);
        UCSR0B = (1 << RXCIE0) | (1 << TXEN0) | (1 << RXEN0);

        // UART1
        UBRR1L = (F_CPU/GLOBAL_UC1_SYS_UART1_BITRATE + 4)/8 - 1;
        UBRR1H = 0x00;
        UCSR1A = (1 << U2X1);
        // UCSR1C = (1 << UPM11) | (1 << UCSZ11) | (1 << UCSZ10);
        UCSR1C = (1 << UCSZ11) | (1 << UCSZ10);
        UCSR1B = (1 << RXCIE1) | (1 << TXEN1) | (1 << RXEN1);
        sys.modbus[0].dT1_35 = 70 * 12000000L / 16 / GLOBAL_UC1_SYS_UART1_BITRATE;  // correct for even parity ?
        sys.modbus[0].dT1_15 = 30 * 12000000L / 16 / GLOBAL_UC1_SYS_UART1_BITRATE;  // correct for even parity ?
        OCR1A = sys.modbus[0].dT1_35;

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
        while (!(UCSR0A & (1 << UDRE0))) {
        }
        UDR0 = c;
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


    

}   

// ------------------------------------
// Interrupt Service Routinen
// ------------------------------------

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

ISR (USART1_RX_vect) {
    volatile uint8_t data = UDR1;
    uint8_t status = 0;
    uint16_t tcnt1 = TCNT1;
    if (TCCR1B & (1 << CS11)) {
    if (tcnt1 > uc1_sys::sys.modbus[0].dT1_35) {
        status |= (1 << SYS_MODBUS_STATUS_NEWFRAME);
    }
    } else {
        status |= (1 << SYS_MODBUS_STATUS_NEWFRAME);
    }
    TCNT1 = 0;
    TCCR1B = (1 << CS11);  // restart timer

    // UPE1 = 2  DOR1 = 3  FE1 = 4
    uint8_t errors = UCSR1A & ( (1 << FE1) | (1 << DOR1) | (1 << UPE1) );
    if (errors) {
        uc1_sys::sys.modbus[0].errorCnt = uc1_sys::inc16BitCnt(uc1_sys::sys.modbus[0].errorCnt);
    } else {
        uc1_sys::sys.modbus[0].receivedByteCnt = uc1_sys::inc16BitCnt(uc1_sys::sys.modbus[0].receivedByteCnt);
    }
    // sei();

    if (errors != 0) { status |= ((errors << 3) | (1 << SYS_MODBUS_STATUS_ERR_FRAME)); }
    if (tcnt1 > uc1_sys::sys.modbus[0].dT1_35) status |= (1 << SYS_MODBUS_STATUS_NEWFRAME);
    // app_handleUart1Byte(data, status);
}

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

ISR (TIMER1_COMPA_vect) {
    TCCR1B = 0;  // disable timer 1
    // app_handleUart1Timeout();
}

ISR (SPI_STC_vect) {
    PORTB |= (1 << PB4); 
    uint8_t toSend = uc1_app::handleSpiByte(SPDR0);
    PORTB &= ~(1 << PB4);
    SPDR0 = toSend;
}
