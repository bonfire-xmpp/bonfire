const {ipcRenderer, contextBridge} = require("electron")

contextBridge.exposeInMainWorld("api", {
    close() { ipcRenderer.send("close") },
    maximizeToggle() { ipcRenderer.send("maximizeToggle") },
    minimize() { ipcRenderer.send("minimize") }
})
