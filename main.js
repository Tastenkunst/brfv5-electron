const { app, BrowserWindow } = require('electron');
const { createProtocol }     = require('./allow_es6_imports');

let win

async function createWindow() {

  win = new BrowserWindow({ width: 1800, height: 1600, frame: true, webPreferences: { nodeIntegration: true }})
  win.maximize()
  win.webContents.openDevTools()
  win.loadFile('electron.html')
  win.on('closed', () => { win = null })
}

app.on('ready', async () => {

    createProtocol('app');
    await createWindow();
  }
);

app.on('window-all-closed', () => { app.quit() })
app.on('activate', async () => { if (win === null) { await createWindow() } })
