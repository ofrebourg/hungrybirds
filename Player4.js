(function(window) {

    // this player follows the player with the highest score to steal his points
    function Player4(x, y, angle) {
        this.player = new Player(4, x, y, angle);
        this.player.view.playerAIMovement = moveMyPlayer;

        this.player.view.body.attributes.stealing = 30;
        this.player.view.body.attributes.speed = 25;
        this.player.view.body.attributes.brakes = 10;
        this.player.view.body.attributes.pushing = 15;
        this.player.view.body.attributes.grip = 20;

        this.player.view.validateAttributes();
    }

    var approximation = 15;

    function getPositionOfHigherScorer(player)
    {
        var others = player.getOtherPlayersInfo();
        if (others.length == 0) return null;

        var highestScore = 0;
        var index = 0;
        for (var i = 0 ; i < others.length ; i++)
        {
            if (others[i].score > highestScore)
            {
                highestScore = others[i].score;
                index = i;
            }
        }
        //console.log("follow player "+others[index].playerNumber+ " with a score of "+others[index].score);
        return others[index].position;
    }

    function moveMyPlayer()
    {
        var positionToFollow = getPositionOfHigherScorer(this);
        if (positionToFollow != null)
        {
            // turn towards next object
            var currentPosition = this.getPosition();
            var currentOrientation = this.getOrientation();
            var orientationCorrected = conventionalOrientation(currentOrientation);
            var angleRad = degToRad(orientationCorrected);
            //console.log("currentPos currentOrientation orientationCorrected angleRad", currentPosition, currentOrientation, orientationCorrected, angleRad);

            var pointForward = new b2d.b2Vec2(currentPosition.x + Math.cos(angleRad), currentPosition.y - Math.sin(angleRad));
            //console.log("pointForward", pointForward);
            var vectorCurrentDirection = new b2d.b2Vec2(pointForward.x-currentPosition.x, pointForward.y-currentPosition.y);
            //console.log("vectorCurrentDirection", vectorCurrentDirection);

            var vectorFromCurrentPositionToObject = new b2d.b2Vec2(positionToFollow.x-currentPosition.x, positionToFollow.y-currentPosition.y);
            //console.log("objectPosition vectorFromCurrentPositionToObject", objectPosition, vectorFromCurrentPositionToObject);

            //var angleFromCurrentPositionToObject = angleBetweenVectors(vectorCurrentDirection, vectorFromCurrentPositionToObject);
            //console.log("angle", radToDeg(angleFromCurrentPositionToObject));

            var signedAngle = signedAngleBetweenVectors(vectorCurrentDirection, vectorFromCurrentPositionToObject);
            //console.log("signed angle", radToDeg(signedAngle));

            this.turn(this.body, radToDeg(signedAngle));

            // and move forward
            this.accelerate(this.body);
        }
    }

    window.Player4 = Player4;
})(window);