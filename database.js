var fs = require('fs');

var database = {
    users: {},
    typos: {},
    enemies: []
};

var _database = {
    addEnemy: function(id){
        if(database.enemies.indexOf(id) == -1){
            database.enemies.push(id);
            return "Added to the enemies list";
        }
        else{
            return "You're already an enemy";
        }
    },
    removeEnemy: function(id){
        if(database.enemies.indexOf(id) != -1){
            database.enemies.splice(database.enemies.indexOf(id), 1);
            return "Removed from the enemies list";
        }
        else{
            return "You were never an enemy";
        }
    },
    isEnemy: function(id){
        if(database.enemies.indexOf(id) != -1){
            return true;
        }
        else{
            return false;
        }
    },
    addTypo: function(id){
        if(database.typos[id] == undefined){
            database.typos[id] = 1;
        }
        else{
            database.typos[id] = database.typos[id] + 1;
        }
    },
    addUser: function(id, name){
        if(Object.keys(database.users).indexOf(id) == -1 && database.enemies.indexOf(id) == -1){
            database.users[id] = name;
        }
    },
    saveToFile: function(){
        fs.writeFileSync("save.json", JSON.stringify(database));
    },
    reloadFromFile: function(){
        var data = fs.readFileSync("save.json");
        database = JSON.parse(data);
    },
    getStats: function(){
        var msg = "Users : ";
        for(var key in database.users){
            if(database.users.hasOwnProperty(key)){
                msg += database.users[key] + " ";
            }
        }
        msg += "\nEnemies : ";
        for(var i = 0; i < database.enemies.length; i++){
            msg += database.users[database.enemies[i]] + " ";
        }
        return msg;
    },
    printStatus: function(){
        console.log(Object.keys(database.users).length + " users, " + database.enemies.length + " enemies");
    }
}
exports.DATABASE = _database;