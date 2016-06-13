var electron = require('electron');
var app = electron.app;
var BrowserWindow = electron.BrowserWindow;
var ipc = electron.ipcMain;

var loader = require('./dataLoader');
var parser = require('./dataParser');
var searcher = require('./searcher');

var mainWindow = null;

var dataMuqathaat = null;
var dataQuran = null;
var dataPosmap = null;
var dataIndex = null;

var allDataReady = false;

/**
 * Prepare search result for view
 * @param {Array.<{id:number,matchCount:number,score:number,highlightPos:Array.<number>}>}  rankedSearchResult
 * @param {Array.<{surah:Number,name:string,ayat:Number,text:string,trans:string}>}         quranTextData
 * @returns {Array.<{surah:Number,name:string,ayat:Number,text:string,trans:string,score:number,highlightPos:Array.<number>}>}
 */
function prepareSearchResult(rankedSearchResult, quranTextData) {

    var result = [];
    for (var i = 0; i < rankedSearchResult.length; i++) {
        var searchRes = rankedSearchResult[i];
        var quranData = quranTextData[searchRes.id - 1];
        var obj = {
            surah: quranData.surah,
            name: quranData.name,
            ayat: quranData.ayat,
            text: quranData.text,
            trans: quranData.trans,
            score: searchRes.score,
            highlightPos: searchRes.highlightPos
        };
        result.push(obj);
    }
    return result;

}

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
            dataMuqathaat = parser.parseMuqathaat(buffer['muqathaat']);
            dataQuran = parser.parseQuran(buffer['quran_teks'], buffer['quran_trans_indonesian']);
            dataPosmap = {};
            dataPosmap['nv'] = parser.parsePosmap(buffer['posmap_nv']);
            dataPosmap['v'] = parser.parsePosmap(buffer['posmap_v']);

            dataIndex = {};
            dataIndex['nv'] = parser.parseIndex(buffer['index_nv']);
            dataIndex['v'] = parser.parseIndex(buffer['index_v']);

            allDataReady = true;
            console.log("ALL READY");
            
        });
    });

    mainWindow.on('closed', function () {
        mainWindow = null
    })
}

ipc.on('invokeSearch', function (event, query) {

    if (allDataReady) {
        var result = searcher.search(dataIndex.v, query, 0.90);
        var ranked = searcher.rank(result, dataPosmap.v, dataQuran);
        var final = prepareSearchResult(ranked, dataQuran);

        event.sender.send('searchDone', final);
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
