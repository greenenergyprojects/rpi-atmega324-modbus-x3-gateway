#include "global.h"
#include "sys.hpp"
#include "app.hpp"

// defines


#define SYS_UART_BYTE_RECEIVED (UCSR0A & (1 << RXC0))
#define SYS_UART_UDR_IS_EMPTY (UCSR0A & (1 << UDRE0))
#define SYS_UDR UDR0
#define SYS_UART_RECEIVE_VECTOR USART0_RX_vect
#define SYS_TIMER0_VECTOR TIMER0_COMPA_vect


namespace uc2_sys {

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

        DDRA |= 0x07;

        DDRB |= 0x0f;  // Debug
        PORTB = 0;

        DDRC = 0x38;    // LED D7,D8,D9
        PORTC |= 0x80;  // Pullup switch 2 (PC7)

        PORTD |= ((1 << PD7) | (1 << PD5));
        PORTD &= ~(1 << PD6);
        PORTD &= ~(1 << PD4);
        DDRD |= 0xf0;  // B3: PD7=nRE, PD6=DE --- B2: PD5=nRE, PD4=DE

        // Timer 0 for task machine
        OCR0A  = (F_CPU + 4) / 8 / 10000 - 1;
        TCCR0A = (1 << WGM01);
        TCCR0B = (1 << CS01);
        TIMSK0 = (1 << OCIE0A);
        TIFR0  = (1 << OCF0A);

        // Timer 1 for Modbus-RTU timing measurments on B2 (UART0)
        TCCR1A = 0;
        TCCR1B = 0; // Timer for Modbus B2 off
        OCR1A  = 2734; // 35 * 12000000L / 8 / 19200; // 2734; 
        TIMSK1 = (1 << OCIE1A);

        // Timer 2 for Modbus-RTU timing measurments on B3 (UART1)
        TCCR2A = 0;
        TCCR2B = 0; // Timer for Modbus B3 off
        OCR2A  = 171; // 35 * 12000000L / 128 / 19200; // 171; 
        TIMSK2 = (1 << OCIE2A);

        // UART0 (B2)
        // to do, config if DEBUG desired
        UBRR0L = 0;
        UBRR0H = 0;
        UCSR0A = (1 << U2X1);

         // UART1 (B3)
        UBRR1L = 0;
        UBRR1H = 0;
        UCSR1A = (1 << U2X1);

        // SPI Slave
        DDRB  |= (1 << PB6);  // MISO
        SPCR0  = (1 << SPE0) | (1 << SPIE0);

