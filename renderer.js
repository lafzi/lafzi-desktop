// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

var ipc = require('electron').ipcRenderer;

ipc.on('loadProgress', function(e, percent) {
    $('#progress').width(percent.toFixed(2) + '%');
});

ipc.on('loadDone', function(e, isDone) {
    if (isDone) {
        $('#search-form').show();
        $('#progress-container').fadeOut();
    }
});

var $searchBtn = $('#search-submit');
var $searchInput = $('#search-box');
var $searchResult = $('#searchResult');
var $introHelp = $('#intro-help');
var $overlay = $('#body-overlay');

$searchInput.on('keyup', function (event) {
    if (event.keyCode == 13) {
        $searchBtn.click();
    }
});

$searchBtn.on('click', function () {
    $introHelp.fadeOut();
    $overlay.show();
    ipc.send('invokeSearch', $searchInput.val());
    ipc.once('searchDone', function (event, result) {
        $overlay.fadeOut();
        $searchResult.empty();
        renderResult(result);
    });
});

/**
 * @param {Array.<{surah:Number,name:string,ayat:Number,text:string,trans:string,score:number,highlightPos:Array.<number>}>} result
 */
function renderResult(result) {

    $('#srp-header').find('h3').html("Hasil Pencarian (" + result.length + " hasil)");

    for (var i = 0; i < result.length; i++) {
        var res = result[i];
        var $template = $('#srb-template').clone();
        $template.attr('id', 'srb-block-' + i);
        $template.css('display', 'block');
        if (i%2) $template.addClass('alt');

        $template.find('.sura-name .num').html(i + 1);
        $template.find('.sura-name .aya_name').html(res.name + " (" + res.surah + "): " + res.ayat);

        var $ayatTextContainer = $template.find('.aya_container .aya_text');
        var hilighted = hilight(res.text, res.highlightPos);
        $ayatTextContainer.html(hilighted);

        $template.find('.aya_container .aya_trans').html(res.trans);

        $searchResult.append($template);
    }

}

function hilight(text, posArray) {
    var startPos, endPos;
    var zwj = "&#x200d;";

    for (var i = posArray.length-1; i >= 0; i--) {
        startPos = posArray[i][0];
        endPos   = posArray[i][1]+1;
        text     = text.splice(endPos, 0, "</span>");
        text     = text.splice(startPos, 0, "<span class='hl_block'>");
    }

    return text;
}

String.prototype.splice = function( idx, rem, s ) {
    return (this.slice(0,idx) + s + this.slice(idx + Math.abs(rem)));
};