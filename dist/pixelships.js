function BaseClass() { }
BaseClass.prototype.construct = function() {};
BaseClass.__asMethod__ = function(func, superClass) {  
  return function() {
      var currentSuperClass = this.super;
      this.super = superClass;
      var ret = func.apply(this, arguments);      
      this.super = currentSuperClass;
      return ret;
  };
};
 
BaseClass.extend = function(def) {
  var classDef = function() {
      if (arguments[0] !== BaseClass) { this.construct.apply(this, arguments); }
  };
 
  var proto = new this(BaseClass);
  var superClass = this.prototype;
 
  for (var n in def) {
      var item = def[n];                      
 
      if (item instanceof Function) {
          item = BaseClass.__asMethod__(item, superClass);
      }
 
      proto[n] = item;
  }
 
  proto.super = superClass;
  classDef.prototype = proto;
   
  classDef.extend = this.extend;      
  return classDef;
};;var PhysicalObject = BaseClass.extend({
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
});;var Particle = PhysicalObject.extend({
	construct: function(x,y,w,h,colour) {
		this.super.construct.call(this,x,y,w,h,colour);
		this.lifeTime = 300;
		this.type = "particle";
	},
	setKillTime: function() {
		this.killTime = new Date(new Date().getTime() + this.lifeTime);	
	},
	processStep: function() {

		var ttl = this.killTime - new Date();

		this.colour.opacity = 255 * (ttl / this.lifeTime);

        if(ttl < 0)
            this.destroy();
        else
            this.super.processStep.call(this);
	}
});;var HomingParticle = PhysicalObject.extend({
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
});;var Bullet = PhysicalObject.extend({
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
});;var PixelShip = PhysicalObject.extend({
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
});;var AI = PixelShip.extend({
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
});;(function() {

	ArrowKeyHandler = {};
	ArrowKeyHandler.loopInterval = 20;
	ArrowKeyHandler.callback = function(playerIndex,action){};
	
	ArrowKeyHandler.sprayShoot = true;
	ArrowKeyHandler.keyMap = {

		0: {
			'left'	: 37, 	// Left Arrow
			'up' 	: 38, 	// Up Arrow
			'right' : 39, 	// Right Arrow
			'down' 	: 40, 	// Down Arrow
			'shoot' : 32 	// Space
		},
		1: {
			'left' 	: 65, 	// A
			'up' 	: 87, 	// W
			'right' : 68, 	// D
			'down' 	: 83, 	// S
			'shoot' : 90 	// Z
		},
		2: {
			'left' 	: 74, 	// J
			'up' 	: 73, 	// I
			'right' : 76, 	// L
			'down' 	: 75, 	// K
			'shoot' : 77 	// M
		},
		3: {
			'left' 	: 100, 	// numpad 4
			'up' 	: 104, 	// numpad 8
			'right' : 102, 	// numpad 6
			'down' 	: 101, 	// numpad 5
			'shoot' : 98 	// numpad 2
		}

	};

	var keys = {};
	document.onkeydown = function(event){
		keys[event.which] = true;
		event.preventDefault();

		if(event.which == ArrowKeyHandler.keyMap[0]['shoot'] && !ArrowKeyHandler.sprayShoot)
			ArrowKeyHandler.callback(0,'shoot');

		if(event.which == ArrowKeyHandler.keyMap[1]['shoot'] && !ArrowKeyHandler.sprayShoot)
			ArrowKeyHandler.callback(1,'shoot');

		if(event.which == ArrowKeyHandler.keyMap[2]['shoot'] && !ArrowKeyHandler.sprayShoot)
			ArrowKeyHandler.callback(2,'shoot');

		if(event.which == ArrowKeyHandler.keyMap[3]['shoot'] && !ArrowKeyHandler.sprayShoot)
			ArrowKeyHandler.callback(3,'shoot');

	}
	document.onkeyup = function(event){
		delete keys[event.which];
		event.preventDefault();
	}

	ArrowKeyHandler.reset = function() {
		keys = {};
	}
	
	function callbackLoop() {
		
		for(var key in keys) {
			for (var playerKey in ArrowKeyHandler.keyMap) {
				for (var action in ArrowKeyHandler.keyMap[playerKey]) {	
					if(key == ArrowKeyHandler.keyMap[playerKey][action]) {
						if(action != "shoot" || ArrowKeyHandler.sprayShoot)
							ArrowKeyHandler.callback(playerKey,action);
					}
				}
			}
		}
			
		setTimeout(callbackLoop, 20);
		
	} callbackLoop();

})();;var win 		= window,
	d 			= document,
	e 			= d.documentElement,
	g 			= d.getElementsByTagName('body')[0],
 	width 		= win.innerWidth || e.clientWidth || g.clientWidth,
 	height 		= win.innerHeight|| e.clientHeight|| g.clientHeight;

