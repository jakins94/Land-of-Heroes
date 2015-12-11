let socket;
let mCanvas, mCtx;
let aCanvas, aCtx;
let bCanvas, bCtx;
let myName, myId;

let players = [];
let enemies = [];
let projectiles = [];

let localPlayer;

var init = function() {

	socket = io.connect('http://25.168.179.255:8000');

	eventHandlers();
	gameHandlers();
	startUp();
	initMap();

};

let eventHandlers = function() {

	socket.on('player connect', playerConnect);

};

var interfaces = [];
let resizeableInterfaces = [];
let openInterfaces = [ 0 ];

function newInterface(options) {

	let that = {};

	that.name = options.name;
	that.mainColor = options.colors.main;
	that.secColor = options.colors.sec;
	that.textColor = options.colors.text;
	that.textStroke = options.colors.textStroke;
	that.secText = options.colors.secText;
	that.startX = options.size.x;
	that.startY = options.size.y;
	that.width = options.size.w;
	that.height = options.size.h;
	that.endX = options.x+options.w;
	that.endY = options.y+options.h;
	that.closeable = options.closeable;
	that.resizeable = options.resizeable;
	that.dragTop = options.drag.top;
	that.dragLeft = options.drag.left;
	that.id = interfaces.length;

	if(options.resizeable) {
		resizeableInterfaces.push(that.id);
	}

	interfaces.push(that);

}

let playerInv = newInterface({
	name: 'Inventory',
	size: {
		x: 100,
		y: 100,
		w: 640,
		h: 240
	},
	colors: {
		main: '#673F00',
		sec: '#563B00',
		text: '#CD6F00',
		textStroke: '#553000',
		secText: '#FFFFFF'
	},
	drag: {
		top: 30,
		left: 0
	},
	resizeable: true,
	closeable: true
});

/*eslint-disable */
	function flipImage(image, ctx, flipH, flipV) {
	    var scaleH = flipH ? -1 : 1, // Set horizontal scale to -1 if flip horizontal
	        scaleV = flipV ? -1 : 1, // Set verical scale to -1 if flip vertical
	        posX = flipH ? 64 * -1 : 0, // Set x position to -100% if flip horizontal
	        posY = flipV ? 64 * -1 : 0; // Set y position to -100% if flip vertical

	    ctx.save(); // Save the current state
	    ctx.scale(scaleH, scaleV); // Set scale to flip the image
	    ctx.drawImage(image, posX, posY, 64, 64); // draw the image
	    ctx.restore(); // Restore the last saved state
	}
	/*eslint-enable */

/**
 * Adds a new animated sprite into the game
 * @param  {ctx} context   Context the sprite will be drawn
 * @param  {string} name      Name of the sprite .png file in the sprites folder
 * @param  {int} myX       x position
 * @param  {int} myY       y position
 * @param  {int} width     width of sprite in px
 * @param  {int} height    height of sprite in px
 * @param  {int} numF      number of frames in the anim
 * @param  {int} animSpeed speed of the anim. default 0 = 60 fps, 4 = 15 fps
 * @param  {bool} loop      whether the animation loops or not
 * @return {obj}           returns the sprite object, which should be pushed into the sprites array to be drawn.
 */
let newSprite = function(context, name, myX, myY, width, height, numF, animSpeed, loop) {


	let frameIndex = 0,
		tickCount = 0,
		ticksPerFrame = animSpeed || 0,
		numberOfFrames = numF || 1;

	let that = {};

	that.x = myX;
	that.y = myY;
	that.context = context;
	that.width = width;
	that.height = height;
	that.loop = loop;
	that.img = new Image();
	that.img.src = './sprites/'+name+'.png';
	that.id = sprites.length;

	that.render = function(facing) {
		that.context.scale(-facing, 1);
		that.context.drawImage(
           that.img,
           frameIndex * that.width / numberOfFrames,
           0,
           that.width / numberOfFrames,
           that.height,
           that.x,
           that.y,
           that.width / numberOfFrames,
           that.height);
		that.context.scale(-facing, 1);
	};

	that.update = function () {
		tickCount += 1;
		if (tickCount > ticksPerFrame) {
			tickCount = 0;
			if (frameIndex < numberOfFrames - 1) {
				frameIndex += 1;
			} else if (that.loop) {
				frameIndex = 0;
			} else if (!that.loop) {
				delete sprites[that.id];
				return false;
			}
		}
		return true;
	};

	return that;

};

