import { Player } from "../game/Player";
import { gameState } from "../game/state";
import { conventionalOrientation, degToRad, radToDeg, signedAngleBetweenVectors } from "../game/util";

export function Player4(this: any, x: number, y: number, angle: number) {
	this.player = new (Player as any)(4, x, y, angle);
	this.player.view.playerAIMovement = moveMyPlayer;

	this.player.view.body.attributes.stealing = 30;
	this.player.view.body.attributes.speed    = 25;
	this.player.view.body.attributes.brakes   = 10;
	this.player.view.body.attributes.pushing  = 15;
	this.player.view.body.attributes.grip     = 20;

	this.player.view.validateAttributes();
}

function getPositionOfHighestScorer(player: any) {
	const others = player.getOtherPlayersInfo();
	if (others.length === 0) return null;
	return others.reduce((best: any, p: any) => p.score > best.score ? p : best, others[0]).position;
}

function moveMyPlayer(this: any) {
	const positionToFollow = getPositionOfHighestScorer(this);
	if (!positionToFollow) return;

	const currentPosition = this.getPosition();
	const orientationCorrected = conventionalOrientation(this.getOrientation());
	const angleRad = degToRad(orientationCorrected);

	const forward = new gameState.b2d.b2Vec2(Math.cos(angleRad), -Math.sin(angleRad));
	const toTarget = new gameState.b2d.b2Vec2(positionToFollow.x - currentPosition.x, positionToFollow.y - currentPosition.y);

	this.turn(this.body, radToDeg(signedAngleBetweenVectors(forward, toTarget)));
	this.accelerate(this.body);
}
