"use strict";

var _parse = function(str) {
    var firstSplit = str.replace(" ", "");
    while (firstSplit.indexOf(" ") > -1) {
        firstSplit = firstSplit.replace(" ", "");
    }
    firstSplit = firstSplit.split("<");
    for (var i = 0; i < firstSplit.length; i++) {
        if (firstSplit[i].indexOf(">") > -1) {
            firstSplit[i] = _order(firstSplit[i].split(">"), "higher");
        }
    }
    firstSplit = [].concat.apply([], firstSplit);
    firstSplit = _order(firstSplit, "smaller");
    return firstSplit;
}

var _order = function(arr, mode) {
    var tab = arr;
    if (mode == "smaller") {
        if (tab.indexOf("harold") > -1) {
            var idx = tab.indexOf("harold");
            if (tab[tab.length - 1] !== "harold") {
                var temp = tab[tab.length - 1];
                tab[tab.length - 1] = "harold";
                tab[idx] = temp;
            }
            return tab.join("<");
        }
    } else {
        if (tab.indexOf("harold") > -1) {
            if (tab[0] !== "harold") {
                var index = tab.indexOf("harold");
                tab[index] = tab[0];
                tab[0] = "harold";
            }
        } else {
            tab = tab.reverse();
        }
        return tab;
    }
}


var _harold = {
    getMessage: function(str) {
        return _parse(str);
    }
}


exports.HAROLD = _harold;