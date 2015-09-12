var win 		= window,
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