(function(window) {

    function ScoreBoard(playerCount) {
        this.objectsToShow = [];
        this.scores = [];

        // scoreboard image
        this.view = new createjs.Bitmap("images/scoreboard.png");
        this.view.x = 0;
        this.view.y = 0;
        //this.view.onTick = tick;
        this.updateScore = updateScore;

        this.objectsToShow.push(this.view);

        var spaceBetweenDelimiters = (w-(playerCount-1)*wallImgMinDimension)/playerCount;
        var playerImgWidth = 40;

        var teamNameFontSize = 36;
        var teamNameOffsetY = 0;
        var teamScoreFontSize = 36;
        var teamScoreOffsetY = 0;
        var extraSpace = 6;
        var spaceBetweenPlayerImgAndTeamName = 3;
        if (playerCount >= 4)
        {
            teamNameFontSize = 28;
            teamNameOffsetY = 5;
            teamScoreFontSize = 32;
            teamScoreOffsetY = 3;
            extraSpace = 0;
            spaceBetweenPlayerImgAndTeamName = 0;
        }
//        else if (playerCount >= 3)
//        {
//            teamNameFontSize = 32;
//            teamNameOffsetY = 4;
//        }

        for (var i = 0 ; i < playerCount ; i++)
        {
            // add player image
            var playerImg = new createjs.Bitmap("images/players/playerRound"+(i+1)+".png");
            playerImg.x = (i*(spaceBetweenDelimiters+wallImgMinDimension))+extraSpace;
            playerImg.y = 2;
            this.objectsToShow.push(playerImg);

            // add team name
            var teamName = new createjs.Text("Team "+(i+1), "normal "+teamNameFontSize+"px Crayon", "#FFFFFF");
            teamName.textAlign = "left";
            teamName.x = (i*(spaceBetweenDelimiters+wallImgMinDimension))+playerImgWidth+extraSpace+spaceBetweenPlayerImgAndTeamName;
            teamName.y = teamNameOffsetY;
            teamName.maxWidth = spaceBetweenDelimiters;
            this.objectsToShow.push(teamName);

            // add score
            var score = new createjs.Text("0", "normal "+teamScoreFontSize+"px Crayon", "#FFFFFF");
            score.textAlign = "right";
            score.x = ((i+1)*(spaceBetweenDelimiters+wallImgMinDimension))-wallImgMinDimension-5-extraSpace;
            score.y = teamScoreOffsetY;
            score.maxWidth = spaceBetweenDelimiters;
            this.scores.push(score);
            this.objectsToShow.push(score);

            // add delimiter
            if (i > 0)
            {
                var delimiter = new createjs.Bitmap("images/tiles/vertical_orange_2.png");
                delimiter.x = (i*spaceBetweenDelimiters)+((i-1)*wallImgMinDimension);
                delimiter.y = 0;
                this.objectsToShow.push(delimiter);
            }
        }
    }

    function updateScore(playerIndex, newScore)
    {
        this.scores[playerIndex].text = newScore.toString();
    }

    window.ScoreBoard = ScoreBoard;
})(window);