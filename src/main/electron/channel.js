const {ipcMain} = require("electron")
const sqlite3 = require("sqlite3")
const {open} = require("sqlite")


class Channel {
    constructor(path) {
        this.path = path
        this.db;
        (async () => {
            this.db = await this.connectDb()

            // aktifin buat relasi antara database di sqlite
            this.db.exec("PRAGMA foreign_keys = ON")

            this.table = [
                new Barang(this.db),
                new Keranjang(this.db),
                new Transaksi(this.db)
            ]
            this.initialDb()
            this.barang = this.table[0]
            this.keranjang = this.table[1]
            this.transaksi = this.table[2]
        })()
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

    async connectDb() {
        const db = await open({
            filename: this.path,
            driver: sqlite3.Database,
        })

        return db;
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
        this.db.close()
    }
}

class Database {
    constructor(db) {
        this.db_name = null;
        this.err = {
            status: false,
            result: null
        }
        this.db = db;
    }

    async handling(cb) {
        try {
            let result = await cb();
            console.log(result)
            return {
                status: true,
                result
            }
        } catch (e) {
            return this.err
        }
    }

    async all() {
        let data = await this.db.all(`SELECT * from ${this.db_name}`)
        return data
    }

    async create() {
        return true;
    }

    async getByID(id) {
        return this.err
    }

    insert(arg) {
        return this.err
    }
}


class Barang extends Database {
    constructor(db) {
        super(db);
        this.db_name = "data_barang"
    }

    async create() {
        await this.db.exec(`CREATE TABLE IF NOT EXISTS ${this.db_name}(id INTEGER PRIMARY KEY, kodebarang INTEGER NOT NULL UNIQUE, namabarang TEXT NOT NULL, harga INT NOT NULL, stok INT NOT NULL)`)
    }

    getByID(id) {
        this.handling(async () => {
            let result = await this.db.get(`SELECT * from ${this.db_name} WHERE id = ${id}`)
            return result
        })

    }

    async insert(arg) {
        return await this.handling(async () => {
            let {kodebarang, namabarang, harga, stok} = arg;
            let result = await this.db.exec(`INSERT INTO ${this.db_name}(kodebarang, namabarang, harga, stok) VALUES(${kodebarang}, ${namabarang}, ${harga}, ${stok})`)
            return result
        })

    }
}


class Keranjang extends Database {
    constructor(db) {
        super(db);
        this.db_name = "keranjang"
    }

    async create() {
        await this.db.exec(`CREATE TABLE IF NOT EXISTS ${this.db_name}(id INTEGER PRIMARY KEY, transaksi_id INTEGER NOT NULL, data_barang_id INTEGER, FOREIGN KEY(transaksi_id) REFERENCES transaksi(id), FOREIGN KEY(data_barang_id) REFERENCES data_barang(id) ON UPDATE CASCADE ON DELETE SET NULL)`)
    }

    insert(arg) {
        this.handling(async () => {
            let {transaksi_id, data_barang_id} = arg;
            let result = await this.db.run(`INSERT INTO ${this.db_name}(transaksi_id, data_barang_id) VALUES(${transaksi_id}, ${data_barang_id})`)
            return result
        })
    }
}


class Transaksi extends Database {
    constructor(db) {
        super(db);
        this.db_name = "transaksi"
    }

    async create() {
        await this.db.exec(`CREATE TABLE IF NOT EXISTS ${this.db_name}(id INTEGER PRIMARY KEY, waktu DATETIME DEFAULT CURRENT_TIMESTAMP)`)
    }

    insert(arg) {
        this.handling(async () => {
            let result = await this.db.run(`INSERT INTO ${this.db_name} DEFAULT VALUES`)
            return result
        })
    }
}



module.exports = Channel;

