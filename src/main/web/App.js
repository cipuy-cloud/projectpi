import {TransaksiModel, TransaksiView, TransaksiController} from "./traansaksi"
import {BarangModel, BarangView, BarangController} from "./barang"
import {KeranjangModel, KeranjangView, KeranjangController} from "./keranjang"
import {PrintModel, PrintView, PrintController} from "./print"



class App {
    run() {
        let form_cari_barang = document.getElementById("cari_barang")

        form_cari_barang?.addEventListener("submit", ev => ev.preventDefault())


        let transaksi_model = new TransaksiModel()
        let transaksi_view = new TransaksiView({
            "cancel": document.getElementById("cancel"),
            "bayar": document.getElementById("bayar")
        })

        let transaksi_controller = new TransaksiController(transaksi_model, transaksi_view)


        let barang_model = new BarangModel()

        let barang_view = new BarangView(barang_model, {
            "cari": form_cari_barang?.elements[0],
            "list": document.getElementById("list_barang"),
            "container": document.getElementById("container_btn"),
            "tambah": document.getElementById("tambah"),
            "hapus": document.getElementById("hapus"),
            "edit": document.getElementById("edit"),
            "form": document.getElementById("form_input_barang")
        })

        let barang_controller = new BarangController(barang_model, barang_view)

        barang_view.show()


        let print_model = new PrintModel()
        let print_view = new PrintView(print_model, {
            "barcode": document.getElementById("barcode"),
            "transaksi": document.getElementById("transaksi_id"),
            "list": document.getElementById("list_print")
        })

        let print_controller = new PrintController(print_model, print_view)


        let keranjang_model = new KeranjangModel()

        let keranjang_view = new KeranjangView(keranjang_model, {
            "form": document.getElementById("bayar"),
            "list": document.getElementById("keranjang_barang"),
            "total": document.getElementById("total")
        })

        let keranjang_controller = new KeranjangController(keranjang_model, keranjang_view)

        keranjang_view.show()

        barang_controller.barang_to_keranjang((barang) => {
            keranjang_controller.add(barang)
        })

        keranjang_controller?.items((items) => {
            print_controller?.updateItems(items)
        })

        transaksi_controller.listen((id) => {
            keranjang_controller?.updateTrasaksiId(id)
            print_controller?.updateTrasaksiId(id)
        })

    }

}


export default App
