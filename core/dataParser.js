
/**
 * Parse Lafzi text data to some defined structures
 * @param {string} buffer
 * @returns {Object.<Number,Object.<Number,string>>}
 */
module.exports.parseMuqathaat = function (buffer) {
    // Result:
    // Array[noSurat][noAyat] = text

    var lines = buffer.split('\n');
    var result = {};
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];

        var data = line.split('|');
        var noSurat = data[0];
        var noAyat = data[2];
        var text = data[3];
        if(!result[noSurat])
            result[noSurat] = {};

        result[noSurat][noAyat] = text;
    }

    return result;
};

/**
 * @param {string} bufferText
 * @param {string} bufferTrans
 * @returns {Array.<{surah:Number,name:string,ayat:Number,text:string,trans:string}>}
 */
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

/**
 * convert comma-delimited string to int array
 * @param {string} str
 * @returns {Array.<Number>}
 */
function strToIntArray(str) {
    var arr = str.split(',');
    return arr.map(function (val) {return Number(val)});
}

/**
 * @param {string} buffer
 * @returns {Array.<Array>}
 */
module.exports.parsePosmap = function (buffer) {

    var lines = buffer.split('\n');
    var result = [];

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        result.push(strToIntArray(line));
    }

    return result;

};

/**
 * @param {string} buffer
 * @returns {Object.<string,Array.<{docID:Number,freq:Number,pos:Array.<Number>}>>}
 */
module.exports.parseIndex = function (buffer) {

    return JSON.parse(buffer);

};

