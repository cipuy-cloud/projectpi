const {ipcMain} = require("electron")
const Database = require("better-sqlite3")


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
        ipcMain.handle(TAMBAH_MASSAGE, (_event, kodebarang, namabarang, harga, jumlah) => {
            return this.tambah(kodebarang, namabarang, harga, jumlah)
        })
        ipcMain.handle(GET_MASSAGE, (_event, _arg) => {
            return this.all()
        })
        ipcMain.handle(BAYAR_MESSAGE, () => {
            this.delete_all()
            return true
        })
    }

    initialDb() {
        this.table.forEach((query) => {
            query.create()
        })
    }

    close() {
        for (let i in this.table) {
            delete this.table[i]
        }
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
}




class Table {
    name = null
    dao = null
    constructor(dao) {
        this.dao = dao
    }
    create() {}
    insert() {}

    getByID(id) {
        return this.dao?.get(`SELECT * from ${this.name} WHERE id = ${id}`)
    }
    all() {
        return this.dao?.all(`SELECT * from ${this.name}`)
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


    getByID(id) {
        return this.dao?.get(
            `SELECT * 
                FROM ${this.name} 
                INNER JOIN barang 
                    ON data_barang_id = barang.id
                WHERE ${this.name}.id = ${id} `)
    }
    barangID(id) {
        return this.dao?.get(
            `SELECT * 
                FROM ${this.name} 
                INNER JOIN barang 
                    ON data_barang_id = barang.id
                WHERE barang.id = ${id}`)

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
        this.dao?.exec(`CREATE TABLE IF NOT EXISTS ${this.name}(id INTEGER PRIMARY KEY,waktu DATETIME DEFAULT CURRENT_TIMESTAMP, terbayar BOOLEAN DEFAULT 0)`)
    }

    update(id) {
        return this.dao?.run(`UPDATE ${this.name} SET terbayar=1 WHERE id=${id}`)
    }

    insert() {
        return this.dao?.run(`INSERT INTO ${this.name} DEFAULT VALUES`)
    }
}



module.exports = Channel;

