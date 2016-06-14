var electron = require('electron');
var app = electron.app;
var BrowserWindow = electron.BrowserWindow;
var ipc = electron.ipcMain;

var loader = require('./core/dataLoader');
var parser = require('./core/dataParser');
var searcher = require('./core/searcher');

var mainWindow = null;

var dataMuqathaat = null;
var dataQuran = null;
var dataPosmap = null;
var dataIndex = null;

var allDataReady = false;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        minWidth: 800,
        minHeight: 600
    });

    mainWindow.loadURL(`file://${__dirname}/index.html`);

    // Open the DevTools.
    mainWindow.webContents.openDevTools();

    mainWindow.webContents.on('dom-ready', function () {
        loader.loadResources(mainWindow, function(buffer) {
            dataMuqathaat = parser.parseMuqathaat(buffer['muqathaat']);
            dataQuran = parser.parseQuran(buffer['quran_teks'], buffer['quran_trans_indonesian']);
            dataPosmap = {};
            dataPosmap['nv'] = parser.parsePosmap(buffer['posmap_nv']);
            dataPosmap['v'] = parser.parsePosmap(buffer['posmap_v']);

            dataIndex = {};
            dataIndex['nv'] = parser.parseIndex(buffer['index_nv']);
            dataIndex['v'] = parser.parseIndex(buffer['index_v']);

            allDataReady = true;
            console.log("MAIN: ALL READY");

            mainWindow.webContents.send('loadDone', true);
        });
    });

    mainWindow.on('closed', function () {
        mainWindow = null
    })
}

ipc.on('invokeSearch', function (event, query) {

    if (allDataReady) {
        searcher.search(dataIndex.v, query, 0.90, 'v', function (result) {
            searcher.rank(result, dataPosmap.v, dataQuran, function (ranked) {
                searcher.prepare(ranked, dataQuran, function (final) {
                    event.sender.send('searchDone', final);
                });
            });
        });
    }

});

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
