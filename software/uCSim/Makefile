.PHONY: clean all

$(shell mkdir -p dist >/dev/null)
$(shell mkdir -p build >/dev/null)

all: dist/ucsim.elf

dist/ucsim.elf: build/main.o build/gui.o build/gtkgui.o build/uc1_sys.o build/uc1_app.o build/uc2_sys.o build/uc2_app.o
	g++ -g $^ -pthread `pkg-config --libs gtk+-3.0` -o $@ 

build/gui.o: src/gui/gui.cpp src/gui/gui.hpp
	g++ -g $< -o $@ -c `pkg-config --cflags gtk+-3.0`

build/gtkgui.o: src/gui/gtkgui.cpp src/gui/gtkgui.hpp src/gui/gui.hpp
	g++ -g $< -o $@ -c `pkg-config --cflags gtk+-3.0`

build/main.o: src/main.cpp src/gui/gtkgui.hpp
	g++ -g $< -o $@ -c `pkg-config --cflags gtk+-3.0`

build/uc1_sys.o: src/uc1/sys.cpp src/gui/gui.hpp src/uc1/global.h src/uc1/sys.hpp
	g++ -g -o $@ -c $<

build/uc1_app.o: src/uc1/app.cpp src/uc1/global.h src/uc1/app.hpp src/uc1/sys.hpp
	g++ -g -o $@ -c $<

build/uc2_sys.o: src/uc2/sys.cpp src/gui/gui.hpp src/uc2/global.h src/uc2/sys.hpp
	g++ -g -o $@ -c $<

build/uc2_app.o: src/uc2/app.cpp src/uc2/global.h src/uc2/app.hpp src/uc2/sys.hpp
	g++ -g -o $@ -c $<

clean:
	-@rm -r dist
	-@rm -r build
