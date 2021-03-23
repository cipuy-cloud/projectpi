import EventEmitter from "events"


class BarangModel extends EventEmitter {
    constructor() {
        super()
        this._items = this.init()
        this._selected = []
        this._find = {val: null, notFound: false}

    }


    async add(barang) {
        let {status} = await window.kasir.barang_tambah(barang)

        if (status) {
            this.refresh()
            this.emit("barang_update")
        }
    }

    async remove() {
        if (!this.is_select_empty()) {
            for (let barang_id of this._selected) {
                await window.kasir.barang_rm(barang_id)
            }
            await this.refresh()
            this._selected = []
            this.emit("barang_update")
        }

    }

    async refresh() {
        this.items = await this.init()
    }

    async init() {
        let {status, result} = await window.kasir.barang_get()

        return status && result.length > 0 ? result : []
    }


    find(barang, notFound) {
        this._find = {val: barang, notFound}
        this.emit("barang_update")
    }

    async items() {
        return this._items
    }

    async getItems() {
        if (this._find.val) {
            return [this._find.val]
        } else {
            return this._find.notFound ? [] : await this.items()
        }
    }

    async is_empty() {
        let items = await this.getItems()
        return items.length === 0
    }

    is_select_empty() {
        return this._selected.length === 0
    }


    is_contain(id) {
        return this._selected.includes(id)
    }


    select(id) {
        if (this.is_contain(id)) {
            this._selected = this._selected.filter((selectedIdx) => selectedIdx != id)
        } else {
            this._selected.push(id)
        }
    }
}


class BarangView extends EventEmitter {
    constructor(model, elements) {
        super()
        this._model = model
        this._elements = elements

        model.on("barang_update", () => this.render())


        elements.cari?.addEventListener("keyup", ({target}) => {
            this.emit("barang_cari", target.value)
        })

        elements.hapus?.addEventListener("click", () => {
            this.emit("barang_hapus")
            this.toggleButtonTambahKeranjang(false)
        })

        elements.tambah?.addEventListener("click", () => {
            this.emit("keranjang_add")
        })

        elements.form?.addEventListener("submit", async (ev) => {
            ev.preventDefault()

            let kodebarang = parseInt(this._elements.cari?.value)
                , harga = parseInt(ev.target.elements["harga"].value)
                , namabarang = ev.target.elements["namabarang"].value
                , stok = parseInt(ev.target.elements["stok"].value)



            this.emit("barang_input", {kodebarang, namabarang, harga, stok})

            this.toggleFormInputBarang(false)
            ev.target.reset()
        })
    }

    handlehidden(el, toggle, className) {
        let is_hidden = el.classList.contains(className)

        if (toggle) {
            is_hidden && el.classList.remove(className)
        } else {
            !is_hidden && el.classList.add(className)
        }

    }

    toggleButtonTambahKeranjang(toggle) {
        this.handlehidden(this._elements.container, toggle, "hidden")
    }

    toggleFormInputBarang(toggle) {
        if (this._elements.form) {
            this.handlehidden(this._elements.form, toggle, "hidden")
        }
    }

    li({id, stok, namabarang, kodebarang, harga}) {
        let el = document.createElement("li")

        el.id = id
        el.className = "container row between center padding-md ".trim()

        el.addEventListener("click", () => {
            this.emit("barang_select", id)
            this.handlehidden(el, !this._model.is_contain(id), "selected")
            this.toggleButtonTambahKeranjang(!this._model.is_select_empty())
        })

        let uang = new Intl.NumberFormat("id-ID", {style: "currency", currency: "IDR"}).format(harga)

        let elNama = `<h1 class="left">${namabarang}</h1>`
            , elStok = stok ? `<div class="fill tr left" style="min-width: 100px;">stok: ${stok}</div>` : "", elHarga = harga ? `<h3 class="border" style="min-width: 130px;">${uang}</h3>` : ""
            , elKodeBarang = kodebarang ? `<div class="margin-lr tr">Kode: ${kodebarang}</div>` : ""

        el.innerHTML = `
                <div class="auto container column baseline between">
                    <div class="item container row center margin-tb"> 
                        ${elNama}
                        ${elKodeBarang}
                    </div>
                    <div class="item container row baseline">
                        ${elStok}
                    </div>
                </div>
                <div class="inlineFlex middle">
                     ${elHarga}  
                </div>
                `.trim()
        return el

    }

    show() {
        this.render()
    }

    async render() {
        this._elements.list.innerHTML = ""

        if (await this._model.is_empty()) {

            this._elements.list.append(this.li({id: 404, namabarang: "Barang Tidak Ditemukan"}))

            this.toggleFormInputBarang(true)
        } else {
            let items = await this._model.getItems()

            items.forEach((br) => this._elements.list.append(this.li(br)))

            this.toggleFormInputBarang(false)
        }
    }
}


class BarangController {
    constructor(model, view) {
        this._model = model
        this._view = view

        view.on("barang_select", idx => this.select(idx))
        view.on("barang_input", barang => this.add(barang))
        view.on("barang_cari", value => this.find_barang(value))
        view.on("barang_hapus", () => this.remove())

    }

    async find_barang(value) {
        let items = await this._model.items()
        let barang = items.find(t => t.kodebarang === parseInt(value))
        this._model.find(barang, value && !barang)
    }

    async add(barang) {
        await this._model.add(barang)
    }

    async remove() {
        await this._model.remove()
    }


    select(idx) {
        this._model.select(idx)
    }

}


export {BarangView, BarangModel, BarangController}
