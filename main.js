const electron = require('electron')
const {app, BrowserWindow, Menu} = electron
const args = process.argv.slice(1)
const serve = args.some(val => val === "--dev")
const Channel = require("./src/channel")


let channel = new Channel;

channel.listen()


let mainWindow

if (serve) {
    require('electron-reload')(__dirname);
}


const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 600,
        title: "Aplikasi Kasir",
        show: false,
        frame: false,
        transparent: true,
        webPreferences: {
            contextIsolation: true,
            preload: `${__dirname}/preload.js`
        }
    });



    mainWindow.loadURL(`file://${__dirname}/index.html`);

    mainWindow.once('ready-to-show', () => {
        mainWindow.show()
    })
    mainWindow.on('closed', () => {
        mainWindow = null
    })
}


app.on('ready', async () => {
    createWindow()
    setMainMenu()
})


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow()
    }
})

function setMainMenu() {
    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'New Data'
                },
                {
                    label: 'Open Data'
                },
                {
                    label: 'Edit Data'
                },
                {
                    label: 'Delete Data'
                },
            ]
        },
        {
            label: 'View',
            submenu: [
                {
                    label: 'Reload',
                    accelerator: 'CmdOrCtrl+R',
                    click(item, focusedWindow) {
                        if (focusedWindow) focusedWindow.reload()
                    }
                },
                {
                    label: 'Toggle Developer Tools',
                    accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
                    click(item, focusedWindow) {
                        if (focusedWindow) focusedWindow.webContents.toggleDevTools()
                    }
                },
                {
                    type: 'separator'
                },
                {
                    role: 'resetzoom'
                },
                {
                    role: 'zoomin'
                },
                {
                    role: 'zoomout'
                },
                {
                    type: 'separator'
                },
                {
                    role: 'togglefullscreen'
                }
            ]
        },
        {
            role: 'window',
            submenu: [
                {
                    role: 'minimize'
                },
                {
                    role: 'close'
                }
            ]
        },
        {
            role: 'help',
            submenu: [
                {
                    label: 'Learn More',
                    click() {require('electron').shell.openExternal('http://electron.atom.io')}
                }
            ]
        }
    ]

    if (process.platform === 'darwin') {
        const name = app.getName()
        template.unshift({
            label: name,
            submenu: [
                {
                    role: 'about'
                },
                {
                    type: 'separator'
                },
                {
                    role: 'services',
                    submenu: []
                },
                {
                    type: 'separator'
                },
                {
                    role: 'hide'
                },
                {
                    role: 'hideothers'
                },
                {
                    role: 'unhide'
                },
                {
                    type: 'separator'
                },
                {
                    role: 'quit'
                }
            ]
        })
        // Edit menu.
        template[1].submenu.push(
            {
                type: 'separator'
            },
            {
                label: 'Speech',
                submenu: [
                    {
                        role: 'startspeaking'
                    },
                    {
                        role: 'stopspeaking'
                    }
                ]
            }
        )
        // Window menu.
        template[3].submenu = [
            {
                label: 'Close',
                accelerator: 'CmdOrCtrl+W',
                role: 'close'
            },
            {
                label: 'Minimize',
                accelerator: 'CmdOrCtrl+M',
                role: 'minimize'
            },
            {
                label: 'Zoom',
                role: 'zoom'
            },
            {
                type: 'separator'
            },
            {
                label: 'Bring All to Front',
                role: 'front'
            }
        ]
    }

    Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}
