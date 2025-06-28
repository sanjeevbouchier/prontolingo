const { app, BrowserWindow } = require('electron')
const path = require('path')
const url = require('url')

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // Required for Next.js, but consider security implications
    }
  })

  // In development, load from the Next.js dev server
  // In production, load the exported Next.js static files
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:9002') // Assuming Next.js runs on port 9002 as per package.json
    // Open the DevTools.
    mainWindow.webContents.openDevTools()
  } else {
    // Path when packaged (recommended way)
    const packagedPath = path.join(app.getAppPath(), 'out/index.html');
    // Fallback for some environments or if asar is unpacked (less common for 'out' dir)
    const devPath = path.join(__dirname, 'out/index.html');

    const startUrl = url.format({
      pathname: app.isPackaged ? packagedPath : devPath,
      protocol: 'file:',
      slashes: true,
    });
    mainWindow.loadURL(startUrl);
  }
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})
