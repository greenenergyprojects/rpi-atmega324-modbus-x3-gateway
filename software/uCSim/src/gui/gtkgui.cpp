
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
    if (widget == (void *)u1ButtonClear) {
        setU1Text(NULL);

    } else if (widget == (void *)u2ButtonClear) {
        setU2Text(NULL);
    
    } else if (widget == (void *)spiButtonClear) {
        setSpiTextU1toU2(NULL);
        setSpiTextU2toU1(NULL);

    } else if (widget == (void *)u1ButtonTest) {
        appendU1Text("Test\n");

    } else if (widget == (void *)u2ButtonTest) {
        appendU2Text("Test\n");

    } else if (widget == (void *)u1ButtonSendU1) {
        
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

        std::string frame(":800600000015");
        //std::string frame(":800300000016B5");
        std::string rawFrame = createModbusAsciiFrame(frame.c_str());
        int rv = bridge::sendStringToUc1Uart0(115200, (uint8_t *)rawFrame.c_str(), rawFrame.length());
        std::string msg = "PI -> U1-UART0:  " + rawFrame.substr(0, rawFrame.length() - 2) + "\\r\\n\"" + "\n";
        appendU1Text(msg.c_str());
    
    } else if (widget == (void *)u1ButtonSendB1) {
        // std::string frame(":020300000001BA");
        // std::string frame(":010300110001B9");
        std::string frame(":012B01233239390D");
        std::string rawFrame = createModbusAsciiFrame(frame.c_str());
        int rv = bridge::sendStringToUc1Uart0(115200, (uint8_t *)rawFrame.c_str(), rawFrame.length());
        std::string msg = "PI -> U1:UART0:  " + rawFrame.substr(0, rawFrame.length() - 2) + "\\r\\n\"" + "\n";
        appendU1Text(msg.c_str());
    
    
    } else if (widget == (void *)u2ButtonSendU2) {
        std::string frame(":810600000001");
        //std::string frame(":800300000016B5");
        std::string rawFrame = createModbusAsciiFrame(frame.c_str());
        int rv = bridge::sendStringToUc1Uart0(115200, (uint8_t *)rawFrame.c_str(), rawFrame.length());
        std::string msg = "PI -> U1-UART0:  " + rawFrame.substr(0, rawFrame.length() - 2) + "\\r\\n\"" + "\n";
        appendU2Text("Send to U2\n");
        appendU1Text(msg.c_str());
    
    } else if (widget == (void *)u2ButtonSendB2) {
        std::string frame(":020600000001");
        //std::string frame(":800300000016B5");
        std::string rawFrame = createModbusAsciiFrame(frame.c_str());
        int rv = bridge::sendStringToUc1Uart0(115200, (uint8_t *)rawFrame.c_str(), rawFrame.length());
        std::string msg = "PI -> U1-UART0:  " + rawFrame.substr(0, rawFrame.length() - 2) + "\\r\\n\"" + "\n";
        appendU2Text("Send to B2\n");
        appendU1Text(msg.c_str());

    
    } else if (widget == (void *)u2ButtonSendB3) {
        std::string frame(":030600000001");
        //std::string frame(":800300000016B5");
        std::string rawFrame = createModbusAsciiFrame(frame.c_str());
        int rv = bridge::sendStringToUc1Uart0(115200, (uint8_t *)rawFrame.c_str(), rawFrame.length());
        std::string msg = "PI -> U1-UART0:  " + rawFrame.substr(0, rawFrame.length() - 2) + "\\r\\n\"" + "\n";
        appendU2Text("Send to B3\n");
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
    
    u1ButtonClear = gtk_builder_get_object (builder, "u1ButtonClear");
    u1ButtonTest = gtk_builder_get_object (builder, "u1ButtonTest");
    u1ButtonSendU1 = gtk_builder_get_object (builder, "u1ButtonSendU1");
    u1ButtonSendB1 = gtk_builder_get_object (builder, "u1ButtonSendB1");
    u1LabelG = GTK_WIDGET(gtk_builder_get_object (builder, "u1LabelG"));
    u1LabelR = GTK_WIDGET(gtk_builder_get_object (builder, "u1LabelR"));
    u1LabelY = GTK_WIDGET(gtk_builder_get_object (builder, "u1LabelY"));
    u1Text   = GTK_WIDGET(gtk_builder_get_object (builder, "u1Text"));

    spiButtonClear = gtk_builder_get_object (builder, "spiButtonClear");
    spiTextU1ToU2  = GTK_WIDGET(gtk_builder_get_object (builder, "spiTextU1ToU2"));
    spiTextU2ToU1  = GTK_WIDGET(gtk_builder_get_object (builder, "spiTextU2ToU1"));

    u2ButtonClear = gtk_builder_get_object (builder, "u2ButtonClear");
    u2ButtonTest = gtk_builder_get_object (builder, "u2ButtonTest");
    u2ButtonSendU2 = gtk_builder_get_object (builder, "u2ButtonSendU2");
    u2ButtonSendB2 = gtk_builder_get_object (builder, "u2ButtonSendB2");
    u2ButtonSendB3 = gtk_builder_get_object (builder, "u2ButtonSendB3");
    u2LabelG = GTK_WIDGET(gtk_builder_get_object (builder, "u2LabelG"));
    u2LabelR = GTK_WIDGET(gtk_builder_get_object (builder, "u2LabelR"));
    u2LabelY = GTK_WIDGET(gtk_builder_get_object (builder, "u2LabelY"));
    u2Text   = GTK_WIDGET(gtk_builder_get_object (builder, "u2Text"));

    g_signal_connect (u1ButtonClear, "clicked", G_CALLBACK (callbackOnButtonClicked), this);
    g_signal_connect (u1ButtonTest, "clicked", G_CALLBACK (callbackOnButtonClicked), this);
    g_signal_connect (u1ButtonSendU1, "clicked", G_CALLBACK (callbackOnButtonClicked), this);
    g_signal_connect (u1ButtonSendB1, "clicked", G_CALLBACK (callbackOnButtonClicked), this);
    g_signal_connect (spiButtonClear, "clicked", G_CALLBACK (callbackOnButtonClicked), this);
    g_signal_connect (u2ButtonClear, "clicked", G_CALLBACK (callbackOnButtonClicked), this);
    g_signal_connect (u2ButtonTest, "clicked", G_CALLBACK (callbackOnButtonClicked), this);
    g_signal_connect (u2ButtonSendU2, "clicked", G_CALLBACK (callbackOnButtonClicked), this);
    g_signal_connect (u2ButtonSendB2, "clicked", G_CALLBACK (callbackOnButtonClicked), this);
    g_signal_connect (u2ButtonSendB3, "clicked", G_CALLBACK (callbackOnButtonClicked), this);
    // g_object_unref(builder);
    gtk_widget_set_size_request(window, 800, 400);
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
    if (p->textView != NULL) {
        GtkTextBuffer *buffer = gtk_text_view_get_buffer (GTK_TEXT_VIEW (p->textView));
        if (p->append && p->length >= 0 && p->text != NULL) {
            GtkTextIter end;
            gtk_text_buffer_get_end_iter (buffer, &end);
            gtk_text_buffer_insert(buffer, &end, p->text, p->length);
        } else {
            if (p->length < 0 || p->text == NULL) {
                gtk_text_buffer_set_text(buffer, "", 0);
            } else {
                gtk_text_buffer_set_text(buffer, p->text, p->length);
            }
        }
    }
    if (p->text) { 
        free(p->text);
    }
    free(p);
    return false;
}

