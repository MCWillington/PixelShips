var HomingParticle = PhysicalObject.extend({
	construct: function(x,y,w,h,colour) {
		this.super.construct.call(this,x,y,w,h,colour);
		this.xDest = 0;
		this.yDest = 0;
		this.accuracy = 10;
		this.power = 3;
		this.maxSpeed = 8;
		this.type = "homingparticle";
	},
	setDestinationObject: function(index) {
		this.destinationObject = index;
	},
	offscreen: function() {
		this.destroy();
		return true;
	},
	processStep: function() {

        if(	this.x > physicalObjects[this.destinationObject].x - this.accuracy &&
        	this.x < physicalObjects[this.destinationObject].x + this.accuracy &&
        	this.y > physicalObjects[this.destinationObject].y - this.accuracy &&
        	this.y < physicalObjects[this.destinationObject].y + this.accuracy   ) {
            this.destroy();
        } else {
        	var angleToDest = this.angleTo(physicalObjects[this.destinationObject].x,physicalObjects[this.destinationObject].y);
        	this.yVel += -Math.sin(angleToDest * Math.PI / 180) * this.power;
			this.xVel += -Math.cos(angleToDest * Math.PI / 180) * this.power;
            this.super.processStep.call(this);
        }
	}
});