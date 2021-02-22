

class Controller {
    constructor(view, model) {
        this.view = view;
        this.model = model;
    }


    async run() {
        console.log("Running Program")
        this.initial()
    }


    initial() {
        this.view.render_barang()
    }
}

class View {


    constructor() {
        // initial
        this.cari_barang = document.getElementById("cari_barang")
        this.form_cari = this.cari_barang.elements[0]
        this.list_barang = document.getElementById("list_barang")

        this.cari_barang.addEventListener("submit", ev => {
            ev.preventDefault()
        })

        this.form_cari.addEventListener("keyup", ev => {
            if (ev.target.value) {
                let barang = window.data_barang.find((t) => t.id === parseInt(ev.target.value))
                if (barang) {
                    this.render_barang([barang])
                } else {
                    this.render_barang()
                }
            }
        })
    }


    render_barang(filter_barang = []) {
        let isEmpty = filter_barang.length === 0
        let data = isEmpty ? window.data_barang : filter_barang
        let li = data.map((barang) => {

            let uang = new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR"
            }).format(barang.harga)

            return `
                <li id="${barang.id}" class="container row baseline between">
                    <span id="id_barang">ID: ${barang.id}</span>
                        <div class="item">
                            <h1 class="left">${barang.nama_barang}</h1>
                        </div>
                    <h3 class="price">${uang}</h3>
                </li>
            `.trim()
        })

        this.list_barang.innerHTML = li.join(" ")
    }


}




class Model {
    constructor() {
        window.data_barang = [
            {id: 323, nama_barang: "Saniter Fabric Disinfectant 200+30ml", harga: 120000},
            {id: 13, nama_barang: "dummy", harga: 1233434, },
        ]
    }
}


export {Controller, Model, View}
