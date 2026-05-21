import { Player } from "../game/Player";
import { findActiveObjects } from "../game/objects";
import {
	OBJ_TYPE_CAR_PART,
	OBJ_ATTR_FROZEN,
	OBJ_ATTR_BEER,
	OBJ_ATTR_GRIP,
	OBJ_ATTR_SPEED,
	OBJ_ATTR_BRAKES,
	OBJ_ATTR_TURBO,
} from "../game/constants";
import { getBoundaries } from "../game/state";
import { conventionalOrientation, degToRad, radToDeg, randomRange, signedAngleBetweenVectors } from "../game/util";
import { gameState } from "../game/state";

// Template for creating a bird agent.
//
// Steps:
// 1. Set the player number (1–4)
// 2. Set attributes (sum must be ≤ 100)
// 3. Implement moveMyPlayer() — called every frame
//
// Available APIs inside moveMyPlayer():
//   getBoundaries()                → { left, right, bottom, top }
//   findActiveObjects()            → array of { type, position, points, attributes }
//   this.getPosition()             → { x, y }
//   this.getOrientation()          → degrees (0=up, 90=right, 180=down, 270=left)
//   this.getOtherPlayersInfo()     → [{ playerNumber, position, score }]
//   this.turn(this.body, angle)    → turn by angle degrees
//   this.accelerate(this.body)     → move forward
//   this.brake(this.body)          → slow down
//   gameState.world.isIcy          → boolean
//   gameState.b2d.b2Vec2           → vector constructor
//   conventionalOrientation(angle) → converts game angle to trig convention
//   degToRad(angle) / radToDeg(angle)
//   Math.cos/sin/sqrt/pow/atan2
//   signedAngleBetweenVectors(v1, v2)
//   randomRange(lo, hi)

export function PlayerTemplate(this: any, x: number, y: number, angle: number) {
	this.player = new (Player as any)(1, x, y, angle); // TODO: change player number

	this.player.view.body.attributes.stealing = 20;
	this.player.view.body.attributes.speed    = 20;
	this.player.view.body.attributes.brakes   = 20;
	this.player.view.body.attributes.pushing  = 20;
	this.player.view.body.attributes.grip     = 20;

	this.player.view.playerAIMovement = moveMyPlayer;
	this.player.view.validateAttributes();
}

function moveMyPlayer(this: any) {
	// TODO: implement your bird's behaviour here
}
