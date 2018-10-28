# Remote typescript project with VS Code

This project shows how to work with a remote typescript project using... 

* a Linux Notebook as working host
* a [Raspberry PI](https://www.raspberrypi.org) with [Raspbian OS](https://www.raspberrypi.org/downloads/raspbian) as remote host
* [Node.js](https://nodejs.org) as Javascript runtime environment on the Raspberry PI
* [Visual Studio Code](https://code.visualstudio.com) (*vsc*) as development environment on the Linux Notebook
* [Remote Workspace](https://marketplace.visualstudio.com/items?itemName=mkloubert.vscode-remote-workspace) as vsc extension
* [Typescript](https://www.typescriptlang.org) as programming language.

The goal is to run the development process on the notebook and to execute and debug the program on the remote system (Raspberry PI).

## Prerequisites

On working host:

* Linux as operating system
* Visual Studio code installed ([Installation](https://code.visualstudio.com/docs/setup/linux))
* Node.js installed ([Installation](https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions))
* Raspberry PI reachable as host `rpi`  
Configure DNS server or add IP and host name `rpi` in file `/etc/hosts`
* Create SSH key without password with name `id_rsa_rpi`  
Use the command `ssh-keygen`, don't protect the key with password
* Clone this project in `/home/user`

On Raspberry PI:
* Raspbian as operating system
* openssh-server installed  
  ```
  sudo apt update
  sudo apt install openssh-server
  ```
* Node.js installed ([Installation instructions](https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions))  
  ```
  sudo curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
  ```
* [nodemon](https://github.com/remy/nodemon) installed  
  ```
  sudo npm install -g nodemon
  ```
* Public ssh key (from notebook´s file `id_rsa_rpi.pub`) added in file `/home/pi/.ssh/authorized_keys`


## Preparations / Startup

1) Clone the project on notebook to `/home/user/prj`.  
   If you prefer another location, change the attribute `localRoot` in the file [.vscode/launch.json](.vscode/launch.json)!

2) Install node packages on working host
   ```
   user@NB:~ $ cd prj
   user@NB:~/prj $ npm install
   ```

3) Create project folder on Raspberry PI on `/home/pi/prj`  
   ```
   user@NB $ ssh pi@rpi
   pi@rpi:~ $ mkdir prj
   ```
   If you prefer another location, change the attribute `remoteRoot` in the file [.vscode/launch.json](.vscode/launch.json)!

4) Start *Visual Studio Code* on working notebook with workspace file.
   ```
   cd /home/user/prj
   code rpi.code-workspace 
   ```
5) Build the project by pressing Ctrl + Alt + b (or F1 and *Tasks: Run Build Task* and *build*)

5) If everything (building and transfer to remote system) works fine, install node packages on Raspberry PI and start the programm there.  
```
user@NB $ ssh pi@rpi
pi@rpi:~ $ cd prj
pi@rpi:~/prj $ npm install
pi@rpi:~/prj $ nodemon --inspect=0.0.0.0:9229 --inspect-brk=0.0.0.0:9229 dist/main.js
```

6) Select Debug Area in Visual Studio Code and launch `Attach (rpi)` (or press F5)

## Debugging project configuration

If something goes wrong, check logging of Visual studio code.

### Remote Workspace extension

Log files can be found in home folder `~/.vscode-remote-workspace`

### Visual Studio Code program startup

1) Enable attribute `trace` in file [.vscode/launch.json](.vscode/launch.json).

2) Launch program.

3) Check the trace output file.  
   This file is located in:  
   `~/.config/Code/logs/..../ms-vscode.node-debug_1/debugadapter.txt`  
   grep for `Mapped` and `SourceMaps.`
   ```
   cat debugadapter.txt | grep Mapped
   cat debugadapter.txt | grep SourceMaps.
   ```
   Expected content:  
   ```
   Mapped remoteToLocal: /home/pi/prj/dist/main.js -> /home/user/prj/dist/main.js

   SourceMaps.getMapForGeneratedPath: Finding SourceMap for /home/user/prj/dist/main.js by URI: main.js.map
   SourceMaps.loadSourceMapContents: Reading local sourcemap file from /home/user/prj/dist/main.js.map
   SourceMaps.scriptParsed: /home/user/prj/dist/main.js was just loaded and has mapped sources: ["/home/user/prj/src/main.ts"]
   ```





