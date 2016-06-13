// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

var ipc = require('electron').ipcRenderer;

ipc.on('loadProgress', function(e, percent) {
    document.getElementById('progress').style.width = percent.toFixed(2) + '%';
});

var searchBtn = document.getElementById('searchBtn');
var searchInput = document.getElementById('searchInput');
var searchResult = document.getElementById('searchResult');

searchBtn.addEventListener('click', function () {
    ipc.send('invokeSearch', searchInput.value);
    ipc.once('searchDone', function (event, result) {
        searchResult.innerHTML = JSON.stringify(result, null, 2);
    });
});