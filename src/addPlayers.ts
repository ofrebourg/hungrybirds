import { HEADER_HEIGHT } from "./game/constants";
import { gameState } from "./game/state";
import { Player1 } from "./players/Player1";
import { Player2 } from "./players/Player2";
import { Player3 } from "./players/Player3";
import { Player4 } from "./players/Player4";

export function addPlayers() {
	const offsetFromCorner = 50;
	const { w, h } = gameState;

	const entries = [
		{ Ctor: Player1, x: offsetFromCorner,          y: h - offsetFromCorner,           angle: -135 },
		{ Ctor: Player2, x: w - offsetFromCorner,       y: HEADER_HEIGHT + offsetFromCorner, angle: 45  },
		{ Ctor: Player3, x: w - offsetFromCorner,       y: h - offsetFromCorner,           angle: 135  },
		{ Ctor: Player4, x: offsetFromCorner,          y: h - offsetFromCorner,           angle: -135 },
	];

	for (const { Ctor, x, y, angle } of entries) {
		const p = new (Ctor as any)(x, y, angle);
		if (p.player.view.parametersAreCorrect()) {
			console.log("Player " + p.player.view.playerNumber + " is ready");
			gameState.players.push(p.player);
			gameState.stage.addChild(p.player.view);
			gameState.playerCount++;
		} else {
			console.log("Player " + p.player.view.playerNumber + " is invalid");
			gameState.world.DestroyBody(p.player.view.body);
		}
	}
}
