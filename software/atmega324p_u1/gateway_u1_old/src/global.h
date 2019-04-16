#ifndef GLOBAL_H_INCLUDED
#define GLOBAL_H_INCLUDED
  
#define F_CPU 12000000UL
#ifndef __AVR_ATmega324P__
    #define __AVR_ATmega324P__
#endif

//#define GLOBAL_UART0_BITRATE  57600
#define GLOBAL_UART0_BITRATE  115200
#define GLOBAL_UART1_BITRATE  9600
#define GLOBAL_UART0_RECBUFSIZE  16

#endif // GLOBAL_H_INCLUDED
