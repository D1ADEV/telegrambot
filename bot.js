var tgapi = require("telegram-node-bot");
var spelling = require('./spellchecking.js').SPELLCHECKER;
var talker = require('./talking.js').TALKER;

var _bot = {
    start: function(token) {
        var tg = tgapi(token);
        console.log('Starting...');

        tg.router
            .when('/talkdirtytome', 'TalkController')
            .otherwise('SpellingController');

        tg.controller('TalkController', ($) => {
            console.log("Talking dirty");
            $.sendMessage(talker.getMessage());
        });

        tg.controller('SpellingController', ($) => {
            if ($.message.text.split(" ").length >= 3) {
                spelling.check($.message.text, function(resp) {
                    if (resp.toLowerCase() != $.message.text.toLowerCase()) {
                        console.log("Correcting an asshole");
                        $.sendMessage(
                            "@" +
                            $.message.from.username +
                            " Did you mean : " +
                            resp +
                            " ?", {
                                parse_mode: "html"
                            });
                        $.waitForRequest(($) => {
                            if ($.message.text.toLowerCase().indexOf("yes") > -1) {
                                $.sendMessage("Pleasure's all mine");
                            } else if ($.message.text.toLowerCase().indexOf("no") > -1) {
                                $.sendMessage("Well fuck you, asshole");
                            }
                        });
                        setTimeout(function() {
                            /* 
                                If tg.waitingCallbacks isn't cleaned, the next message of the 
                                user will not be spell checked. Cleaning it after 5 secs seems to be ok. 
                            */
                            console.log('Cleaning waiting callbacks');
                            tg.waitingCallbacks = {};
                        }, 5000);
                    }
                });
            }
        });
    }
};

exports.BOT = _bot;