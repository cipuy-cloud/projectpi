const {contextBridge, ipcRenderer} = require("electron")
const {TUTUP, BARANG_GET, KERANJANG_GET, KERANJANG_TAMBAH, KERANJANG_BAYAR, BARANG_TAMBAH, TRANSAKSI_CANCEL, TRANSAKSI_TAMBAH, TRANSAKSI_LAST_ID, BARANG_HAPUS} = require("./env")


contextBridge.exposeInMainWorld("kasir", {
    keranjang_bayar: (transaksi_id) => ipcRenderer.invoke(KERANJANG_BAYAR, transaksi_id),
    keranjang_tambah: ({transaksi_id, data_barang_id, jumlah}) => ipcRenderer.invoke(KERANJANG_TAMBAH, transaksi_id, data_barang_id, jumlah),
    keranjang_get: (transaksi_id) => ipcRenderer.invoke(KERANJANG_GET, transaksi_id),

    barang_tambah: ({kodebarang, namabarang, harga, stok}) => ipcRenderer.invoke(BARANG_TAMBAH, kodebarang, namabarang, harga, stok),
    barang_get: () => ipcRenderer.invoke(BARANG_GET),
    barang_rm: (barang_id) => ipcRenderer.invoke(BARANG_HAPUS, barang_id),

    transaksi_tambah: () => ipcRenderer.invoke(TRANSAKSI_TAMBAH),
    transaksi_last_id: () => ipcRenderer.invoke(TRANSAKSI_LAST_ID),
    transaksi_cancel: (transaksi_id) => ipcRenderer.invoke(TRANSAKSI_CANCEL, transaksi_id),

    tutup: () => ipcRenderer.invoke(TUTUP)
})
