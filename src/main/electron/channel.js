const {ipcMain, app} = require("electron")
const Database = require("better-sqlite3")
const vars = require("./env")

const connect = (path) => new Database(path)


const pesan = ({status = false, result = null, err = null}) => {
    return {status, result, err}
}

const handling = (cb) => {
    try {
        let result = cb()
        return pesan({status: true, result})
    } catch (err) {
        return pesan({err})
    }

}

class Channel {
    constructor(path) {
        let db = connect(path)
        this.dao = new Dao(db)
        this.table = [
            new Barang(this.dao),
            new Keranjang(this.dao),
            new Transaksi(this.dao)
        ]
        this.initialDb()
        this.barang = this.table[0]
        this.keranjang = this.table[1]
        this.transaksi = this.table[2]
    }

    listen() {

        ipcMain.handle(vars.BARANG_TAMBAH, (_event, kodebarang, namabarang, harga, stok) => {
            return this.barang.tambah(kodebarang, namabarang, harga, stok)
        })

        ipcMain.handle(vars.BARANG_GET, (_event, _arg) => {
            return this.barang.all()
        })

        ipcMain.handle(vars.BARANG_HAPUS, (_event, barang_id) => {
            return this.barang.rmByID(barang_id)
        })

        ipcMain.handle(vars.KERANJANG_BAYAR, (_event, transaksi_id) => {
            return this.handleBayar(transaksi_id)
        })

        ipcMain.handle(vars.KERANJANG_GET, (_event, transaksi_id) => {
            return this.keranjang.transaksiID(transaksi_id)
        })

        ipcMain.handle(vars.KERANJANG_TAMBAH, (_event, transaksi_id, data_barang_id, jumlah) => {
            return this.keranjang.tambah({transaksi_id, data_barang_id, jumlah})
        })

        ipcMain.handle(vars.KERANJANG_HAPUS, (_event, data_barang_id) => {
            return this.keranjang.rmByBarangID(data_barang_id)
        })

        ipcMain.handle(vars.TRANSAKSI_LAST_ID, (_event) => {
            return this.transaksi.lastID()
        })

        ipcMain.handle(vars.TRANSAKSI_TAMBAH, (_event, _arg) => {
            return this.transaksi.insert()
        })

        ipcMain.handle(vars.TRANSAKSI_HAPUS, (_event, transaksi_id) => {
            return this.transaksi.rmByID(transaksi_id)
        })

        ipcMain.handle(vars.TRANSAKSI_CANCEL, (_event, transaksi_id) => {
            return this.handleCancel(transaksi_id)
        })

        ipcMain.handle(vars.TUTUP, (_event, _arg) => {
            this.close()
            app.quit()
        })
    }

    initialDb() {
        this.table.forEach((query) => {
            query.create()
        })
    }

    handleCancel(transaksi_id) {
        return handling(() => {
            let {status, err} = this.transaksi.cancel(transaksi_id)
            if (!status) {
                throw err
            }
            let {result} = this.keranjang.rmByTransaksiID(transaksi_id)
            return result
        })
    }

    handleBayar(transaksi_id) {
        return handling(() => {
            let {status, err} = this.transaksi.update(transaksi_id)
            if (!status) {
                throw err
            }
            let {result} = this.barang.handleUpdateStok(transaksi_id)
            return result
        })
    }

    close() {
        for (let i in this.table) {
            delete this.table[i]
        }
        this.dao.close()
    }
}


class Dao {
    constructor(db) {
        this.db = db;
        this.db.pragma("foreign_keys = ON")

    }


    exec(query) {
        return handling(() => this.db.exec(query))
    }

    get(query) {
        return handling(() => {
            const stmt = this.db.prepare(query)
            return stmt.get()
        })
    }

    all(query) {
        return handling(() => {
            const stmt = this.db.prepare(query)
            return stmt.all()
        })
    }


    run(query) {
        return handling(() => {
            const stmt = this.db.prepare(query)
            return stmt.run()

        })
    }
    close() {
        this.db.close()
    }
}




