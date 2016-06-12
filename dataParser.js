
/*
 * Parse Lafzi text data to some defined structures
 */

module.exports.parseMuqathaat = function (buffer) {
    // Result:
    // Array[noSurat][noAyat] = text

    var lines = buffer.split('\n');
    var result = {};
    lines.forEach(function(line) {
        var data = line.split('|');
        var noSurat = data[0];
        var noAyat = data[2];
        var text = data[3];
        if(!result[noSurat])
            result[noSurat] = {};

        result[noSurat][noAyat] = text;
    });

    return result;
};

module.exports.parseQuran = function(bufferText, bufferTrans) {

    var lineText = bufferText.split('\n');
    var lineTrans = bufferTrans.split('\n');
    var result = [];

    for (var i = 0; i < lineText.length; i++) {
        var dataText = lineText[i].split('|');
        var dataTrans = lineTrans[i].split('|');
        var obj = {
            surah: Number(dataText[0]),
            name: dataText[1],
            ayat: Number(dataText[2]),
            text: dataText[3],
            trans: dataTrans[2]
        };
        result.push(obj);
    }

    return result;
};

function strToIntArray(str) {
    // convert comma-delimited string to int array
    var arr = str.split(',');
    return arr.map(function (val) {return Number(val)});
}

module.exports.parsePosmap = function (buffer) {

    var lines = buffer.split('\n');
    var result = [];

    lines.forEach(function (line) {
        result.push(strToIntArray(line));
    });

    return result;

};

module.exports.parseIndex = function (buffer) {

    var lines = buffer.split('\n');
    var result = {};

    lines.forEach(function (line) {
        var d = line.split('\x09');
        var term = d[0];
        var posts = d[1];
        result[term] = [];
        if (posts) {
            posts.split(';').forEach(function (post) {
                var postData = post.split(':');
                var obj = {
                    doc: Number(postData[0]),
                    freq: Number(postData[1]),
                    pos: strToIntArray(postData[2])
                };
                result[term].push(obj);
            });
        }
    });

    return result;

};






















