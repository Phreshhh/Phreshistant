const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const windowStateKeeper = require('electron-window-state');

let mainWindow;

function createWindow () {

  let mainWindowState = windowStateKeeper({
    defaultWidth: 800,
    defaultHeight: 600
  });

  mainWindow = new BrowserWindow({
    'x': mainWindowState.x,
    'y': mainWindowState.y,
    'width': mainWindowState.width,
    'height': mainWindowState.height,
    title: 'Phreshistant',
    icon: __dirname + '/build/icons/phreshistant-icon.png'
  });

  mainWindowState.manage(mainWindow);
  
  mainWindow.loadURL('file://' + __dirname + '/app/index.html');

  mainWindow.setMenu(null);

  // Open the DevTools.
  /* mainWindow.webContents.openDevTools(); */

  mainWindow.on('closed', function () {
    mainWindowState.saveState(mainWindow);
    mainWindow = null;
  });

}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});
