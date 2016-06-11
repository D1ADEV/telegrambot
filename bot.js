var token = "237858530:AAGoydp1DXx1m-DrYtSYQte5X4n3vx7Ww2g";
var tg = require("telegram-node-bot")(token);
var request = require('request');
var querystring = require('querystring');
var yaspeller = require('yaspeller');
var lev = require('levenshtein');


var authorizedWords = [
    "kek",
    "memes",
    "meme",
    "pepe",
    "pepes"
];

var _newCheck = function(original, cb) {
    var str = original;
    yaspeller.checkText(str, function(err, resp) {
        console.log(resp);
        for (var i = 0; i < resp.length; i++) {
            if (resp[i].s[0] != undefined && authorizedWords.indexOf(resp[i].word.toLowerCase()) == -1) {
                if (resp[i].s.length == 1) {
                    str = str.replace(resp[i].word, resp[i].s[0]);
                } else {
                    if (resp[i].s != undefined) {
                        var closest = [resp[i].s[0], new lev(resp[i].word, resp[i].s[0])];
                        for (var y = 0; y < resp[i].s.length; y++) {
                            var nl = new lev(resp[i].word, resp[i].s[y]);
                            if (nl.distance < closest[1]) {
                                closest = [resp[i].s[y], nl.distance];
                            }
                        }
                        str = str.replace(resp[i].word, closest[0]);
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

var _checkSpelling = function(str, cb) {
    var res = 'https://bingapis.azure-api.net/api/v5/spellcheck?mode=spell';
    var data = {
        Text: str
    };
    var formData = querystring.stringify(data);
    var reqHeaders = {
        'Ocp-Apim-Subscription-Key': bingkey,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': formData.length
    };
    request(res, {
        method: "POST",
        headers: reqHeaders,
        form: formData,
    }, function(err, res, body) {
        cb(body);
    })
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

var _bot = {
    start: function() {
        console.log('Starting...');

        tg.router
            .when([''], 'SpellController')

        tg.controller('SpellController', ($) => {
            if ($.message.text.split(" ").length >= 3) {
                _newCheck($.message.text, function(resp) {
                    console.log("Correcting an asshole");
                    if (resp.toLowerCase() != $.message.text.toLowerCase()) {
                        $.sendMessage("@" + $.message.from.username + " Did you mean : " + resp + " ?");
                    }

                });
            }

            /*
            _checkSpelling($.message.text, function(resp) {
                _parseResponse($.message.text, resp, function(r) {
                    console.log("Correcting an asshole");
                    $.sendMessage("@" + $.message.from.username + " Did you mean : " + r + " ?");
                })
            });
            */
        })
    }
}

exports.BOT = _bot;