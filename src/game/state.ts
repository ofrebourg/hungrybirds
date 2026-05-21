import { WALL_BOTTOM, WALL_LEFT, WALL_RIGHT, WALL_TOP } from "./constants";

export const gameState = {
	b2d: null as any,
	stage: null as any,
	debug: null as any,
	world: null as any,
	players: [] as any[],
	objects: [] as any[],
	walls: [] as any[],
	objectsContainer: null as any,
	scoreboard: null as any,
	iceWarning: null as any,
	playerCount: 0,
	w: 0,
	h: 0,
	gameOver: false,
	gameOverCountdown: 0,
	showWinnerCountdown: 0,
	objectOrderIndex: -1,
	boxesForObjects: [] as any[],
	boxWidth: 0,
	boxHeight: 0,
	debugScores: false,
	wallImgMinDimension: 21,
};

export function getBoundaries() {
	let left = 0, right = 0, bottom = 0, top = 0;
	for (let i = 0; i < gameState.walls.length; i++) {
		const wall = gameState.walls[i];
		switch (wall.id) {
			case WALL_LEFT:   left   = wall.x + wall.width; break;
			case WALL_RIGHT:  right  = wall.x - wall.width; break;
			case WALL_TOP:    top    = wall.y + wall.height; break;
			case WALL_BOTTOM: bottom = wall.y - wall.height; break;
		}
	}
	return { left, right, bottom, top };
}

export function makeTheWorldIcy() {
	gameState.iceWarning.startTimer();
	gameState.world.friction = 0;
	gameState.world.isIcy = true;
}

export function makeTheWorldNotIcy() {
	gameState.world.friction = 1;
	gameState.world.isIcy = false;
}
