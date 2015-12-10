var cls = require('./Class').Class;
var Enemy = cls.extend({

	init: function(name, hp, id) {
		this.name = name;
		this.id = id;
		this.maxhp = hp;
		this.hp = hp;
		this.x = 120;
		this.y = 240;
	}

});

// Export the Player class so you can use it in
// other files by using require("Player").Player
exports.Enemy = Enemy;
