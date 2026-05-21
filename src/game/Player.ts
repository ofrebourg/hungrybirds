import { createjs } from "../lib/createjs";
import { FRAMERATE, SCALE, TYPE_PLAYER } from "./constants";
import {
	SOUND_COLLISION,
	playSound,
	randomAngrySound,
	randomHappySound,
	randomNeutralSound,
} from "./sounds";
import { gameState, makeTheWorldIcy } from "./state";
import {
	degToRad,
	radToDeg,
	randomRange,
} from "./util";
import {
	OBJ_ATTR_BEER,
	OBJ_ATTR_BRAKES,
	OBJ_ATTR_FROZEN,
	OBJ_ATTR_GRIP,
	OBJ_ATTR_SPEED,
	OBJ_ATTR_TURBO,
	BONUS_OBJ_BRAKES,
	BONUS_OBJ_GRIP,
	BONUS_OBJ_SPEED,
} from "./constants";

const MIN_SPEED = 0.1;
const MAX_SPEED = 700;
const MIN_BRAKE_FORCE = 0.005;
const MAX_BRAKE_FORCE = 0.2;
const MIN_ANGULAR_BRAKE_FORCE = 0.1;
const MAX_ANGULAR_BRAKE_FORCE = 0.8;
const MIN_PUSH = 0.1;
const MAX_PUSH = 2;
const NO_STEALING_TIME = 5;
const TIME_TO_GET_SOBER = 5;
const RANDOM_DRUNK_ANGLE = 45;
const RANDOM_DRUNK_SPEED_MODIFIER_MIN = 1;
const RANDOM_DRUNK_SPEED_MODIFIER_MAX = 2;
const LINEAR_DAMPING = 1.0;
const ANGULAR_DAMPING = 1.0;
const MIN_GRIP = 0.4;
const MAX_GRIP = 1;

let gamePaused = true;
let controlsEnabled = true;
let lfHeld = false, rtHeld = false, fwdHeld = false, bwdHeld = false;
let turnLeftDone = false, turnRightDone = false;
let previousPosition = { x: 0, y: 0 };

const KEYCODE_LEFT = 37;
const KEYCODE_UP = 38;
const KEYCODE_RIGHT = 39;
const KEYCODE_DOWN = 40;
const KEYCODE_P = 80;

export function Player(this: any, playerNumber: number, x: number, y: number, startingAngle: number) {
	const playerRadius = 15;
	const playerOffsetCenter = 5;

	this.view = new createjs.Bitmap("images/players/playerRound" + playerNumber + ".png");
	this.view.regX = playerRadius + playerOffsetCenter;
	this.view.regY = playerRadius + playerOffsetCenter;

	const fixDef = new gameState.b2d.b2FixtureDef();
	fixDef.density = 70;
	fixDef.friction = 0.5;
	fixDef.restitution = 0.5;

	const bodyDef = new gameState.b2d.b2BodyDef();
	bodyDef.type = gameState.b2d.b2Body.b2_dynamicBody;
	bodyDef.position = new gameState.b2d.b2Vec2(x / SCALE, y / SCALE);
	fixDef.shape = new gameState.b2d.b2CircleShape(playerRadius / SCALE);

	this.view.body = gameState.world.CreateBody(bodyDef);
	this.view.body.CreateFixture(fixDef);
	this.view.body.SetAngle(degToRad(startingAngle));
	this.view.on("tick", playerTick);

	this.view.turn = turn;
	this.view.accelerate = accelerate;
	this.view.brake = brake;
	this.view.consume = consume;
	this.view.updateFriction = updateFriction;
	this.view.theWorldJustChanged = false;
	this.view.parametersAreCorrect = parametersAreCorrect;
	this.view.playerAIMovement = defaultPlayerMove;
	this.view.body.attributes = { stealing: 0, speed: 0, brakes: 0, pushing: 0, grip: 0 };
	this.view.validateAttributes = validateAttributes;

	this.view.body.SetLinearDamping(LINEAR_DAMPING * gameState.world.friction);
	this.view.body.SetAngularDamping(ANGULAR_DAMPING * gameState.world.friction);
	this.view.body.drunk = false;
	this.view.body.drunkCountdown = 0;

	this.view.playerNumber = playerNumber;
	this.view.score = 0;
	this.view.stealingPower = stealingPower;
	this.view.stealFromPlayer = stealFromPlayer;
	this.view.canSteal = true;
	this.view.stealingEnableCountdown = 0;
	this.view.push = push;
	this.view.turbo = turbo;
	this.view.stop = stop;
	this.view.getOtherPlayersInfo = getOtherPlayersInfo;
	this.view.body.SetUserData({ type: TYPE_PLAYER, player: this.view });

	this.view.getPosition = function () { return { x: this.x, y: this.y }; };
	this.view.getOrientation = function () { return this.rotation; };

	this.enableControls = function (c: boolean) { controlsEnabled = c; };

	previousPosition = { x, y };

	document.onkeydown = handleKeyDown;
	document.onkeyup = handleKeyUp;
}

