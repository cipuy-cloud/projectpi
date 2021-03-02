const electron = require('electron')
const {app, BrowserWindow, Menu} = electron
const args = process.argv.slice(1)
const serve = args.some(val => val === "--dev")
const Channel = require("./channel")
const path = require("path")
const {DB} = require("./env")


let channel = new Channel(DB);

channel.listen()



let mainWindow
let dataBarangWindow

const _root = path.join(__dirname, "..", "..")

if (serve) {
    const all = path.join(_root, "..")
    require('electron-reload')(all)
}
const createWindow = () => {
    console.log(__dirname)
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 600,
        title: "Program Kasir",
        center: true,
        show: false,
        webPreferences: {
            contextIsolation: true,
            preload: `${__dirname}/preload.js`
        }
    });


    setMainMenu()

    mainWindow.loadURL(`file://${_root}/resources/index.html`);


    mainWindow.once('ready-to-show', () => {
        mainWindow.show()
    })
    mainWindow.on('closed', () => {
        // channel.close()
        mainWindow = null
    })
}


app.on('ready', async () => {
    createWindow()
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


const createWindowDataBarang = () => {
    const currentWindow = BrowserWindow.getFocusedWindow()

    let x, y

    if (currentWindow) {
        const [currentWindowX, currentWindowY] = currentWindow.getPosition();
        x = currentWindowX;
        y = currentWindowY;
    }


    dataBarangWindow = new BrowserWindow({
        width: 600,
        height: 600,
        title: "Data Barang",
        x,
        y,
        show: false,
        webPreferences: {
            contextIsolation: true,
            preload: `${__dirname}/preload.js`
        }
    })

    dataBarangWindow.loadURL(`file://${_root}/resources/databarang.html`);

    dataBarangWindow.setMenu(null)

    dataBarangWindow.once('ready-to-show', () => {
        dataBarangWindow.show()
    })

    dataBarangWindow.on('closed', () => {
        dataBarangWindow = null
    })
}


const setMainMenu = () => {
    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'Data Barang',
                    click: () => createWindowDataBarang()
                },
            ]
        },
        {
            label: 'View',
            submenu: [
                {
                    label: 'Reload',
                    accelerator: 'CmdOrCtrl+R',
                    click(_, focusedWindow) {
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
