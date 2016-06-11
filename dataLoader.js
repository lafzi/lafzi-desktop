var fs = require('fs');

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

files.forEach(function(f) {
    totalSize += fs.statSync('data/' + f).size;
});

var loaded = 0;
var buffer = {};

files.forEach(function(f) {

    buffer[f] = '';

    var readable = fs.createReadStream('data/' + f);
    readable.on('data', function(chunk) {
        loaded += chunk.length;
        var percent = loaded / totalSize * 100;
        console.log('Loading ', percent.toFixed(2));

        buffer[f] += chunk;

        if (loaded >= totalSize) {
            console.log("ALL LOADED");
        }
    });

    // readable.on('end', function() {
    //     console.log(buffer[f].length);
    // });

});


