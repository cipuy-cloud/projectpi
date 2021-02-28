const assert = require('assert')
const Channel = require("../src/main/electron/channel")
const fs = require("fs")



const db = "test/dummy.db"

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
        }
    ]

    let dummy;
    let data_barang_id;
    let transaksi_id;



    before(() => {
        dummy = new Channel("test/dummy.db")
    })

    it('menghitung jumlah db', () => {
        let {status, result, err} = dummy.dao?.get("SELECT COUNT(*) as count from sqlite_master where type='table'")
        assert.equal(status, true)
        assert.equal(result.count, 3)
    })

    describe("Barang", function () {
        it('masukin barang', () => {
            const {status, result} = dummy.barang.insert(barang[0])
            data_barang_id = result.lastInsertRowid
            assert.equal(status, true)
        })

        it('jika memasukan kodebarang sama, status: false', () => {
            const {status} = dummy.barang.insert(barang[0])
            assert.equal(status, false)
        })

        it('print barang dengan id', () => {
            const {status, result} = dummy.barang.getByID(data_barang_id)
            assert.equal(status, true)
            assert.equal(result.kodebarang, barang[0].kodebarang)
        })

    })

    describe("Transaksi", function () {
        it("buat transaksi", () => {
            const {status, result} = dummy.transaksi.insert()
            transaksi_id = result.lastInsertRowid
            assert.equal(status, true)
        })
        it('print transaksi dengan id', () => {
            const {status, result} = dummy.transaksi.getByID(transaksi_id)
            assert.equal(status, true)
            assert.equal(result.id, transaksi_id)
        })
    })

    describe("Keranjang", function () {
        let keranjang_id;
        it("masukin keranjang", () => {
            const {status, result} = dummy.keranjang.insert({transaksi_id, data_barang_id, jumlah: 2})
            assert.equal(status, true)
            keranjang_id = result.lastInsertRowid
        })
        it('print keranjang dengan keranjang id', () => {
            const {status, result} = dummy.keranjang.getByID(data_barang_id)
            assert.equal(status, true)
            assert.equal(result.kodebarang, barang[0].kodebarang)
        })
        it('print keranjang dengan barang id', () => {
            const {status, result} = dummy.keranjang.barangID(data_barang_id)

            assert.equal(status, true)
            assert.equal(result.kodebarang, barang[0].kodebarang)
        })
        it('print keranjang dengan transaksi id', () => {
            delete barang[0]

            barang.forEach((b) => {
                let br = dummy.barang.insert(b)
                let data_barang_id = br.result.lastInsertRowid
                let k = dummy.keranjang.insert({transaksi_id, data_barang_id, jumlah: 1})

            })

            const {result} = dummy.keranjang.transaksiID(transaksi_id)
            assert.equal(result.length, 3)

        })
    })



    describe("Event", function () {
        it("transaksi terbayar", () => {
            const {status, result, err} = dummy.transaksi.update(transaksi_id)
            assert.equal(status, true)
        })
    })

    after(() => {
        dummy.close()
        fs.unlink(db, (err) => {
            if (err) {
                throw err
            }
            console.log("delete dummy db");
        })
    })
})

