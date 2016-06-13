"use strict";
var tgapi = require("telegram-node-bot");
var fd = require("node-football-data");
var spelling = require('./spellchecking.js').SPELLCHECKER;
var talker = require('./talking.js').TALKER;
var foss = require('./foss.js').FOSS;
var database = require('./database.js').DATABASE;
var harold = require('./harold.js').HAROLD;
var football = require('./football.js').FOOTBALL;
process.on('uncaughtException', function(err) {
    console.log("UNCAUGHT OMG WE ALL GONNA DIE");
    console.error(err);
});

var isSaving = false;

var _displayMessage = function(message) {
    var msg = "";
    if (!message.text.startsWith("/")) {
        msg += "MSG | ";
    } else {
        msg += "CMD | ";
    }
    msg += message.from.id;
    msg += " | ";
    msg += message.from.username;
    msg += " | ";
    msg += message.text;
    console.log(msg);

}

var on_request = function(message, debug) {
    _displayMessage(message);
    if (!isSaving) {
        isSaving = true;
        setTimeout(function() {
            console.log("saving");
            database.saveToFile();
            isSaving = false;
        }, 60000);
    }
    database.addUser(message.from.id, message.from.username);
    if (debug != undefined) {
        if (debug === true) {
            if (message.from.id == "50795873") {
                return true;
            } else {
                return false;
            }
        }
    }
    return database.isEnemy(message.from.id)
}

