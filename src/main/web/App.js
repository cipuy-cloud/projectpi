
class Controller {
    constructor(view, model) {
        this.view = view;
        this.model = model;
    }


    // fungsi utama dari controller buat siapin mula mula
    async run() {
        await this.initial()
    }


    // fungsi untuk ambil list barang dari 
    // database > context isolation  > render barang
    async reload() {
        await this.model.barang()
        await this.model.keranjang()
        this.view.render_barang(this.model.data_barang)
        if (this.view.keranjang_barang && this.view.form_pembayaran) {
            this.view.render_keranjang(this.model.data_keranjang)
            this.model.data_keranjang.length > 0 && this.view.form_pembayaran.classList.contains("hidden") ? this.view.form_pembayaran.classList.remove("hidden") : this.view.form_pembayaran.classList.add("hidden")
        }
    }

    async initial() {
        await this.reload()

        // untuk main window menu list ke reload jika databarang terjadi input edit hapus barang
        // jalanin fungsi ini
        window.kasir.listen(() => {
            this.reload()
        })


        this.view.form_pembayaran?.addEventListener("submit", ev => {
            ev.preventDefault()
        })


        // kalo Cari Barang tersubmit biar kaga ke reload pagenya
        this.view.cari_barang?.addEventListener("submit", ev => {
            ev.preventDefault()
        })

        // kalo input barang selesai dan terklik tambah jalanin fungsi ini
        this.view.form_input_barang?.addEventListener("submit", async (ev) => {
            ev.preventDefault()

            let kodebarang = parseInt(this.view.form_cari?.value)
                , harga = parseInt(ev.target.elements["harga"].value)
                , namabarang = ev.target.elements["namabarang"].value
                , stok = parseInt(ev.target.elements["stok"].value)

            // input barang ke api
            window.kasir.barang_tambah({kodebarang, namabarang, harga, stok})
            // reload list barang
            await this.model.barang()

            // jika barang terinput tampilkan hanya barang yang terinput
            this.find_barang(kodebarang)

            // kosongin form input 
            this.view.form_input_barang.reset()
        })


        // kalo input form Cari Barang terketik jalanin fungsi ini
        this.view.form_cari?.addEventListener("keyup", ({target}) => {
            this.find_barang(target.value)
        })

        // ngeset fungsi callback dari Model ke View untuk fungsi click menu barang
        this.view.setHook(this.brigeEvent())

        // fungsi klik hapus untuk menghapus yang di tandai
        this.view.btn_hapus?.addEventListener("click", async () => {
            // remove semua yang di tandai
            this.model.barang_removeSelected()

            //  reload list barang data barang
            this.reload()
        })

        this.view.btn_tambah?.addEventListener("click", () => {
            this.model.keranjang_tambah()

            //  reload keranjang
            this.reload()
        })

    }


    // fungsi buat handle cari barang
    find_barang(value) {

        // check classname kalo terdapat hidden
        const is_hidden = () => !this.view.form_input_barang?.classList.contains("hidden") && this.view.form_input_barang?.classList.toggle("hidden")

        if (value) {
            // cari barang dari list barang sesuai id yang di input dari Cari Barang
            let barang = this.model.data_barang?.find((t) => t.kodebarang === parseInt(value))

            if (barang) {
                is_hidden()

                // kalo barang ada render hanya satu yang sesuai 
                this.view.render_barang([barang])
            } else {
                // hapus classname hidden
                this.view.form_input_barang?.classList.remove("hidden")

                // kalo barang yang di cari engga ada render kosong
                this.view.render_barang()
            }
        } else {
            is_hidden()

            // kalo input terhapus sampai habis render semua barang
            this.view.render_barang(this.model.data_barang)
        }
    }

    // fungsi jembatan fungsi callback dari Model ke View 
    brigeEvent() {
        return {
            barang_getSelected: (id) => this.model.barang_getSelected(id),
            barang_setSelected: (id) => this.model.barang_setSelected(id),
            keranjang_tambah: (barang) => this.model.keranjang_tambah(barang)
        }
    }
}

