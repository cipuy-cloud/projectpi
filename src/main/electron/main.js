const electron = require("electron")
const {app, BrowserWindow, Menu, globalShortcut} = electron
const args = process.argv.slice(1)
const serve = args.some(val => val === "--dev")
const Channel = require("./channel")
const path = require("path")
const {DB} = require("./env")

const indexPath = args.indexOf("--test")
const isTest = indexPath != -1




let mainWindow
let dataBarangWindow

const _root = path.join(__dirname, "..", "..")

if (serve) {
    const bundle = path.join(_root, "..", "build")
    const resources = path.join(_root, "resources/*.*")
    require("electron-reload")([bundle, resources])
}

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 600,
        title: "Program Kasir",
        center: true,
        show: false,
        webPreferences: {
            preload: `${__dirname}/preload.js`,
            nodeIntegration: isTest,
            enableRemoteModule: isTest,
            contextIsolation: !isTest,
        },
    });

    setMainMenu()

    mainWindow.loadURL(`file://${_root}/resources/index.html`);

    mainWindow.once("ready-to-show", () => {
        mainWindow.show()
    })

    mainWindow.on("closed", () => {
        channel.close()
        mainWindow = null
    })
}


app.on("ready", async () => {
    globalShortcut.register(process.platform === "darwin" ? "Alt+Cmd+I" : "Ctrl+Shift+I", () => {
        let focused = BrowserWindow.getFocusedWindow()
        focused.webContents.toggleDevTools()
    })

    createWindow()
    let channel = new Channel(isTest ? args[indexPath + 1] : DB);

    if (mainWindow) {
        channel.listen(mainWindow)
    }
})


app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit()
    }
})

app.on("activate", () => {
    if (mainWindow === null) {
        createWindow()
    }
})


const createWindowDataBarang = () => {

    let x, y

    if (mainWindow) {
        const [currentWindowX, currentWindowY] = mainWindow.getPosition();
        x = currentWindowX;
        y = currentWindowY;
    }


    dataBarangWindow = new BrowserWindow({
        width: 600,
        height: 600,
        title: "Data Barang",
        x,
        y,
        parent: mainWindow,
        show: false,
        webPreferences: {
            contextIsolation: true,
            preload: `${__dirname}/preload.js`
        }
    })

    dataBarangWindow.loadURL(`file://${_root}/resources/databarang.html`);

    dataBarangWindow.setMenu(null)

    dataBarangWindow.once("ready-to-show", () => {
        dataBarangWindow.show()
    })

    dataBarangWindow.on("closed", () => {
        dataBarangWindow = null
    })
}


const setMainMenu = () => {
    const template = [
        {
            label: "Application",
            submenu: [
                {
                    label: "Tutup",
                    click: () => {
                        channel.close()
                        app.quit()
                    }
                },
            ]
        },
        {
            label: "Data",
            submenu: [
                {
                    label: "Data Barang",
                    click: () => createWindowDataBarang()
                },
            ]
        },
    ]
    Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

