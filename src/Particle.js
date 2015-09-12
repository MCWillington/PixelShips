var Particle = PhysicalObject.extend({
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
});