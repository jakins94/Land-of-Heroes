let express = require('express'),
	app = express(),
	port = 8000;

let main = exports.main = function(){ return exports; };
var cls = require('./Class').Class;
main = cls.extend();

let Player = require('./Player').Player;
let Enemy = require('./Enemy').Enemy;
let World = require('./World').World;

let players = [];
let enemies = [];

app.use(express.static(__dirname + '/public'));

var io = require('socket.io').listen(app.listen(port));

var init = function() {

	io.sockets.on('connection', function(client) {

		client.on('player connect', playerConnect);
		//client.send(client.id);

	});

	let theWorld = new World();

};

//k

/*new array =
[

[
[1,1,1],
[0,0,0],
[1,1,1]],

[
[0,1,1],
[0,1,1],
[0,0,0]],

[
[1,1,1],
[1,2,2],
[0,1,1]]
]
;*/

function playerConnect(data) {

	let newPlayer = new Player(data.name, data.id);

	players.push(newPlayer);

	io.to(data.id).emit('player connect', newPlayer);

}


var Projectile = function(id, pid, life, speed, x, y, endX, endY, follow, spriteName, width, height, frames, animSpeed, loopAnim) {

	//let owner = playerById(this.pid);
	//
	
	var that = {
		move: function() {

		}
	};

	/*that.move = function() {
		console.log('test');
		return 'hello';
	};*/

	this.damage = 1;

	//if(owner) {
	//	this.damage = owner.strength;
	//}
	this.life = life,
	this.id = id,
	this.pid = pid,
	this.speed = speed,
	this.x = x,
	this.y = y,
	this.endX = endX,
	this.endY = endY,
	this.follow = follow;

	function move() {
		var Angle = Math.atan2(this.endY - this.y, this.endX - this.x);
		var Per_Frame_Distance = this.speed;
		var Sin = Math.sin(Angle) * Per_Frame_Distance;
		var Cos = Math.cos(Angle) * Per_Frame_Distance;
		this.x += Cos;
		this.y += Sin;
	}

	return that;

};

let projNum = 0;
let projectiles = [];

let maxProjectiles = 100;

for(let i=0;i<maxProjectiles;i++) {
	let newProj = new Projectile(0, 0, 150, 15, 400, 400, 600+(projNum % 10), 600+(projNum % 10), -1, 'Slash', 192, 64, 3, 10, false);
	projectiles.push(newProj);
	projNum++;
}
init();