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

