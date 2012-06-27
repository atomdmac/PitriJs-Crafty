Crafty.c("Agent", {
	
	// Target entity.
	target: null,
	
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
	
	// Current steering vector.
	_steer: null,
	
	/*
	 * ---
	 * Steering Behaviors
	 * --- 
	 */
	
	_arrival: function(target_pos) {
		if(!target_pos){
			target_pos = this.target;
		}
		
		var slowingDistance = 120;
		var targetOffset = new Vector(target_pos.x - this.x, target_pos.y - this.y);
		var distance = targetOffset.len();
		var rampedSpeed = this._maxSpeed * (distance / slowingDistance)
		var clippedSpeed = Math.min(rampedSpeed, this._maxSpeed)
		
		// TODO: This is very messy.  Clean it up before anyone finds out.
		var clipxdist = (clippedSpeed / distance);
		var desiredVelocity = new Vector(clipxdist * targetOffset.x, clipxdist * targetOffset.y);
		// var desiredVelocity = (clippedSpeed / distance) * targetOffset
		
		this._steer = desiredVelocity.sub(this._velocity);
	},
	
	_seek: function(target_pos) {
		if(!target_pos){
			target_pos = this.target;
		}
		
		var currentPos = new Vector(this.x,this.y);
		var targetPos = new Vector(target_pos.x, target_pos.y);
		
		// var desired = currentPos.sub(targetPos);
		var desired = targetPos.sub(currentPos);
		
		// Scale the desired velocity vector to maxSpeed.
		desired.normalize();
		desired = desired.mult(this._maxSpeed);
		
		this._steer = desired.sub(this._velocity);
		// this._steer = this._velocity.sub(desired);
		this._steer.trunc(this._maxForce);
	},
	
	_pursuit: function() {
	
		// If the current target doesn't have a velocity vector, throw an error.
		if(this.target._velocity == undefined) {
			throw(new Error("Agent target does not have velocity."));
			return;
		}
		
		// Where do we think the target will be next?
		var nextTargetPos = new Vector(
			this.target.x + this.target._velocity.x,
			this.target.y + this.target._velocity.y
		);
		
		// TODO: This is a really bad predicter.  Fix it.
		var radius = this.target.w + 25;
		nextTargetPos.len(nextTargetPos.len() - radius);
		
		// Apply the predicted target position to the seek steering vector.
		this._seek(nextTargetPos);
	},
	
	_flee: function(quary_pos) {
		// TODO
	},
	
	_wandertheta: null,
	_wander:function() {
		// Radius for our "wander circle"
		var wanderR = 50.0;
		
		// Distance for our "wander circle"
		var wanderD = 60.0;
		
		// Randomly change wander theta
		var change = 0.45;
		if(this.wandertheta == null) this.wandertheta = 0;
		this.wandertheta += Crafty.math.randomNumber(-change,change);     

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
		
		// Make it relative to boid's location
		circleloc = circleloc.add(new Vector(this.x, this.y));
		
		var circleOffSet = new Vector(wanderR*Math.cos(this.wandertheta),
										wanderR*Math.sin(this.wandertheta));
										
		var newTarget = circleloc.add(circleOffSet);
		
		this._seek({x: newTarget.x, y:newTarget.y});
	},
	
	_move: function() {
		// Calculate acceleration.
		this._accel.x = (this._steer.x / this._mass);
		this._accel.y = (this._steer.y / this._mass);
		
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
	},
	
	// Iterate!
	_tick: function(e) {
		// Do nothing if paused.
		// if(Crafty.isPaused()) return;
		
		// Calculate steering vector.
		this["_"+this._state]();
		
		// Move the entity.
		this._move();
	},
	
	// Initialize the agent.
	agent: function(target /* Entity */) {
		this.target = target;
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