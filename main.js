var electron = require('electron');
var app = electron.app;
var BrowserWindow = electron.BrowserWindow;
var ipc = electron.ipcMain;
var ElectronSettings = require('electron-settings');

var loader = require('./core/dataLoader');
var parser = require('./core/dataParser');
var searcher = require('./core/searcher');

var mainWindow = null;
global.appConfig = new ElectronSettings();

console.log("Using config file: " + appConfig.getConfigFilePath());

var dataMuqathaat = null;
var dataQuran = null;
var dataPosmap = null;
var dataIndex = null;

var allDataReady = false;

function loadDefaultConfig() {

    var vowel = global.appConfig.get('vowel');
    if (vowel === undefined) {
        vowel = true;
        global.appConfig.set('vowel', vowel)
    }

    var threshold = global.appConfig.get('threshold');
    if (threshold === undefined) {
        threshold = 0.9;
        global.appConfig.set('threshold', threshold)
    }

    var showTrans = global.appConfig.get('showTrans');
    if (showTrans === undefined) {
        showTrans = true;
        global.appConfig.set('showTrans', showTrans)
    }

}

function createWindow() {

    loadDefaultConfig();

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

    var mode = (appConfig.get('vowel') == true) ? 'v' : 'nv';

    if (allDataReady) {
        console.log("SEARCH: threshold=" + appConfig.get('threshold') + " mode=" + mode);
        searcher.search(dataIndex[mode], query, appConfig.get('threshold'), mode, function (result) {
            searcher.rank(result, dataPosmap[mode], dataQuran, function (ranked) {
                searcher.prepare(ranked, dataQuran, function (final) {
                    event.sender.send('searchDone', final);
                });
            });
        });
    }

});

var settingsWindow = null;

function createSettingsWindow() {

    if (settingsWindow) return;

    settingsWindow = new BrowserWindow({
        width: 400,
        height: 400,
        frame: false
    });

    settingsWindow.loadURL(`file://${__dirname}/settings.html`);

    settingsWindow.on('closed', function () {
        settingsWindow = null
    })
}

ipc.on('settingsSave', function (event, obj) {

    global.appConfig.set('vowel', obj.vowel);
    global.appConfig.set('threshold', obj.threshold);
    global.appConfig.set('showTrans', obj.showTrans);

    event.sender.send('settingsSaveDone', true);

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
