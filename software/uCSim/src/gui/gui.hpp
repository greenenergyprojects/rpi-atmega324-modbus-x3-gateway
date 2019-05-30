#ifndef GUI_HPP
#define GUI_HPP

extern class Gui *gui;

class Gui {

    public:
        virtual int  show (int argc, char **argv, void *(*callback)(void *)) = 0;
        virtual void setU1LedGreen (bool on) = 0;
        virtual void setU1LedRed (bool on) = 0;
        virtual void setU1LedYellow (bool on) = 0;
        virtual void appendU1Text (const char *text) = 0;

        virtual void appendSpiTextU1toU2 (const char *text) = 0;
        virtual void appendSpiTextU2toU1 (const char *text) = 0;

        virtual void setU2LedGreen (bool on) = 0;
        virtual void setU2LedRed (bool on) = 0;
        virtual void setU2LedYellow (bool on) = 0;
        virtual void appendU2Text (const char *text) = 0;
};

#endif
