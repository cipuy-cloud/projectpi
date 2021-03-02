const assert = require('assert')
const Channel = require("../src/main/electron/channel")

const fs = require("fs")



const db = "test/dummy.db"

describe("App", function () {

    before(() => {
        dummy = new Channel("test/dummy.db")
    })


    after(async () => {
        dummy.close()
        fs.unlink(db, (err) => {
            if (err) {
                throw err
            }
            console.log("delete dummy db");

        })
    })

    describe('Database', function () {
        const barang = [
            {
                kodebarang: 323,
                namabarang: "dummy1",
                harga: 12000000,
                stok: 2
            },
            {
                kodebarang: 123,
                namabarang: "dummy2",
                harga: 112000,
                stok: 12
            },
            {
                kodebarang: 11394,
                namabarang: "dummy3",
                harga: 50000,
                stok: 8
            },
            {
                kodebarang: 323343,
                namabarang: "dummy4",
                harga: 12000000,
                stok: 2
            },
            {
                kodebarang: 123343,
                namabarang: "dummy5",
                harga: 112000,
                stok: 12
            },
        ]

        let data_barang_id;
        let transaksi_id;
        let listByTransaksiID



        it('menghitung jumlah db', () => {
            let {status, result} = dummy.dao?.get("SELECT COUNT(*) as count from sqlite_master where type='table'")
            assert.strictEqual(status, true)
            assert.strictEqual(result.count, 3)
        })

        describe("Barang", function () {
            it('masukin barang', () => {
                barang.forEach((b) => {
                    const {status, result} = dummy.barang.insert(b)
                    assert.strictEqual(status, true)
                    data_barang_id = result.lastInsertRowid
                })
            })

            it('jika memasukan kodebarang sama, status: false', () => {
                const {status} = dummy.barang.insert(barang[0])
                assert.strictEqual(status, false)
            })

            it('print barang dengan id', () => {
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
            it('print transaksi dengan id', () => {
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

            it('print keranjang dengan transaksi id', () => {
                const {result} = dummy.keranjang.transaksiID(transaksi_id)
                assert.strictEqual(result.length, 3)
                listByTransaksiID = result
            })

            it('print keranjang dengan barang id', () => {
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

                for (i in result) {
                    assert.strictEqual(result[i].stok, (listByTransaksiID[i].stok - 1))
                }
            })
        })

    })
})
