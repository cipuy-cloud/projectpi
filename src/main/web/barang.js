import EventEmitter from "events"


class BarangModel extends EventEmitter {
    constructor() {
        super()
        this._items = this.init()
        this._selected = []
        this._find = {val: null, notFound: false}

        window.kasir.listen(async () => {
            await this.refresh()
        })
    }

    async add(barang) {
        let {status} = await window.kasir.barang_tambah(barang)
        if (status) {
            await this.refresh()
        }
    }

    async update(barang) {
        let {status} = await window.kasir.barang_update(barang)
        if (status) {
            await this.refresh()
        }
    }

    async remove() {
        if (!this.is_select_empty()) {
            for (let barang_id of this._selected) {
                await window.kasir.barang_rm(barang_id)
            }
            this.find(null, false)
            await this.refresh()
        }
    }

    async refresh() {
        this._items = await this.init()
        this.reset_select()
    }

    async init() {
        let {status, result} = await window.kasir.barang_get()

        return status && result.length > 0 ? result : []
    }


    find(barang, notFound) {
        this._find = {val: barang, notFound}
        this.emit("barang_refresh")
    }

    async items() {
        return await this._items
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


    reset_select() {
        this._selected = []
        this.emit("reset_select")
    }

    selects() {
        return this._selected
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

        model.on("barang_refresh", () => this.render())
        model.on("reset_select", async () => {
            this.toggleButtonTambahKeranjang(false)
            this.render()
        })

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

            if (this._elements.cari.disabled) {
                this.emit("barang_update", {kodebarang, namabarang, harga, stok})
            } else {
                this.emit("barang_input", {kodebarang, namabarang, harga, stok})
            }


            ev.target.reset()
            this._elements.cari.value = ""
            this._elements.cari.disabled = false
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
        el.className = `container row between center padding-md  ${this._model.is_contain(id) ? "selected" : ""}`.trim()

        if (this._elements.form) {
            el.addEventListener("contextmenu", ev => {
                if (ev.button === 2) {
                    this.handlehidden(el, false, "hidden")

                    let elKodebarang = this._elements.cari,
                        elHarga = this._elements.form?.elements["harga"],
                        elNamabarang = this._elements.form?.elements["namabarang"],
                        elStok = this._elements.form?.elements["stok"]

                    elKodebarang.value = kodebarang
                    elHarga.value = harga
                    elNamabarang.value = namabarang
                    elStok.value = stok

                    elKodebarang.disabled = true

                    this.toggleFormInputBarang(true)
                    this._elements.list.innerHTML = ""
                }
            })

        }

        el.addEventListener("click", () => {
            this.emit("barang_select", id)
            this.handlehidden(el, !this._model.is_contain(id), "selected")
            this.toggleButtonTambahKeranjang(!this._model.is_select_empty())
        })

        let uang = new Intl.NumberFormat("id-ID", {style: "currency", currency: "IDR"}).format(harga)

        let elNama = `<h1 class="left">${namabarang}</h1>`,
            elStok = stok ? `<div class="fill tr left" style="min-width: 100px;">stok: ${stok}</div>` : "",
            elHarga = harga ? `<h3 class="border" style="min-width: 130px;">${uang}</h3>` : "",
            elKodeBarang = kodebarang ? `<div class="margin-lr tr">Kode: ${kodebarang}</div>` : ""


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

            for (let br of items) {
                this._elements.list.append(this.li(br))
            }

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
        view.on("barang_update", barang => this.update(barang))
    }

    barang_to_keranjang(send_to_keranjang) {
        this._view.on("keranjang_add", () => {
            send_to_keranjang(this._model.selects())
            this._model.refresh()
        })
    }

    async find_barang(value) {
        let items = await this._model.items()
        let barang = items.find(t => t.kodebarang === parseInt(value))
        this._model.find(barang, value && !barang)
    }

    async update(barang) {
        await this._model.update(barang)
    }

    async add(barang) {
        await this._model.add(barang)
        await this.find_barang(barang.kodebarang)
    }

    async remove() {
        await this._model.remove()
    }


    select(idx) {
        this._model.select(idx)
    }

}


export {BarangView, BarangModel, BarangController}
