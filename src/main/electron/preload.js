const {contextBridge, ipcRenderer} = require("electron")
const api = require("./api")
const vars = require("./env")




contextBridge.exposeInMainWorld("kasir", api(ipcRenderer))