let sprites = [];

function inSquare (x, y, startX, endX, startY, endY) {
	if((x > startX && x < endX && y > startY && y < endY))
		return true;
	return false;
}

let worldX = 10;
let worldY = 10;
let tileSize = 32;
let worldSize = 100;
let mapName = 'cave';

let initMap = function() {
	let worldRight = worldSize * tileSize;
	let worldBottom = worldSize * tileSize;
	let spriteNum = 0;
	let sprites = [];
	let spriteIndex = 0;

	bCtx.clearRect(0, 0, worldX * 640, worldY * 360);
	aCtx.clearRect(0, 0, worldX * 640, worldY * 360);

	for (let w=0; w < worldX; w++) {
		for (let h=0; h < worldY; h++) {
			let texLoc = 'maps/'+mapName+'/'+mapName+'B_('+w+','+h+').png';
			sprites[spriteIndex] = new Image();

			sprites[spriteIndex].onload = (function () {
				var thisX = w * 640;
				var thisY = h * 360;

				return function () {
					bCtx.drawImage(this, thisX, thisY);
				};
			}());
			sprites[spriteIndex].src = texLoc;
			spriteIndex += 1;
		}
	}
	for (let w=0; w < worldX; w++) {
		for (let h=0; h < worldY; h++) {
			let texLoc = 'maps/'+mapName+'/'+mapName+'A_('+w+','+h+').png';
			sprites[spriteIndex] = new Image();

			sprites[spriteIndex].onload = (function () {
				var thisX = w * 640;
				var thisY = h * 360;

				return function () {
					aCtx.drawImage(this, thisX, thisY);
				};
			}());
			sprites[spriteIndex].src = texLoc;
			spriteIndex += 1;
		}
	}
};

let gameHandlers = function() {

	window.addEventListener("resize", onResize);

	$('#gameContainer').mousemove(function(e){
		mX = e.pageX, mY = e.pageY;
		let player = playerById(socket.id);
		interfaceId = -1;
		interfaceDrag = -1;
		for(let i in openInterfaces) {
			let id = openInterfaces[i];
			let left = interfaces[id].startX, top = interfaces[id].startY, width = interfaces[id].width, height = interfaces[id].height;
			let dragTop = interfaces[id].dragTop, dragLeft = interfaces[id].dragLeft;
			if(inSquare(e.pageX, e.pageY, left - 10, left + width + 20, top - 10, top + height + 20)) {
				interfaceId = id;
				if(resizeableInterfaces.indexOf(id) > -1) {
					if(inSquare(e.pageX, e.pageY, left - 10, left + 10, top - 10, top + 10)) {
						$('#mainCanvas').css('cursor', 'nw-resize');
						interfaceDrag = 1;
					} else if(inSquare(e.pageX, e.pageY, left - 10, left + 10, top+10, top + height - 10)) {
						$('#mainCanvas').css('cursor', 'w-resize');
						interfaceDrag = 2;
					} else if(inSquare(e.pageX, e.pageY, left - 10, left + 10, top + height, top + height + 20)) {
						$('#mainCanvas').css('cursor', 'sw-resize');
						interfaceDrag = 3;
					} else if(inSquare(e.pageX, e.pageY, left + 10, left + width - 10, top + height, top + height + 20)) {
						$('#mainCanvas').css('cursor', 's-resize');
						interfaceDrag = 4;
					} else if(inSquare(e.pageX, e.pageY, left + width, left + width + 20, top + height, top + height + 20)) {
						$('#mainCanvas').css('cursor', 'se-resize');
						interfaceDrag = 5;
					} else if(inSquare(e.pageX, e.pageY, left + width, left + width + 20, top + 10, top + height - 10)) {
						$('#mainCanvas').css('cursor', 'e-resize');
						interfaceDrag = 6;
					} else if(inSquare(e.pageX, e.pageY, left + width, left + width + 20, top - 10, top + 10)) {
						$('#mainCanvas').css('cursor', 'ne-resize');
						interfaceDrag = 7;
					} else if(inSquare(e.pageX, e.pageY, left + 10, left + width - 10, top-10, top + 10)) {
						$('#mainCanvas').css('cursor', 'n-resize');
						interfaceDrag = 8;
					} else if(interfaceDrag === -1) {
						$('#mainCanvas').css('cursor', 'auto');
						interfaceDrag = 0;
					}
				}
				if(inSquare(e.pageX, e.pageY, left + 10, left + width - 10, top+10, top + 10 + dragTop)) {
					$('#mainCanvas').css('cursor', 'move');
					interfaceDrag = 9;
				}
				if(inSquare(e.pageX, e.pageY, left, left + dragLeft, top, top+height)) {
					$('#mainCanvas').css('cursor', 'move');
					interfaceDrag = 9;
				}
			} else if(interfaceDrag === -1) {
				$('#mainCanvas').css('cursor', 'auto');
				interfaceDrag = 0;
			}

			if(dragId !== -1 || interfaceDrag > 0) { // If they are dragging 1 interface, break the entire loop to prevent dragging others
				break;
			}
		}
		if(mouseWalking) {
			let myDest = getClickedPos(e, { x: player.bgX, y: player.bgY });
			player.destX = myDest.x, player.destY = myDest.y;
		}
	});
	$('#gameContainer').mousedown(mouseDown);
	$('#gameContainer').mouseup(function() {
		if(mouseDownID)
			clearInterval(mouseDownID);
		mouseWalking = false;

		dragId = -1; // Reset interface dragging since they let up on mouse
		dragType = 0;
	});

	$('body').on('contextmenu', '#mainCanvas', function(e){ return false; });

};

