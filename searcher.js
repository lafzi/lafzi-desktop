var trigram = require('./trigram');
var array = require('./array');
var phonetic = require('./phonetic');

var LafziDocument = function() {

    this.id = 0;
    this.matchCount = 0;
    this.contigScore = 0;
    this.score = 0;
    this.matchTerms = {};
    this.LCS = [];
    this.highlightPos = [];

};

module.exports.search = function (docIndex, query, threshold, mode) {
    //  mode = v | nv
    if (mode === undefined) mode = 'v';
    var queryFinal;

    if (mode == 'v')
        queryFinal = phonetic.convert(query);
    else
        queryFinal = phonetic.convertNoVowel(query);

    var queryTrigrams = trigram.extract(queryFinal);
    if (Object.keys(queryTrigrams).length <= 0)
        return {};

    var matchedDocs = {};

    Object.keys(queryTrigrams).forEach(function (trigram) {
        var trigramFreq = queryTrigrams[trigram];

        if (docIndex[trigram] && Array.isArray(docIndex[trigram])) {
            docIndex[trigram].forEach(function (match) {

                // hitung jumlah kemunculan dll
                if (matchedDocs[match.docID] !== undefined) {
                    matchedDocs[match.docID].matchCount += (trigramFreq < match.freq) ? trigramFreq : match.freq;
                } else {
                    matchedDocs[match.docID] = new LafziDocument();
                    matchedDocs[match.docID].matchCount = 1;
                    matchedDocs[match.docID].id = match.docID;
                }

                matchedDocs[match.docID].matchTerms[trigram] = match.pos;

            })
        }
    });

    var filteredDocs = {};
    var minScore = threshold * Object.keys(queryTrigrams).length;
    console.log(minScore);
    Object.keys(matchedDocs).forEach(function (docID) {
        var doc = matchedDocs[docID];

        var lcs = array.LCS(array.flattenValues(doc.matchTerms));
        var orderScore = lcs.length * 1.0;

        doc.LCS = lcs;
        doc.contigScore = array.contiguityScore(lcs);
        doc.score = orderScore * doc.contigScore;

        if (doc.score >= minScore) {
            filteredDocs[docID] = doc;
        }
    });

    return filteredDocs;

};

