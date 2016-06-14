var request = require("request");
var token = '';

var _customTelegramFunctions = {
    init: function(t) {
        token = t;
    },
    editMessage: function(id, newText) {
        var url = "https://api.telegram.org/bot" + token;
        var str = encodeURIComponent(newText);
        request.get(url +
            "/editMessageText?inline_message_id=" +
            id +
            "&text=" +
            str
        );
    }
}

exports.TG = _customTelegramFunctions;