(function() {

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

})();