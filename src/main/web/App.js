import {TransaksiModel, TransaksiView, TransaksiController} from "./traansaksi"
import {BarangModel, BarangView, BarangController} from "./barang"
import {KeranjangModel, KeranjangView, KeranjangController} from "./keranjang"




class App {
    run() {
        let form_cari_barang = document.getElementById("cari_barang")

        form_cari_barang.addEventListener("submit", ev => ev.preventDefault())


        let transaksi_model = new TransaksiModel()
        let transaksi_view = new TransaksiView({
            "cancel": document.getElementById("cancel"),
            "bayar": document.getElementById("bayar")
        })

        let transaksi_controller = new TransaksiController(transaksi_model, transaksi_view)


        let barang_model = new BarangModel()

        let barang_view = new BarangView(barang_model, {
            "cari": form_cari_barang.elements[0],
            "list": document.getElementById("list_barang"),
            "container": document.getElementById("container_btn"),
            "tambah": document.getElementById("tambah"),
            "hapus": document.getElementById("hapus"),
            "form": document.getElementById("form_input_barang")
        })

        new BarangController(barang_model, barang_view)

        barang_view.show()


        let keranjang_model = new KeranjangModel()

        let keranjang_view = new KeranjangView(keranjang_model, {
            "form": document.getElementById("form_input_barang"),
            "list": document.getElementById("keranjang_barang")
        })

        let keranjang_controller = new KeranjangController(keranjang_model, keranjang_view)

        keranjang_view.show()


        transaksi_controller.listen((id) => {
            keranjang_controller.updateTrasaksiId(id)
        })
    }

}


export default App
