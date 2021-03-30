import EventEmitter from "events"
import JsBarcode from "jsbarcode"

class PrintModel extends EventEmitter {
    constructor() {
        super()
        this.transaksi_id = null
        this.items = null
    }

    is_empty() {
        return this.items?.length === 0
    }

    setTrasaksiId(id) {
        this.transaksi_id = id
    }

    setItems(items) {
        this.items = items
    }
}

class PrintView extends EventEmitter {
    constructor(model, elements) {
        super()
        this._model = model
        this._elements = elements
    }

    setTransaksi() {
        if (this._model.transaksi_id && this._elements.transaksi) {
            this._elements.transaksi.innerText = this._model.transaksi_id
        }
    }

    currency(nominal) {
        return new Intl.NumberFormat("id-ID", {style: "currency", currency: "IDR"}).format(nominal)
    }

    li({id, namabarang, harga, jumlah}) {
        let el = document.createElement("li")
        el.id = id
        el.className = "container row between center padding-md"

        let uang = this.currency(harga * jumlah)

        el.innerHTML = `
            <h1>${namabarang}</h1>
            <h3 style="min-width: 130px;" class="right">${uang}</h3>
        `
        return el
    }


    render() {
        if (this._elements.list) {
            JsBarcode(this._elements.barcode, this._model.transaksi_id, {height: 40})
            this._elements.list.innerHTML = ""
            if (this._model.is_empty()) {
                this._elements.list?.append(this.li({
                    id: 404,
                    namabarang: "Keranjang Tidak Ditemukan"
                }))
            } else {
                for (let kr of this._model.items) {
                    this._elements.list?.append(this.li(kr))
                }

            }
        }
    }

    show() {
        this.render()
    }
}

class PrintController {
    constructor(model, view) {
        this._model = model
        this._view = view
    }

    updateItems(items) {
        this._model.setItems(items)
        this._view.render()
    }

    updateTrasaksiId(id) {
        this._model.setTrasaksiId(id)
        this._view.setTransaksi()
    }
}


export {PrintController, PrintModel, PrintView}
