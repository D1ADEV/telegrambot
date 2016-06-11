var bot = require("./bot.js").BOT;
var fs = require('fs');

var token = fs.readFileSync("token.txt").toString();
bot.start(token);
