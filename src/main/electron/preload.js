const {contextBridge, ipcRenderer} = require("electron")
const api = require("./api")




contextBridge.exposeInMainWorld("kasir", api(ipcRenderer))