class View {

    constructor() {
        // element
        this.cari_barang = document.getElementById("cari_barang")
        this.form_cari = this.cari_barang.elements[0]
        this.list_barang = document.getElementById("list_barang")


        // element ini hanya terdapat di main Window
        this.form_pembayaran = document.getElementById("bayar")
        this.keranjang_barang = document.getElementById("keranjang_barang")


        // element ini hanya terdapat di databarang
        this.form_input_barang = document.getElementById("form_input_barang")
        this.cotainer_btn = document.getElementById("container_btn")
        this.btn_hapus = this.cotainer_btn?.children.namedItem("hapus")
        this.btn_tambah = this.cotainer_btn?.children.namedItem("tambah")
    }

    // ngeset fungsi callback dari Model ke View melalui Controller untuk fungsi click menu barang
    setHook(hook) {
        this.hook = hook
    }


    // kalo list barang ke klik jalanin fungsi ini
    handleOnClickMenuList(el, data_barang_id) {

        let {barang_setSelected} = this.hook ?? {}

        let {is_contain, is_empty} = barang_setSelected?.(data_barang_id),
            is_classExist = el.classList.contains("selected"),
            is_container_btn_hidden = !this.container_btn?.includes("hidden")

        // kalo kelas `selected engga ada ama kalo id ini terdapat di barang_arr di model 
        !is_classExist && is_contain ? el.classList.add("selected") : el.classList.remove("selected")

        // kalo barang_arr kosong ama kalo container_btn terdapat di view
        is_empty && is_container_btn_hidden ? this.cotainer_btn?.classList.add("hidden") : this.cotainer_btn?.classList.remove("hidden")
    }

    handleOnChangeJumlah(barang) {
        let {keranjang_tambah} = this.hook ?? {}
        keranjang_tambah?.(barang)
    }