var objectPools = [];
objectPools.pixelShip = [];
objectPools.particle = [];
for(var i = 0; i < 10000; i++) {
    var particle = new Particle(1,1,1,1,'');
    objectPools.particle.push(particle);
}
objectPools.homingparticle = [];
for(var i = 0; i < 10000; i++) {
    var homingparticle = new HomingParticle(1,1,1,1,'');
    objectPools.homingparticle.push(homingparticle);
}
objectPools.bullet = [];
for(var i = 0; i < 10000; i++) {
    var bullet = new Bullet(1,1,1,1,'');
    objectPools.bullet.push(bullet);
}
var physicalObjects = [];
var playerObjects = [];
var players = [];
var winner = false;

window.onload = function() {

	var canvas = document.createElement("canvas");
	canvas.id = "canvas";
	document.body.appendChild(canvas);

	var context = canvas.getContext("2d");	

	canvas.width  = width;
	canvas.height = height;

	render = function() {

		// Clear view
		context.clearRect(0, 0, width, height);

		for(var i = 0; i < physicalObjects.length; i++) {

			// Right edge
            if (physicalObjects[i].x - (physicalObjects[i].width / 2) > canvas.width) {
            	physicalObjects[i].x = -physicalObjects[i].width / 2;
            	if(physicalObjects[i].offscreen())
                	continue;
            }
                    
            // Left edge
            if (physicalObjects[i].x + (physicalObjects[i].width / 2) < 0) {
                physicalObjects[i].x = canvas.width + physicalObjects[i].width / 2;
                if(physicalObjects[i].offscreen())
                	continue;
            }
            
            // Bottom edge
            if (physicalObjects[i].y - (physicalObjects[i].height / 2) > canvas.height) {
                physicalObjects[i].y = -physicalObjects[i].height / 2;
                if(physicalObjects[i].offscreen())
                	continue;
            }

            // Top edge
            if (physicalObjects[i].y + (physicalObjects[i].height / 2) < 0) {
                physicalObjects[i].y = canvas.height + physicalObjects[i].height / 2;
                if(physicalObjects[i].offscreen())
                	continue;
            }

			if (!physicalObjects[i].alive)
				continue;

			if(physicalObjects[i].type == "pixelShip" || physicalObjects[i].type == "homingparticle") {
				context.fillStyle = "rgba(255,255,255,50)";
				context.fillRect( physicalObjects[i].x - 3, physicalObjects[i].y - 3, physicalObjects[i].width + 6, physicalObjects[i].height + 6 );
				context.fillStyle = "rgba(255,255,255,50)";
				context.fillRect( physicalObjects[i].x - 2, physicalObjects[i].y - 2, physicalObjects[i].width + 4, physicalObjects[i].height + 4 );	
				context.fillStyle = "rgba(255,255,255,50)";
				context.fillRect( physicalObjects[i].x - 1, physicalObjects[i].y - 1, physicalObjects[i].width + 2, physicalObjects[i].height + 2 );	
			}
			context.fillStyle = physicalObjects[i].getColour();
			context.fillRect( physicalObjects[i].x, physicalObjects[i].y, physicalObjects[i].width, physicalObjects[i].height );
			
			if(physicalObjects[i].type == "pixelShip") {
				var x = physicalObjects[i].sight()[0];
				var y = physicalObjects[i].sight()[1];
				context.beginPath();
				context.strokeStyle = physicalObjects[i].getColour();
				context.moveTo(x - 20, y);
				context.lineTo(x + 20, y);
				context.stroke();
				context.beginPath();
				context.strokeStyle = physicalObjects[i].getColour();
				context.moveTo(x, y - 20);
				context.lineTo(x, y + 20);
				context.stroke();
 			}


			physicalObjects[i].processStep();
		}
		
	}	

	loopRender = function() {
		requestAnimationFrame(loopRender);
		render();
	}

	ArrowKeyHandler.callback = function(playerIndex,action) { 

		if(playerIndex === "0" && action === "shoot") {

			document.getElementById("desktop-intro").style.display = 'none';

			var players = getPlayerCount();
			var humans =  getHumanCount();

			addPlayers( players, humans );

			ArrowKeyHandler.callback = function(playerIndex,action) { 
				if(action == "shoot")
					physicalObjects[playerIndex].shoot();
				if(action == "up")
					physicalObjects[playerIndex].setYVel(-0.3);
				if(action == "down")
					physicalObjects[playerIndex].setYVel(0.3);
				if(action == "left")
					physicalObjects[playerIndex].setXVel(-0.3);
				if(action == "right")
					physicalObjects[playerIndex].setXVel(0.3);
			}

			render();

			countdown = 4;

			startInterval = setInterval(function(){
				if(countdown > 1){
					countdown--;
					document.getElementById("countdown").innerHTML = countdown;
				} else {
					clearInterval(startInterval);
					ArrowKeyHandler.reset();
					document.getElementById("countdown").innerHTML = "";
					loopRender();
				}
			},1000);
		}
	}
}

