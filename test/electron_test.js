const assert = require("assert")
const {Application} = require("spectron")
const path = require("path")
const api = require("../src/main/electron/api")

const _root = path.join(__dirname, "..")

// const electronPath = `${_root}/node_modules/.bin/electron`
const electronPath = require("electron")



describe("Electron", function () {
    this.timeout(50000)

    let channel;
    const app = new Application({
        path: electronPath,
        args: [_root, "", "--test"]
    })

    before(async () => {
        await app.start()
        channel = app.electron.ipcRenderer
    })

    after(async () => {
        if (app && app.isRunning()) {
            await app.stop()
        }
    })



    it("test", async () => {
        let id = await api(channel).transaksi_last_id()
        console.log(id)
    })
})
