import EventEmitter from "events"


class KeranjangModel extends EventEmitter {
    constructor() {
        super()
        this._items = []
    }

    async get(transaksi_id) {
        let {status, result} = await window.kasir.keranjang_get(transaksi_id)

        this._items = status && result.length > 0 ? result : []
    }

    is_empty() {
        return this._items.length === 0
    }

    getItems() {
        return this._items
    }

    async remove(transaksi_id, barang_id) {

        let {status} = await window.kasir.keranjang_rm(transaksi_id, barang_id)

        if (status) this.emit("keranjang_update")
    }

    async add(transaksi_id, {data_barang_id, jumlah}) {
        let status

        if (jumlah) {
            let t = await window.kasir.keranjang_tambah({transaksi_id, data_barang_id, jumlah})
            status = t.status
        }

        if (status) this.emit("keranjang_update")
    }
}


class KeranjangView extends EventEmitter {
    constructor(model, elements) {
        super()
        this._model = model
        this._elements = elements

        elements.form?.addEventListener("submit", ev => ev.preventDefault())

    }

    li({id, namabarang, harga, jumlah}) {
        let el = document.createElement("li")

        el.id = id
        el.className = "container row between center padding-md"

        let uang = new Intl.NumberFormat("id-ID", {style: "currency", currency: "IDR"}).format(harga)

        let elNama = `<h1 class="left">${namabarang}</h1>`

        let elHarga = harga ? `<h3 class="border" style="min-width: 130px;">${uang}</h3>` : ""

        let elJumlah = jumlah ? `<input id="${id}" name="jumlah" type="number" value=${jumlah} class="margin-lr" style="max-width: 70px;"></input>` : ""

        el.innerHTML = `
                <div class="auto container column baseline between">
                    <div class="item container row center margin-tb"> 
                        ${elNama}
                    </div>
                </div>
                <div class="inlineFlex middle">
                     ${elJumlah}
                     <span class='tr center'>&times;</span>
                     ${elHarga}  
                </div>
                `.trim()

        return el

    }

    toggleForm(toggle) {
        let is_hidden = this._elements.form?.classList.contains("hidden")
        if (toggle) {
            is_hidden && this._elements.form?.classList.remove("hidden")
        } else {
            !is_hidden && this._elements.form?.classList.add("hidden")
        }
    }

    show() {
        this.render()
    }

    render() {
        this._elements.innerHTML = ""

        if (this._model.is_empty()) {
            this._elements.list?.append(this.li({
                id: 404,
                namabarang: "Keranjang Tidak Ditemukan"
            }))

            this.toggleForm(false)
        } else {
            this._model.getItems().forEach((kr) => {
                this._elements.list.append(this.li(kr))
            })
            this.toggleForm(true)
        }
    }
}

class KeranjangController {
    constructor(model, view) {
        this._model = model
        this._view = view

        this._transaksi_id = null

        model.on("keranjang_update", () => this.updateList())
    }

    async add(barang) {
        if (this._transaksi_id) {
            this._model.add(this._transaksi_id, barang)
        }
    }

    updateTrasaksiId(id) {
        this._transaksi_id = id
        this.updateList()
    }

    async updateList() {
        if (this._transaksi_id) {
            await this._model.get(this._transaksi_id)
            this._view.render()
        }
    }
}


export {KeranjangModel, KeranjangView, KeranjangController}
