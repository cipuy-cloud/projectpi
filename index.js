const electron = require('electron')
const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const uuid = require("uuid")
const { v4 } = uuid

let allAppointment = []
let mainWindow

// window properties
function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 1224,
    height: 600,
    title: "Aplikasi Kasir",
    webPreferences: {
      nodeIntegration: true
    }
  })
// load to file app kasir
  mainWindow.loadFile('index.html')
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

//
ipcMain.on("appointment:creates", async (event, Appointment) => {
  Appointment["id"] = uuid.v1()
  Appointment["done"] = 0
  allAppointment.push(Appointment)
  mainWindow.reload()
})

ipcMain.on("appointment:request:list", (event, message) => {
  mainWindow.webContents.send("appointment:response:list", allAppointment)
})