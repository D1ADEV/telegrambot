var request = require('request');
var yaspeller = require('yaspeller');
var lev = require('levenshtein');


var _authorizedWords = [
    "kek",
    "memes",
    "meme",
    "pepe",
    "pepes",
    "tho"
];

var _check = function(original, cb) {
    var str = original;
    yaspeller.checkText(str, function(err, resp) {
        for (var i = 0; i < resp.length; i++) {
            if (resp[i].s[0] != undefined && _authorizedWords.indexOf(resp[i].word.toLowerCase()) == -1) {
                if (resp[i].s.length == 1) {
                    str = str.replace(resp[i].word, "<b>" + resp[i].s[0] + "</b>");
                } else {
                    if (resp[i].s != undefined) {
                        var closest = [resp[i].s[0], new lev(resp[i].word, resp[i].s[0])];
                        for (var y = 0; y < resp[i].s.length; y++) {
                            var nl = new lev(resp[i].word, resp[i].s[y]);
                            if (nl.distance < closest[1]) {
                                closest = [resp[i].s[y], nl.distance];
                            }
                        }
                        str = str.replace(resp[i].word, "<b>" + closest[0] + "</b>");
                    }
                }
            }

        }
        cb(str);

    }, {
        format: "plain",
        lang: "en",
    });
};

var _parseResponse = function(originalString, serverString, cb) {
    var serverResponse = JSON.parse(serverString);
    var toSend = originalString;
    if (serverResponse != null) {
        if (serverResponse.flaggedTokens != null) {
            if (serverResponse.flaggedTokens.length != 0) {
                for (var i = 0; i < serverResponse.flaggedTokens.length; i++) {
                    var token = serverResponse.flaggedTokens[i].token;
                    var suggestion = serverResponse.flaggedTokens[i].suggestions[0].suggestion;
                    toSend = toSend.replace(token, suggestion);
                }
                cb(toSend);
            }
        }
    }

}


var _spellChecker = {
    check: function(str, cb){
        _check(str, function(resp){
            cb(resp);
        });
    }
}

exports.SPELLCHECKER = _spellChecker;