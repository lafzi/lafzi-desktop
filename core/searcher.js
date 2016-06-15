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

/**
 * @param {Object.<string,Array.<{docID:Number,freq:Number,pos:Array.<Number>}>>} docIndex
 * @param {string} query
 * @param {number} threshold
 * @param {string} [mode='v']
 * @param {searchCb} callback
 */
module.exports.search = function (docIndex, query, threshold, mode, callback) {
    //  mode = v | nv
    if (mode === undefined) mode = 'v';
    var queryFinal;

    if (mode == 'v')
        queryFinal = phonetic.convert(query);
    else
        queryFinal = phonetic.convertNoVowel(query);

    var queryTrigrams = trigram.extract(queryFinal);
    if (Object.keys(queryTrigrams).length <= 0)
        callback([]);

    var matchedDocs = {};

    Object.keys(queryTrigrams).forEach(function (trigram) {
        var trigramFreq = queryTrigrams[trigram];

        if (docIndex[trigram] && Array.isArray(docIndex[trigram])) {
            var indexEntry = docIndex[trigram];
            for (var i = 0; i < indexEntry.length; i++) {
                var match = indexEntry[i];

                // hitung jumlah kemunculan dll
                if (matchedDocs[match.docID] !== undefined) {
                    matchedDocs[match.docID].matchCount += (trigramFreq < match.freq) ? trigramFreq : match.freq;
                } else {
                    matchedDocs[match.docID] = new LafziDocument();
                    matchedDocs[match.docID].matchCount = 1;
                    matchedDocs[match.docID].id = match.docID;
                }

                matchedDocs[match.docID].matchTerms[trigram] = match.pos;

            }
        }
    });

    var filteredDocs = [];
    var minScore = threshold * Object.keys(queryTrigrams).length;

    var matches = Object.keys(matchedDocs);
    for (var i = 0; i < matches.length; i++) {
        var docID = matches[i];
        var doc = matchedDocs[docID];

        var lcs = array.LCS(array.flattenValues(doc.matchTerms));
        var orderScore = lcs.length;

        doc.LCS = lcs;
        doc.contigScore = array.contiguityScore(lcs);
        doc.score = orderScore * doc.contigScore;

        if (doc.score >= minScore) {
            filteredDocs.push(doc);
        }
    }

    callback(filteredDocs);

};
/**
 * @callback searchCb
 * @param {Array.<LafziDocument>} res
 */

Array.prototype.unique = function(){
    var u = {}, a = [];
    for(var i = 0, l = this.length; i < l; ++i){
        if(u.hasOwnProperty(this[i])) {
            continue;
        }
        a.push(this[i]);
        u[this[i]] = 1;
    }
    return a;
};

/**
 * @param {Array.<LafziDocument>} filteredDocs
 * @param {Array.<Array>} posmapData
 * @param {Array.<{surah:Number,name:string,ayat:Number,text:string,trans:string}>} quranTextData
 * @param {rankCb} callback
 */
module.exports.rank = function (filteredDocs, posmapData, quranTextData, callback) {

    for (var i = 0; i < filteredDocs.length; i++) {
        var doc = filteredDocs[i];

        var realPos = [];
        var posmap = posmapData[doc.id - 1];
        var seq = [];

        for (var j = 0; j < doc.LCS.length; j++) {
            var pos = doc.LCS[j];
            seq.push(pos);
            seq.push(pos + 1);
            seq.push(pos + 2);
        }
        seq = seq.unique();

        for (var k = 0; k < seq.length; k++) {
            pos = seq[k];
            realPos.push(posmap[pos - 1]);
        }

        doc.highlightPos = array.highlightSpan(realPos, 6);

        // additional scoring based on space
        if (quranTextData !== undefined) {
            var endPos = doc.highlightPos[doc.highlightPos.length - 1][1];
            var docText = quranTextData[doc.id - 1].text;
            if (docText[endPos + 1] == ' ') doc.score += 0.01;
            if (docText[endPos + 2] == ' ') doc.score += 0.01;
            if (docText[endPos + 3] == ' ') doc.score += 0.01;
        }

        delete doc.LCS;
        delete doc.matchTerms;
        delete doc.contigScore;
    }

    filteredDocs.sort(function (docA, docB) {
        return docB.score - docA.score;
    });

    callback(filteredDocs);

};
/**
 * @callback rankCb
 * @param {Array.<LafziDocument>} res
 */

/**
 * Prepare search result for view
 * @param {Array.<{id:number,matchCount:number,score:number,highlightPos:Array.<number>}>}  rankedSearchResult
 * @param {Array.<{surah:Number,name:string,ayat:Number,text:string,trans:string}>}         quranTextData
 * @param {prepareCb} callback
 */
module.exports.prepare = function (rankedSearchResult, quranTextData, callback) {

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

    callback(result);

};
/**
 * @callback prepareCb
 * @param {Array.<{surah:Number,name:string,ayat:Number,text:string,trans:string,score:number,highlightPos:Array.<number>}>} res
 */