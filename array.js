/**
 * @param {Array.<number>} arr
 * @returns {number}
 */
function contiguityScore(arr) {

    var diff = [];
    var len = arr.length;

    if (len == 1) return 1;

    for (var i = 0; i < len - 1; i++) {
        diff.push(1 / (arr[i+1] - arr[i]));
    }

    var sum = diff.reduce(function(a, b) {return a+b}, 0);
    return sum / (len - 1);

}

/**
 * Longest Contiguous Subsequence
 * @param {Array.<number>} seq
 * @param {number} [maxgap=7]
 * @returns {Array.<number>}
 */
function LCS(seq, maxgap) {
    if (maxgap === undefined) maxgap = 7;

    seq.sort(function (a, b) {return a-b;});
    var size = seq.length;
    var start = 0, length = 0, maxstart = 0, maxlength = 0;

    for (var i = 0; i < size - 1; i++) {
        if ((seq[i+1] - seq[i]) > maxgap) {
            length = 0;
            start = i+1;
        } else {
            length++;
            if (length > maxlength) {
                maxlength = length;
                maxstart = start;
            }
        }
    }

    maxlength++;

    return seq.slice(maxstart, maxstart + maxlength);

}

/**
 * @param {Object.<string,Array.<number>>} obj
 * @returns {Array.<number>}
 */
function flattenValues(obj) {
    var result = [];
    var keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        result = result.concat(obj[key]);
    }
    return result;
}

/**
 * @param {Array.<number>} hlSequence
 * @param {number} [minLength=3]
 * @returns {Array.<Array.<number>>}
 */
function highlightSpan(hlSequence, minLength) {
    if (minLength === undefined) minLength = 3;

    var len = hlSequence.length;
    if (len == 1)
        return [[hlSequence[0], hlSequence[0] + minLength]];

    hlSequence.sort(function (a, b) {return a-b;});

    var result = [];
    var j = 1;

    for (var i = 0; i < len; i++) {
        while (hlSequence[j] !== undefined && hlSequence[j] - hlSequence[j-1] <= minLength + 1 && j < len) {
            j++;
        }
        result.push([hlSequence[i], hlSequence[j-1]]);
        i = j - 1;
        j++;
    }

    return result;
}

module.exports.flattenValues = flattenValues;
module.exports.contiguityScore = contiguityScore;
module.exports.LCS = LCS;
module.exports.highlightSpan = highlightSpan;