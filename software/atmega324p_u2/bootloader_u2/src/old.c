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

// Globale variablen
uint8_t flashMode_u8;

// Funktionsprototypen
void init(void);
char isSer(void);
char getSer(void);
void sendByte(char ch);
void sendStr(const char *s);
void sendByteAsASCII(unsigned char byte);
unsigned char toHexByte(char hi, char lo);
unsigned char hexCharToInt(char ch);
void command (char first);
void sendStrPgm (const char *s);
void sendLineFeed(void);

void (*startApplication)( void ) = (void *)0x0000;
void (*startBootloader)( void ) = (void *)BOOTADR;

typedef void (*pFunc)(char);
typedef struct Table {
    pFunc       funcCommand;
    const char *welcomeMsg;
    uint8_t     mainVersion;
    uint8_t     subVersion;
    uint16_t    magic;
} Table;

const char __attribute__ ((section (".table"))) welcomeMsg[52] =
  "Bootloader uc1 V0.01 [Atmega324P,2018-10-xx,SX] ";

const struct Table __attribute__ ((section (".table"))) table = {
    command,
    welcomeMsg,
    0x02,
    0x0,
    0x1234
};



void flashWithRSN (void)
{
  int  i,j;
  char recFeld[2*SPM_PAGESIZE+8];
  int  recCnt;
  char recCh;
  int  intelAdr=0;
  char intelFeld[SPM_PAGESIZE+1];
  uint8_t  chksum;
  uint16_t err;
  
  _delay_ms(100);
  sendLineFeed();
  sendStr("f>");

  while(1)
  {
    recCnt = 0;
    err = 0;

    //for (i=0; i<2*SPM_PAGESIZE+8; i++)
    //  recFeld[i] = 0xff;

    err = 0;
    while (err < 0xfffff)
    {
      if (UCSR0A & 0x80)
      {
        err = 0;
        recFeld[recCnt++] = UDR0;

        if (recCnt==3 && recFeld[0]=='F')
        {
          sendByte('X');
          break;
        }

        if(recCnt==(SPM_PAGESIZE+3))
        {
          sendByte('=');
          sendByte(recFeld[1]);
          sendByte(recFeld[2]);
          recFeld[recCnt]=0;
          break;
        }
      }
      err++;
    }

    if (err)
      sendByte('E');

    // Check RSN
    if (recFeld[0]=='F')
    {
      _delay_ms(100);
      startApplication();
    }
    else if (recFeld[0]=='P')
    {
      intelAdr = toHexByte(recFeld[1],recFeld[2]);

      chksum=0;
      // ByteFeld bestimmen
      for(i=0,j=3; i<=SPM_PAGESIZE && j<recCnt; i++,j++)
      {
        switch (flashMode_u8)
        {
          case 0: // ASCII mode without chksum
          case 1: // ASCII mode with chksum
            intelFeld[i] = toHexByte(recFeld[j], recFeld[j+1]);
            j++;
            break;

          case 2: // binary mode without chksum
          case 3: // binary mode with chksum
            intelFeld[i] = recFeld[j];
            break;

          default: // error
            j = recCnt;
            i = 0;
            break;
        }

        if (i<SPM_PAGESIZE)
          chksum += intelFeld[i];
      }

      if (flashMode_u8==0 || flashMode_u8==2)
      {
        if (i !=SPM_PAGESIZE)
          err = (i<<8) | 1;
      }
      else if (flashMode_u8==1 || flashMode_u8==3)
      {
        if (i != (SPM_PAGESIZE+1))
          err = (i<<8) | 2;
        else if (chksum != intelFeld[SPM_PAGESIZE])
          err = (chksum<<8) | 3;
      }

      if (err==0)
      {
        // Ins FLASH schreiben
        eeprom_busy_wait ();
        boot_page_erase (intelAdr*SPM_PAGESIZE);
        boot_spm_busy_wait (); // warten bis Speicher geloescht
        for (i=0; i<SPM_PAGESIZE; i+=2)
        {
          // little-endian Wort definieren
          unsigned int w = intelFeld[i] + (intelFeld[i+1] << 8);
          boot_page_fill (intelAdr*SPM_PAGESIZE+ i, w);
        }

        // Buffer in Flash-Speicher speichern
        boot_page_write (intelAdr*SPM_PAGESIZE);

        // Warten bis der Speicher geschrieben ist
        boot_spm_busy_wait();

        // RWW_Enable einschalten, damit die Applikation funktioniert
        boot_rww_enable ();

        //_delay_ms(100);
        chksum = 0;
        for (i=0; err==0 && i<SPM_PAGESIZE; i++)
        {
          recCh = pgm_read_byte(intelAdr*SPM_PAGESIZE +i);
          chksum += recCh;
          if (recCh != intelFeld[i])
            err = (i<<8) | 4;
        }
      }

      sendByte(32);
      sendByteAsASCII(chksum);

      sendByte(32);
      sendByteAsASCII(err & 0xff);

      sendByte(32);
      sendByteAsASCII(err >> 8);
    }

    sendLineFeed();
    sendStr("f>");
  }
}






// Funktion zum Initialisieren des Systems
// Name: init
// Parameter: ---
// Rueckgabewert:---
void init(void)
{
  MCUSR = 0;     // first step to turn off WDT
  wdt_disable(); // second step to turn off WDT
  // init UART
  UCSR0A  = 0x02; // double the UART speed
  UCSR0B = 0x18; // RX + TX enable
  UBRR0H = 0;
  //UBRR0L = 102; // 9600 baud @ 8 MHz
  //UBRR0L = 25; // 38400 baud @ 8 MHz
  //UBRR0L = 17; // 57600 baud @ 8 MHz

  UBRR0L = (F_CPU/BAUDRATE + 4)/8 - 1;
  // =25 (38400@8MHz), =102 (9600@8MHz), =17 (57600baud@8MHz)
}


