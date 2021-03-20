const assert = require("assert")
const {Application} = require("spectron")
const path = require("path")
const fs = require("fs")
const api_kasir = require("../src/main/electron/api")

const _root = path.join(__dirname, "..")
const electronPath = require("electron")



describe("Electron", function () {
    this.timeout(5000)
    const DB = `${__dirname}/dummy.db`

    let api
    let barang

    const app = new Application({
        path: electronPath,
        args: [_root, "", "--test", DB],
    })

    before(async () => {
        try {
            await app.start()
            api = api_kasir(app.electron.ipcRenderer)
            barang = JSON.parse(fs.readFileSync(require.resolve(`${__dirname}/barang.json`)))
        } catch (err) {
            console.log(err)
        }
    })

    after(async () => {
        if (app && app.isRunning()) {
            await app.stop()
        }

        fs.unlink(DB, (err) => {
            if (err) {
                throw err
            }
            console.log("DELETE DUMMY DB");
        })
    })

    describe("Api", function () {
        let data_barang_id
        let transaksiID
        let rmID
        let listByTransaksiID


        it("barang_tambah", async () => {
            for (let br of barang) {
                let {result, status} = await api.barang_tambah(br)
                assert.strictEqual(status, true)
                rmID = data_barang_id
                data_barang_id = result.lastInsertRowid
            }
        })

        it("jika memasukan kodebarang sama, status: false", async () => {
            let {status} = await api.barang_tambah(barang[0])
            assert.strictEqual(status, false)
        })


        it("barang_rm", async () => {
            let {status} = await api.barang_rm(rmID)
            assert.strictEqual(status, true)
        })

        it("barang_get", async () => {
            let {result, status} = await api.barang_get()
            assert.strictEqual(status, true)
            assert.strictEqual(result.length, barang.length - 1)
        })

        it("transaksi_tambah", async () => {
            let {status, result} = await api.transaksi_tambah()
            transaksiID = result.lastInsertRowid
            assert.strictEqual(status, true)
            assert.strictEqual(transaksiID, 1)
        })

        it("transaksi_last_id", async () => {
            let {status, result} = await api.transaksi_last_id()
            assert.strictEqual(status, true)
            assert.strictEqual(result.lastID, transaksiID)
        })

        it("keranjang_tambah", async () => {
            let {result} = await api.barang_get()
            for (let br of result.slice(0, 3)) {
                let keranjang = await api.keranjang_tambah({transaksi_id: transaksiID, data_barang_id: br.id, jumlah: 1})
                assert.strictEqual(keranjang.status, true)
            }
        })


        it("keranjang_get", async () => {
            let {status, result} = await api.keranjang_get(transaksiID)
            assert.strictEqual(status, true)
            assert.strictEqual(result.length, 3)
            listByTransaksiID = result
        })

        it("keranjang_rm", async () => {
            let {status} = await api.keranjang_rm(transaksiID, listByTransaksiID[0].data_barang_id)
            assert.strictEqual(status, true)

            let list = await api.keranjang_get(transaksiID)
            assert.strictEqual(status, true)
            assert.strictEqual(list.result.length, 2)
        })


        it("transaksi_cancel", async () => {
            let {status} = await api.transaksi_cancel(transaksiID)
            assert.strictEqual(status, true)
        })

        it("transaksi_get", async () => {
            let {status, result} = await api.transaksi_get(transaksiID)
            assert.strictEqual(status, true)
            assert.strictEqual(result.cancel, 1)
        })

        it("transaksi_rm", async () => {
            let {status, result} = await api.transaksi_rm(transaksiID)
            assert.strictEqual(status, true)
            assert.strictEqual(result.changes, 1)
        })


    })

})
