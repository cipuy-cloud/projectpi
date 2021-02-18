const electron = require('electron')
const {app, BrowserWindow, Menu} = electron
const args = process.argv.slice(1)
const serve = args.some(val => val === "--dev")
const Channel = require("./channel")
const path = require("path")


let channel = new Channel;

channel.listen()


let mainWindow


const _root = path.join(__dirname, "..", "..")

if (serve) {
    const all = path.join(_root, "..")
    require('electron-reload')(all)
}


const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 600,
        title: "Aplikasi Kasir",
        center: true,
        show: false,
        webPreferences: {
            contextIsolation: true,
            preload: "preload.js"
        }
    });



    mainWindow.loadURL(`file://${_root}/resources/index.html`);

    mainWindow.once('ready-to-show', () => {
        mainWindow.show()
    })
    mainWindow.on('closed', () => {
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

