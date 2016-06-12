var fs = require('fs');

function loadResources(rendererWindow, callback) {

    var files = [
        'index_nv.txt',
        'index_v.txt',
        'muqathaat.txt',
        'posmap_nv.txt',
        'posmap_v.txt',
        'quran_teks.txt',
        'quran_trans_indonesian.txt'
    ];

    var totalSize = 0;

    files.forEach(function (f) {
        totalSize += fs.statSync('data/' + f).size;
    });

    var loaded = 0;
    var buffer = {};

    files.forEach(function (f) {

        var name = f.slice(0, -4);
        buffer[name] = '';

        var readable = fs.createReadStream('data/' + f);
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

module.exports.loadResources = loadResources;


