const vars = require("./env")



const api = (ipc) => {
    return {
        keranjang_bayar: (transaksi_id) => ipc.invoke(vars.KERANJANG_BAYAR, transaksi_id),
        keranjang_tambah: (barang) => ipc.invoke(vars.KERANJANG_TAMBAH, barang),
        keranjang_get: (transaksi_id) => ipc.invoke(vars.KERANJANG_GET, transaksi_id),
        keranjang_rm: (data_barang_id) => ipc.invoke(vars.KERANJANG_HAPUS, data_barang_id),

        barang_tambah: (barang) => ipc.invoke(vars.BARANG_TAMBAH, barang),
        barang_get: () => ipc.invoke(vars.BARANG_GET),
        barang_rm: (barang_id) => ipc.invoke(vars.BARANG_HAPUS, barang_id),

        transaksi_tambah: () => ipc.invoke(vars.TRANSAKSI_TAMBAH),
        transaksi_last_id: () => ipc.invoke(vars.TRANSAKSI_LAST_ID),
        transaksi_get: (transaksi_id) => ipc.invoke(vars.TRANSAKSI_GET, transaksi_id),
        transaksi_cancel: (transaksi_id) => ipc.invoke(vars.TRANSAKSI_CANCEL, transaksi_id),
        transaksi_rm: (transaksi_id) => ipc.invoke(vars.TRANSAKSI_HAPUS, transaksi_id),


        listen: (listener_callback) => {
            ipc.on(vars.BARANG_UPDATE, () => {
                listener_callback()
            })
        }
    }
}


module.exports = api;
