import {GET_MASSAGE, TAMBAH_MASSAGE} from "./const"
const electron = window.require("electron")
const {ipcRenderer} = electron;

class Controller {
    constructor(view, model) {
        this.view = view;
        this.model = model;
    }


    async run() {
        this.view.handlerDaftarList(await this.model.daftar_barang)
        this.view.initFormListener(async (...val) => {
            this.model.tambah(...val)
            this.view.handlerDaftarList(await this.model.daftar_barang)
        })
    }
}

class View {
    constructor() {
        this.form = document.getElementById("form_tambah_barang");
        this.table = document.getElementById("daftar_barang_belanjaan");
        this.kodebarang = this.form.elements["kode_barang"]
        this.namabarang = this.form.elements["nama_barang"]
        this.jumlah_barang = this.form.elements["jumlah_barang"];
        this.harga = this.form.elements["harga"];
        this.total = document.getElementById("total_harga_barang");
        this.total_display = document.querySelector(".total_harga")
        this.total_harga_barang = 0
    }


    handlerDaftarList(daftar_barang) {
        daftar_barang.forEach(({kodebarang, namabarang, harga, jumlah}) => {
            let total = harga * jumlah;
            const child = document.createElement("tr");

            const KodeBarang = document.createElement("th");
            KodeBarang.innerHTML = `${kodebarang}`;

            const NamaBarang = document.createElement("td");
            NamaBarang.innerHTML = namabarang;

            const HargaBarang = document.createElement("td");
            HargaBarang.innerHTML = `Rp ${harga}`;

            const JumlahBarang = document.createElement("td");
            JumlahBarang.innerHTML = `${jumlah}`;


            const TotalHargaBarang = document.createElement("td");
            TotalHargaBarang.innerHTML = `Rp.${total}`;

            this.total_harga_barang += total;
            child.appendChild(KodeBarang);
            child.appendChild(NamaBarang);
            child.appendChild(HargaBarang);
            child.appendChild(JumlahBarang);
            child.appendChild(TotalHargaBarang);
            this.table.append(child);
        })
        const TrTotalHarga = document.createElement("tr");
        TrTotalHarga.setAttribute('class', 'table-success');
        const TotalTxt = document.createElement("th");
        TotalTxt.setAttribute('colspan', '4');
        TotalTxt.innerHTML = 'Total Semua';
        const TotalSemuaHarga = document.createElement("td");
        TotalSemuaHarga.innerHTML = `<h3>Rp.${this.total_harga_barang}</h3>`;


        TrTotalHarga.appendChild(TotalTxt);
        TrTotalHarga.appendChild(TotalSemuaHarga);
        this.table.append(TrTotalHarga);
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


    async tambah({kodebarang, namabarang, harga, jumlah}) {
        let result = await ipcRenderer.invoke(TAMBAH_MASSAGE, kodebarang, namabarang, harga, jumlah)
        this.daftar_barang.push(result);
    }

    async all() {
        const result = await ipcRenderer.invoke(GET_MASSAGE)
        return result
    }
}


export {Controller, Model, View}
