import { createjs } from "../lib/createjs";
import { FRAMERATE, HEADER_HEIGHT, SCALE, WALL_BOTTOM, WALL_LEFT, WALL_RIGHT, WALL_TOP } from "./constants";
import { IceWarning } from "./IceWarning";
import { MoveableObject } from "./MoveableObject";
import { ScoreBoard } from "./ScoreBoard";
import { Wall } from "./Wall";
import {
	activeObjectsRemaining,
	addObjectsContainer,
	calculateObjectBoxesBoundaries,
	loadObjects,
	loadVeggies,
	objectOrder,
	removeAllObjects,
	resetBoxes,
} from "./objects";
import { registerSounds, playSound, randomAngrySound, randomHappySound, randomNeutralSound, SOUND_VICTORY } from "./sounds";
import { gameState } from "./state";
import { urlParams } from "./util";
import { OBJ_LOAD_VEGGIES, TYPE_PLAYER, TYPE_OBJECT } from "./constants";

const TIMEOUT_AFTER_GAME_OVER = 10;
const TIMEOUT_SHOW_WINNER = 2;
const DEBUG = "debug" in urlParams;

export function init() {
	gameState.stage = new createjs.Stage(document.getElementById("canvas") as HTMLCanvasElement);
	const debugStage = new createjs.Stage(document.getElementById("debug") as HTMLCanvasElement);
	gameState.debug = debugStage;

	gameState.w = gameState.stage.canvas.width;
	gameState.h = gameState.stage.canvas.height;

	const { w, h, wallImgMinDimension } = gameState;

	gameState.walls.push({ id: WALL_BOTTOM, x: w / 2,               y: h - wallImgMinDimension / 2,           width: w / 2,               height: wallImgMinDimension / 2, image: "images/tiles/bottom.png" });
	gameState.walls.push({ id: WALL_TOP,    x: w / 2,               y: HEADER_HEIGHT + wallImgMinDimension / 2, width: w / 2,               height: wallImgMinDimension / 2, image: "images/tiles/top.png" });
	gameState.walls.push({ id: WALL_LEFT,   x: wallImgMinDimension / 2,  y: HEADER_HEIGHT + h / 2,             width: wallImgMinDimension / 2, height: (h - 2 * wallImgMinDimension) / 2, image: "images/tiles/wall_left.png" });
	gameState.walls.push({ id: WALL_RIGHT,  x: w - wallImgMinDimension / 2, y: HEADER_HEIGHT + h / 2,         width: wallImgMinDimension / 2, height: (h - 2 * wallImgMinDimension) / 2, image: "images/tiles/wall_right.png" });

	setupPhysics();
	addCollisionListener();
	registerSounds();
	createScene();

	// addPlayers is called from addPlayers.ts, imported in main.ts
	(window as any).__addPlayers();

	addScoreboard();
	addIceWarning();

	createjs.Ticker.addEventListener("tick", gameTick);
	createjs.Ticker.framerate = FRAMERATE;
	createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
}

function setupPhysics() {
	gameState.b2d = {
		b2Vec2: Box2D.Common.Math.b2Vec2,
		b2BodyDef: Box2D.Dynamics.b2BodyDef,
		b2Body: Box2D.Dynamics.b2Body,
		b2FixtureDef: Box2D.Dynamics.b2FixtureDef,
		b2Fixture: Box2D.Dynamics.b2Fixture,
		b2World: Box2D.Dynamics.b2World,
		b2MassData: Box2D.Collision.Shapes.b2MassData,
		b2PolygonShape: Box2D.Collision.Shapes.b2PolygonShape,
		b2CircleShape: Box2D.Collision.Shapes.b2CircleShape,
		b2DebugDraw: Box2D.Dynamics.b2DebugDraw,
		b2RevoluteJointDef: Box2D.Dynamics.Joints.b2RevoluteJointDef,
		b2PrismaticJointDef: Box2D.Dynamics.Joints.b2PrismaticJointDef,
		b2EdgeShape: Box2D.Collision.Shapes.b2EdgeShape,
	};

	gameState.world = new gameState.b2d.b2World(new gameState.b2d.b2Vec2(0, 0), true);
	gameState.world.friction = 1;
	gameState.world.isIcy = false;

	if (DEBUG) {
		const debugDraw = new gameState.b2d.b2DebugDraw();
		debugDraw.SetSprite(gameState.debug.canvas.getContext("2d"));
		debugDraw.SetDrawScale(SCALE);
		debugDraw.SetFillAlpha(0.5);
		debugDraw.SetFlags(gameState.b2d.b2DebugDraw.e_shapeBit | gameState.b2d.b2DebugDraw.e_jointBit | gameState.b2d.b2DebugDraw.e_centerOfMassBit);
		gameState.world.SetDebugDraw(debugDraw);
	}
}