function stop(this: any) {
	this.canSteal = false;
	brake(this.body);
	gamePaused = true;
}

function getOtherPlayersInfo(this: any) {
	return gameState.players
		.filter((p) => p.view.playerNumber !== this.playerNumber)
		.map((p) => ({
			playerNumber: p.view.playerNumber,
			position: p.view.getPosition(),
			score: p.view.score,
		}));
}

function stealingPower(this: any) {
	return this.canSteal ? this.body.attributes.stealing / 100 : 0;
}

function stealFromPlayer(this: any, otherPlayer: any, points: number) {
	this.score += points;
	otherPlayer.score -= points;
	this.canSteal = false;
	this.stealingEnableCountdown = NO_STEALING_TIME * FRAMERATE;
}

function validateAttributes(this: any) {
	this.updateFriction();
}

function parametersAreCorrect(this: any) {
	const attrs = this.body.attributes;
	let total = 0;
	for (const key of ["stealing", "speed", "brakes", "pushing", "grip"] as const) {
		if (attrs[key] < 0 || attrs[key] > 100) {
			console.log("Incorrect value for attribute '" + key + "'");
			return false;
		}
		total += attrs[key];
	}
	if (total > 100) { console.log("Total of attributes is over 100!"); return false; }
	if (total < 100) console.log("Warning: player " + this.playerNumber + " only has a total of " + total + " out of 100");
	return true;
}

function getGrip(body: any) {
	return (MIN_GRIP + body.attributes.grip / 100) * MAX_GRIP / (MIN_GRIP + 1);
}
function getBrakes(body: any) {
	return (MIN_BRAKE_FORCE + body.attributes.brakes / 100) * MAX_BRAKE_FORCE / (MIN_BRAKE_FORCE + 1);
}
function getBrakesAngular(body: any) {
	return (MIN_ANGULAR_BRAKE_FORCE + body.attributes.brakes / 100) * MAX_ANGULAR_BRAKE_FORCE / (MIN_ANGULAR_BRAKE_FORCE + 1);
}
function getSpeed(body: any) {
	return (MIN_SPEED + body.attributes.speed / 100) * MAX_SPEED / (MIN_SPEED + 1);
}
function getPushingForce(body: any) {
	return (MIN_PUSH + body.attributes.pushing / 100) * MAX_PUSH / (MIN_PUSH + 1);
}

function turn(this: any, body: any, angle: number) {
	if (body.drunk) angle += randomRange(-RANDOM_DRUNK_ANGLE, RANDOM_DRUNK_ANGLE);

	const worldFriction = (gameState.world.isIcy && body.equippedWithWinterTyres) ? 1 : gameState.world.friction;
	const brakeForce = worldFriction * getGrip(body);

	const linear = body.GetLinearVelocity();
	const forceX = linear.x * body.GetMass();
	const forceY = linear.y * body.GetMass();

	body.ApplyImpulse(
		new gameState.b2d.b2Vec2(-forceX * brakeForce, -forceY * brakeForce),
		body.GetWorldCenter(),
	);

	const angleInRadians = degToRad(angle);
	body.SetAngle((body.GetAngle() + angleInRadians) % (2 * Math.PI));

	const forceInNewDirection = worldFriction * getGrip(body);
	body.ApplyImpulse(
		new gameState.b2d.b2Vec2(
			forceInNewDirection * (forceX * Math.cos(angleInRadians) - forceY * Math.sin(angleInRadians)),
			forceInNewDirection * (forceX * Math.sin(angleInRadians) + forceY * Math.cos(angleInRadians)),
		),
		body.GetWorldCenter(),
	);
}

function accelerate(body: any) {
	let speed = getSpeed(body);
	if (body.drunk) speed *= randomRange(RANDOM_DRUNK_SPEED_MODIFIER_MIN, RANDOM_DRUNK_SPEED_MODIFIER_MAX);
	const angle = body.GetAngle();
	body.ApplyForce(
		new gameState.b2d.b2Vec2(Math.sin(angle) * speed, -Math.cos(angle) * speed),
		body.GetWorldCenter(),
	);
}

