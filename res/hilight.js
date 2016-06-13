String.prototype.splice = function( idx, rem, s ) {
    return (this.slice(0,idx) + s + this.slice(idx + Math.abs(rem)));
};

function hilightTo(elementId, posArray) {
    var text = document.getElementById(elementId).innerHTML;
    var startPos, endPos;
    var zwj = "&#x200d;";

    for (var i = posArray.length-1; i >= 0; i--) {
        startPos = posArray[i][0];
        endPos   = posArray[i][1]+1;
        text     = text.splice(endPos, 0, "</span>"); 
        text     = text.splice(startPos, 0, "<span class='hl_block'>"); 
    }
    
    document.getElementById(elementId).innerHTML = text;
}