function addCollisionListener() {
	const b2Listener = Box2D.Dynamics.b2ContactListener;
	const listener = new b2Listener();

	listener.BeginContact = function (contact: any) {
		const objectA = contact.GetFixtureA().GetBody().GetUserData();
		const objectB = contact.GetFixtureB().GetBody().GetUserData();
		let soundToPlay: string | null = null;

		if (objectA.type === TYPE_PLAYER && objectB.type === TYPE_PLAYER) {
			let pointsToMove = objectB.player.stealingPower() * objectA.player.score;
			pointsToMove -= objectA.player.stealingPower() * objectB.player.score;
			pointsToMove = Math.floor(pointsToMove);

			let updateScoreBoard = true;
			if (pointsToMove > 0) {
				objectB.player.stealFromPlayer(objectA.player, Math.abs(pointsToMove));
			} else if (pointsToMove < 0) {
				objectA.player.stealFromPlayer(objectB.player, Math.abs(pointsToMove));
			} else {
				updateScoreBoard = false;
				soundToPlay = randomNeutralSound();
			}

			objectA.player.push();

			if (updateScoreBoard) {
				gameState.scoreboard.updateScore(objectA.player.playerNumber - 1, objectA.player.score);
				gameState.scoreboard.updateScore(objectB.player.playerNumber - 1, objectB.player.score);
				soundToPlay = Math.random() < 0.5 ? randomHappySound() : randomAngrySound();
			}
		} else if (objectA.type === TYPE_PLAYER || objectB.type === TYPE_OBJECT) {
			if (objectA.type === TYPE_PLAYER) objectA.player.push();
			soundToPlay = randomNeutralSound();
		} else if (objectA.type === TYPE_PLAYER || objectB.type === TYPE_PLAYER) {
			soundToPlay = randomNeutralSound();
		}

		playSound(soundToPlay);
	};

	listener.EndContact = function () {};
	listener.PostSolve = function () {};
	listener.PreSolve = function () {};

	gameState.world.SetContactListener(listener);
}

function createScene() {
	const { w, h, wallImgMinDimension } = gameState;

	const bg = new createjs.Bitmap("images/bg_stone2_800x600.jpg");
	bg.x = 0;
	bg.y = HEADER_HEIGHT;
	gameState.stage.addChild(bg);

	for (const wallDef of gameState.walls) {
		const wall = new (Wall as any)(wallDef.x / SCALE, wallDef.y / SCALE, wallDef.width / SCALE, wallDef.height / SCALE, wallDef.image);
		gameState.stage.addChild(wall.view);
	}

	const mo = new (MoveableObject as any)(400, 400);
	gameState.stage.addChild(mo.view);

	calculateObjectBoxesBoundaries();
	addObjectsContainer();
}

function addScoreboard() {
	gameState.scoreboard = new (ScoreBoard as any)(gameState.playerCount);
	for (const obj of gameState.scoreboard.objectsToShow) {
		gameState.stage.addChild(obj);
	}
}

function addIceWarning() {
	const { wallImgMinDimension, HEADER_HEIGHT: _ } = gameState as any;
	gameState.iceWarning = new (IceWarning as any)(wallImgMinDimension, HEADER_HEIGHT + wallImgMinDimension);
	for (const obj of gameState.iceWarning.objectsToShow) {
		gameState.stage.addChild(obj);
	}
}

function showWinner(playerNumber: number) {
	const { w, h } = gameState;

	const trophy = new createjs.Bitmap("images/victory.png");
	trophy.x = w / 2;
	trophy.y = h / 2;
	trophy.visible = false;
	gameState.stage.addChild(trophy);
	trophy.image.onload = function () {
		trophy.recenter();
		trophy.visible = true;
	};

	const winner = new createjs.Bitmap("images/players/player" + playerNumber + "_won.png");
	winner.x = trophy.x;
	winner.y = trophy.y - 20;
	winner.regX = winner.regY = 65;
	gameState.stage.addChild(winner);

	const teamName = new createjs.Text("Team " + playerNumber, "normal 30px TW Cen MT", "#231f20");
	teamName.textAlign = "center";
	teamName.x = trophy.x;
	teamName.y = trophy.y + 126;
	teamName.maxWidth = 200;
	gameState.stage.addChild(teamName);
}

function gameTick() {
	if (gameState.showWinnerCountdown > 0) {
		gameState.showWinnerCountdown--;
		if (gameState.showWinnerCountdown === 0) {
			let highestScore = 0;
			let index = 0;
			for (let i = 0; i < gameState.players.length; i++) {
				if (gameState.players[i].view.score > highestScore) {
					highestScore = gameState.players[i].view.score;
					index = i;
				}
			}
			showWinner(gameState.players[index].view.playerNumber);
			playSound(SOUND_VICTORY);
		}
	}

	if (gameState.gameOverCountdown > 0) {
		gameState.gameOverCountdown--;
		if (gameState.gameOverCountdown === 0) {
			gameState.gameOver = true;
			console.log("GAME OVER");
		}
	}

	if (gameState.gameOver) return;

	if (!activeObjectsRemaining()) {
		gameState.objectOrderIndex++;

		if (gameState.objectOrderIndex < objectOrder.length) {
			if (gameState.objectOrderIndex > 0) {
				removeAllObjects();
				resetBoxes();
			}
			const wave = objectOrder[gameState.objectOrderIndex];
			if (wave.title) console.log("Title:", wave.title);
			for (const item of wave.objects) {
				if (item === OBJ_LOAD_VEGGIES) {
					loadVeggies();
				} else {
					loadObjects(item as any[], 35);
				}
			}
		} else {
			if (gameState.gameOverCountdown === 0) {
				gameState.gameOverCountdown = TIMEOUT_AFTER_GAME_OVER * FRAMERATE;
				gameState.showWinnerCountdown = TIMEOUT_SHOW_WINNER * FRAMERATE;
				for (const p of gameState.players) p.view.stop();
				console.log("Game finishing...");
			}
		}
	}

	gameState.iceWarning.update();
	gameState.stage.update();

	if (DEBUG) gameState.world.DrawDebugData();

	gameState.world.Step(1 / FRAMERATE, 10, 10);
	gameState.world.ClearForces();
}
