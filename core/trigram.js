/**
 * Extract trigrams from string
 * @param {string} string
 * @returns {Array.<string>}
 */
function trigram(string) {

    string = string.trim();
    var length = string.length;

    if (length < 3) return [];
    if (length == 3) return [string];

    var trigrams = [];
    for (var i = 0; i <= length - 3; i++) {
        trigrams.push(string.substring(i, i+3));
    }

    return trigrams;

}

/**
 * Extract trigrams with frequencies
 * @param {string} string
 * @returns {Object.<string,number>}
 */
function extract(string) {

    var trig = trigram(string);
    return trig.reduce(function (acc, e) {
        acc[e] = (e in acc ? acc[e] + 1 : 1);
        return acc;
    }, {});

}

module.exports.extract = extract;