        // connect libc functions printf(), gets()... to UART
        // fdevopen(sys_monitor_putch, sys_monitor_getch);
        stdout = &sys_stdout;
        stderr = &sys_stdout;
        // stdin  = &sys_stdin;
    }


    void initSpi (enum SpiMode mode) {
        sys.spi.mode = mode;
    }


    void initUart0 (enum Uart0Mode mode, uint32_t baudrate, uint8_t t35x10) {
        UBRR0H = 0;
        UBRR0L = (F_CPU / baudrate + 4) / 8 - 1;
        UCSR0A = (1 << U2X0);
        UCSR0C = (1 << UCSZ01) | (1 << UCSZ00); // 8N1 mode
        sys.uart0Mode = mode;
        sys.tccr1bInit = (1 << CS11);  // Timer 1 f = 12MHz / 8
        sys.ocr1aInit = (uint16_t)(F_CPU / 8 / baudrate * t35x10); // 5468;

        switch (mode) {
            case OFF: {
                break;
            }
            case ModbusRTU: {
                break;
            }
            case STDOUT: {
                UCSR0B = (1 << RXCIE0) | (1 << TXEN0) | (1 << RXEN0);
                break;
            }
            case DEBUG: {
                break;
            }
            case MIXED: {
                break;
            }
            default: {
                sys.uart0Mode = ModbusRTU; break;
            }

        }
        
    }

    
    void initUart1 (uint16_t baudrate, uint8_t t35x10) {
        UBRR1H = 0;
        UBRR1L = (F_CPU / baudrate + 4) / 8 - 1;
        UCSR1A = (1 << U2X1);
        UCSR1B = 0; // (1 << RXCIE1) | (1 << TXCIE1) | (1 << TXEN1) | (1 << RXEN1);
        UCSR1C = (1 << UCSZ11) | (1 << UCSZ10); // 8N1 mode
        
        uint32_t x = F_CPU / baudrate * t35x10;
        uint8_t csxx = 0;
        while (csxx < 7) {
            csxx++;
            if (x < 255) {
                sys.tccr2bInit = csxx;
                sys.ocr2aInit = (uint8_t)(x) + 1;
                break;
            }
            switch (csxx) {
                case 1: // fTimer = fCpu / 8
                    x = x / 8;
                    break; 
                case 2: // fTimer = fCpu / 32
                    x = x / 4;
                    break; 
                case 3: // fTimer = fCpu / 64
                case 4: // fTimer = fCpu / 128
                case 5: // fTimer = fCpu / 256
                    x = x / 2;
                    break; 
                case 6: // fTimer = fCpu / 1024
                    x = x / 4;
                    break; 
                case 7: // error
                    x = 255;
                    break;
            }
        }
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
        
        // if (sys.flags & SYS_FLAG_SREG_I) {
        //     sei(); // error sometimes hanging
        // }
        sei(); 
    }


    void saveCli (void) {
        // if (SREG & 0x80) {
        //     sys.flags |= SYS_FLAG_SREG_I;
        // } else {
        //     sys.flags &= ~SYS_FLAG_SREG_I;
        // }
        cli();
    }


    //----------------------------------------------------------------------------

    int uart_getch (FILE *f) {
        return (int) EOF;
    }


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

    void setPortA (uint8_t index) {
        PORTA |= (1 << index);
    }

    void clrPortA (uint8_t index) {
        PORTA &= ~(1 << index);
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

    void togglePortA (uint8_t index) {
        PORTA ^= (1 << index);
    }

    //----------------------------------------------------------------------------

    void setUart0Ubrr0 (uint16_t ubrr0) {
        UBRR0 = ubrr0;
    }

    void setUart0Ucsr0b (uint8_t ucsr0b) {
        UCSR0B = ucsr0b;
    }

    void setUart0Ucsr0c (uint8_t ucsr0c) {
        UCSR0C = ucsr0c;
    }

    void setUart0Ocr1a (uint16_t ocr1a) {
        OCR1A = ocr1a;
    }

    void setUart0Tccr1b (uint8_t tccr1b) {
        TCCR1B = tccr1b;
    }

    void setUart1Ubrr1 (uint16_t ubrr1) {
        UBRR1 = ubrr1;
    }

    void setUart1Ucsr1b (uint8_t ucsr1b) {
        UCSR1B = ucsr1b;
    }

    void setUart1Ucsr1c (uint8_t ucsr1c) {
        UCSR1C = ucsr1c;
    }

    void setUart1Ocr2a (uint8_t ocr2a) {
        OCR2A = ocr2a;
    }

    void setUart1Tccr2b (uint8_t tccr2b) {
        TCCR2B = tccr2b;
    }


    uint16_t getUart0Ubrr0 () {
        return UBRR0;
    }

    uint8_t getUart0Ucsr0b () {
        return UCSR0B;
    }

    uint8_t getUart0Ucsr0c () {
        return UCSR0C;
    }

    uint16_t getUart0Ocr1a () {
        return OCR1A;
    }

    uint8_t getUart0Tccr1b () {
        return TCCR1B;
    }

    uint16_t getUart1Ubrr1 () {
        return UBRR1;
    }

    uint8_t getUart1Ucsr1b () {
        return UCSR1B;
    }

    uint8_t getUart1Ucsr1c () {
        return UCSR1C;
    }

    uint8_t getUart1Ocr2a  () {
        return OCR2A;
    }

    uint8_t getUart1Tccr2b () {
        return TCCR2B;
    }
    
    //----------------------------------------------------------------------------
    
    void sendViaUart0 (uint8_t buf[], uint8_t size) {
        if (buf == NULL || size < 1) {
            uc2_app::uart0ReadyToSent(1);
        
        } else if (sys.uart0Size > 0) {
            sys.uart0Size = 0;
            uc2_app::uart0ReadyToSent(2);
        
        }

        sys.uart0Buf = buf;
        sys.uart0Size = size - 1;
        UCSR0B = (1 << TXCIE0) | (1 << TXEN0); // no |= otherwise echo received !!
        PORTD |= (1 << PD4); // B2: MODBUS-DE = 1
        PORTD |= (1 << PD5); // B2: MODBUS-nRE = 1
        UDR0 = *sys.uart0Buf++;
    }


    void sendViaUart1 (uint8_t buf[], uint8_t size) {
        if (buf == NULL || size < 1) {
            uc2_app::uart1ReadyToSent(1);
        }
        if (sys.uart1Size > 0) {
            sys.uart1Size = 0;
            uc2_app::uart1ReadyToSent(2);
        }
        sys.uart1Buf = buf;
        sys.uart1Size = size - 1;
        UCSR1B = (1 << TXCIE1) | (1 << TXEN1); // no |= otherwise echo received !!
        PORTD |= (1 << PD6); // B3: MODBUS-DE = 1
        PORTD |= (1 << PD7); // B3: MODBUS-nRE = 1
        UDR1 = *sys.uart1Buf++;
    }



}   

