// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

var ipc = require('electron').ipcRenderer;
var clipboard = require('electron').clipboard;
var shell = require('electron').shell;
var remote = require('electron').remote;
var appConfig = remote.getGlobal('appConfig');

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
var $bodyMessage = $('#body-message');
var $overlay = $('#body-overlay');

ipc.on('askToReloadSearch', function (event) {
    $searchBtn.click();
});

$searchInput.on('keyup', function (event) {
    if (event.keyCode == 13) {
        $searchBtn.click();
    }
});

$searchBtn.on('click', function () {
    if ($searchInput.val() == '') return;

    $bodyMessage.fadeOut();
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

    if (result.length == 0) {
        $bodyMessage.html("<p>Tidak ditemukan hasil pencarian.</p>");
        $bodyMessage.fadeIn();
        return;
    }

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

        if(appConfig.get('showTrans'))
            $template.find('.aya_container .aya_trans').html(res.trans);

        let textContent = res.name + " (" + res.surah + "): " + res.ayat + "\n\n";
        textContent += res.text + "\n\n";
        textContent += res.trans;

        $template.find('.aya_tools .btn_copy').on('click', function () {
            clipboard.writeText(textContent);
        });

        let quranURL = "http://quran.ksu.edu.sa/index.php?l=id#aya=" + res.surah + "_" + res.ayat + "&m=hafs&qaree=husary&trans=id_indonesian";

        $template.find('.aya_tools .btn_open').on('click', function () {
            shell.openExternal(quranURL);
        });

        $searchResult.append($template);
    }

}

function hilight(text, posArray) {
    var startPos, endPos;

    // workaround for chromium arabic bug (not completed yet)
    var zwj = "&#x200d;";

    for (var i = posArray.length-1; i >= 0; i--) {
        startPos = posArray[i][0];
        endPos   = posArray[i][1]+1;

        var spanStart = "<span class='hl_block'>";
        //if (text[startPos+1] != ' ') spanStart = zwj + spanStart;
        //if (text[startPos-1] != ' ') spanStart = spanStart + zwj;

        var spanEnd = "</span>";
        //if (text[endPos+1] != ' ') spanEnd = zwj + spanEnd;
        //if (text[endPos-1] != ' ') spanEnd = spanEnd + zwj;

        text     = text.splice(endPos, 0, spanEnd);
        text     = text.splice(startPos, 0, spanStart);
    }

    return text;
}

String.prototype.splice = function( idx, rem, s ) {
    return (this.slice(0,idx) + s + this.slice(idx + Math.abs(rem)));
};

$('.enter_sample').each(function () {
    var $this = $(this);
    $this.on('click', function () {
        var text = $(this).closest('li').text();
        $searchInput.val(text.replace('↖', '').trim());
    });
});

// ========= MENU ====================================================

var Menu = remote.Menu;

var template = [
    {
        label: 'Program',
        submenu: [
            {
                label: 'Pengaturan',
                click() {
                    ipc.send('invokeSettingsShow', true);
                }
            },
            {
                label: 'Keluar',
                click() {
                    ipc.send('invokeAppQuit', true);
                }
            }
        ]
    },
    {
        label: 'Bantuan',
        role: 'help',
        submenu: [
            {
                label: 'Pertanyaan?',
                click() {
                    ipc.send('invokeFaqShow', true);
                }
            },
            {
                label: 'Tentang Aplikasi',
                click() {
                    ipc.send('invokeAboutShow', true);
                }
            }
        ]
    }
];

if (process.platform === 'darwin') {
    const name = remote.app.getName();
    template = [{
        label: name,
        submenu: [
            {
                label: 'Tentang ' + name,
                click() {
                    ipc.send('invokeAboutShow', true);
                }
            },
            {
                type: 'separator'
            },
            {
                label: 'Pengaturan...',
                accelerator: 'Command+,',
                click() {
                    ipc.send('invokeSettingsShow', true);
                }
            },
            {
                type: 'separator'
            },
            {
                label: 'Hide ' + name,
                accelerator: 'Command+H',
                role: 'hide'
            },
            {
                label: 'Hide Others',
                accelerator: 'Command+Alt+H',
                role: 'hideothers'
            },
            {
                label: 'Show All',
                role: 'unhide'
            },
            {
                type: 'separator'
            },
            {
                label: 'Keluar',
                accelerator: 'Command+Q',
                click() {
                    ipc.send('invokeAppQuit', true);
                }
            }
        ]
    },
    {
        label: 'Window',
        role: 'window',
        submenu: [
            {
                label: 'Minimize',
                accelerator: 'CmdOrCtrl+M',
                role: 'minimize'
            },
            {
                label: 'Zoom',
                role: 'zoom'
            },
            {
                type: 'separator'
            },
            {
                label: 'Bring All to Front',
                role: 'front'
            }
        ]
    },
    {
        label: 'Help',
        role: 'help',
        submenu: [
            {
                label: 'Ada Pertanyaan?',
                click() {
                    ipc.send('invokeFaqShow', true);
                }
            },
            {
                type: 'separator'
            },
            {
                label: 'Kunjungi Website',
                click() {
                    shell.openExternal('http://apps.cs.ipb.ac.id/lafzi');
                }
            }
        ]
    }];
}

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);




