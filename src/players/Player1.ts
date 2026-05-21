import { gameState } from "../game/state";
import { Player } from "../game/Player";
import { findActiveObjects } from "../game/objects";
import { OBJ_TYPE_CAR_PART } from "../game/constants";
import { radToDeg } from "../game/util";

export function Player1(this: any, x: number, y: number, angle: number) {
	this.player = new (Player as any)(1, x, y, angle);
	this.player.view.playerAIMovement = moveMyPlayer;

	this.player.view.body.attributes.stealing = 0;
	this.player.view.body.attributes.speed    = 80;
	this.player.view.body.attributes.brakes   = 0;
	this.player.view.body.attributes.pushing  = 0;
	this.player.view.body.attributes.grip     = 20;

	this.player.view.validateAttributes();
}

const approximation = 15;

function moveMyPlayer(this: any) {
	const objectArray = findActiveObjects();
	if (objectArray.length === 0) return;

	const foodArray = objectArray.filter((o) => o.type !== OBJ_TYPE_CAR_PART);
	if (foodArray.length === 0) return;

	const myPos = this.getPosition();
	let closeDist = Number.MAX_VALUE;
	let closeObj = foodArray[0];

	for (const obj of foodArray) {
		const dist = Math.sqrt(Math.pow(obj.position.x - myPos.x, 2) + Math.pow(obj.position.y - myPos.y, 2));
		if (dist < closeDist) { closeDist = dist; closeObj = obj; }
	}

	const myOri = this.getOrientation();
	const dx = closeObj.position.x - myPos.x;
	const dy = closeObj.position.y - myPos.y;

	if (Math.abs(dx) < 20) {
		if (dy < 0) this.turn(this.body, 360 - myOri);
		else this.turn(this.body, 180 - myOri);
	} else if (dx > 0) {
		this.turn(this.body, myOri - 90);
	} else {
		this.turn(this.body, myOri - 270);
	}

	if (closeDist > 5) this.accelerate(this.body);
}
