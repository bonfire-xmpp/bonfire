const {app, ipcMain, BrowserWindow} = require("electron")
const path = require("path")

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 800,
    minHeight: 600,
    autoHideMenuBar: true,
    frame: false,
    webPreferences: {
      webSecurity: true,
      allowRunningInsecureContent: false,
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.resolve(__dirname, "preload.js")
    }
  })
  win.loadURL("http://localhost:3000/login")
  // win.loadFile("./dist/index.html")
  ipcMain.on("close", () => win.close())
  ipcMain.on("minimize", () => win.minimize())
  ipcMain.on("maximizeToggle", () => win.isMaximized() ? win.unmaximize() : win.maximize())
}

app.whenReady().then(() => createWindow())