void cmdSetSpeed (char *recBuf)
{
  int i= toHexByte(recBuf[0], recBuf[1]);
  if (i>3 && i<100)
  {
    UCSR0B = 0; // RX + TX disable
    UBRR0H = 0;
    UBRR0L = i;
    UCSR0B = 0x18; // RX + TX enable
  }
}


void cmdSetMode (char *recBuf)
{
  flashMode_u8 = toHexByte(recBuf[0], recBuf[1]);
}


void cmdFlash (char *recBuf)
{
  if (recBuf[0]=='1' && recBuf[1]=='2' && recBuf[2]=='8')
  {
    switch (flashMode_u8)
    {
      case 0: case 1: case 2: case 3:
        flashWithRSN();
        break;

      default:
        startBootloader();
    }
  }
  startApplication();
}


void cmdDumpMemory (char *recBuf)
{

  uint16_t page = toHexByte(recBuf[1], recBuf[2]);
  uint8_t  i;
  uint8_t  byte;

  sendLineFeed();
  sendByteAsASCII(page);
  sendByte(':');

  for (i=0; i<SPM_PAGESIZE; i++)
  {
    byte = pgm_read_byte(page*SPM_PAGESIZE + i);
    if (recBuf[0]=='b')
      sendByte(byte);
    else
      sendByteAsASCII(byte);
  }
  sendLineFeed();
}


void command (char first)
{
  char c;
  char recBuf[16];
  uint8_t len;
  uint8_t i;

  len = 0;
  c = first;

  do
  {
    if (c != 0 && len<(sizeof(recBuf)-1) )
    {
      recBuf[len++] = c;
      sendByte(c);
      c = 0;
    }
    if (isSer())
      c = getSer();
  }
  while (c != 10 && c != 13);

  recBuf[len++] = 0;

  for (i=0; i<len; i++)
  {
    if (recBuf[i] == '@')
    {
      i++;
      switch (recBuf[i])
      {
        case 's':
          cmdSetSpeed(&recBuf[i+1]);
        break;

        case 'm':
          cmdSetMode(&recBuf[i+1]);
        break;

        case 'f':
          cmdFlash(&recBuf[i+1]);
        break;

        case 'd':
          cmdDumpMemory(&recBuf[i+1]);
        break;

        case 'g':
          startApplication();
        break;

        case 'r':
          startBootloader();
        break;
      }
    }
  }

  startBootloader();
}



// Funktionen fuer die serielle Schnittstelle
// Wurde ein Zeichen empfangen?
// Name: isSer
// Parameter: ---
// Rueckgabewert:0..nein - 1..ja
char isSer(void)
{
  return (UCSR0A & 0x80)==0x80 ? 1 : 0;
}


// Ein Zeichen einlesen
// Name: getSer
// Parameter: ---
// Rueckgabewert:das eingelesene Zeichen
char getSer(void)
{
  while (!isSer())
    ;
  return UDR0;
}


// Ein Zeichen senden
// Name: sendByte
// Parameter: das zu sendende Zeichen
// Rueckgabewert:---
void sendByte(char ch)
{
  UDR0 = ch;
  while ((UCSR0A & 0x20)==0x00)
  ;
}


// Einen String senden
// Name: sendStr
// Parameter: den zu sendenden String
// Rueckgabewert:---
void sendStr (const char *s)
{
  while (*s)
  {
    sendByte(*s++);
  }
}


void sendStrPgm (const char *s)
{
  uint8_t byte;

  while (1)
  {
    byte = pgm_read_byte(s++);
    if (!byte)
      break;
    sendByte(byte);
  }
}

void sendLineFeed(void)
{
  sendByte(13);
  sendByte(10);
}



// 2 ASCII Zeichen in eine HexZahl umwandeln
// Name: toHexByte
// Parameter: die 2 Zeichen
// Rueckgabewert:der berechnete Wert
unsigned char toHexByte(char hi, char lo)
{
  return (hexCharToInt(hi)<<4) + hexCharToInt(lo);
}


// Eine ASCII Zeichen in eine Zahl umwandeln
// Name: hexCharToInt
// Parameter: den zu sendenden String
// Rueckgabewert:---
unsigned char hexCharToInt(char ch)
{
  if(ch>='0' && ch<='9')
    return ch-'0';
  if(ch>='A' && ch<='F')
    return ch-'A'+10;
  if(ch>='a' && ch<='f')
    return ch-'a'+10;

  return 0;
}


void sendByteAsASCII(unsigned char byte)
{
  char s[2];

  s[0] = byte>>4;
  s[1] = byte - (s[0]<<4);
  s[0] = s[0]>9 ? s[0]+'A'-10 : s[0]+'0';
  s[1] = s[1]>9 ? s[1]+'A'-10 : s[1]+'0';
  sendByte(s[0]);
  sendByte(s[1]);
}


int main(void)
{
  int  timer;
  char c;

  init();
  flashMode_u8 = 0;
  //_delay_ms(50);
  sendLineFeed();
  sendStrPgm(welcomeMsg);
  sendLineFeed();
  sendStr(" ... press '@'");
  sendLineFeed();

  timer = 0;
  c = 0;
  do
  {
    sendStr(".");
    timer++;
    _delay_ms(50);
    if(isSer())
      c = getSer();
  }
  while (timer<40 && c!='@');

  sendLineFeed();
  if (timer<40)
  {
    command(c);
  }

  startApplication();
  return 0;
}