    create_li({barang = {}, emptyMsg}) {
        let {id, stok, namabarang, kodebarang, harga, jumlah, data_barang_id} = barang

        let {barang_getSelected} = this.hook ?? {}

        let el = document.createElement("li")

        // check apakah data_barang_id tertandai
        let is_selected = barang_getSelected?.(id)

        // kalo tertandai tambahkan selected di className
        el.className = `container row between center padding-md ${is_selected ? "selected" : ""}`.trim()

        if (id) {
            // kalo terdapat objek id di barang set idnya per element list
            el.id = id

            // jika objek jumlah engga ada
            // nambahin fungsi click per element list
            if (!jumlah) {
                el.addEventListener("click", () => this.handleOnClickMenuList(el, id))
            }
        }

        // ubah nomor ke format uang rupiah
        let uang = new Intl.NumberFormat("id-ID", {style: "currency", currency: "IDR"}).format(harga)

        // element list 
        let elNama = `<h1 class="left">${namabarang ?? emptyMsg}</h1>`
            , elStok = stok && !jumlah ? `<div class="fill tr left" style="min-width: 100px;">stok: ${stok}</div>` : ""
            , elHarga = harga ? `<h3 class="border" style="min-width: 130px;">${uang}</h3>` : ""
            , elKodeBarang = kodebarang && !jumlah ? `<div class="margin-lr tr">Kode: ${kodebarang}</div>` : ""
            , elJumlah = jumlah ? `<input id="${id}" name="jumlah" type="number" value=${jumlah} class="margin-lr" style="max-width: 50px;"></input>` : ""


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
                     ${elJumlah}
                     ${jumlah ? "<span class='tr center'>&times;</span>" : ""}
                     ${elHarga}  
                </div>
                `.trim()

        if (data_barang_id) {
            let elJumlahByName = el.querySelector("input[name='jumlah']")
            elJumlahByName?.addEventListener("change", ({target}) => this.handleOnChangeJumlah({data_barang_id, jumlah: target.value}))
        }

        return el
    }

    render_keranjang(data_keranjang = []) {
        // buat keranjang kosong
        this.keranjang_barang.innerHTML = ""

        // check barang di keranjang kosong apa engga
        let is_empty = data_keranjang?.length == 0

        // kalo barang kosong render hanya satu barang kosong kalo engga render barang 
        is_empty
            ? this.keranjang_barang.append(this.create_li({emptyMsg: "Keranjang Kosong"})) :
            data_keranjang.forEach(barang => this.keranjang_barang.append(this.create_li({barang})))
    }

    // render list barang
    render_barang(data_barang = []) {

        // membuat element list barang kosong
        this.list_barang.innerHTML = ""

        let is_empty = data_barang?.length == 0

        // kalo barang kosong render hanya satu barang kosong kalo engga render barang 
        is_empty ?
            this.list_barang.append(this.create_li({emptyMsg: "Barang tidak ditemukan"}))
            : data_barang.forEach(barang => this.list_barang.append(this.create_li({barang})))

    }
}


class Model {
    constructor() {
        // dapetin transaksi
        this.trasaksi = this.trasaksi_init()

        // kumpulan barang dari api
        this.data_barang = []

        // kumpulan barang yang di tandai
        this.barang_arr = []

        // kumpulan barang yang ada di keranjang dari api
        this.data_keranjang = []

        // fungsi untuk mengitial barang
        this.barang()

        // fungsi untuk mengitial keranjang
        this.keranjang()
    }

    async trasaksi_init() {
        // ngambil transaksi terkahir 
        let {result} = await window.kasir.transaksi_last_id()

        // fungsi kalo transaksi id engga ada buat baru
        let init = async (id) => await window.kasir.transaksi_get(id ?? await window.kasir.transaksi_tambah().lastID)

        // check transaksi terkahir ada atau engga
        let get = await init(result.lastID)

        // check transaksi cancel apa engga
        let is_cancel = get.result.cancel === 1

        // kalo cancel buat baru
        if (is_cancel) get = await init()

        return get.result
    }


    async keranjang_tambah(barang) {
        let transaksi_id = (await this.trasaksi)?.id
        if (transaksi_id) {
            if (barang) {
                let {data_barang_id, jumlah} = barang
                window.kasir.keranjang_tambah({transaksi_id, data_barang_id, jumlah})
            } else {
                if (!this.barang_isEmpty()) {
                    for (let data_barang_id of this.barang_arr) {
                        window.kasir.keranjang_tambah({transaksi_id, data_barang_id, jumlah: null})
                    }
                }

            }
            await this.keranjang()
        }
    }

    // fungsi hapus semua yang di tandai
    // kalo status true return ok 
    async barang_removeSelected() {
        for (let data_barang_id of this.barang_arr) {
            window.kasir.barang_rm(data_barang_id)
        }
    }

    // untuk check data_barang_id terdapat di list barang yang di tandai
    barang_getSelected(id) {
        return this.barang_arr.includes(id)
    }

    // untuk check barang yang di tandai kosong apa engga
    barang_isEmpty() {
        return this.barang_arr.length === 0
    }

    // Check kalo barang_arr kosong push dengan id 
    // kalo engga hapus barang sesuai id
    // return data apakah barang terdapat di barang_arr ama barang_arr kosong apa engga
    barang_setSelected(id) {
        if (!this.barang_isEmpty() && this.barang_getSelected(id)) {
            this.barang_arr = this.barang_arr.filter((v) => v !== id)
        } else {
            this.barang_arr.push(id)
        }

        return {is_contain: this.barang_getSelected(id), is_empty: this.barang_isEmpty()}
    }

    // hook ambil data dari context isolation ngambil keranjang 
    async keranjang() {
        let trasaksi_id = (await this.trasaksi)?.id
        let {status, result} = await window.kasir.keranjang_get(trasaksi_id)
        if (status) {
            this.data_keranjang = result
        }
    }

    // hook ambil data dari context isolation ngambil list barang 
    async barang() {
        let {status, result} = await window.kasir.barang_get()
        this.data_barang = status && result.length > 0 ? result : []
        if (!this.barang_isEmpty()) {
            this.barang_arr = []
        }
    }
}


export {Controller, Model, View}
