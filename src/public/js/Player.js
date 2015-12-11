//var Lamp = illuminated.Lamp, Lighting = illuminated.Lighting;
var Player = Class.extend({

	init: function(name, id, spriteId) {
		this.name = name;
		this.id = id;
		this.pid = 0;
		this.inventory = [];
		this.weaponType = 1;
		this.x = 120;
		this.y = 240;
		this.absX = this.x;
		this.absY = this.y;
		this.destX = this.x;
		this.destY = this.y;
		this.bgX = 0;
		this.bgY = 0;
		this.target = -1;
		this.attackRange = 125;
		this.facingDir = 0;
		this.lastAttack = 0;
		this.maxhp = 100;
		this.hp = this.maxhp;
		this.strength = 10;

		this.hitArray = [];

		this.num1 = 1.15, this.num2 = 2.15;

		this.hitByEnemy = function(damage, enemy) {
			var damageText = [];
			var rand = Math.random();
			var rand2 = Math.random() / 3 + .75;
			var rand3 = Math.random() / 5 + .9;
 			var num1 = this.num1 * rand2, num2 = this.num2 * rand3;
			this.hp -= damage;
			if(rand <= .33)
				damageText = [damage, num1, num2, 1];
			else if(rand > .33 && rand <= .66)
				damageText = [damage, num1, num2, -1];
			else
				damageText = [damage, num1, num2, 0];
			this.hitArray.push(damageText);

			//this.target = enemy.id;
		};

		this.getX = function() {
			return this.x;
		};

		this.getY = function() {
			return this.y;
		};

		this.worldRight = this.worldBottom = 5184;

		this.update = function() {
			var tx = this.absX;
			var ty = this.absY;
			var pathValue;

			      if(this.x > ((window.innerWidth / 2)) || this.bgX <= 0) {
			      let diff = (window.innerWidth / 2) - this.x;
			        this.bgX = diff;
			      if(this.x < 320 && this.bgX < 0) {
			        let diff = 320 - this.x;
			        this.bgX += diff;
			      }
			    } else {
			      this.bgX += Math.round(this.speed*dt);
			    }

			  if(this.y > ((window.innerHeight / 2)) || this.bgY <= 0) {
			    let diff = ((window.innerHeight / 2)) - this.y;
			        this.bgY = diff;
			      if(this.y < 320 && this.bgY < 0) {
			        let diff = 320 - this.y;
			        this.bgY += diff;
			      }
			    }
			    else {
			      //this.bgY += Math.round(this.speed*dt);
			    }

			      if(this.y > (window.innerHeight / 2) && (this.worldBottom + this.bgY) < window.innerHeight) {
			        let diff = (this.worldBottom + this.bgY) - window.innerHeight;
			        this.bgY -= diff;
			      }

			      if(this.x > (window.innerWidth / 2) && (this.worldRight + this.bgX) < window.innerWidth) {
			        let diff = (this.worldRight + this.bgX) - (window.innerWidth);
			        this.bgX -= diff;
			      }

			      if(this.bgX > 0) //test
			        this.bgX = 0;
			      if(this.bgY > 0)
			        this.bgY = 0;
		};

		this.draw = function(ctx) {

			//ctx.fillText(Math.floor(this.x)+', '+Math.floor(this.y), this.x, this.y - 16); // coordinates

			ctx.fillStyle = 'red';
			ctx.fillRect(this.x+this.bgX-20, this.y+this.bgY+44, 40 * (this.hp / this.maxhp), 4);
			ctx.strokeStyle = '#000';
			ctx.strokeRect(this.x+this.bgX-20, this.y+this.bgY+44, 40, 4);


			ctx.strokeStyle = '#000';
			ctx.font = 'bold 15px Arial';
			ctx.textAlign = 'center';
			ctx.fillStyle = '#000';
			ctx.fillText(this.name, this.x+this.bgX+1, this.y+this.bgY-31);
			ctx.fillStyle = 'yellow';
			ctx.fillText(this.name, this.x+this.bgX, this.y+this.bgY-32);
		//	ctx.strokeText(this.name, this.x+this.bgX, this.y+this.bgY-32);

		ctx.fillStyle = 'red';
		ctx.strokeStyle = 'black';

		for(let i=0;i<this.hitArray.length;i++) {
			ctx.save();
			this.hitArray[i][1] = this.hitArray[i][1] * 1.090;
			this.hitArray[i][2] = this.hitArray[i][2] * 1.125;
			this.hitArray[i][3] = this.hitArray[i][3] * 1.055;
			console.log(this.hitArray[i][1], this.hitArray[i][2], this.hitArray[i][3]);
			ctx.globalAlpha = 1 - (this.hitArray[i][2] / 1000);
			ctx.font = 'bold 30px Acknowledge';
			ctx.fillText(this.hitArray[i][0], this.x+this.bgX + this.hitArray[i][3], this.y+this.bgY + 16 - this.hitArray[i][1]);
			ctx.font = '30px Acknowledge';
			ctx.strokeText(this.hitArray[i][0], this.x+this.bgX + this.hitArray[i][3], this.y+this.bgY + 16 - this.hitArray[i][1]);
			ctx.restore();

			/*if(this.hitArray[i][1] / 1000 >= 1)
				this.hitArray.splice(i, 1);*/

				if(this.hitArray[i][2] / 950 >= 1)
					delete this.hitArray[i];
		}

		for(let i=0;i<this.hitArray.length;i++) {
			if(typeof this.hitArray[i] == "undefined")
				this.hitArray.splice(i, 1);
		}

		};

		/*this.light = new Lamp({
			position: new Vec2(100, 250),
			color: '#FFF',
			distance: 200,
			radius: 10,
			samples: 50
		}),
		this.lighting = new Lighting({
			light: this.light,
			objects: []
		});*/
		this.spriteId = spriteId;
	}



});
