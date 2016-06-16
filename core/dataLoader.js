var fs = require('fs');

/**
 * @param {BrowserWindow} rendererWindow
 * @param {doneCallback} callback
 */
function loadResources(rendererWindow, callback) {

    var files = [
        'index_nv.jsn',
        'index_v.jsn',
        'muqathaat.txt',
        'posmap_nv.txt',
        'posmap_v.txt',
        'quran_teks.txt',
        'quran_trans_indonesian.txt'
    ];

    var totalSize = 0;
    var dataRoot = (process.platform === 'darwin') ? (__dirname + '/../data/') : ('../data/');

    files.forEach(function (f) {
        totalSize += fs.statSync(dataRoot + f).size;
    });

    var loaded = 0;
    var buffer = {};

    files.forEach(function (f) {

        var name = f.slice(0, -4);
        buffer[name] = '';

        var readable = fs.createReadStream(dataRoot + f);
        readable.on('data', function (chunk) {
            loaded += chunk.length;
            var percent = loaded / totalSize * 100;

            //console.log('Loading ', percent.toFixed(2));
            rendererWindow.webContents.send('loadProgress', percent);

            buffer[name] += chunk;

            if (loaded >= totalSize) {
                callback(buffer);
            }
        });

    });

}

/**
 * @callback doneCallback
 * @param {Object.<string,string>} buffer
 */
module.exports.loadResources = loadResources;


