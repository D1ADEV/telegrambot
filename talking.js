var randomWords = require('random-words');

var _getSentence = function(cb){
    return randomWords({min: 5, max: 10, join: ' '});
};

var _talker = {
    getMessage: function(){
        return _getSentence();
    }
};

exports.TALKER = _talker;