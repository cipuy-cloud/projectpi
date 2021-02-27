const {ipcMain} = require("electron")
const sqlite3 = require("sqlite3")
const {open} = require("sqlite")


class Channel {
    constructor(db) {
        this.dao = new Dao(db)
        // aktifin buat relasi antara database di sqlite
        this.dao.exec("PRAGMA foreign_keys = ON")

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
    static async build(path) {
        let db = await Channel.connectDb(path)
        return new Channel(db)
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

    static async connectDb(path) {
        const db = await open({
            filename: path,
            driver: sqlite3.Database,
        })

        return db;
    }

    initialDb() {
        this.table.forEach(async (query) => {
            await query.create()
        })
    }


    close() {
        for (let i in this.table) {
            delete this.table[i]
        }
        this.dao.close()
    }
}



const pesan = ({status = false, result = null, err = null}) => {
    return {status, result, err}
}

const handling = async (cb, query) => {
    try {
        let result = await cb()
        return pesan({status: true, result})
    } catch (err) {
        return pesan({err})
    }

}


class Dao {
    constructor(db) {
        this.db = db;
    }


    async exec(query) {
        await handling(() => this.db.exec(query))
    }

    async get(query) {
        return await handling(() => this.db.get(query))
    }

    async all(query) {
        return await handling(() => this.db.all(query))
    }

    async run(query) {
        return await handling(() => this.db.run(query))
    }
    close() {
        this.db.close()
    }
}




class Table {
    name = null
    dao = null
    constructor(dao) {
        this.dao = dao
    }
    async create() {}
    async insert() {}

    async getByID(id) {
        return await this.dao?.get(`SELECT * from ${this.name} WHERE id = ${id}`)
    }
    async all() {
        return await this.dao?.all(`SELECT * from ${this.name}`)
    }
}



class Barang extends Table {
    name = "barang"
    constructor(dao) {
        super(dao);
    }

    async create() {
        await this.dao?.exec(`CREATE TABLE IF NOT EXISTS ${this.name}(id INTEGER PRIMARY KEY, kodebarang INTEGER NOT NULL UNIQUE, namabarang TEXT NOT NULL, harga INT NOT NULL, stok INT NOT NULL)`)
    }


    async insert({kodebarang, namabarang, harga, stok}) {
        return await this.dao?.run(`INSERT INTO ${this.name}(kodebarang, namabarang, harga, stok) VALUES(${kodebarang}, '${namabarang}', ${harga}, ${stok})`)

    }
}


class Keranjang extends Table {
    name = "keranjang"
    constructor(dao) {
        super(dao);
    }

    async create() {
        await this.dao?.exec(`CREATE TABLE IF NOT EXISTS ${this.name} (id INTEGER PRIMARY KEY, transaksi_id INTEGER NOT NULL, data_barang_id INTEGER, FOREIGN KEY(transaksi_id) REFERENCES transaksi(id), FOREIGN KEY(data_barang_id) REFERENCES data_barang(id) ON UPDATE CASCADE ON DELETE SET NULL)`)
    }

    async insert({transaksi_id, data_barang_id}) {
        return await this.dao?.run(`INSERT INTO ${this.name} (transaksi_id, data_barang_id) VALUES(${transaksi_id}, ${data_barang_id})`)
    }
}

class Transaksi extends Table {
    name = "transaksi"
    constructor(dao) {
        super(dao);
    }

    async create() {
        await this.dao?.exec(`CREATE TABLE IF NOT EXISTS ${this.name} (id INTEGER PRIMARY KEY, waktu DATETIME DEFAULT CURRENT_TIMESTAMP)`)
    }

    async insert() {
        return await this.dao?.run(`INSERT INTO ${this.name} DEFAULT VALUES`)
    }
}



module.exports = Channel;

