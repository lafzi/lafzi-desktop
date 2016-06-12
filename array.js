
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

// Longest Contiguous Subsequence
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

function flattenValues(obj) {
    var result = [];
    Object.keys(obj).forEach(function (key) {
        result = result.concat(obj[key]);
    });
    return result;
}

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

// console.log(contiguityScore([1,3,4,5,6,18]));
// console.log(LCS([7,33,209,218,233,8,210,202,311,212,213,291,1,214,292,2,158,190,215,265,275,216,217]));
// console.log(flattenValues({
//     'abc': [1,5,7,9],
//     'def': [8,9,1,1, 2]
// }));
// console.log(highlightSpan([0, 0, 1, 3, 4, 5, 6, 7, 20, 22, 24], 3));

module.exports.flattenValues = flattenValues;
module.exports.contiguityScore = contiguityScore;
module.exports.LCS = LCS;
module.exports.highlightSpan = highlightSpan;