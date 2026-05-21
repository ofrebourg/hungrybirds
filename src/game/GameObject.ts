import { createjs } from "../lib/createjs";
import { SOUND_EATING_RANDOM } from "./sounds";
import { playSound, randomEatingSound } from "./sounds";
import { gameState } from "./state";

const DISAPPEARING_STEPS = 20;
const CENTER_OFFSET = 25;

export function GameObject(
	this: any,
	image: string,
	x: number,
	y: number,
	type: string,
	points: number,
	sound: string | null,
	attributes: number[] | undefined,
) {
	this.view = new createjs.Bitmap("images/" + image + ".png");
	this.view.x = x;
	this.view.y = y;
	this.view.regX = this.view.regY = CENTER_OFFSET;
	this.view.on("tick", gameObjectTick);

	this.view.displayed = true;
	this.view.disappearingCounter = 0;
	this.view.reappearanceCounter = 0;
	this.view.type = type;
	this.view.points = points;
	this.view.sound = sound ?? null;
	this.view.attributes = attributes;
	this.view.initialScale = 1;

	this.scaleObject = function (scale: number) {
		this.view.initialScale = scale;
		this.view.multiplyScale(scale);
	};
}

function gameObjectTick(this: any) {
	if (this.displayed) {
		for (let p = 0; p < gameState.players.length; p++) {
			if (gameState.players[p].view && this) {
				const intersection = ndgmr.checkPixelCollision(gameState.players[p].view, this, 0.5);
				if (intersection) {
					this.displayed = false;
					this.disappearingCounter = 0;
					this.reappearanceCounter = 0;

					gameState.players[p].view.score += this.points;
					gameState.scoreboard.updateScore(gameState.players[p].view.playerNumber - 1, gameState.players[p].view.score);

					let soundToPlay = this.sound;
					if (soundToPlay === SOUND_EATING_RANDOM) soundToPlay = randomEatingSound();
					playSound(soundToPlay);

					gameState.players[p].view.consume(this);
				}
			}
		}
	} else if (this.disappearingCounter < DISAPPEARING_STEPS) {
		this.disappearingCounter++;
		this.multiplyScale(1 + this.disappearingCounter / 60);
		this.alpha = 1 - this.disappearingCounter / DISAPPEARING_STEPS;
	} else {
		if (this.reappearanceCounter === 0) this.visible = false;
		if (this.reappearanceCounter < 120) this.reappearanceCounter++;
	}
}