function clamp(value, min, max){
	if(value < min) return min;
	else if(value > max) return max;
	return value;
}

function onResize() {
	mCanvas.width = window.innerWidth;
	mCanvas.height = window.innerHeight;
}

function startUp() {

	bCanvas = document.getElementById('bgCanvas');
	bCtx = bCanvas.getContext('2d');

	mCanvas = document.getElementById('mainCanvas');
	mCtx = mCanvas.getContext('2d');

	aCanvas = document.getElementById('aCanvas');
	aCtx = aCanvas.getContext('2d');

//	aCtx.scale(2,2);
//	bCtx.scale(2,2);
//	mCtx.scale(2,2);

	mCanvas.width = window.innerWidth;
	mCanvas.height = window.innerHeight;

	bCanvas.width = 5184;
	bCanvas.height = 5184;
	aCanvas.width = 5184;
	aCanvas.height = 5184;

	mCtx.fillStyle = '#22AE40';
	mCtx.fillRect(0, 0, window.innerWidth, window.innerHeight);

	animate();

/*	let spriteName = 'spider';
	let newImg = new Image();
	newImg.src = './sprites/'+spriteName+'.png';
	let newSpriteId = sprites.length; // Sprite id is equal to what it's id will be in the sprite array
	sprites.push(newImg); // Put the sprite into the array*/
	var enemy = new Enemy('spider', 'Spider', 3, 250, 0, 400, 460);

	enemies.push(enemy);

	var tryConnect = setTimeout(sendConnection, 1000);

}

let mX = 0, mY = 0;
let mouseDownID = 0;
let mouseWalking = false; // if mouse is down for walking

var theGameLoop = setInterval(gameLoop, 30);

