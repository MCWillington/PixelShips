var PhysicalObject = BaseClass.extend({
	construct: function(x,y,w,h,colour) {
		this.x 			= x;
		this.y 			= y;
		this.width 		= w;
		this.height 	= h;
		this.xVel 		= 0;
		this.yVel 		= 0;
		this.rotation 	= 0;
		this.mass 		= 1;
		this.maxSpeed	= 10;
		this.state 		= "";
		this.alive 		= true;
		this.type		= "";
		this.playerIndex = null;

		this.colour		= {
			red: 		255,
			green: 		255,
			blue: 		255,
			opacity: 	255
		};

		if(colour == 'red')
			this.colour.red = 255;
		if(colour == 'yellow')
			this.setColour(255,255,0,255);
		if(colour == 'green')
			this.colour.green = 255;
		if(colour == 'blue')
			this.colour.blue = 255;
	},
	getColour: function() {
		return "rgba("+this.colour.red+","+this.colour.green+","+this.colour.blue+","+this.colour.opacity+")";
	},
	setColour: function(r,g,b,o) {
		this.colour.red = r;
		this.colour.green = g;
		this.colour.blue = b;
		this.colour.opacity = o;
	},
	setXVel: function(vel) {
		this.xVel += vel;
	},
	setYVel: function(vel) {
		this.yVel += vel;
	},
	speed: function() {
		return Math.abs(this.xVel) + Math.abs(this.yVel);
	},
	angleTo: function(x,y) {
		return Math.atan2(this.y - y, this.x - x) * 180 / Math.PI;
	},
	distanceTo: function(obj) {
		return Math.abs(obj.x - this.x) + Math.abs(obj.y - this.y);
	},
	closestShip: function() {
		var closestShip = 0;
		var distance = 9999999;
		for(var i = 0; i < playerObjects.length; i++) {
			if(this.distanceTo(playerObjects[i]) < distance &&
				playerObjects[i].playerIndex !== this.playerIndex &&
				playerObjects[i].alive) {
				closestShip = i;
				distance = this.distanceTo(playerObjects[i]);
			}
		}
		return playerObjects[closestShip];
	},
	pixelCount: function() {
		return this.width * this.height;
	},
	shot: function(playerIndex) {
		return false;
	},
	offscreen: function() {
		return;
	},
	processStep: function() {
		if( Math.abs(this.xVel) + Math.abs(this.yVel) > this.maxSpeed) {
			this.xVel = this.maxSpeed * this.xVel / ( Math.abs(this.xVel) + Math.abs(this.yVel) );
			this.yVel = this.maxSpeed * this.yVel / ( Math.abs(this.xVel) + Math.abs(this.yVel) );
		}
		this.x += this.xVel;
		this.y += this.yVel;
	},
    destroy: function() {
        var objectPool = objectPools[this.type];
        var index = physicalObjects.indexOf(this);
        objectPool.push( physicalObjects.splice(index,1)[0] );
    }
});