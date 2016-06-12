var electron = require('electron');
var app = electron.app;
var BrowserWindow = electron.BrowserWindow;

var loader = require('./dataLoader');
var parser = require('./dataParser');

var mainWindow = null;

//

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        resizable: false,
        maximizable: false
    });

    mainWindow.loadURL(`file://${__dirname}/index.html`);

    // Open the DevTools.
    // mainWindow.webContents.openDevTools();

    mainWindow.webContents.on('did-finish-load', function () {
        loader.loadResources(mainWindow, function(buffer) {
            var dataMuqathaat = parser.parseMuqathaat(buffer['muqathaat']);
            var dataQuran = parser.parseQuran(buffer['quran_teks'], buffer['quran_trans_indonesian']);
            var dataPosmap = {};
            dataPosmap['nv'] = parser.parsePosmap(buffer['posmap_nv']);
            dataPosmap['v'] = parser.parsePosmap(buffer['posmap_v']);

            var dataIndex = {};
            dataIndex['nv'] = parser.parseIndex(buffer['index_nv']);
            dataIndex['v'] = parser.parseIndex(buffer['index_v']);
        });
    });

    mainWindow.on('closed', function () {
        mainWindow = null
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
