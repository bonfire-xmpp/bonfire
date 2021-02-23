import { app, ipcMain } from "electron";
import { createCapacitorElectronApp } from "@capacitor-community/electron";

// The MainWindow object can be accessed via myCapacitorApp.getMainWindow()
const myCapacitorApp = createCapacitorElectronApp({
  splashScreen: {
    useSplashScreen: false,
  },
  applicationMenuTemplate: null,
  mainWindow: {
    windowOptions: {
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
        // preload: path.resolve(__dirname, "preload.js")
      }
    }
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some Electron APIs can only be used after this event occurs.
app.on("ready", () => {
  myCapacitorApp.init();
});

// Quit when all windows are closed.
app.on("window-all-closed", function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (myCapacitorApp.getMainWindow().isDestroyed()) myCapacitorApp.init();
});

// Define any IPC or other custom functionality below here
app.whenReady().then(() =>{
  const win = myCapacitorApp.getMainWindow();
  ipcMain.on("close", () => win.close())
  ipcMain.on("minimize", () => win.minimize())
  ipcMain.on("maximizeToggle", () => win.isMaximized() ? win.unmaximize() : win.maximize())
})
