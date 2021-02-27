const assert = require('assert')
const Channel = require("../src/main/electron/channel")
const fs = require("fs")



const db = "test/dummy.db"

describe('Database', function () {
    let dummy;
    let data_barang_id;
    let transaksi_id;

    before(async () => {
        dummy = await Channel.build("test/dummy.db")
    })

    it('menghitung jumlah db', async () => {
        let {status, result} = await dummy.dao?.get("SELECT COUNT(*) as count from sqlite_master where type='table'")
        assert.equal(status, true)
        assert.equal(result.count, 3)
    })

    describe("Barang", function () {
        const barang = {
            kodebarang: 323,
            namabarang: "dummy1",
            harga: 12000000,
            stok: 2
        }
        it('masukin barang', async () => {
            const {status, result} = await dummy.barang.insert(barang)
            data_barang_id = result.lastID
            assert.equal(status, true)
        })

        it('jika memasukan kodebarang sama, status: false', async () => {
            const {status} = await dummy.barang.insert(barang)
            assert.equal(status, false)
        })

        it('print barang dengan id', async () => {
            const {status, result} = await dummy.barang.getByID(data_barang_id)
            assert.equal(status, true)
            assert.equal(result.kodebarang, barang.kodebarang)
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

