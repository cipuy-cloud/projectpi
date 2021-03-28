import EventEmitter from "events"


class TransaksiModel extends EventEmitter {
    constructor() {
        super()
        this._data = this.init().then(data => {
            this.emit("transaksi_update")
            return data
        })
    }


    async id() {
        return (await this._data).id
    }

    async init() {
        let {result} = await window.kasir.transaksi_last_id()

        let get = await this.try_init(result.lastID)

        let is_cancel = get.result.cancel === 1

        if (is_cancel) get = await this.try_init()

        return get.result
    }


    async try_init(id) {
        let transaksi_id = id ?? await window.kasir.transaksi_tambah().lastID

        return await window.kasir.transaksi_get(transaksi_id)
    }

    async cancel() {
        let {status} = await window.kasir.transaksi_cancel(await this.id())

        if (status) {
            await this.init()

            this.emit("transaksi_cancel")
        }
    }

    async update() {
        let {status} = await window.kasir.transaksi_bayar(await this.id())

        if (status) {
            await this.init()

            this.emit("transaksi_update")
        }
    }
}

class TransaksiView extends EventEmitter {
    constructor(elements) {
        super()
        this._elements = elements

        elements.cancel?.addEventListener("click", () => this.emit("cancel"))

        elements.bayar?.addEventListener("click", () => this.emit("bayar"))

    }

}


class TransaksiController {
    constructor(model, view) {
        this._model = model
        this._view = view

        view.on("bayar", () => this._model.update())
            .on("cancel", () => this._model.cancel())
    }

    listen(cb) {
        this._model.on("transaksi_update", async () => {
            cb(await this._model.id())
        })
    }
}

export {TransaksiModel, TransaksiView, TransaksiController}
