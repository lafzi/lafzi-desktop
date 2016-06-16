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

console.log("Using config file: " + global.appConfig.getConfigFilePath());

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

var iconPath = __dirname + '/res/icon.png';

function createMainWindow() {

    loadDefaultConfig();

    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        minWidth: 800,
        minHeight: 600,
        icon: iconPath
    });

    mainWindow.loadURL(`file://${__dirname}/index.html`);

    // Open the DevTools.
    // mainWindow.webContents.openDevTools();

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
        app.quit();
    })
}

ipc.on('invokeSearch', function (event, query) {

    var mode = (global.appConfig.get('vowel') == true) ? 'v' : 'nv';

    if (allDataReady) {
        console.log("SEARCH: threshold=" + global.appConfig.get('threshold') + " mode=" + mode);
        searcher.search(dataIndex[mode], query, global.appConfig.get('threshold'), mode, function (result) {
            searcher.rank(result, dataPosmap[mode], dataQuran, function (ranked) {
                searcher.prepare(ranked, dataQuran, function (final) {
                    event.sender.send('searchDone', final);
                });
            });
        });
    }

});

ipc.on('invokeAppQuit', function (event, obj) {
    if (obj === true) {
        app.quit();
    }
});

// SETTINGS WINDOW =====================================================================================================

var settingsWindow = null;

function createSettingsWindow() {

    if (settingsWindow) return;

    settingsWindow = new BrowserWindow({
        width: 400,
        height: 400,
        frame: false,
        skipTaskbar: true,
        resizable: false
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
    mainWindow.webContents.send('askToReloadSearch', true);

});

ipc.on('invokeSettingsShow', function (event, obj) {
    if (obj === true) {
        createSettingsWindow();
    }
});

// ABOUT WINDOW ========================================================================================================

var aboutWindow = null;

function createAboutWindow() {

    if (aboutWindow) return;

    aboutWindow = new BrowserWindow({
        width: 400,
        height: 400,
        frame: false,
        skipTaskbar: true,
        resizable: false
    });

    aboutWindow.loadURL(`file://${__dirname}/about.html`);

    aboutWindow.on('closed', function () {
        aboutWindow = null
    })
}

ipc.on('invokeAboutShow', function (event, obj) {
    if (obj === true) {
        createAboutWindow();
    }
});

// FAQ WINDOW ==========================================================================================================

var faqWindow = null;

function createFaqWindow() {

    if (faqWindow) return;

    faqWindow = new BrowserWindow({
        width: 400,
        height: 400,
        frame: false,
        skipTaskbar: true,
        resizable: false
    });

    faqWindow.loadURL(`file://${__dirname}/faq.html`);

    faqWindow.on('closed', function () {
        faqWindow = null
    })
}

ipc.on('invokeFaqShow', function (event, obj) {
    if (obj === true) {
        createFaqWindow();
    }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createMainWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    app.quit();
});
