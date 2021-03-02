const {contextBridge, ipcRenderer} = require("electron")
const {TUTUP, BARANG_GET, KERANJANG_TAMBAH, KERANJANG_BAYAR, BARANG_TAMBAH, TRANSAKSI_TAMBAH, TRANSAKSI_LAST_ID} = require("./env")


contextBridge.exposeInMainWorld("kasir", {
    keranjang_bayar: () => ipcRenderer.invoke(KERANJANG_BAYAR, transaksi_id, data_barang_id, jumlah),
    keranjang_tambah: () => ipcRenderer.invoke(KERANJANG_TAMBAH),
    barang_tambah: ({kodebarang, namabarang, harga, stok}) => ipcRenderer.invoke(BARANG_TAMBAH, kodebarang, namabarang, harga, stok),
    barang_get: () => ipcRenderer.invoke(BARANG_GET),
    transaksi_tambah: () => ipcRenderer.invoke(TRANSAKSI_TAMBAH),
    transaksi_last_id: () => ipcRenderer.invoke(TRANSAKSI_LAST_ID),
    tutup: () => ipcRenderer.invoke(TUTUP)
})
