import { createjs } from "../lib/createjs";
import { FRAMERATE } from "./constants";
import { makeTheWorldNotIcy } from "./state";

const TIMER = 5;

export function IceWarning(this: any, x: number, y: number) {
	this.objectsToShow = [];
	this.framesRemaining = TIMER * FRAMERATE;
	this.timerStarted = false;

	const iceWarningImg = new createjs.Bitmap("images/iceWarning.png");
	iceWarningImg.x = x;
	iceWarningImg.y = y;
	this.objectsToShow.push(iceWarningImg);

	const iceWarningTxt = new createjs.Text("Ice!", "normal 24px Crayon", "#568fcb");
	iceWarningTxt.textAlign = "left";
	iceWarningTxt.x = x + 37;
	iceWarningTxt.y = y + 4;
	iceWarningTxt.maxWidth = 78;
	this.objectsToShow.push(iceWarningTxt);

	this.iceWarningSeconds = new createjs.Text(TIMER.toString(), "normal 24px Crayon", "#568fcb");
	this.iceWarningSeconds.textAlign = "right";
	this.iceWarningSeconds.x = x + 109;
	this.iceWarningSeconds.y = y + 4;
	this.iceWarningSeconds.maxWidth = 30;
	this.objectsToShow.push(this.iceWarningSeconds);

	for (const obj of this.objectsToShow) obj.visible = false;

	this.startTimer = startTimer;
	this.stopTimer = stopTimer;
	this.update = iceUpdate;
}

function startTimer(this: any) {
	this.timerStarted = true;
	for (const obj of this.objectsToShow) obj.visible = true;
}

function stopTimer(this: any) {
	this.framesRemaining = TIMER * FRAMERATE;
	this.timerStarted = false;
	for (const obj of this.objectsToShow) obj.visible = false;
	makeTheWorldNotIcy();
}

function iceUpdate(this: any) {
	if (!this.timerStarted) return;
	this.framesRemaining--;
	this.iceWarningSeconds.text = Math.floor(this.framesRemaining / FRAMERATE).toString();
	if (this.framesRemaining <= 0) this.stopTimer();
}