function brake(body: any) {
	const linear = body.GetLinearVelocity();
	const brakeFactor = getBrakes(body) * getGrip(body);
	body.ApplyImpulse(
		new gameState.b2d.b2Vec2(-linear.x * body.GetMass() * brakeFactor, -linear.y * body.GetMass() * brakeFactor),
		body.GetWorldCenter(),
	);
	body.ApplyTorque(-body.GetAngularVelocity() * body.GetMass() * getBrakesAngular(body));
}

function updateFriction(this: any) {
	const damping = LINEAR_DAMPING * gameState.world.friction * getGrip(this.body);
	this.body.SetLinearDamping(damping);
	this.body.SetAngularDamping(ANGULAR_DAMPING * gameState.world.friction * getGrip(this.body));
}

function push(this: any) {
	const linear = this.body.GetLinearVelocity();
	const m = this.body.GetMass();
	const mod = getPushingForce(this.body);
	this.body.ApplyImpulse(
		new gameState.b2d.b2Vec2(linear.x * m * mod, linear.y * m * mod),
		this.body.GetWorldCenter(),
	);
}

function turbo(this: any) {
	const linear = this.body.GetLinearVelocity();
	const m = this.body.GetMass();
	this.body.ApplyImpulse(
		new gameState.b2d.b2Vec2(linear.x * m * MAX_PUSH, linear.y * m * MAX_PUSH),
		this.body.GetWorldCenter(),
	);
}

function consume(this: any, object: any) {
	if (!object.attributes) return;
	for (const attr of object.attributes) {
		switch (attr) {
			case OBJ_ATTR_FROZEN:
				makeTheWorldIcy();
				break;
			case OBJ_ATTR_BEER:
				this.body.drunk = true;
				this.body.drunkCountdown = TIME_TO_GET_SOBER * FRAMERATE;
				break;
			case OBJ_ATTR_TURBO:
				turbo.call(this);
				break;
			case OBJ_ATTR_BRAKES:
				this.body.attributes.brakes = Math.max(this.body.attributes.brakes, BONUS_OBJ_BRAKES);
				break;
			case OBJ_ATTR_GRIP:
				this.body.attributes.grip = Math.max(this.body.attributes.grip, BONUS_OBJ_GRIP);
				this.body.equippedWithWinterTyres = true;
				break;
			case OBJ_ATTR_SPEED:
				this.body.attributes.speed = Math.max(this.body.attributes.speed, BONUS_OBJ_SPEED);
				break;
		}
	}
}

function defaultPlayerMove(this: any) {
	if (lfHeld && !turnLeftDone) { turn.call(this, this.body, -90); turnLeftDone = true; }
	if (rtHeld && !turnRightDone) { turn.call(this, this.body, 90); turnRightDone = true; }
	if (fwdHeld) accelerate(this.body);
	if (bwdHeld) brake(this.body);
}

function playerTick(this: any) {
	if (!gamePaused) {
		this.playerAIMovement();

		if (gameState.world.isIcy) this.theWorldJustChanged = true;
		if (this.theWorldJustChanged) updateFriction.call(this);
		if (!gameState.world.isIcy) this.theWorldJustChanged = false;

		if (!this.canSteal) {
			this.stealingEnableCountdown--;
			if (this.stealingEnableCountdown <= 0) this.canSteal = true;
		}
		if (this.body.drunk) {
			this.body.drunkCountdown--;
			if (this.body.drunkCountdown <= 0) {
				this.body.drunk = false;
				console.log("Player " + this.playerNumber + " is now sober!");
			}
		}
	}
	this.x = this.body.GetPosition().x * SCALE;
	this.y = this.body.GetPosition().y * SCALE;
	this.rotation = radToDeg(this.body.GetAngle());
}

function handleKeyDown(e: KeyboardEvent) {
	switch (e.keyCode) {
		case KEYCODE_LEFT:  if (controlsEnabled) lfHeld = true; break;
		case KEYCODE_RIGHT: if (controlsEnabled) rtHeld = true; break;
		case KEYCODE_UP:    if (controlsEnabled) fwdHeld = true; break;
		case KEYCODE_DOWN:  if (controlsEnabled) bwdHeld = true; break;
		case KEYCODE_P:
			gamePaused = !gamePaused;
			console.log("game paused? " + (gamePaused ? "yes" : "no"));
			break;
	}
}

function handleKeyUp(e: KeyboardEvent) {
	switch (e.keyCode) {
		case KEYCODE_LEFT:  lfHeld = false; turnLeftDone = false; break;
		case KEYCODE_RIGHT: rtHeld = false; turnRightDone = false; break;
		case KEYCODE_UP:    fwdHeld = false; break;
		case KEYCODE_DOWN:  bwdHeld = false; break;
	}
}
