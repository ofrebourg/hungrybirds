import { Player } from "../game/Player";
import { findActiveObjects } from "../game/objects";

export function Player3(this: any, x: number, y: number, angle: number) {
	this.player = new (Player as any)(3, x, y, angle);
	this.player.view.playerAIMovement = moveMyPlayer;

	this.player.view.body.attributes.stealing = 30;
	this.player.view.body.attributes.speed    = 15;
	this.player.view.body.attributes.brakes   = 20;
	this.player.view.body.attributes.pushing  = 15;
	this.player.view.body.attributes.grip     = 20;

	this.player.view.validateAttributes();
}

const approximation = 15;

function moveMyPlayer(this: any) {
	const objects = findActiveObjects();
	if (objects.length === 0) return;

	const objectIWant = objects[0];
	const currentPosition = this.getPosition();
	const currentOrientation = this.getOrientation();

	if (objectIWant.position.x >= currentPosition.x - approximation && objectIWant.position.x <= currentPosition.x + approximation) {
		this.turn(this.body, (currentPosition.y > objectIWant.position.y ? 0 : 180) - currentOrientation);
	} else {
		this.turn(this.body, (currentPosition.x < objectIWant.position.x ? 90 : 270) - currentOrientation);
	}

	this.accelerate(this.body);
}
