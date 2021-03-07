/*eslint no-undefined: "error"*/
const assert = require("assert")
const Channel = require("../src/main/electron/channel")
const fs = require("fs")



describe("Before Install", function () {
    const db = `${__dirname}/dummy.db`
    let dummy;
    let barang;
    before(() => {
        dummy = new Channel(db)
        try {
            barang = JSON.parse(fs.readFileSync(require.resolve(`${__dirname}/barang.json`)))
        } catch (err) {
            console.log(err)
        }
    })


    after(async () => {
        dummy.close()
        fs.unlink(db, (err) => {
            if (err) {
                throw err
            }
            console.log("DELETE DUMMY DB");

        })
    })

    describe("Database", function () {

        let data_barang_id;
        let transaksi_id;
        let listByTransaksiID



        it("menghitung jumlah db", () => {
            let {status, result} = dummy.dao?.get("SELECT COUNT(*) as count from sqlite_master where type='table'")
            assert.strictEqual(status, true)
            assert.strictEqual(result.count, 3)
        })

        describe("Barang", function () {
            it("masukin barang", () => {
                barang.forEach((b) => {
                    const {status, result} = dummy.barang.insert(b)
                    assert.strictEqual(status, true)
                    data_barang_id = result.lastInsertRowid
                })
            })

            it("jika memasukan kodebarang sama, status: false", () => {
                const {status} = dummy.barang.insert(barang[0])
                assert.strictEqual(status, false)
            })

            it("print barang dengan id", () => {
                const {status, result} = dummy.barang.getByID(data_barang_id)
                assert.strictEqual(status, true)
                assert.strictEqual(result.kodebarang, barang[barang.length - 1].kodebarang)
            })

        })

        describe("Transaksi", function () {
            it("buat transaksi", () => {
                const {status, result} = dummy.transaksi.insert()
                transaksi_id = result.lastInsertRowid
                assert.strictEqual(status, true)
            })
            it("print transaksi dengan id", () => {
                const {status, result} = dummy.transaksi.getByID(transaksi_id)
                assert.strictEqual(status, true)
                assert.strictEqual(result.id, transaksi_id)
            })
        })

        describe("Keranjang", function () {
            let br = []
            it("masukin keranjang", () => {
                br = dummy.barang.all().result
                br.slice(0, 3).forEach((b) => {
                    let k = dummy.keranjang.insert({transaksi_id, data_barang_id: b.id, jumlah: 1})
                    assert.strictEqual(k.status, true)
                })
            })

            it("print keranjang dengan transaksi id", () => {
                const {result} = dummy.keranjang.transaksiID(transaksi_id)
                assert.strictEqual(result.length, 3)
                listByTransaksiID = result
            })

            it("print keranjang dengan barang id", () => {
                const {status, result} = dummy.keranjang.barangID(br[0].id)

                assert.strictEqual(status, true)
                assert.strictEqual(result.kodebarang, barang[0].kodebarang)
            })
        })



        describe("Event", function () {
            it("transaksi terbayar", () => {
                let bayar = dummy.handleBayar(transaksi_id)
                assert.strictEqual(bayar.status, true)

                const {result} = dummy.keranjang.transaksiID(transaksi_id)

                for (let i in result) {
                    assert.strictEqual(result[i].stok, (listByTransaksiID[i].stok - 1))
                }
            })
        })

    })
})
