const {ipcMain} = require("electron")
const sqlite3 = require("sqlite3")
const {open} = require("sqlite")
const path = require("path")
const {TAMBAH_MASSAGE, GET_MASSAGE, BAYAR_MESSAGE} = require("./const")

class Channel {
    constructor() {
        this.nama_database = "daftarbarang";
        (async () => {
            this.db = await this.connectDb();
            this.initialDb();
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
        let dir = path.join(__dirname, "..", "assets/db/database.db");
        const db = await open({
            filename: dir,
            driver: sqlite3.Database,
        })

        return db;
    }

    async initialDb() {
        await this.db.exec(`CREATE TABLE IF NOT EXISTS ${this.nama_database}(id INTEGER PRIMARY KEY, kodebarang INTEGER, namabarang TEXT, harga INT, jumlah INT)`);

    }
    async delete_all() {
        await this.db.exec(`DELETE from ${this.nama_database}`)
    }

    async tambah(kodebarang, namabarang, harga, jumlah) {
        let result = await this.db.run(`INSERT INTO ${this.nama_database}(kodebarang,namabarang, harga, jumlah) VALUES(:kodebarang,:namabarang, :harga, :jumlah)`, {
            ":kodebarang": kodebarang,
            ":namabarang": namabarang,
            ":harga": harga,
            ":jumlah": jumlah,
        });
        return result
    }

    async all() {
        let data = await this.db.all(`SELECT * from ${this.nama_database}`);
        return data
    }
}

module.exports = Channel;

