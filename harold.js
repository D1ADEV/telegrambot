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
    console.log(firstSplit);
}

var _order = function(arr, mode) {
    var tab = arr;
    if (mode == "smaller") {
        if (tab.indexOf("harold") > -1) {
            if (tab[0] === "harold") {
                var temp = tab[tab.length - 1];
                tab[tab.length - 1] = "harold";
                tab[0] = temp;
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
    getMessage: function(msg) {
        console.log("---------");
        if (msg.indexOf("<") !== -1 || msg.indexOf(">") !== -1) {
            var indexLower = msg.indexOf("<");
            var indexHigher = msg.indexOf(">");
            if (indexLower > -1) {
                console.log("---");
                var words = msg.toLowerCase().split("<");
                console.log(words);
                if (words[words.length - 1] !== "harold") {

                    words.splice(words.indexOf("harold") - 1, 1);
                    console.log(words);
                    words.push("harold");
                    console.log(words);
                    return words.join(" < ");
                } else {
                    return false;
                }
            }
            if (indexHigher > -1) {
                console.log("---");
                var otherWords = msg.toLowerCase().replace(" ", "").split(">");
                console.log(otherWords);
                if (otherWords[0] !== "harold") {
                    otherWords.splice(otherWords.indexOf("harold"), 1);
                    console.log(otherWords);
                    otherWords.unshift("harold");
                    console.log(otherWords);
                    return otherWords.join(" > ");
                } else {
                    return false;
                }
            }
        }
    },
    newGetMessage: function(str) {
        var parsed = _parse(str);
    }
}


exports.HAROLD = _harold;