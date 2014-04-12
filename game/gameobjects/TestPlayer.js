var util = require('util');
var BoardObject = require('./BoardObject');
var Caster = require('./Caster');

var ScriptService = require('../contents/services/ScriptService');
var CombatService = require('../contents/services/CombatService');
var TestPlayer = function(world) {
	TestPlayer.super_.call(this, world);
	this.setSpriteSheet(new createjs.SpriteSheet({
		"images" : [ world.assets.getResult("m_mage") ],
		"frames" : {
			"regX" : 105,
			"height" : 210,
			"count" : 50,
			"regY" : 130,
			"width" : 260
		},
		"animations" : {
			"stand" : [ 0, 1, "stand" ],
			"initRun" : [ 2, 4, "run", 6 ],
			"run" : [ 5, 8, "run", 3 ],
			"attack" : [ 32, 45, "stand", 3 ],
		}
	}));
	this.defaultAnimation = "stand";

	// register to script service
	world.services[ScriptService.NAME].setContext(this);
	world.services[ScriptService.NAME].setCallback((function(e) {
		if (e.status == 0) {
			// rollback
		} else {
			this.triggerAction_();
		}
	}).bind(this));

	this.myTurn = {};
	world.services[CombatService.NAME].subscribe(CombatService.Events.NextTurn,
			(function(event) {
				if (event.turn == CombatService.TurnAlly) {
					this.myTurn = event;
					this.triggerAction_();
				}
			}.bind(this)));

	console.log("player initialized");
	this.initialize();
};

// util.inherits(Caster, BoardObject);
util.inherits(TestPlayer, Caster);

/**
 * whenever triggerAction , we go to next turn
 */
TestPlayer.prototype.triggerAction = function() {
	this.world.services[CombatService.NAME].nextTurn(this.myTurn);
};

/**
 * the original triggerAction method
 */
TestPlayer.prototype.triggerAction_ = function() {
	TestPlayer.super_.prototype.triggerAction.apply(this);
};
TestPlayer.prototype.onCast_ = function(onComplete, onCastActionComplete) {
	var done = function() {
		if (onCastActionComplete instanceof Function) {
			onCastActionComplete();
		}
		if (onComplete instanceof Function) {
			onComplete();
		}
	};
	this.gotoAndPlay("attack", done);
}

TestPlayer.prototype.onStartMoving_ = function() {
	this.gotoAndPlay("initRun");
};

TestPlayer.prototype.onStopMoving_ = function() {
	this.gotoAndPlay("stand");
};
module.exports = TestPlayer;