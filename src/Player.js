var cls = require('./Class').Class;
var Player = cls.extend({

	init: function(name, id) {
		this.name = name;
		this.id = id;
		this.inventory = [];
		this.x = 120;
		this.y = 240;
		this.destX = this.x;
		this.destY = this.y;
		this.target = -1;
		this.attackRange = 75;
	}

});

// Export the Player class so you can use it in
// other files by using require("Player").Player
exports.Player = Player;
