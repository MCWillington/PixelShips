var AI = PixelShip.extend({
	construct: function(x,y,colour) {
		this.super.construct.call(this,x,y,10,10,colour);
		this.minSpeed = 2;
		this.maxSpeed = 6;
		this.difficulty = 0.4;
	},
	velocityBurst: function(power) {
		power = power || 1;
		this.setXVel( (Math.random() - 0.5) * power );
		this.setYVel( (Math.random() - 0.5) * power );
	},
	confrontShip: function(ship) {
		var angleToShip = this.angleTo(ship.x,ship.y);
		var distanceToShip = this.distanceTo(ship);
		if(distanceToShip < 200)
			this.velocityBurst(10);
    	this.setYVel(-Math.sin(angleToShip * Math.PI / 180) * this.difficulty * Math.random());
		this.setXVel(-Math.cos(angleToShip * Math.PI / 180) * this.difficulty * Math.random());
	},
	shipInRange: function(ship) {
		var angleToShip = this.angleTo(ship.x,ship.y);
		var angleOfVelocity = this.angleTo(this.x + this.sightX, this.y + this.sightY);
		if(Math.abs(angleToShip - angleOfVelocity) < 30)
			return true;
	},
	processStep: function() {

		var closestShip = this.closestShip();
		this.confrontShip(closestShip);

		if(this.shipInRange(closestShip) && winner === false)
			this.shoot();

		this.super.processStep.call(this);
	}
});