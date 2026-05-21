import { createjs } from "../lib/createjs";
import { gameState } from "./state";

export function ScoreBoard(this: any, playerCount: number) {
	this.objectsToShow = [];
	this.scores = [];

	this.view = new createjs.Bitmap("images/scoreboard.png");
	this.view.x = 0;
	this.view.y = 0;
	this.updateScore = updateScore;
	this.objectsToShow.push(this.view);

	const { w, wallImgMinDimension } = gameState;
	const spaceBetweenDelimiters = (w - (playerCount - 1) * wallImgMinDimension) / playerCount;
	const playerImgWidth = 40;

	let teamNameFontSize = 36;
	let teamNameOffsetY = 0;
	let teamScoreFontSize = 36;
	let teamScoreOffsetY = 0;
	let extraSpace = 6;
	let spaceBetweenPlayerImgAndTeamName = 3;

	if (playerCount >= 4) {
		teamNameFontSize = 28;
		teamNameOffsetY = 5;
		teamScoreFontSize = 32;
		teamScoreOffsetY = 3;
		extraSpace = 0;
		spaceBetweenPlayerImgAndTeamName = 0;
	}

	for (let i = 0; i < playerCount; i++) {
		const playerImg = new createjs.Bitmap("images/players/playerRound" + (i + 1) + ".png");
		playerImg.x = i * (spaceBetweenDelimiters + wallImgMinDimension) + extraSpace;
		playerImg.y = 2;
		this.objectsToShow.push(playerImg);

		const teamName = new createjs.Text(
			"Team " + (i + 1),
			"normal " + teamNameFontSize + "px Crayon",
			"#FFFFFF",
		);
		teamName.textAlign = "left";
		teamName.x = i * (spaceBetweenDelimiters + wallImgMinDimension) + playerImgWidth + extraSpace + spaceBetweenPlayerImgAndTeamName;
		teamName.y = teamNameOffsetY;
		teamName.maxWidth = spaceBetweenDelimiters;
		this.objectsToShow.push(teamName);

		const score = new createjs.Text("0", "normal " + teamScoreFontSize + "px Crayon", "#FFFFFF");
		score.textAlign = "right";
		score.x = (i + 1) * (spaceBetweenDelimiters + wallImgMinDimension) - wallImgMinDimension - 5 - extraSpace;
		score.y = teamScoreOffsetY;
		score.maxWidth = spaceBetweenDelimiters;
		this.scores.push(score);
		this.objectsToShow.push(score);

		if (i > 0) {
			const delimiter = new createjs.Bitmap("images/tiles/vertical_orange_2.png");
			delimiter.x = i * spaceBetweenDelimiters + (i - 1) * wallImgMinDimension;
			delimiter.y = 0;
			this.objectsToShow.push(delimiter);
		}
	}
}

function updateScore(this: any, playerIndex: number, newScore: number) {
	this.scores[playerIndex].text = newScore.toString();
}
