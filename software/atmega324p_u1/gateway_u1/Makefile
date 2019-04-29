.PHONY: clean all

$(shell mkdir -p dist >/dev/null)
$(shell mkdir -p build >/dev/null)

## Intel Hex file production flags
HEX_FLASH_FLAGS = -R .eeprom -R .fuse -R .lock -R .signature

all: dist/atmega324p_u1.hex
	@avr-size --mcu=atmega324p --format=avr dist/atmega324p_u1.elf

dist/atmega324p_u1.hex: dist/atmega324p_u1.elf
	avr-objcopy -O ihex $< $@

dist/atmega324p_u1.elf: build/main.o build/sys.o build/app.o
	avr-gcc -o $@ -mmcu=atmega324p build/main.o build/sys.o build/app.o

build/main.o: src/main.cpp src/global.h src/sys.hpp src/app.hpp
	avr-g++ -o $@ -mmcu=atmega324p -Os -c -DCOMPILE $<

build/sys.o: src/sys.cpp src/global.h src/sys.hpp
	avr-g++ -o $@ -mmcu=atmega324p -Os -c -DCOMPILE $<

build/app.o: src/app.cpp src/global.h src/app.hpp src/sys.hpp
	avr-g++ -o $@ -mmcu=atmega324p -Os -c -DCOMPILE $<

u1: dist/atmega324p_u1.hex
	avrdude -c usbasp -p atmega324p -e -U flash:w:$<:i

u1bl: dist/atmega324p_u1.hex ../bootloader_u1/dist/bootloader_atmega324p_115200_12MHz_u1_uart0.hex
	avrdude -c usbasp -p atmega324p -e -U flash:w:$<:i
	avrdude -c usbasp -p atmega324p -D -U flash:w:../bootloader_u1/dist/bootloader_atmega324p_115200_12MHz_u1_uart0.hex:i

clean:
	-@rm -r dist
	-@rm -r build
