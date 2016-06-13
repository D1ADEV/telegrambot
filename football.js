var lookup = require('country-data').lookup;
var flag = require('emoji-flag')

var specialCases = {
    "England": "GB",
    "Wales": "GB",
    "Russia": "RU",
    "Northern Ireland": "IE",
    "Republic of Ireland": "IE"
};

var _getEmoji = function(countryName) {
    var countryId = lookup.countries({
        name: countryName
    });
    if (countryId[0] !== undefined) {
        countryId = countryId[0].alpha2;
        return flag(countryId);
    } else {
        if (specialCases[countryName] !== undefined) {
            return flag(specialCases[countryName]);
        } else {
            return "";
        }
    }
}

var _getAllMatchesString = function(matchArray) {
    var toReturn = "";
    for (var i = 0; i < matchArray.length; i++) {
        toReturn += _getEmoji(matchArray[i].homeTeamName);
        if (matchArray[i].result.goalsHomeTeam > matchArray[i].result.goalsAwayTeam) {
            toReturn += "<b>" + matchArray[i].homeTeamName + "</b>";
        } else {
            toReturn += matchArray[i].homeTeamName;
        }
        toReturn += " vs ";
        if (matchArray[i].result.goalsHomeTeam < matchArray[i].result.goalsAwayTeam) {
            toReturn += "<b>" + matchArray[i].awayTeamName + "</b>";
        } else {
            toReturn += matchArray[i].awayTeamName;
        }
        toReturn += _getEmoji(matchArray[i].awayTeamName);
        toReturn += " | ";
        if (matchArray[i].status === "FINISHED" || matchArray[i].status === "IN_PLAY") {
            toReturn += matchArray[i].result.goalsHomeTeam;
            toReturn += " - ";
            toReturn += matchArray[i].result.goalsAwayTeam;
            toReturn += "\n";
        } else {
            var date = new Date(matchArray[i].date);
            toReturn += date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
            toReturn += "\n";
        }
    }
    if(toReturn === ""){
        toReturn += "Seems like no matches match this query...";
    }
    return toReturn;
}

var _football = {
    getMessage: function(res, options, optional) {
        var toReturn = "";
        if (options === "all") {
            toReturn += "<b>FINISHED MATCHES</b>\n\n"
            var finishedMatches = res.fixtures.filter(function(el) {
                return el.status === "FINISHED" ? true : false
            });
            toReturn += _getAllMatchesString(finishedMatches);
        } else if (options == "predict") {
            toReturn += "<b>PREDICTING RESULTS</b>\n";
            toReturn += (Math.floor(Math.random() * 3)) + " - " + (Math.floor(Math.random() * 3)) + "\n";
        } else if (options == "country" && optional !== undefined) {
            var matchesBy = res.fixtures.filter(function(el) {
                if (el.homeTeamName == optional || el.awayTeamName == optional) {
                    return true;
                } else {
                    return false;
                }
            });
            toReturn += "<b>" + optional.toUpperCase() + " MATCHES</b>\n";
            toReturn += _getAllMatchesString(matchesBy);
        } else if (options === "upcoming" && optional === undefined) {
            var upcomingMatches = res.fixtures.filter(function(el){
                return el.status === "TIMED" ? true : false;
            });
            toReturn += "<b>UPCOMING MATCHES</b>\n";
            toReturn += _getAllMatchesString(upcomingMatches);
        } else if (options == "upcoming" && optional !== undefined && isNaN(parseInt(optional)) === true){
            var upcomingMatches = res.fixtures.filter(function(el){
                if(el.status === "TIMED"){
                    if(el.homeTeamName === optional || el.awayTeamName === optional){
                        return true;
                    }
                    else{
                        return false;
                    }
                }
                return false;
            })
            toReturn += optional.toUpperCase() + " UPCOMING MATCHES\n";
            toReturn += _getAllMatchesString(upcomingMatches);
        } else if (options === "upcoming" && optional !== undefined && isNaN(parseInt(optional)) === false){
            var date = new Date();
            var matches = res.fixtures.filter(function(el){
                if(new Date(el.date).getDate() == date.getDate() + parseInt(optional)){
                    return true;
                }
                else{
                    return false;
                }
            });
            toReturn += _getAllMatchesString(matches);
        } else if (options === "playing") {
            var match = res.fixtures.filter(function(el){
                return el.status === "IN_PLAY" ? true : false;
            });
            toReturn += "<b>ONGOING MATCHES</b>\n";
            toReturn += _getAllMatchesString(match);
        }
        return toReturn;
    }
}

exports.FOOTBALL = _football;