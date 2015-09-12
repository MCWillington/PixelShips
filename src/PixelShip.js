var PixelShip = PhysicalObject.extend({
	construct: function(x,y,colour) {
		this.super.construct.call(this,x,y,10,10,colour);
		this.type = "pixelShip";
		this.drag = 0.01;
		this.smoothingValue = 40;
		this.sightX = 0;
		this.sightY = 0;
		this.xVelSmoother = [];
		this.yVelSmoother = [];
		for(var i = 0; i < this.smoothingValue; i++) {
			this.xVelSmoother.push(0);
			this.yVelSmoother.push(0);
		}
	},
	getSmootherValue: function(smoother) {
		var smoothedVel = 0;
		for(var i = 0; i < smoother.length; i++)
			smoothedVel += smoother[i];
		return smoothedVel / smoother.length;
	},
	setXVel: function(vel) {
		this.xVel += vel;
	},
	setYVel: function(vel) {
		this.yVel += vel;
	},
	sight: function() {

		var angle = this.angleTo(this.x + this.sightX,this.y + this.sightY) + 270;
		
		return [
			this.x + ((Math.sin(angle * Math.PI / 180) * 4) * ((objectPools.bullet[0].lifeTime / 1000) * 60)),
			this.y + ((-Math.cos(angle * Math.PI / 180) * 4) * ((objectPools.bullet[0].lifeTime / 1000) * 60))
		];
	},
	shoot: function() {

		if(!this.alive) return;

		var angle = this.angleTo(this.x + this.sightX,this.y + this.sightY) + 270;
		var bullet = null;
		while(bullet === null || bullet.type !== "bullet") 
			bullet = objectPools.bullet.pop();
		bullet.width = this.width / 4;
		bullet.height = this.height / 4;
		bullet.width = bullet.width < 4 ? 4 : bullet.width;
		bullet.height = bullet.height < 4 ? 4 : bullet.height;
		bullet.x = this.x + this.width/2 - bullet.width/2;
		bullet.y = this.y + this.height/2 - bullet.height/2;
		bullet.xVel = Math.sin(angle * Math.PI / 180) * 10 + (Math.random() - 0.5) + this.xVel;
		bullet.yVel = -Math.cos(angle * Math.PI / 180) * 10 + (Math.random() - 0.5) + this.yVel;
		bullet.colour = this.colour;
		bullet.playerIndex = this.playerIndex;
		bullet.setKillTime();
		physicalObjects.push(bullet);
	},
	shot: function(playerIndex) {

		if(!this.alive) return;

		if(this.width > 2) {
			this.shedLayer(~~(playerIndex));
		} else {
			this.width = 0;
			this.height = 0;
			this.alive = false;
			playerKilled(~~(this.playerIndex));
		}
	},
	shedLayer: function(playerIndex) {

		this.width -= 2;
		this.height -= 2;

		physicalObjects[~~(playerIndex)].width += 2;
		physicalObjects[~~(playerIndex)].height += 2;

		var layerCount = (this.width * 2) + (this.height * 2) - 4;

		for(var i = 0; i < layerCount; i++) {
			var angle = (360 / layerCount) * i;
			var particle = objectPools.homingparticle.pop();
			particle.x = this.x;
			particle.y = this.y;
			particle.xVel = Math.sin(angle * Math.PI / 180) * 10 + Math.random();
			particle.yVel = -Math.cos(angle * Math.PI / 180) * 10 + Math.random();
			particle.colour = this.colour;
			particle.setDestinationObject(~~(playerIndex));
			physicalObjects.push(particle);
		}
	},
	processStep: function() {

		if(!this.alive) return;

		var pixelCount = this.pixelCount();

		if(this.speed() !== 0) {
			this.xVel *= 1 - this.drag;
			this.yVel *= 1 - this.drag;
		}

		if( Math.abs(this.xVel) + Math.abs(this.yVel) > this.maxSpeed) {
			this.xVel = this.maxSpeed * this.xVel / ( Math.abs(this.xVel) + Math.abs(this.yVel) );
			this.yVel = this.maxSpeed * this.yVel / ( Math.abs(this.xVel) + Math.abs(this.yVel) );
		}

		this.sightX = this.xVel;

		this.xVelSmoother.unshift(this.xVel);
		this.xVelSmoother.pop();
		var xVal = this.getSmootherValue(this.xVelSmoother); 

		this.sightY = this.yVel;

		this.yVelSmoother.unshift(this.yVel);
		this.yVelSmoother.pop();
		var yVal = this.getSmootherValue(this.yVelSmoother);
		
		this.x += xVal;
		this.y += yVal;
	}
});