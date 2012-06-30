Crafty.c("Agent", {
	
	// Target entity.
	_targets: null,
	
	// Reference to all other agents.
	_agents: null,
	
	// Current agent behavior.
	_state: "pursuit",
	
	// Max. speed.
	_maxSpeed: 5,
	
	// Max force.
	_maxForce: 10,
	
	// Mass of this Agent.
	_mass: 10,
	
	// Motion vectors.
	_accel: new Vector(0,0),
	_velocity: new Vector(0,0),
	
	/*
	 * ---
	 * Steering Behaviors
	 * --- 
	 */
	 
	// A method that calculates a steering vector towards a target
	// Takes a second argument, if true, it slows down as it approaches the target
	_steer: function(target, slowdown) {
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
	
	_seek: function(target_pos) {
		// If no target was provided, attempt to use the first Entity in the
		// this._targets array.
		if(!target_pos && this._targets.length !== undefined){
			target_pos = new Vector(this._targets[0].x, this._targets[0].y);
		} else {
			throw new Error("Agent._seek failed.  No target was provided.");
		}
		
		var steer = this._steer(target_pos, false);
		
		return steer;
	},
	
	_flee: function(quary_pos) {
		// TODO
	},
	
	_align: function(targets) {
		// TODO
	},
	
	_cohesion: function(targets) {
		// TODO
	},
	
	_separation: function(targets) {
		// TODO
	}, 
	
	_pursuit: function() {
	
		// If the current target doesn't have a velocity vector, throw an error.
		if(this._target._velocity == undefined) {
			throw(new Error("Agent target does not have velocity."));
			return;
		}
		
		// Where do we think the target will be next?
		var nextTargetPos = new Vector(
			this._target.x + this._target._velocity.x,
			this._target.y + this._target._velocity.y
		);
		
		// TODO: This is a really bad predicter.  Fix it.
		var radius = this._target.w + 25;
		nextTargetPos.len(nextTargetPos.len() - radius);
		
		// Apply the predicted target position to the seek steering vector.
		return this._seek(nextTargetPos);
	},
	
	_wandertheta: null,
	_wander:function() {
		// Radius for our "wander circle"
		var wanderR = 50.0;
		
		// Distance for our "wander circle"
		var wanderD = 60.0;
		
		// Randomly change wander theta
		var change = 0.25;
		if(this._wandertheta == null) this._wandertheta = 0;
		this._wandertheta += Crafty.math.randomNumber(-change,change);     

		// Now we have to calculate the new location to steer towards on the wander circle
		// Start with velocity (if available).
		var circleloc;
		if(this._velocity.x>0 && this._velocity.y>0) {
			circleloc = this._velocity.copy();
		} else {
			circleloc = new Vector(Math.random(), Math.random());
		}
		
		// Normalize to get heading
		circleloc.normalize();
		
		// Multiply by distance
		circleloc = circleloc.mult(wanderD);
		// Make it relative to agent's location
		circleloc = circleloc.add(new Vector(this.x, this.y));
		
		var circleOffSet = new Vector(wanderR*Math.cos(this._wandertheta),
										wanderR*Math.sin(this._wandertheta));
										
		var newTarget = circleloc.add(circleOffSet);
		
		return this._steer(newTarget);
	},
	
	_move: function() {
		// Calculate acceleration.
		var force = new Vector(0,0);
		force = force.add(this._wander());
		force.normalize();
		force = force.add(this._seek());
		force.normalize();
		
		this._accel.x = force.x / this._mass;
		this._accel.y = force.y / this._mass;
		
		// Calculate and truncate speed.
		this._velocity = this._velocity.add(this._accel);
		this._velocity.trunc(this._maxSpeed);
		
		// Move me!
		this.attr({
			x: this.x + this._velocity.x,
			y: this.y + this._velocity.y,
			// TODO: Fix this rotation code.  It sucks.
			rotation: Crafty.math.radToDeg(Math.atan2(this._velocity.y, this._velocity.x))
		});
		
		// Reset acceleration.
		this._accel.x = 0;
		this._accel.y = 0;
	},
	
	// Iterate!
	_tick: function(e) {
		// Move the entity.
		this._move();
	},
	
	// Initialize the agent.
	agent: function(targets /* Entity */) {
		// If only one target was provided, put it in an array.
		this._targets = [].concat(targets);
		this.origin("center");
		this.bind("EnterFrame", function(e){
			this._tick.apply(this, e);
		})
	},
	
	// Set agent's state.
	state:function(newState) {
		if(arguments==0) {
			return this._state;
		}
		
		// Update state.
		this._state = newState;
	}
});