function gameLoop() {
	for(let i in players) {
		if(players[i].target !== -1) { // If player has a target, follow or attack it
			let enemy = enemyById(players[i].target);
			if(distance(players[i].x, players[i].y, enemy.x, enemy.y) >= players[i].attackRange/2) { // Follow if not as close as possible (to do: different for range weapon)
				playerFollow(players[i]);
			}
			if(distance(players[i].x, players[i].y, players[i].destX, players[i].destY) <= players[i].attackRange) { // Attack if we are close enough
				playerAttack(players[i]);
			}
		} else { // If player doesn't have a target, check if they are moving
			if(distance(players[i].x, players[i].y, players[i].destX, players[i].destY) >= 3) {
				playerMove(players[i]);
			}
		}
	}

	for(let j in enemies) {
		if(distance(enemies[j].x, enemies[j].y, enemies[j].destX, enemies[j].destY) <= enemies[j].attackRange) {

			//console.log(distance(enemies[j].x, enemies[j].y, enemies[j].destX, enemies[j].destY));
			console.log(enemies[j].destX, enemies[j].destY);
			//console.log(enemies[j].x, enemies[j].y);


			enemyMove(enemies[j]);

			if(enemies[j].fighting) {
				enemyAttack(enemies[j]);
			}

		} else if(distance(enemies[j].x, enemies[j].y, enemies[j].destX, enemies[j].destY) >= enemies[j].attackRange) {
			enemyMove(enemies[j]);
		} else if(Math.random() * 75 <= 1){
			enemies[j].destX = enemies[j].startX + Math.random() * 200 - 200;
			enemies[j].destY = enemies[j].startY + Math.random() * 200 - 200;
			console.log('destination changed!');
		}
	}

	for(let j in projectiles) {
		if(projectiles[j].follow !== -1) {
			let enemy = enemyById(projectiles[j].follow);
			projectiles[j]['endX'] = enemy.x, projectiles[j]['endY'] = enemy.y;
		}
		if(projectiles[j].life > 0) {
			projectiles[j].life--;

			if(projectiles[j].life <= 0) {
				delete projectiles[j];
				continue;
			}
		}
		if(distance(projectiles[j].x, projectiles[j].y, projectiles[j].endX, projectiles[j].endY) >= 20) {
			projectileMove(projectiles[j]);
		} else {
			if(projectiles[j].follow !== -1) {
				let enemy = enemyById(projectiles[j].follow);
				enemy['hp'] -= projectiles[j].damage;
			}
			delete projectiles[j];
			continue;
		}
	}
}

function playerFollow(player) {
	let enemy = enemyById(player.target);
	player.destX = enemy.x;
	player.destY = enemy.y;
	playerMove(player);
}

function playerAttack(player) {

	let enemy = enemyById(player.target);

	if(enemy.hp > 0) {
		//enemy.hp--;
		if(player.lastAttack <= Date.now() - 1000) {
			player.lastAttack = Date.now();
			if(player.weaponType == 1) { // sword
				let damage = 1 + Math.floor(Math.random() * player.strength);
				enemy.gotHit(damage, player);
				console.log(player.pid);
			} else if(player.weaponType == 2){ //bow
				let newProj = new Projectile(0, player.id, 150, 15, player.x, player.y, enemy.x, enemy.y, -1, 'Slash', 192, 64, 3, 10, false);
				projectiles.push(newProj);
			}
		}
	} else {

		enemy.onDeath();

		player.target = -1;
		player.destX = player.x, player.destY = player.y;
	}

}

function enemyAttack(enemy) {

	let player = playerById(enemy.target);
	if(player.hp > 0) {
		if(enemy.lastAttack <= Date.now() - enemy.attackSpeed) {
			enemy.lastAttack = Date.now();
			let damage = 1 + Math.floor(Math.random() * enemy.strength);
			player.hitByEnemy(damage, enemy);
		}
	} else {
		enemy.target = -1;
		enemy.fighting = false;
	}

}

var Projectile = function(id, pid, life, speed, x, y, endX, endY, follow, spriteName, width, height, frames, animSpeed, loopAnim) {

	let owner = playerById(this.pid);

	this.mySprite = newSprite(mCtx, 'slash', x, y, width, height, frames, animSpeed, loopAnim);
	this.spriteId = sprites.length; // Sprite id is equal to what it's id will be in the sprite array
	sprites.push(this.mySprite); // Put the sprite into the array

	this.damage = 1;

	if(owner) {
		this.damage = owner.strength;
	}
	this.life = life,
	this.id = id,
	this.pid = pid,
	this.speed = speed,
	this.x = x,
	this.y = y,
	this.endX = endX,
	this.endY = endY,
	this.follow = follow;

	this.move = function(x, y) {
		this.x += x;
		this.y += y;
	};
	/*damage: 1,
	pid: pid,
	id: id,
	speed: speed,
	x: x,
	y: y,
	endX: endX,
	endY: endY,
	follow: follow;*/

};

function playerMove(player) {
	var Angle = Math.atan2(player.destY - player.y, player.destX - player.x);
	var Per_Frame_Distance = 5;
	var Sin = Math.sin(Angle) * Per_Frame_Distance;
	var Cos = Math.cos(Angle) * Per_Frame_Distance;
	player.x += Cos;
	player.y += Sin;
}

