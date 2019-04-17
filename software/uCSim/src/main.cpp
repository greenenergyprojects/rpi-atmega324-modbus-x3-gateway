#include <iostream>
#include <string>
#include <gtk/gtk.h>

#include "gui/gtkgui.hpp"
#include "bridge/bridge.hpp"
#include "uc1/sys.hpp"
#include "uc1/app.hpp"
#include "uc2/sys.hpp"
#include "uc2/app.hpp"

using namespace std;

Gui *gui = NULL;

void *mainLoop (void *tid) {
    bridge::init();
    uc1_sys::init();
    uc2_sys::init();
    uc1_app::init();
    uc2_app::init();

    while (true) {
        uc1_sys::main();
        uc2_sys::main();
        uc1_app::main();
        uc2_app::main();
        struct timeval tm;
        tm.tv_sec = 0;
        tm.tv_usec = 20;
        select(0 ,NULL, NULL, NULL, &tm);
    }
}


int main (int argc, char **argv) {

    gui = new GtkGui();
    int status = gui->show(argc, argv, mainLoop);
    std::cout << "End of program (exit code " << status << ")" << std::endl;

    return status;
}