void GtkGui::setText (int index, const char *t) {
    struct SetLabelTextData *p = (struct SetLabelTextData *)calloc(sizeof(struct SetLabelTextData), 1);
    switch (index) {
        case 0: p->textView = u1Text; break;
        case 1: p->textView = u2Text; break;
        case 2: p->textView = spiTextU1ToU2; break;
        case 3: p->textView = spiTextU2ToU1; break;
        default: return;
    }
    p->append = false;
    if (t == NULL) {
        p->length = -1;
        p->text = NULL;
    } else {
        p->length = strlen(t);
        p->text = (char *)malloc(p->length + 1);
        strncpy(p->text, t, p->length);
        p->text[p->length] = 0;
    }
    g_idle_add((GSourceFunc)callbackSetLabelText, p);
}

void GtkGui::appendText (int index, const char *t) {
    // std::thread::id tid = std::this_thread::get_id();
    // std::cout << "appendText thread: " << std::hex << tid << "\n";
    struct SetLabelTextData *p = (struct SetLabelTextData *)calloc(sizeof(struct SetLabelTextData), 1);
    switch (index) {
        case 0: p->textView = u1Text; break;
        case 1: p->textView = u2Text; break;
        case 2: p->textView = spiTextU1ToU2; break;
        case 3: p->textView = spiTextU2ToU1; break;
        default: return;
    }
    p->length = strlen(t);
    p->append = true;
    p->text = (char *)malloc(p->length + 1);
    strncpy(p->text, t, p->length);
    p->text[p->length] = 0;
    g_idle_add((GSourceFunc)callbackSetLabelText, p);   
}


void GtkGui::setU1Text (const char *t) {
    setText(0, t);
}

void GtkGui::setU2Text (const char *t) {
    setText(1, t);
}

void GtkGui::setSpiTextU1toU2 (const char *t) {
    setText(2, t);
}

void GtkGui::setSpiTextU2toU1 (const char *t) {
    setText(3, t);
}

void GtkGui::appendU1Text (const char *t) {
   appendText(0, t);
}

void GtkGui::appendU2Text (const char *t) {
   appendText(1, t);
}

void GtkGui::appendSpiTextU1toU2 (const char *t) {
    appendText(2, t);
}

void GtkGui::appendSpiTextU2toU1 (const char *t) {
    appendText(3, t);
}
