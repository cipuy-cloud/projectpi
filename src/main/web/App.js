

class Controller {
    constructor(view, model) {
        this.view = view;
        this.model = model;
    }


    async run() {
        this.view.handlerDaftarList(await this.model.daftar_barang)
        this.view.initFormListener(async (val) => {
            this.model.tambah(val)
            this.view.handlerDaftarList(await this.model.daftar_barang)
        })
        this.view.listenerKeranjangBelanjaan(async () => {
            let is_success = await this.model.bayar()
            if (is_success) {
                this.view.table.reset()
            }
        })
    }
}

class View {
    constructor() {
        // this.form = document.getElementById("form_tambah_keranjang")
        // this.table = document.getElementById("daftar_barang_belanjaan")
        // this.kodebarang = this.form.elements["kode_barang"]
        // this.namabarang = this.form.elements["nama_barang"]
        // this.jumlah_barang = this.form.elements["jumlah_barang"]
        // this.harga = this.form.elements["harga"];
        // this.total = document.getElementById("total_harga_barang")
        // this.total_display = document.querySelector(".total_harga")
        // this.total_harga_barang = 0
        // this.form_keranjang_belanjaan = document.getElementById("keranjang_pembayaran")
        // this.form_bayar = this.form_keranjang_belanjaan.elements["form_bayar"]
        // this.form_kembali = this.form_keranjang_belanjaan.elements["form_kembalian"]
        this.handlerBayar()
    }


    handlerDaftarList(daftar_barang) {
    }

    async listenerKeranjangBelanjaan(constroller_event_bayar) {
        this.form_keranjang_belanjaan.addEventListener("submit", (event) => {
            event.preventDefault()
            if (this.form_kembali.value < 0) {
                alert("pembayaran kurang")
            } else {
                constroller_event_bayar()
            }

        })
    }

    handlerBayar() {
        this.form_bayar.onchange = () => {
            this.form_kembali.value = this.form_bayar.value - this.total_harga_barang;
        }
    }

    handleOnChangeHarga() {
        if (this.jumlah_barang.value > 0 && this.harga.value > 0) {
            this.total.value = (this.jumlah_barang.value * this.harga.value).toLocaleString()

            this.total_display.innerText = (this.jumlah_barang.value * this.harga.value).toLocaleString()
        }
    }

    initFormListener(controller_push) {
        this.total_display.innerText = ""
        this.jumlah_barang.value = 0
        this.harga.value = 0
        this.jumlah_barang.onchange = () => this.handleOnChangeHarga()
        this.harga.onchange = () => this.handleOnChangeHarga()

        this.form.addEventListener("submit", (event) => {
            event.preventDefault();
            controller_push(
                {
                    kodebarang: this.kodebarang.value,
                    namabarang: this.namabarang.value,
                    harga: this.harga.value,
                    jumlah: this.jumlah_barang.value,
                }
            )
            this.form.reset();
            this.total_display.innerText = ""
        });
    }
}




class Model {

    constructor() {
        this.daftar_barang = this.all() ?? [];
    }


    async tambah(barang) {
        let result = await window.api.tambah(barang)
        this.daftar_barang.push(result);
    }

    async bayar() {
        await window.api.bayar()
    }

    async all() {
        return await window.api.barang()
    }

}


export {Controller, Model, View}
