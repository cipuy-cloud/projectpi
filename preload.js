const {contextBridge, ipcRenderer} = require("electron")
const {GET_MASSAGE, BAYAR_MESSAGE, TAMBAH_MASSAGE} = require("./src/const")


contextBridge.exposeInMainWorld("api", {
    tambah: ({kodebarang, namabarang, harga, jumlah}) => ipcRenderer.invoke(TAMBAH_MASSAGE, kodebarang, namabarang, harga, jumlah),
    bayar: () => ipcRenderer.invoke(BAYAR_MESSAGE),
    barang: () => ipcRenderer.invoke(GET_MASSAGE)
})
