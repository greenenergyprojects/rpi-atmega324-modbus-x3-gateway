#ifndef GTKGUI_HPP
#define GTKGUI_HPP

#include <gtk/gtk.h>
#include "gui.hpp"

struct SetLabelColorData {
    GtkWidget *label;
    GdkRGBA   color;
};

struct SetLabelTextData {
    GtkWidget *textView;
    char      *text;
    int       length;
    bool      append;
};

class GtkGui : public Gui {

    private:
        GtkWidget *u1LabelG, *u1LabelR, *u1LabelY, *u1Text, *u1Tab;
        GtkWidget *spiTextU1ToU2, *spiTextU2ToU1;
        GtkWidget *u2LabelG, *u2LabelR, *u2LabelY, *u2Text, *u2Tab;
        GObject *u1ButtonClear, *u1ButtonTest, *u1ButtonSendU1, *u1ButtonSendB1;
        GObject *spiButtonClear;
        GObject *u2ButtonClear, *u2ButtonTest, *u2ButtonSendU2, *u2ButtonSendB2, *u2ButtonSendB3;

        static void callbackOnButtonClicked (GtkWidget* button, gpointer* data) {
            reinterpret_cast<GtkGui*>(data)->onButtonClicked(button);
        }
        static void callbackActivate (GtkApplication* app, gpointer* data) {
            reinterpret_cast<GtkGui*>(data)->activate(app);
        }
        static gboolean callbackSetLabelColor (gpointer* data);
        static gboolean callbackSetLabelText (gpointer* data);


        void activate (GtkApplication* app);
        void onButtonClicked(GtkWidget *widget);
        std::string createModbusAsciiFrame (const char f[]);

    public:
        GtkGui ();
        ~GtkGui ();

        virtual int  show (int argc, char **argv, void *(*callback)(void *));

        virtual void setText (int index, const char *t);
        virtual void appendText (int index, const char *t);

        virtual void setU1LedGreen (bool on);
        virtual void setU1LedRed (bool on);
        virtual void setU1LedYellow (bool on);
        virtual void setU1Text (const char *text);
        virtual void appendU1Text (const char *text);

        virtual void setSpiTextU1toU2 (const char *text);
        virtual void setSpiTextU2toU1 (const char *text);
        virtual void appendSpiTextU1toU2 (const char *text);
        virtual void appendSpiTextU2toU1 (const char *text);

        virtual void setU2LedGreen (bool on);
        virtual void setU2LedRed (bool on);
        virtual void setU2LedYellow (bool on);
        virtual void setU2Text (const char *text);
        virtual void appendU2Text (const char *text);

};

#endif
