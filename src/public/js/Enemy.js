var Enemy = Class.extend({

	init: function(spriteName, name, str, hp, id, x, y) {
		this.name = name;
		this.id = id;
		this.target = -1;
		this.maxhp = hp;
		this.hp = hp;
		this.strength = str;
		this.startX = x;
		this.startY = y;
		this.x = x;
		this.y = y;
		this.destX = this.x;
		this.destY = this.y;
		this.lastAttack = 0;
		this.attackRange = 60;
		this.followDistance = 500;
		this.speed = 2;
		this.alive = true;

		this.sprite = new Image();
		this.sprite.src = './sprites/'+spriteName+'.png';

		this.hitArray = [];

		this.gotHit = function(damage, player) {
			this.hp -= damage;
			let damageText = [damage, 3, 1];
			this.hitArray.push(damageText);

			this.target = player.id;
			this.fighting = true;
			this.destX = player.x, this.destY = player.y;
		};

		this.onDeath = function() {
			this.name = 'Dead';
			this.alive = false;
			this.fighting = false;
			this.target = -1;
		};

		this.draw = function(ctx, bgX, bgY) {

			//ctx.fillStyle = 'red';
			//ctx.fillRect(this.x+bgX-16, this.y+bgY-16, 32, 32);
			ctx.drawImage(this.sprite, this.x+bgX-48, this.y+bgY-48);

			ctx.fillStyle = 'red';
			ctx.fillRect(this.x+bgX-38, this.y+bgY+18, 48 * (this.hp / this.maxhp), 3);
			ctx.strokeStyle = '#000';
			ctx.strokeRect(this.x+bgX-38, this.y+bgY+18, 48, 3);

			ctx.fillStyle = '#000';
			ctx.textAlign = 'center';
			ctx.font = 'bold 15px Arial';
			ctx.fillStyle = '#000';
			ctx.fillText(this.name, this.x+bgX-15, this.y+bgY-39);
			ctx.fillStyle = '#e6e6e6';
			ctx.fillText(this.name, this.x+bgX-16, this.y+bgY-40);

			for(let i=0;i<this.hitArray.length;i++) {
				ctx.save();
				this.hitArray[i][1] = this.hitArray[i][1] * 1.035;
				//this.hitArray[i][2] = this.hitArray[i][2] * 1.05;
				//ctx.globalAlpha = 1 - (this.hitArray[i][2] / 1000);
				ctx.font = 'bold 30px Eskargot';
				ctx.fillText(this.hitArray[i][0], this.x+bgX, this.y+bgY - 16 - this.hitArray[i][1]);
				ctx.font = '30px Eskargot';
				ctx.strokeText(this.hitArray[i][0], this.x+bgX, this.y+bgY - 16 - this.hitArray[i][1]);
				ctx.restore();

				if(this.hitArray[i][2] / 1000 >= 1)
					this.hitArray.splice(i, 1);
			}
		};

		//this.spriteId = spriteId;
	}

});
