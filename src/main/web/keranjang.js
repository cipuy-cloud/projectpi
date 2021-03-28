import EventEmitter from "events"


class KeranjangModel extends EventEmitter {
    constructor() {
        super()
        this._items = []
        this.total = 0
    }

    get items() {
        return this._items
    }

    setTotal() {
        this.total = 0
        for (let item of this._items) {
            this.total += item.harga * item.jumlah
        }
    }

    async setItems(transaksi_id) {
        let {status, result} = await window.kasir.keranjang_get(transaksi_id)
        this._items = status && result.length > 0 ? result : []
        this.setTotal()
    }


    is_empty() {
        return this._items.length === 0
    }


    async remove(transaksi_id, barang_id) {

        let {status} = await window.kasir.keranjang_rm(transaksi_id, barang_id)

        if (status) this.emit("keranjang_update")
    }

    async add(transaksi_id, {data_barang_id, jumlah, stok}) {
        let {status} = await window.kasir.keranjang_tambah({transaksi_id, data_barang_id, jumlah, stok})
        return status
    }
}


class KeranjangView extends EventEmitter {
    constructor(model, elements) {
        super()
        this._model = model
        this._elements = elements

        elements.form?.addEventListener("submit", ev => ev.preventDefault())

    }


    currency(nominal) {
        return new Intl.NumberFormat("id-ID", {style: "currency", currency: "IDR"}).format(nominal)
    }

    li({id, namabarang, harga, jumlah}) {
        let el = document.createElement("li")

        el.id = id

        el.className = "container row between center padding-md"

        let uang = this.currency(harga)

        let elNama = `<h1 class="left">${namabarang}</h1>`

        let elHarga = harga ? `<h3 class="border" style="min-width: 130px;">${uang}</h3>` : ""

        let elJumlah = jumlah ? `<input id="jumlah-${id}" name="jumlah" type="number" value=${jumlah} class="margin-lr" style="max-width: 70px;"></input>` : ""


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

        let elJumlahByID = el.querySelector(`#jumlah-${id}`)

        if (elJumlahByID) {
            elJumlahByID.addEventListener("change", ev => {
                ev.preventDefault()

                jumlah = parseInt(ev.target.value)

                this.emit("keranjang_jumlah", id, jumlah, el)
            })
        }

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


    setTotal(total) {
        this._elements.total.innerText = this.currency(total)
    }

    render() {
        this._elements.list.innerHTML = ""

        if (this._model.is_empty()) {
            this._elements.list?.append(this.li({
                id: 404,
                namabarang: "Keranjang Tidak Ditemukan"
            }))

            this.toggleForm(false)
        } else {
            for (let kr of this._model.items) {
                this._elements.list.append(this.li(kr))
            }
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

        view.on("keranjang_jumlah", (id, jumlah, el) => this.change(id, jumlah, el))
    }

    handleTotal() {
        this._view.setTotal(this._model.total)
    }

    async change(data_barang_id, jumlah, el) {
        let status = await this._model.add(this._transaksi_id, {data_barang_id, jumlah})

        if (status && this._transaksi_id) {
            await this._model.setItems(this._transaksi_id)

            let item = this._model.items.find((br) => br.id == data_barang_id)

            if (item) {
                if ((jumlah == 0 || jumlah < 0) || jumlah > item.stok) el.parentNode.replaceChild(this._view.li(item), el)
            } else {
                el.parentNode.removeChild(el)
            }
        }
        this.handleTotal()
    }

    async add(barang) {
        if (this._transaksi_id) {
            let status

            for (let data_barang_id of barang) {
                status = await this._model.add(this._transaksi_id, {data_barang_id, jumlah: null})
            }

            if (status) this.updateList()
        }
    }

    updateTrasaksiId(id) {
        this._transaksi_id = id
        this.updateList()
    }

    async updateList() {
        if (this._transaksi_id) {
            await this._model.setItems(this._transaksi_id)

            this._view.render()
        }
        this.handleTotal()
    }
}


export {KeranjangModel, KeranjangView, KeranjangController}
