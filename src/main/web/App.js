
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
        this.view.render_barang(this.model.data_barang)
    }

    async initial() {
        await this.reload()

        // untuk main window menu list ke reload jika databarang terjadi input edit hapus barang
        // jalinin fungsi ini
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

            window.kasir.barang_tambah({kodebarang, namabarang, harga, stok})
            await this.model.barang()
            this.find_barang(kodebarang)
            this.view.form_input_barang.reset()
        })


        // kalo input form Cari Barang terketik jalanin fungsi ini
        this.view.form_cari?.addEventListener("keyup", ({target}) => {
            this.find_barang(target.value)
        })

        // ngeset fungsi callback dari Model ke View untuk fungsi click menu barang
        this.view.setHook(this.handleTandai())
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

    // fungsi jembatan fungsi callback dari Model ke View untuk fungsi click menu barang
    handleTandai() {
        return {
            getSelected: (id) => this.model.getSelected(id),
            setSelected: (id) => this.model.setSelected(id)
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


        // element ini hanya terdapat di databarang
        this.form_input_barang = document.getElementById("form_input_barang")
        this.cotainer_btn = document.getElementById("container_btn")
        this.btn_hapus = this.cotainer_btn?.children.namedItem("hapus")
        this.btn_tandai = this.cotainer_btn?.children.namedItem("tandai")
    }

    // ngeset fungsi callback dari Model ke View melalui Controller untuk fungsi click menu barang
    setHook(hook) {
        this.hook = hook
    }


    // kalo list barang ke klik jalanin fungsi ini
    handleOnClickMenuList(el, data_barang_id) {

        let {setSelected} = this.hook ?? {}

        let {is_contain, is_empty} = setSelected?.(data_barang_id),
            is_classExist = el.classList.contains("selected"),
            is_container_btn_hidden = !this.container_btn?.includes("hidden")

        // kalo kelas `selected engga ada ama kalo id ini terdapat di barang_arr di model 
        !is_classExist && is_contain ? el.classList.add("selected") : el.classList.remove("selected")

        // kalo barang_arr kosong ama kalo container_btn terdapat di view
        is_empty && is_container_btn_hidden ? this.cotainer_btn?.classList.add("hidden") : this.cotainer_btn?.classList.remove("hidden")
    }

    // render list barang
    render_barang(data_barang = []) {
        this.list_barang.innerHTML = ""

        let is_empty = data_barang?.length == 0

        let li = (barang = {}) => {
            let {id, stok, namabarang, kodebarang, harga} = barang
            let {getSelected} = this.hook ?? {}

            let el = document.createElement("li")

            let is_selected = getSelected?.(id)
            el.className = `container row baseline ${is_selected ? "selected" : ""}`.trim()

            if (id) {
                el.id = id
                el.addEventListener("click", () => this.handleOnClickMenuList(el, id))
            }

            let uang = new Intl.NumberFormat("id-ID", {style: "currency", currency: "IDR"}).format(harga)
                , elNama = `<div class="item"><h1 class="left">${is_empty ? "Barang tidak ditemukan" : namabarang}</h1></div >`
                , elStok = stok > 1 ? `<div class="fill">${stok}</div>` : ""
                , elHarga = harga ? `<h3 class="border">${uang}</h3>` : ""
                , elKodeBarang = kodebarang ? `<div class="tr">KB-${kodebarang}</div>` : ""

            el.innerHTML = (elKodeBarang
                + elNama
                + elStok
                + elHarga).trim()


            return el
        }


        is_empty ?
            this.list_barang.append(li())
            : data_barang.forEach(barang => {this.list_barang.append(li(barang))})

    }
}


class Model {
    constructor() {
        this.barang()

        // kumpulan list barang yang di tandai
        this.barang_arr = []

    }

    // untuk check data_barang_id terdapat di list barang yang di tandai
    getSelected(id) {
        return this.barang_arr.includes(id)
    }


    // Check kalo barang_arr kosong push dengan id 
    // kalo engga hapus barang sesuai id
    // return data apakah barang terdapat di barang_arr ama barang_arr kosong apa engga
    setSelected(id) {
        let is_empty = () => this.barang_arr.length === 0

        if (!is_empty() && this.getSelected(id)) {
            this.barang_arr = this.barang_arr.filter((v) => v !== id)
        } else {
            this.barang_arr.push(id)
        }

        return {is_contain: this.getSelected(id), is_empty: is_empty()}
    }


    // hook ambil data dari context isolation ngambil list barang 
    async barang() {
        let {status, result} = await window.kasir.barang_get()
        this.data_barang = status && result.length > 0 ? result : []
    }
}


export {Controller, Model, View}