var _bot = {
    start: function(token, ftoken) {
        var tg = tgapi(token);
        var fb = fd(ftoken);
        console.log('Starting...');
        database.reloadFromFile();
        database.printStatus();
        console.log('Started');

        tg.router
            .when(['tbh fam', 'tbhfam'], 'DesuController')
            .when('/talkdirtytome', 'TalkController')
            .when('/foss', 'FossController')
            .when('/enemy :str', 'EnemyController')
            .when('/save', 'SaveController')
            .when('/reload', 'ReloadController')
            .when('/stats', 'StatsController')
            .when('/authorize :str', 'AuthController')
            .when(['harold'], 'HaroldController')
            .when(['/foot :option',
                '/foot',
                '/foot :option :opt',
                '/foot@isthisavailablebot :option',
                '/foot@isthisavailablebot :option :opt'
            ], 'FootController');
        //.otherwise('SpellingController');

        tg.inlineMode(($) => {
            console.log("INLINE");
            console.log($);
            if($.query === "foot"){
                console.log("fooooot");
                tg.answerInlineQuery($.id, [{
                    message_text: "dejidei"
                }]);
            }
        });

        tg.controller('HaroldController', ($) => {
            if (!on_request($.message)) {
                var message = harold.getMessage($.message.text);
                if (message !== false && message !== undefined) {
                    $.sendMessage(message + "\nFTFY", {
                        reply_to_message_id: $.message.message_id,
                    });
                }
            }
        });

        tg.controller('FootController', ($) => {
            on_request($.message);
            tg.for('/foot :option', ($) => {
                fb.getLeagugeFixtures(424).then(function(res) {
                    $.sendMessage(football.getMessage(res, $.query.option), {
                        parse_mode: "html"
                    });
                }).catch(function(err) {
                    console.log(err);
                });
            });
            tg.for('/foot :option :opt', ($) => {
                on_request($.message);
                fb.getLeagugeFixtures(424).then(function(res) {
                    $.sendMessage(football.getMessage(res, $.query.option, $.query.opt), {
                        parse_mode: "html"
                    });
                });
            });
            tg.for('/foot@isthisavailablebot :option', ($) => {
                on_request($.message);
                fb.getLeagugeFixtures(424).then(function(res) {
                    $.sendMessage(football.getMessage(res, $.query.option), {
                        parse_mode: "html"
                    });
                }).catch(function(err) {
                    console.log(err);
                });
            });
            tg.for('/foot@isthisavailablebot :option :opt', ($) => {
                on_request($.message);
                fb.getLeagugeFixtures(424).then(function(res) {
                    $.sendMessage(football.getMessage(res, $.query.option, $.query.opt), {
                        parse_mode: "html"
                    });
                });
            });
            tg.for('/foot', ($) => {
                on_request($.message);
                var toReturn = "";
                toReturn += "/foot all - All played matches\n";
                toReturn += "/foot country <Country> - All matches <Country> played / will play."
                toReturn += "/foot upcoming <number> - All matches that will be played in <number> days\n";
                $.sendMessage(toReturn);
            });
        });

        tg.controller('AuthController', ($) => {
            on_request($.message);
            tg.for("/authorize :str", ($) => {
                var resp = database.addWord($.query.str);
                if (resp == true) {
                    $.sendMessage($.query.str + " added to the list of authorized words", {
                        reply_to_message_id: $.message.message_id
                    });
                } else {
                    $.sendMessage("Couldn't add " + $.query.str + " (Aready in the list / not valid)", {
                        reply_to_message_id: $.message.message_id
                    });
                }


            });
        });

        tg.controller('DesuController', ($) => {
            if (!on_request($.message)) {
                console.log("Desu");
                $.sendMessage("desu senpai", {
                    reply_to_message_id: $.message.message_id
                });
            }
        });

        tg.controller('StatsController', ($) => {
            if (on_request($.message, true)) {
                $.sendMessage(database.getStats(), {
                    reply_to_message_id: $.message.message_id
                });
            } else {
                $.sendMessage("Only Harold is allowed to do that", {
                    reply_to_message_id: $.message.message_id
                });
            }
        });

        tg.controller('SaveController', ($) => {
            if (on_request($.message, true)) {
                database.saveToFile();
            } else {
                $.sendMessage("Only Harold is allowed to do that", {
                    reply_to_message_id: $.message.message_id
                });
            }

        });

        tg.controller('ReloadController', ($) => {
            if (on_request($.message, true)) {
                database.reloadFromFile();
            } else {
                $.sendMessage("Only Harold is allowed to do that", {
                    reply_to_message_id: $.message.message_id
                });
            }
        });

        tg.controller('EnemyController', ($) => {
            on_request($.message);
            tg.for("/enemy :str", ($) => {
                if ($.query.str == "add") {
                    $.sendMessage(database.addEnemy($.message.from.id), {
                        reply_to_message_id: $.message.message_id
                    });
                } else if ($.query.str == "remove") {
                    $.sendMessage(database.removeEnemy($.message.from.id), {
                        reply_to_message_id: $.message.message_id
                    });
                } else {
                    $.sendMessage("lean2read", {
                        reply_to_message_id: $.message.message_id
                    });
                }
            })

        })

        tg.controller('TalkController', ($) => {
            on_request($.message);
            console.log("Talking dirty");
            on_request($.message);
            $.sendMessage(talker.getMessage(), {
                reply_to_message_id: $.message.message_id
            });

        });

        tg.controller('FossController', ($) => {
            on_request($.message);
            console.log("Foss");
            $.sendMessage(foss.getMessage(), {
                parse_mode: "html",
                reply_to_message_id: $.message.message_id
            });
        });

        tg.controller('SpellingController', ($) => {
            if (!on_request($.message)) {
                if ($.message.text != undefined) {
                    if ($.message.text.split(" ").length >= 3) {
                        spelling.check($.message.text, database.getAuthorizedWords(), function(resp) {
                            if (resp.toLowerCase() !== $.message.text.toLowerCase()) {
                                database.addTypo($.message.from.id);
                                console.log("Correcting an asshole");
                                $.sendMessage(
                                    " Did you mean : " +
                                    resp +
                                    " ?", {
                                        parse_mode: "html",
                                        reply_to_message_id: $.message.message_id
                                    });
                                $.waitForRequest(($) => {
                                    if ($.message.text.toLowerCase().indexOf("yes") > -1) {
                                        $.sendMessage("Pleasure's all mine", {
                                            reply_to_message_id: $.message.message_id
                                        });
                                    } else if ($.message.text.toLowerCase().indexOf("no") > -1) {
                                        $.sendMessage("Well fuck you, asshole", {
                                            reply_to_message_id: $.message.message_id
                                        });
                                    }
                                });
                                setTimeout(function() {
                                    /*
                                        If tg.waitingCallbacks isn't cleaned, the next message of the 
                                        user will not be spell checked. Cleaning it after 5 secs seems to be ok. 
                                    */
                                    console.log('Cleaning waiting callbacks');
                                    delete tg.waitingCallbacks[$.message.from.id];
                                }, 4000);
                            }
                        });
                    }
                }
            }
        });
    }
};

exports.BOT = _bot;