function playerKilled(index) {

	var livePlayers = [];
	for(var i = 0; i < players.length; i++) {
		if(physicalObjects[i].alive)
			livePlayers.push(i);
	}

	if(livePlayers.length === 1) {
		winner = livePlayers[0];
		for(var keys in ArrowKeyHandler.keys)
			delete key;
		alert( "Winner is opponent " + (~~(livePlayers[0])+1) );
		document.getElementById("countdown").innerHTML = "Refresh to play again!";
	}

}

function getPlayerCount() {

    var count = null;
    while(count == null || isNaN(count) || count < 2 || count > 4) 
    	count = prompt("How many opponents? (2-4)", 4);

    return count;
}

function getHumanCount() {
	
    var count = null;
    while(count == null || isNaN(count) || count < 0 || count > 2) 
    	count = prompt("How many players? (0-2)", 1);

    return count;
}

function addPlayers(count,humans) {

	// 2 is min
	if(count < 2)
		count = 2;

	// 4 is max
	if(count > 4)
		count = 4;

	// 4 is max
	if(humans > 4)
		humans = 4;

	var thirdWidth = canvas.width/3;
	var thirdHeight = canvas.height/3;

	// Create the 4 ships in play
	for(var i = 0; i < count; i++) {
		
		if(humans >= i+1)
			var ship = new PixelShip(0,0,'');
		else
			var ship = new AI(0,0,'');
		
		ship.playerIndex = ~~(i);

		if(i == 0) {
			ship.x = thirdWidth;
			ship.y = thirdHeight;	
			ship.setColour(255,0,204,255);
		}
		if(i == 1) {
			ship.x = thirdWidth*2;
			ship.y = thirdHeight;	
			ship.setColour(204,255,0,255);
		}
		if(i == 2) {
			ship.x = thirdWidth;
			ship.y = thirdHeight*2;	
			ship.setColour(0,204,255,255);
		}
		if(i == 3) {
			ship.x = thirdWidth*2;
			ship.y = thirdHeight*2;	
			ship.setColour(204,0,255,255);
		}

		var playerIndex = physicalObjects.push(ship);
		playerObjects.push(ship);
		players.push(playerIndex);
	}
}