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



    before(async () => {
        dummy = await Channel.build("test/dummy.db")
    })

    it('menghitung jumlah db', async () => {
        let {status, result, err} = await dummy.dao?.get("SELECT COUNT(*) as count from sqlite_master where type='table'")
        assert.equal(status, true)
        assert.equal(result.count, 3)
    })

    describe("Barang", function () {
        it('masukin barang', async () => {
            const {status, result} = await dummy.barang.insert(barang[0])
            data_barang_id = result.lastID
            assert.equal(status, true)
        })

        it('jika memasukan kodebarang sama, status: false', async () => {
            const {status, err} = await dummy.barang.insert(barang[0])
            assert.equal(status, false)
            assert.equal(err.errno, 19)
        })

        it('print barang dengan id', async () => {
            const {status, result} = await dummy.barang.getByID(data_barang_id)
            assert.equal(status, true)
            assert.equal(result.kodebarang, barang[0].kodebarang)
        })

    })

    describe("Transaksi", function () {
        it("buat transaksi", async () => {
            const {status, result} = await dummy.transaksi.insert()
            transaksi_id = result.lastID
            assert.equal(status, true)
        })
        it('print transaksi dengan id', async () => {
            const {status, result} = await dummy.transaksi.getByID(transaksi_id)
            assert.equal(status, true)
            assert.equal(result.id, transaksi_id)
        })
    })

    describe("Keranjang", function () {
        let keranjang_id;
        it("masukin keranjang", async () => {
            const {status, result} = await dummy.keranjang.insert({transaksi_id, data_barang_id, jumlah: 2})
            assert.equal(status, true)
            keranjang_id = result.lastID
        })
        it('print keranjang dengan keranjang id', async () => {
            const {status, result} = await dummy.keranjang.getByID(data_barang_id)
            assert.equal(status, true)
            assert.equal(result.kodebarang, barang[0].kodebarang)
        })
        it('print keranjang dengan barang id', async () => {
            const {status, result} = await dummy.keranjang.barangID(data_barang_id)

            assert.equal(status, true)
            assert.equal(result.kodebarang, barang[0].kodebarang)
        })
        it('print keranjang dengan transaksi id', async () => {
            delete barang[0]

            barang.forEach(async (b) => {
                let br = await dummy.barang.insert(b)
                let data_barang_id = br.result.lastID
                let k = await dummy.keranjang.insert({transaksi_id, data_barang_id, jumlah: 1})

            })

            const {result} = await dummy.keranjang.transaksiID(transaksi_id)
            assert.equal(result.length, 3)

        })
    })



    describe("Event", function () {
        it("transaksi terbayar", async () => {
            const {status, result, err} = await dummy.transaksi.update(transaksi_id)
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

