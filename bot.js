var tgapi = require("telegram-node-bot");
var spelling = require('./spellchecking.js').SPELLCHECKER;
var talker = require('./talking.js').TALKER;
var foss = require('./foss.js').FOSS;
var database = require('./database.js').DATABASE;

var isSaving = false;

var _displayMessage = function(message) {
    var msg = "";
    if (!message.text.startsWith("/")) {
        msg += "MSG | ";
    } else {
        msg += "CMD | ";
    }
    msg += message.from.id;
    msg += " - ";
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
    start: function(token) {
        var tg = tgapi(token);
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
            .otherwise('SpellingController');

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
                        spelling.check($.message.text, function(resp) {
                            if (resp.toLowerCase() !== $.message.text.toLowerCase()) {
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