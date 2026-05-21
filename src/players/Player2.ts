import { Player } from "../game/Player";
import { findActiveObjects } from "../game/objects";
import { OBJ_TYPE_CAR_PART } from "../game/constants";

export function Player2(this: any, x: number, y: number, angle: number) {
	this.player = new (Player as any)(2, x, y, angle);
	this.player.view.playerAIMovement = moveMyPlayer;

	this.player.view.body.attributes.stealing = 1;
	this.player.view.body.attributes.speed    = 43;
	this.player.view.body.attributes.brakes   = 5;
	this.player.view.body.attributes.pushing  = 1;
	this.player.view.body.attributes.grip     = 50;

	this.player.view.validateAttributes();
}

const approximation = 15;
let starting = 1;

function moveMyPlayer(this: any) {
	if (starting) { this.turn(this.body, -this.getOrientation()); starting = 0; }

	const objects = findActiveObjects();
	if (objects.length === 0) return;

	let maxPoints = 0;
	let objectIWant = objects[0];
	for (const obj of objects) {
		if (obj.type === OBJ_TYPE_CAR_PART) { objectIWant = obj; break; }
		if (obj.points > maxPoints) { maxPoints = obj.points; objectIWant = obj; }
	}

	const currentPosition = this.getPosition();
	const currentOrientation = this.getOrientation();

	if (objectIWant.position.x >= currentPosition.x - approximation && objectIWant.position.x <= currentPosition.x + approximation) {
		this.turn(this.body, (currentPosition.y > objectIWant.position.y ? 0 : 180) - currentOrientation);
	} else {
		this.turn(this.body, (currentPosition.x < objectIWant.position.x ? 90 : 270) - currentOrientation);
	}

	this.accelerate(this.body);
}
