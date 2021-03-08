
class Controller {
    constructor(view, model) {
        this.view = view;
        this.model = model;
    }


    async run() {
        await this.initial()
    }


    async reload() {
        await this.model.barang()
        this.view.render_barang(this.model.data_barang)
    }

    async initial() {
        await this.reload()

        window.kasir.listen(() => {
            this.reload()
        })

        this.view.form_pembayaran?.addEventListener("submit", ev => {
            ev.preventDefault()
        })


        this.view.cari_barang?.addEventListener("submit", ev => {
            ev.preventDefault()
        })

        this.view.form_input_barang?.addEventListener("submit", async (ev) => {
            ev.preventDefault()

            let kodebarang = parseInt(this.view.form_cari?.value)
            let harga = parseInt(ev.target.elements["harga"].value)
            let namabarang = ev.target.elements["namabarang"].value
            let stok = parseInt(ev.target.elements["stok"].value)

            window.kasir.barang_tambah({kodebarang, namabarang, harga, stok})
            await this.model.barang()
            this.find_barang(kodebarang)
            this.view.form_input_barang.reset()
        })


        this.view.form_cari?.addEventListener("keyup", ({target}) => {
            this.find_barang(target.value)
        })

    }

    find_barang(value) {

        const is_hidden = () => !this.view.form_input_barang?.classList.contains("hidden") && this.view.form_input_barang?.classList.toggle("hidden")
        if (value) {
            let barang = this.model.data_barang?.find((t) => t.kodebarang === parseInt(value))
            if (barang) {
                is_hidden()
                this.view.render_barang([barang])
            } else {
                this.view.form_input_barang?.classList.remove("hidden")
                this.view.render_barang()
            }
        } else {
            is_hidden()
            this.view.render_barang(this.model.data_barang)
        }
    }
}

class View {


    constructor() {
        // initial
        this.cari_barang = document.getElementById("cari_barang")
        this.form_cari = this.cari_barang.elements[0]
        this.list_barang = document.getElementById("list_barang")
        this.form_pembayaran = document.getElementById("bayar")
        this.form_input_barang = document.getElementById("form_input_barang")
    }


    render_barang(data_barang = []) {
        let list = data_barang.length == 0 ? "<li class=\"container\"><div class=\"item\"><h1 class=\"left\">Barang Kosong</h1></div></li>".trim()
            : data_barang.map((barang) => {
                let uang = new Intl.NumberFormat("id-ID", {style: "currency", currency: "IDR"}).format(barang.harga)

                return `
                    <li id="${barang.id}" class="container row baseline between"> 
                        <div class="tr">kB-${barang.kodebarang}</div>
                        <div class="item">
                            <h1 class="left">${barang.namabarang}</h1>
                        </div>
                        <h3 class="border">
                            ${uang}
                        </h3>
                        <div class="fill">${barang.stok}</div>
                    </li>
                `.trim()
            }).join(" ")
        this.list_barang.innerHTML = list
    }


}




class Model {
    constructor() {
        this.barang()
    }
    async barang() {
        let {status, result} = await window.kasir.barang_get()
        this.data_barang = status && result.length > 0 ? result : []
    }
}


export {Controller, Model, View}