function enemyMove(enemy) {
	if(distance(enemy.startX, enemy.startY, enemy.x, enemy.y) <= enemy.followDistance) {
		if(enemy.fighting) {
			let player = playerById(enemy.target);
			console.log(player);
			console.log(Boolean(player));
			if(player) {
				enemy.destX = player.x, enemy.destY = player.y; // Set enemy destination to my location

				console.log('destination changed! 2');
				console.log(enemy.destX, enemy.destY);
				console.log(distance(enemy.destX, enemy.destY, enemy.x, enemy.y));
			}
		}
	} else {
		enemy.destX = enemy.startX, enemy.destY = enemy.startY;
		console.log('destination changed! 3');
		enemy.target = -1;
		enemy.fighting = false;
	}

	var Angle = Math.atan2(enemy.destY - enemy.y, enemy.destX - enemy.x);
	var Per_Frame_Distance = enemy.speed;
	var Sin = Math.sin(Angle) * Per_Frame_Distance;
	var Cos = Math.cos(Angle) * Per_Frame_Distance;

	if(distance(enemy.x, enemy.y, enemy.destX, enemy.destY) >= enemy.attackRange / 2
		&& enemy.alive){
		enemy.x += Cos;
		enemy.y += Sin;
	}
}

function projectileMove(p) {
	var Angle = Math.atan2(p.endY - p.y, p.endX - p.x);
	var Per_Frame_Distance = p.speed;
	var Sin = Math.sin(Angle) * Per_Frame_Distance;
	var Cos = Math.cos(Angle) * Per_Frame_Distance;
	p['x'] += Cos;
	p['y'] += Sin;
}

