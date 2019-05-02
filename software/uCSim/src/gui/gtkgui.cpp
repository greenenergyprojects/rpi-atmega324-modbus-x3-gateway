
#include <gtk/gtk.h>
#include <string.h>
#include <iostream>
#include <sstream>
#include <thread>
#include <cstring>

#include "gtkgui.hpp"
#include "../bridge/bridge.hpp"


std::string GtkGui::createModbusAsciiFrame (const char f[]) {
    int size = 0;
    uint8_t lrc = 0;
    if (f[0] != ':' || f[1] == 0) {
        return ""; 
    }
    std::stringstream rv;
    rv << ':';
    for (int i = 1; f[i] != 0; i++) {
        if (!((f[i] >= '0' && f[i] <= '9') || (f[i] >= 'A' && f[i] <= 'F'))) {
            return "";
        }
        lrc = lrc + f[i];
        rv << f[i];
    }
    lrc = (uint8_t)(-(int8_t)lrc);
    char s[3];
    snprintf(s, sizeof s, "%02X", lrc);
    rv << s << "\r\n";
    return rv.str();
}

void GtkGui::onButtonClicked(GtkWidget *widget) {
    if (widget == (void *)u1ButtonTest) {
        
        // Modbus E-Meter
        // Request  :010300000004B8 -> RTU: 01 03 00 00 00 04 44 09
        // Response RTU: 01 03 08 00 00 00 27 00 00 00 00 a1 d0 -> :0103080000002700000000CB

        // :010300000009B3
        // :01031200000027000000000000000000000000000010
        // 0000 0027 0000 0000 0000 0000 0000 0000 0000 10

        // all registers: :010300000016B5
        // response :01032C00000027000000000000000000000000000000050000002208B700000000000003E813890000000000000101DD
        //           01032C00000027000000000000000000000000000000050000002208B700000000000003E813900000000000000101E5
        // 0000 0027 0000 0000 0000 0000 0000 0000 0000 0005 0000 0022 08B7 0000 0000 0000 03E8 1390 0000 0000 0000 0101

        // std::string frame(":010300110001B9");
        std::string frame(":010300000016B5");
        std::string rawFrame = frame + "\r\n";
        int rv = bridge::sendStringToUc1Uart0(115200, (uint8_t *)rawFrame.c_str(), rawFrame.length());
        std::string msg = "PI -> U1-UART0:  " + frame + "\\r\\n\"" + "\n";
        appendU1Text(msg.c_str());
    }
    if (widget == (void *)u2ButtonTest) {
        // std::string frame(":020300000001BA");
        // std::string frame(":010300110001B9");
        std::string frame(":012B01233239390D");
        std::string rawFrame = createModbusAsciiFrame(frame.c_str());
        int rv = bridge::sendStringToUc1Uart0(115200, (uint8_t *)rawFrame.c_str(), rawFrame.length());
        std::string msg = "PI -> U1:UART0:  " + rawFrame.substr(0, rawFrame.length() - 2) + "\\r\\n\"" + "\n";
        appendU1Text(msg.c_str());
    }
}

void GtkGui::activate (GtkApplication* app) {

    GtkBuilder *builder;
    GtkWidget *window;
    GError *error = NULL;

    builder = gtk_builder_new ();
    if (gtk_builder_add_from_file (builder, "ucsim.glade", &error) == 0) {
        g_printerr ("Error loading file: %s\n", error->message);
        g_clear_error (&error);
        exit(1);
    }

    window = GTK_WIDGET(gtk_builder_get_object (builder, "window"));
    g_signal_connect (window, "destroy", G_CALLBACK (gtk_main_quit), NULL);
    
    u1ButtonTest = gtk_builder_get_object (builder, "u1ButtonTest");
    u1LabelG = GTK_WIDGET(gtk_builder_get_object (builder, "u1LabelG"));
    u1LabelR = GTK_WIDGET(gtk_builder_get_object (builder, "u1LabelR"));
    u1LabelY = GTK_WIDGET(gtk_builder_get_object (builder, "u1LabelY"));
    u1Text   = GTK_WIDGET(gtk_builder_get_object (builder, "u1Text"));

    u2ButtonTest = gtk_builder_get_object (builder, "u2ButtonTest");
    u2LabelG = GTK_WIDGET(gtk_builder_get_object (builder, "u2LabelG"));
    u2LabelR = GTK_WIDGET(gtk_builder_get_object (builder, "u2LabelR"));
    u2LabelY = GTK_WIDGET(gtk_builder_get_object (builder, "u2LabelY"));
    u2Text   = GTK_WIDGET(gtk_builder_get_object (builder, "u2Text"));

    g_signal_connect (u1ButtonTest, "clicked", G_CALLBACK (callbackOnButtonTest1Clicked), this);
    g_signal_connect (u2ButtonTest, "clicked", G_CALLBACK (callbackOnButtonTest2Clicked), this);
    // g_object_unref(builder);
    gtk_widget_show(window);
}

GtkGui::GtkGui () {

}

GtkGui::~GtkGui () {

}


