
class Controller {
    constructor(view, model) {
        this.view = view;
        this.model = model;
    }


    async run() {
        await this.initial()
    }


    async initial() {
        let {status, result} = await this.model.data_barang

        this.view.form_pembayaran?.addEventListener("submit", ev => {
            ev.preventDefault()
        })


        this.view.cari_barang?.addEventListener("submit", ev => {
            ev.preventDefault()
        })

        this.view.form_input_barang?.addEventListener("submit", ev => {
            ev.preventDefault()
        })


        this.view.form_cari?.addEventListener("keyup", async ({target}) => {
            const is_hidden = () => !this.view.form_input_barang?.classList.contains("hidden") && this.view.form_input_barang?.classList.toggle("hidden")

            if (target.value) {
                let barang = result?.find((t) => t.id === parseInt(target.value))
                if (barang) {
                    is_hidden()
                    this.view.render_barang([barang])
                }
                else {
                    this.view.form_input_barang?.classList.remove("hidden")
                    this.view.render_barang()
                }
            } else {
                is_hidden()
            }
        })

        status ? this.view.render_barang(result) : this.view.render_barang()
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
                        <span id="id_barang">ID: ${barang.id}</span>
                        <div class="item">
                            <h1 class="left">${barang.nama_barang}</h1>
                        </div>
                        <h3 class="price">${uang}</h3>
                    </li>
                `.trim()
            }).join(" ")
        this.list_barang.innerHTML = list
    }


}




class Model {
    constructor() {
        this.data_barang = window.kasir.barang_get()
    }
}


export {Controller, Model, View}
