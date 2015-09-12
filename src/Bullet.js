var Bullet = PhysicalObject.extend({
	construct: function(x,y,w,h,colour) {
		this.super.construct.call(this,x,y,w,h,colour);
		this.lifeTime = 400;
		this.maxSpeed = 1000;
		this.homingPower = 0.1;
		this.type = "bullet";
	},
	setKillTime: function() {
		this.killTime = new Date(new Date().getTime() + this.lifeTime);	
	},
	processStep: function() {

		for(var i = 0; i < physicalObjects.length; i++) {
			
			if (this.x < physicalObjects[i].x + physicalObjects[i].width &&
			   	this.x + this.width > physicalObjects[i].x &&
			   	this.y < physicalObjects[i].y + physicalObjects[i].height &&
			   	this.height + this.y > physicalObjects[i].y &&
			   	physicalObjects[i].type == "pixelShip" &&
			   	this.playerIndex !== physicalObjects[i].playerIndex) {
			   	// collision detected!
			   	this.destroy();
			   	physicalObjects[i].shot(this.playerIndex);
			}
		}

		// homing maths
		var closestShip = this.closestShip();
		var angleToDest = this.angleTo(closestShip.x,closestShip.y);
        this.yVel += -Math.sin(angleToDest * Math.PI / 180) * this.homingPower;
		this.xVel += -Math.cos(angleToDest * Math.PI / 180) * this.homingPower;


		var ttl = this.killTime - new Date();
	        if(ttl < 0)
	            this.destroy();
	        else
	            this.super.processStep.call(this);
	}
});