var bot = require("./bot.js").BOT;
var fs = require('fs');

var token = fs.readFileSync("token.txt").toString();
var football = fs.readFileSync("footballtoken.txt").toString();
bot.start(token, football);