// ------------------------------------
// Interrupt Service Routinen
// ------------------------------------

ISR (USART0_RX_vect) {
    uint8_t c = UDR0;
    TCNT1 = 0;
    OCR1A  = uc2_sys::sys.ocr1aInit;
    TCCR1B = uc2_sys::sys.tccr1bInit;
    uc2_app::handleUart0Byte(c);
}

ISR (USART0_TX_vect) {
    if (uc2_sys::sys.uart0DebugByte > 0) {
        UDR0 = uc2_sys::sys.uart0Mode == uc2_sys::DEBUG ? uc2_sys::sys.uart0DebugByte : 0x80 | uc2_sys::sys.uart0DebugByte;
        uc2_sys::sys.uart0DebugByte = 0;
    
    } else if (uc2_sys::sys.uart0Size > 0) {
        UDR0 = *uc2_sys::sys.uart0Buf++;
        uc2_sys::sys.uart0Size--;
    
    } else {
        PORTD &= ~(1 << PD4); // B2: MODBUS-DE = 0
        PORTD &= ~(1 << PD5); // B2: MODBUS-nRE = 0
        UCSR0B |= (1 << RXCIE0) | (1 << RXEN0);
        UCSR0B &= ~((1 << TXCIE0) | (1 << TXEN0));
        uc2_app::uart0ReadyToSent(0);
    }
}

ISR (TIMER1_COMPA_vect) {
    TCCR1B = 0;  // disable timer 1
    TCNT1 = 0;
    uc2_app::handleUart0Byte(-1);
}

// ------------------------------------

ISR (USART1_RX_vect) {
    uint8_t c = UDR1;
    TCNT2 = 0;
    OCR2A  = uc2_sys::sys.ocr2aInit;
    TCCR2B = uc2_sys::sys.tccr2bInit;
    uc2_app::handleUart1Byte(c);
}

ISR (USART1_TX_vect) {
    if (uc2_sys::sys.uart1Size > 0) {
        UDR1 = *uc2_sys::sys.uart1Buf++;
        uc2_sys::sys.uart1Size--;
    } else {
        PORTD &= ~(1 << PD6); // B3: MODBUS-DE = 0
        PORTD &= ~(1 << PD7); // B3: MODBUS-nRE = 0
        UCSR1B |= (1 << RXCIE1) | (1 << RXEN1);
        UCSR1B &= ~((1 << TXCIE1) | (1 << TXEN1));
        uc2_app::uart1ReadyToSent(0);
    }
}

ISR (TIMER2_COMPA_vect) {
    TCCR2B = 0;  // disable timer 2
    TCNT2 = 0;
    uc2_app::handleUart1Byte(-1);
}

// ------------------------------------

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
            uc2_sys::sys.taskErr_u8 = uc2_sys::inc8BitCnt(uc2_sys::sys.taskErr_u8);
        } else {
            busy = 1;
            sei();
            if      (cnt500us & 0x01) uc2_app::task_1ms();
            else if (cnt500us & 0x02) uc2_app::task_2ms();
            else if (cnt500us & 0x04) uc2_app::task_4ms();
            else if (cnt500us & 0x08) uc2_app::task_8ms();
            else if (cnt500us & 0x10) uc2_app::task_16ms();
            else if (cnt500us & 0x20) uc2_app::task_32ms();
            else if (cnt500us & 0x40) uc2_app::task_64ms();
            else if (cnt500us & 0x80) uc2_app::task_128ms();
            busy = 0;
        }
    }
}


ISR (SPI_STC_vect) {
    if (uc2_sys::sys.spi.mode == uc2_sys::SPIMODE_MODBUS) {
        SPDR0 = uc2_app::handleSpiByte(SPDR0); 

    } else if (uc2_sys::sys.spi.mode == uc2_sys::SPIMODE_STDOUT) {
        uc2_app::handleSpiByte(SPDR0);
        SPDR0 = uc2_sys::sys.spi.toSendFromStdout;
        uc2_sys::sys.spi.toSendFromStdout = 0;

    } else {
        uint8_t b = uc2_app::handleSpiByte(SPDR0);
        if (b == 0) {
            SPDR0 = uc2_sys::sys.spi.toSendFromStdout | 0x80;
            uc2_sys::sys.spi.toSendFromStdout = 0;

        } else {
            SPDR0 = b;

        }

    }
}
