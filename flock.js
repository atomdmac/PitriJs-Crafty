Crafty.c("Flock", {
	_agents: [],
	_steer: function(target) {
		var steer,
		desired = target.sub(new Vector(this.x, this.y)),
		d = desired.len();
		if (d > 0) {
			// Two options for desired vector magnitude (1 -- based on distance, 2 -- maxSpeed)
			if (slowdown && d < 100) {
				desired.len(this._maxSpeed * (d / 100)); // This damping is somewhat arbitrary
			} else {
				desired.len(this._maxSpeed);
			}
			steer = desired.sub(this._velocity);
			steer.len(Math.min(this._maxForce, steer.len()));
		} else {
			steer = new Vector(0, 0);
		}
		
		return steer;
	},
	_align: function(agents) {
		var total = new Vector(0,0);
		for(a in this._agents) {
			total = total.add(this._agents._velocity);
		}
		return total.div(new Vector(this._agents.length, this._agents.length));
	},
	_cohesion: function(agents) {
		// TODO
	},
	_separation: function(agents) {
		// TODO
	},
	_tick: function() {
		for(var a in this._agents) {
			this._agents[a]._tick();
		}
	},
	flock: function(maxAgents,target,weighting) {
		// Create agents
		for(var i=0; i<maxAgents; i++) {
			var newAgent = Crafty.e("2D, DOM, Color, Agent")
			
			newAgent.color("rgb(0,255,0)")
				.attr({
					x: Crafty.math.randomInt(0, 500),
					y: Crafty.math.randomInt(0, 500),
					w: 25,
					h: 25
				})
			
			// Set initial velocity.
			newAgent._velocity = new Vector(Crafty.math.randomNumber(-1,1), Crafty.math.randomNumber(-1,1));
			
			// Give agent the list of other agents.
			newAgent.agent(this._agents, target);
			
			// Add agent to the pile!
			this._agents.push(newAgent);
		}
		
		// Start ticking.
		this.bind("EnterFrame", function(e){
			this._tick.apply(this, e);
		})
	}
});