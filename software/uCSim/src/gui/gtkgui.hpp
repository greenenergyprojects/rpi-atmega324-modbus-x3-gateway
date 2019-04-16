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
        GtkWidget *u2LabelG, *u2LabelR, *u2LabelY, *u2Text, *u2Tab;
        

        static void callbackOnButtonTest1Clicked (GtkWidget* button, gpointer* data) {
            reinterpret_cast<GtkGui*>(data)->onButtonClicked(button);
        }
        static void callbackOnButtonTest2Clicked (GtkWidget* button, gpointer* data) {
            reinterpret_cast<GtkGui*>(data)->onButtonClicked(button);
        }
        static void callbackActivate (GtkApplication* app, gpointer* data) {
            reinterpret_cast<GtkGui*>(data)->activate(app);
        }
        static gboolean callbackSetLabelColor (gpointer* data);
        static gboolean callbackSetLabelText (gpointer* data);


        void activate (GtkApplication* app);
        void onButtonClicked(GtkWidget *widget);

    public:
        GtkGui ();
        ~GtkGui ();

        virtual int  show (int argc, char **argv, void *(*callback)(void *));
        
        virtual void setU1LedGreen (bool on);
        virtual void setU1LedRed (bool on);
        virtual void setU1LedYellow (bool on);
        virtual void appendU1Text (const char *text);

        virtual void setU2LedGreen (bool on);
        virtual void setU2LedRed (bool on);
        virtual void setU2LedYellow (bool on);
        virtual void appendU2Text (const char *text);

};

#endif
