const assert = require('assert')
const Channel = require("../src/main/electron/channel")
const fs = require("fs")



const db = "test/dummy.db"



describe('Database', function () {
    let dummy;

    before(() => {
        dummy = new Channel("test/dummy.db")
    })

    it('menghitung jumlah db', async () => {
        let {count} = await dummy.db.get("SELECT COUNT(*) as count from sqlite_master where type='table'")

        assert.equal(count, 3)
    })

    describe("Barang", function () {
        it('masukin barang', async () => {
            const barang = {
                kodebarang: 323,
                namabarang: "dummy1",
                harga: 12000000,
                stok: 2
            }
            const result = await dummy.barang.insert(barang)
            console.log(result)
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

