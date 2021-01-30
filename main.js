const electron = require('electron')
const {app, BrowserWindow} = electron
const args = process.argv.slice(1)
const serve = args.some(val => val === "--start-dev")
const Channel = require("./src/channel")

let channel = new Channel;

channel.listen()

let mainWindow

if (serve) {
    require('electron-reload')(__dirname);
}

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 1224,
        height: 600,
        title: "Aplikasi Kasir",
        show: false,
        webPreferences: {
            nodeIntegration: true
        }
    });


    mainWindow.loadURL(serve ? "http://localhost:1234" : `file://${__dirname}/build/index.html`);

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