int GtkGui::show (int argc, char **argv, void* (*callback)(void *)) {
    // gtk_init (&argc, &argv);
    GtkApplication *app;
    int status;

    app = gtk_application_new ("sx.htlmechatronik.at.ucsim", G_APPLICATION_FLAGS_NONE);
    g_signal_connect (app, "activate", G_CALLBACK (callbackActivate), this);
    status = g_application_run (G_APPLICATION (app), argc, argv);
    g_object_unref (app);

    // GTK is not thread save, functions must be called inside this thread!
    std::thread::id myThreadId = std::this_thread::get_id();
    std::cout << "gtk_main thread id: 0x" << std::hex << myThreadId << "\n";

    pthread_t tid;
    int rc = pthread_create(&tid, NULL, callback, NULL);
    if (rc) {
         std::cout << "Error:unable to create thread," << rc << std::endl;
         exit(-1);
    }

    gtk_main ();
}

gboolean GtkGui::callbackSetLabelColor (gpointer* data) {
    SetLabelColorData *p = reinterpret_cast<SetLabelColorData*>(data);
    gtk_widget_override_color (p->label, GTK_STATE_FLAG_NORMAL, &p->color);
    free(p);
    return false;
}

void GtkGui::setU1LedGreen (bool on) {
    struct SetLabelColorData *p = (struct SetLabelColorData *)calloc(sizeof(struct SetLabelColorData), 1);
    p->label = u1LabelG;
    p->color.alpha = 1;
    p->color.green = on ? 1: 0;
    g_idle_add((GSourceFunc)callbackSetLabelColor, p);
}

void GtkGui::setU1LedRed (bool on) {
    struct SetLabelColorData *p = (struct SetLabelColorData *)calloc(sizeof(struct SetLabelColorData), 1);
    p->label = u1LabelR;
    p->color.alpha = 1;
    p->color.red = on ? 1: 0;
    g_idle_add((GSourceFunc)callbackSetLabelColor, p);

}

void GtkGui::setU1LedYellow (bool on) {
    struct SetLabelColorData *p = (struct SetLabelColorData *)calloc(sizeof(struct SetLabelColorData), 1);
    p->label = u1LabelY;
    p->color.alpha = 1;
    p->color.red = on ? 1: 0;
    p->color.green = on ? 1: 0;
    g_idle_add((GSourceFunc)callbackSetLabelColor, p);      
}

void GtkGui::setU2LedGreen (bool on) {
    struct SetLabelColorData *p = (struct SetLabelColorData *)calloc(sizeof(struct SetLabelColorData), 1);
    p->label = u2LabelG;
    p->color.alpha = 1;
    p->color.green = on ? 1: 0;
    g_idle_add((GSourceFunc)callbackSetLabelColor, p);
}

void GtkGui::setU2LedRed (bool on) {
    struct SetLabelColorData *p = (struct SetLabelColorData *)calloc(sizeof(struct SetLabelColorData), 1);
    p->label = u2LabelR;
    p->color.alpha = 1;
    p->color.red = on ? 1: 0;
    g_idle_add((GSourceFunc)callbackSetLabelColor, p);

}

void GtkGui::setU2LedYellow (bool on) {
    struct SetLabelColorData *p = (struct SetLabelColorData *)calloc(sizeof(struct SetLabelColorData), 1);
    p->label = u2LabelY;
    p->color.alpha = 1;
    p->color.red = on ? 1: 0;
    p->color.green = on ? 1: 0;
    g_idle_add((GSourceFunc)callbackSetLabelColor, p);      
}


gboolean GtkGui::callbackSetLabelText (gpointer* data) {
    // std::thread::id tid = std::this_thread::get_id();
    // std::cout << "callbackSetLabelText thread: " << std::hex << tid << "\n";
    SetLabelTextData *p = reinterpret_cast<SetLabelTextData*>(data);
    if (p->length >= 0 && p->text != NULL && p->textView != NULL) {
        GtkTextBuffer *buffer = gtk_text_view_get_buffer (GTK_TEXT_VIEW (p->textView));
        if (p->append) {
            GtkTextIter end;
            gtk_text_buffer_get_end_iter (buffer, &end);
            gtk_text_buffer_insert(buffer, &end, p->text, p->length);
        } else {
            gtk_text_buffer_set_text(buffer, p->text, p->length);
        }
    }
    if (p->text) { 
        free(p->text);
    }
    free(p);
    return false;
}

void GtkGui::appendU1Text (const char *t) {
    // std::thread::id tid = std::this_thread::get_id();
    // std::cout << "appendText thread: " << std::hex << tid << "\n";
    struct SetLabelTextData *p = (struct SetLabelTextData *)calloc(sizeof(struct SetLabelTextData), 1);
    p->textView = u1Text;
    p->length = strlen(t);
    p->append = true;
    p->text = (char *)malloc(p->length + 1);
    strncpy(p->text, t, p->length);
    p->text[p->length] = 0;
    g_idle_add((GSourceFunc)callbackSetLabelText, p);   
}

void GtkGui::appendU2Text (const char *t) {
    // std::thread::id tid = std::this_thread::get_id();
    // std::cout << "appendText thread: " << std::hex << tid << "\n";
    struct SetLabelTextData *p = (struct SetLabelTextData *)calloc(sizeof(struct SetLabelTextData), 1);
    p->textView = u2Text;
    p->length = strlen(t);
    p->append = true;
    p->text = (char *)malloc(p->length + 1);
    strncpy(p->text, t, p->length);
    p->text[p->length] = 0;
    g_idle_add((GSourceFunc)callbackSetLabelText, p);   
}