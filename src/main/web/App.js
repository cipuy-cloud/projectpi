
class Controller {
    constructor(view, model) {
        this.view = view;
        this.model = model;
    }


    async run() {
        this.initial()
    }

    barang() {
        return this.model.data_barang
    }

    initial() {
        this.view.render_barang(this.barang)
    }
}

class View {


    constructor() {
        // initial
        this.cari_barang = document.getElementById("cari_barang")
        this.form_cari = this.cari_barang.elements[0]
        this.list_barang = document.getElementById("list_barang")


        // event
        this.cari_barang.addEventListener("submit", ev => {
            ev.preventDefault()
        })

        this.form_cari.addEventListener("keyup", ({target}) => {
            if (target.value) {
                let barang = window.data_barang.find((t) => t.id === parseInt(target.value))

                barang ? this.render_barang([barang]) : this.render_barang()
            }
        })
    }


    render_barang(data_barang = []) {
        // let data = data_barang ?? window.data_barang

        this.list_barang.innerHTML = data.map((barang) => {

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

    }


}




class Model {
    constructor() {
    }
}


export {Controller, Model, View}
