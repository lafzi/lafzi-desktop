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
        // $searchResult.html(JSON.stringify(result, null, 2));
        renderResult(result);
    });
});

/**
 * @param {Array.<{surah:Number,name:string,ayat:Number,text:string,trans:string,score:number,highlightPos:Array.<number>}>} result
 */
function renderResult(result) {

    $('#srp-header h3').html("Hasil Pencarian (" + (result.length + 1) + " hasil)");

    for (var i = 0; i < result.length; i++) {
        var res = result[i];
        var $template = $('#srb-template').clone();
        $template.attr('id', 'srb-block-' + i);
        $template.css('display', 'block');
        if (i%2) $template.addClass('alt');
        $template.find('.sura-name .num').first().html(i + 1);

        $searchResult.append($template);
    }

}