function distance(x1, y1, x2, y2) {
	return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function mouseDown(e) {

	//mX = e.pageX, mY = e.pageY; // Set mouseX and mouseY
	e.preventDefault();

	if(e.which == 1) {
		onLeftPress(e);
		clearInterval(mouseDownID);
		leftMouseDown(e);
		mouseDownID = setInterval(function() {
			this.leftMouseDown(e);
		}, 25);
	} else if(e.which == 3 || e.button == 2){
		onRightPress(e);
		clearInterval(mouseDownID);
		rightMouseDown(e);
		mouseDownID = setInterval(function() {
			this.rightMouseDown(e);
		}, 25);
	}

	return false;
}

let intOffX = 0, intOffY = 0;
let dragId = -1;

function onLeftPress(e) {

	mouseWalking = true; // By default we assume they are trying to walk when left clicking
	dragType = interfaceDrag; // Set the drag type, if they are inside an interface
	dragId = interfaceId;

	for(let i in enemies) { // Targetting an enemy when left clicking near it
		let myDest = getClickedPos(e, { x: localPlayer.bgX, y: localPlayer.bgY });
		if(distance(myDest.x, myDest.y, enemies[i].x, enemies[i].y) <= 30) {
			localPlayer.target = enemies[i].id;
			mouseWalking = false;
		}
	}

	if(dragId !== -1 && dragType !== 0) { // Check if user is clicking inside of an interface

		intOffX = mX - interfaces[dragId].startX; // Set interfaceOffX, which is the difference between start of interface x and the mouse x
		intOffY = mY - interfaces[dragId].startY;

	}

	if(dragId !== -1 || dragType !== 0)
		mouseWalking = false; // Since they are inside of an interface, don't let them walk

	if(mouseWalking) { // Only set new destination if the player is not clicking inside an interface
		let myDest = getClickedPos(e, { x: localPlayer.bgX, y: localPlayer.bgY });
		localPlayer.destX = myDest.x, localPlayer.destY = myDest.y;
		localPlayer.target = -1; // Also clear their target
	}
}

let interfaceId = -1, dragType = 0, interfaceDrag = -1;

function leftMouseDown(e) {

	let player = playerById(socket.id);

	if(dragId !== -1 && dragType !== 0) { // If user is inside of an interface or dragging one
		var inter = interfaces[dragId];

		inter.endX = inter.startX + inter.width;
		inter.endY = inter.startY + inter.height;

		if(dragType === 9) { // Dragging an interface
			inter.startX = mX - intOffX; // Mouse x - interfaceOffX
			inter.startY = mY - intOffY;
		} else if(dragType === 1) { // NW-resize
			inter.startX = mX - intOffX; // Mouse x - interfaceOffX
			inter.startY = mY - intOffY;
			inter.width = inter.endX - inter.startX;
			inter.height = inter.endY - inter.startY;
		}

		if(inter.endX <= inter.startX + 75) { // Make sure interface is not bugged
			inter.width = 75;
		}
		if(inter.endY <= inter.startY + 75) {
			inter.height = 75;
		}
	}

}

function onRightPress(e) {

}

function rightMouseDown(e) {

}

function drawLightGradient(x, y, lightSize) {
	aCtx.save();

	//aCtx.globalCompositeOperation = 'source-atop';

	/*aCtx.globalAlpha = .8;
	aCtx.fillStyle = 'rgba(0, 0, 0, 1)';
	aCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
	aCtx.fillRect(0, 0, window.innerWidth, window.innerHeight); // Draw blackness
	*/

	aCtx.globalCompositeOperation = 'xor';
	var radialGradient = aCtx.createRadialGradient(x, y, 10 ,x, y, lightSize/4);
	radialGradient.addColorStop(0, 'rgba(0, 0, 0, .5)');
	radialGradient.addColorStop(1, 'transparent');
	aCtx.fillStyle = radialGradient;
	//aCtx.clearRect(x-lightSize/2, y-lightSize/2, lightSize, lightSize);
	aCtx.fillRect(x-lightSize/2, y-lightSize/2, lightSize, lightSize);

	aCtx.restore();

	//mCtx.drawImage(aCtx.canvas, 0, 0);
}

/*eslint-disable */

	(function(){
  // Importing relevant classes

	}());

	/*var Lamp = illuminated.Lamp
  , RectangleObject = illuminated.RectangleObject
  , DiscObject = illuminated.DiscObject
  , Vec2 = illuminated.Vec2
  , Lighting = illuminated.Lighting
  , DarkMask = illuminated.DarkMask
  ;*/

  var canvas = document.getElementById("mainCanvas");
  var ctx = canvas.getContext("2d");

  /*var light1 = new Lamp({
    position: new Vec2(100, 250),
    distance: 200,
    radius: 10,
    samples: 50
  });
  var light2 = new Lamp({
    position: new Vec2(300, 50),
    color: '#CCF',
    distance: 200,
    radius: 10,
    samples: 50
  });
  var disc = new DiscObject({ center: new Vec2(100, 100), radius: 30 });
  var rect = new RectangleObject({ topleft: new Vec2(250, 200), bottomright: new Vec2(350, 250) });

  var objects = [ disc, rect ];

  var lighting1 = new Lighting({
    light: light1,
    objects: objects
  });
  var lighting2 = new Lighting({
    light: light2,
    objects: [ disc, rect ]
  });

  var darkmask = new DarkMask({ lights: [light1, light2] });
  */

//!START
// ...
  var startAt = +new Date();
  var lastd;

  function render () {
    var t = +new Date() - startAt;
    var d = Math.round(100*Math.cos(t/1000));
    if (d == lastd) return; // nothing has changed
    lastd = d;

    light1.position = new Vec2(200-d, 150+d);
    light2.position = new Vec2(200+d, 150-d);

    lighting1.compute(canvas.width, canvas.height);
    lighting2.compute(canvas.width, canvas.height);
    darkmask.compute(canvas.width, canvas.height);

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.beginPath();
    disc.path(ctx);
    ctx.fill();
    ctx.beginPath();
    rect.path(ctx);
    ctx.fill();

    ctx.globalCompositeOperation = "lighter";
    lighting1.render(ctx);
    lighting2.render(ctx);

    ctx.globalCompositeOperation = "source-over";
    darkmask.render(ctx);
  }

 /* function render () {
    var t = +new Date() - startAt;
    var d = Math.round(100*Math.cos(t/1000));
    if (d == lastd) return; // nothing has changed
    lastd = d;

    let allLights = [ light2];

    for(let i in players) {

    	players[i].light.position = new Vec2(players[i].x, players[i].y);
    	allLights.push(players[i].light);

		mCtx.fillStyle = 'blue';
		mCtx.fillRect(players[i].x-16, players[i].y-16, 32, 32);
		mCtx.fillStyle = '000';
		mCtx.textAlign = 'center';
		mCtx.fillText(players[i].name, players[i].x, players[i].y-18);


	}

	for(let i in enemies) {
		light2.position = new Vec2(enemies[i].x, enemies[i].y);
	}

    //light1.position = new Vec2(mX, mY);

    var darkmask = new DarkMask({ lights: allLights });

    for(let i in players) {
    	players[i].lighting.objects = objects;
     	players[i].lighting.compute(canvas.width, canvas.height);
    }

    lighting2.compute(canvas.width, canvas.height);

    darkmask.compute(canvas.width, canvas.height);

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.beginPath();
    disc.path(ctx);
    ctx.fill();
    ctx.beginPath();
    rect.path(ctx);
    ctx.fill();

    ctx.globalCompositeOperation = "lighter";
    for(let i in players) {
     	players[i].lighting.render(ctx);
    }
    lighting2.render(ctx);

    ctx.globalCompositeOperation = "source-over";
    darkmask.render(ctx);
}*/

	/*eslint-enable */

	function getClickedPos(e, bgPos) {
		var x = e.pageX;
		var y = e.pageY;
		x = Math.floor((x - bgPos.x));
		y = Math.floor((y - bgPos.y));
		return { x: x, y: y };
	}

function draw() {

	if(localPlayer) {
		let bgPos = { x: localPlayer.bgX, y: localPlayer.bgY };
		localPlayer.update();

		if(parseInt(document.getElementById("bgDiv").style.marginLeft) != bgPos.x) {
			document.getElementById("bgDiv").style.marginLeft = bgPos.x + "px";
		}
		if(parseInt(document.getElementById("bgDiv").style.marginTop) != bgPos.y) {
			document.getElementById("bgDiv").style.marginTop = bgPos.y + "px";
		}
	}



//	aCtx.save();
//	aCtx.globalCompositeOperation = 'lighter';
	//aCtx.globalAlpha = .8;
//	aCtx.fillStyle = 'rgba(0, 0, 0, 1)';
	mCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
	//aCtx.fillRect(0, 0, window.innerWidth, window.innerHeight); // Draw blackness
//	aCtx.restore();

	mCtx.save();
	//mCtx.globalCompositeOperation = 'screen';

	//mCtx.fillStyle = '#22AE40';
	//mCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
	//mCtx.fillRect(0, 0, window.innerWidth, window.innerHeight);

	//mCtx.fillStyle = '#000';
	//mCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
	//mCtx.fillRect(0, 0, window.innerWidth, window.innerHeight);
	//mCtx.globalCompositeOperation = 'source-over';

	for(let j in enemies) {

		enemies[j].draw(mCtx, localPlayer.bgX, localPlayer.bgY);
		//drawLightGradient(enemies[j].x, enemies[j].y, 250);

	}

	for(let i in projectiles) {
		let id = projectiles[i].spriteId;
		if(sprites[id]) { // Only run if animation still exists, otherwise it probably ended.
			sprites[id].x = projectiles[i].x;
			sprites[id].y = projectiles[i].y;
			if(sprites[id].update()) { // If the sprite exists after update, then render it. Otherwise, the animation was finished playing.
				sprites[id].render();
			}
			//drawLightGradient(projectiles[i].x, projectiles[i].y, 150);
		}
	}

	for(let i in players) {

		let id = players[i].spriteId;
		if(sprites[id]) { // Only run if animation still exists, otherwise it probably ended.
			sprites[id].x = players[i].x+players[i].bgX-32;
			sprites[id].y = players[i].y+players[i].bgY-24;
			if(sprites[id].update()) { // If the sprite exists after update, then render it. Otherwise, the animation was finished playing.
				//mCtx.scale(-1, 1);
				sprites[id].render();
				//mCtx.scale(-1, 1);
			}
			//drawLightGradient(players[i].x, players[i].y, 350);
		}

		players[i].draw(mCtx);

	}

	//mCtx.drawImage(aCtx.canvas, 0, 0);

	for(let i in openInterfaces) {
		let id = openInterfaces[i];
		let fontSize = 10 + (interfaces[id].width / 100);
		let thisAlpha = 0.85;
		let mainColor = interfaces[id].mainColor, secColor = interfaces[id].secColor, textColor = interfaces[id].textColor, textStroke = interfaces[id].textStroke, secText = interfaces[id].secText;

		mCtx.save(); // Save canvas so we can modify it

		mCtx.globalAlpha = thisAlpha; // Set the opacity/alpha for the interface
		mCtx.fillStyle = mainColor; // Set the first fill color for the interface

		if(interfaces[id].dragTop) { // If it can be dragged from the top

			// Drag bar fillRect, alpha is lower so it doesn't effect the interface as much
			mCtx.globalAlpha = 0.25;
			mCtx.fillRect(interfaces[id].startX, interfaces[id].startY, interfaces[id].width, interfaces[id].dragTop);

			// Drag bar line, alpha is higher so it's darker
			mCtx.globalAlpha = 0.8; mCtx.fillStyle = secColor;
			mCtx.fillRect(interfaces[id].startX, interfaces[id].startY+interfaces[id].dragTop-2, interfaces[id].width, 2);

			mCtx.globalAlpha = 0.85; mCtx.fillStyle = mainColor; // return to the original alpha and fill state

		} else if(interfaces[id].dragLeft) { // If it can be dragged from the top

			// Drag bar fillRect, alpha is lower so it doesn't effect the interface as much
			mCtx.globalAlpha = 0.25;
			mCtx.fillRect(interfaces[id].startX, interfaces[id].startY, interfaces[id].dragLeft, interfaces[id].height);

			// Drag bar line, alpha is higher so it's darker
			mCtx.globalAlpha = 0.8; mCtx.fillStyle = secColor;
			mCtx.fillRect(interfaces[id].startX+interfaces[id].dragLeft-2, interfaces[id].startY, 2, interfaces[id].height);

			mCtx.globalAlpha = 0.85; mCtx.fillStyle = mainColor; // return to the original alpha and fill state

		}

		mCtx.fillRect(interfaces[id].startX, interfaces[id].startY, interfaces[id].width, interfaces[id].height);
		mCtx.strokeStyle = secColor;
		mCtx.lineWidth = 5;
		mCtx.globalAlpha = 0.8;
		mCtx.strokeRect(interfaces[id].startX, interfaces[id].startY, interfaces[id].width, interfaces[id].height);
		mCtx.globalAlpha = 0.9;
		mCtx.fillStyle = textColor;
		mCtx.strokeStyle = textStroke;
		mCtx.textAlign = 'center';
		mCtx.font = 'bold '+fontSize+'pt Arial';
		mCtx.lineWidth = 2;
		mCtx.fillText(interfaces[id].name, interfaces[id].startX + interfaces[id].width/2, interfaces[id].startY + 20);
		mCtx.globalAlpha = 0.5;
		mCtx.strokeText(interfaces[id].name, interfaces[id].startX + interfaces[id].width/2, interfaces[id].startY + 20);

		mCtx.restore();
	}

	mCtx.restore();

}


let lastRender = Date.now(), lastFpsCycle = Date.now(), delta = 0, FPS = 30;

function animate() {

	//mCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);

	requestAnimFrame(animate);

	draw();
	//render();


	delta = (Date.now() - lastRender);
	lastRender = Date.now();

	if(Date.now() - lastFpsCycle > 1000) {
		lastFpsCycle = Date.now();
		var fps = Math.round(1/delta);
		//mCtx.fillStyle = '000';
		//mCtx.fillText(fps, 20, 20);
		//$("#fps").html("FPS: "+fps);
	}

}

window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame       ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame    ||
	window.oRequestAnimationFrame      ||
	window.msRequestAnimationFrame     ||
	function(/* function */ callback){
		window.setTimeout(callback, 1000 / 60);
	};
})();

function sendConnection() {
	socket.emit('player connect', { id: socket.id, name: 'James' } );
}

function playerConnect(data) {

	let newPlayer;

	let mySprite = newSprite(mCtx, 'test', 0, 0, 256, 64, 4, 4, true);
	let spriteId = sprites.length; // Sprite id is equal to what it's id will be in the sprite array
	sprites.push(mySprite); // Put the sprite into the array

	if(socket.id === data.id) {
		localPlayer = new Player(data.name, data.id, spriteId);
		newPlayer = localPlayer;
	} else {
		newPlayer = new Player(data.name, data.id, spriteId);
	}

	players.push(newPlayer);

	console.log(players);

}

function playerById(id) {
	for(let i in players) {
		if(players[i].id === id) {
			return players[i];
		}
	}
}

function enemyById(id) {
	for(let i in enemies) {
		if(enemies[i].id === id) {
			return enemies[i];
		}
	}
}
