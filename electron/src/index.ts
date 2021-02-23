import { app, ipcMain } from "electron";
import { createCapacitorElectronApp } from "@capacitor-community/electron";
const localShortcut = require("electron-localshortcut")

const capapp = createCapacitorElectronApp({
  splashScreen: {
    useSplashScreen: false,
  },
  applicationMenuTemplate: null,
  mainWindow: {
    windowOptions: {
      width: 1120,
      height: 800,
      minWidth: 1120,
      minHeight: 800,
      autoHideMenuBar: true,
      frame: false,
      webPreferences: {
        webSecurity: true,
        allowRunningInsecureContent: false,
        nodeIntegration: false,
        contextIsolation: true,
        devTools: true,
      }
    },
  },
});

app.on("ready", () => {
  capapp.init();
  localShortcut.register(capapp.getMainWindow(), "F5", () => {
    capapp.getMainWindow().reload()
  })
  localShortcut.register(capapp.getMainWindow(), "F12", () => {
    capapp.getMainWindow().webContents.toggleDevTools()
  })
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function () {
  if (capapp.getMainWindow().isDestroyed()) 
    capapp.init();
});

app.whenReady().then(() =>{
  const win = capapp.getMainWindow();
  ipcMain.on("close", () => win.close())
  ipcMain.on("minimize", () => win.minimize())
  ipcMain.on("maximizeToggle", () => win.isMaximized() ? win.unmaximize() : win.maximize())
})