class Table {
    dao = null;
    name = null;

    constructor(dao) {
        this.dao = dao
    }
    create() {}
    insert() {}

    getByID(id) {
        return this.dao?.get(`SELECT * from ${this.name} WHERE id = ${id}`)
    }

    rmByID(id) {
        return this.dao?.get(`DELETE from ${this.name} WHERE id = ${id}`)
    }


    all() {
        return this.dao?.all(`SELECT * from ${this.name}`)
    }

    lastID() {
        return this.dao?.get(`SELECT MAX(id) as lastID FROM ${this.name}`)
    }
}



class Barang extends Table {
    name = "barang"
    constructor(dao) {
        super(dao);
    }

    create() {
        this.dao?.exec(`CREATE TABLE IF NOT EXISTS ${this.name}(id INTEGER PRIMARY KEY, kodebarang INTEGER NOT NULL UNIQUE, namabarang TEXT NOT NULL, harga INT NOT NULL, stok INT NOT NULL)`)
    }


    insert({kodebarang, namabarang, harga, stok}) {
        return this.dao?.run(`INSERT INTO ${this.name}(kodebarang, namabarang, harga, stok) VALUES(${kodebarang}, '${namabarang}', ${harga}, ${stok})`)

    }

    handleUpdateStok(transaksi_id) {
        return this.dao?.run(`UPDATE ${this.name} SET stok = stok - 1 WHERE id IN (SELECT data_barang_id FROM keranjang where transaksi_id= ${transaksi_id})`)
    }
}


class Keranjang extends Table {
    name = "keranjang"
    constructor(dao) {
        super(dao);
    }

    create() {
        this.dao?.exec(`CREATE TABLE IF NOT EXISTS ${this.name}(id INTEGER PRIMARY KEY, transaksi_id INTEGER NOT NULL, data_barang_id INTEGER, jumlah INTEGER NOT NULL, FOREIGN KEY(transaksi_id) REFERENCES transaksi(id), FOREIGN KEY(data_barang_id) REFERENCES barang(id) ON UPDATE CASCADE ON DELETE SET NULL)`)
    }

    insert({transaksi_id, data_barang_id, jumlah}) {
        return this.dao?.run(`INSERT INTO ${this.name}(transaksi_id, data_barang_id, jumlah) VALUES(${transaksi_id}, ${data_barang_id}, ${jumlah})`)
    }



    barangID(id) {
        return this.dao?.get(
            `SELECT * 
                FROM ${this.name} 
                INNER JOIN barang 
                    ON data_barang_id = barang.id
                WHERE data_barang_id = ${id}`)

    }

    rmByTransaksiID(transaksi_id) {
        return this.dao?.get(`DELETE from ${this.name} WHERE transaksi_id=${transaksi_id}`)
    }

    rmByBarangID(data_barang_id) {
        return this.dao?.get(`DELETE from ${this.name} WHERE data_barang_id=${data_barang_id}`)
    }

    transaksiID(id) {
        return this.dao?.all(
            `SELECT * 
                FROM ${this.name} 
                INNER JOIN barang 
                    ON data_barang_id = barang.id
                WHERE transaksi_id = ${id}`)

    }

}

class Transaksi extends Table {
    name = "transaksi"
    constructor(dao) {
        super(dao);
    }

    create() {
        this.dao?.exec(`CREATE TABLE IF NOT EXISTS ${this.name}(id INTEGER PRIMARY KEY,waktu DATETIME DEFAULT CURRENT_TIMESTAMP, terbayar BOOLEAN DEFAULT 0, cancel BOOLEAN DEFAULT 0)`)
    }


    cancel(id) {
        return this.dao?.run(`UPDATE ${this.name} SET cancel=1 WHERE id=${id}`)
    }

    update(id) {
        return this.dao?.run(`UPDATE ${this.name} SET terbayar=1 WHERE id=${id}`)
    }

    insert() {
        return this.dao?.run(`INSERT INTO ${this.name} DEFAULT VALUES`)
    }

}



module.exports = Channel;

