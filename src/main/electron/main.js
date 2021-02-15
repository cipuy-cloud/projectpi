const electron = require('electron')
const {app, BrowserWindow, Menu} = electron
const args = process.argv.slice(1)
const serve = args.some(val => val === "--dev")
const Channel = require("./channel")
const path = require("path")


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
            preload: "preload.js"
        }
    });



    let urlDir = path.join("file://", __dirname,"../../", "resources", "index.html")
    mainWindow.loadURL(urlDir);

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

