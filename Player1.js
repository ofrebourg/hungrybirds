(function(window) {

    // TODO:
    // 1. Name the player class (e.g. PlayerN with N being between 1 and 4) below and at the bottom of this file
    // 2. Initialise your player and set its attributes (stealing, speed, brakes, pushing, grip).
    //    The sum of the attributes cannot be over 100. Otherwise your player will be disqualified.
    // 3. Implement the player's update function (moveMyPlayer) being called at every frame.
    //    Decide in this function the behaviour of your player.
    //

    function Player1(x, y, angle) {                        // TODO: change class name here (PlayerN with N between 1 and 4). Also change it at the end of the file!
        this.player = new Player(1, x, y, angle);          // TODO: change player number: new Player(N, x, y, angle) with N between 1 and 4)
        this.player.view.playerAIMovement = moveMyPlayer;

        // TODO: set the player's attributes (sum <= 100)
        this.player.view.body.attributes.stealing = 0;
        this.player.view.body.attributes.speed    = 80;
        this.player.view.body.attributes.brakes   = 0;
        this.player.view.body.attributes.pushing  = 0;
        this.player.view.body.attributes.grip     = 20;

        this.player.view.validateAttributes();
    }

    var approximation = 15;
        /*
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
    }  */

    // Functions available from within moveMyPlayer(). Note that you don't necessarily need all that!
    //
    // Information about the world
    // - getBoundaries() - get coordinates of the world. Example: { left: 10, right: 590, bottom: 450, top: 10 }
    // - world.isIcy - boolean indicating if the world is icy (i.e. no grip)
    // - findActiveObjects() - get list of objects to collect. Example:
    //    [
    //      { type: OBJ_TYPE_VEGGIE,   position: { x: 12, y: 34 }, points: 40, attributes: undefined },
    //      { type: OBJ_TYPE_CAR_PART, position: { x: 37, y: 11 }, points: 27, attributes: [ OBJ_ATTR_FROZEN, OBJ_ATTR_GRIP ] }
    //    ]
    //   Object types: OBJ_TYPE_VEGGIE, OBJ_TYPE_CAR_PART, OBJ_TYPE_DRINK, OBJ_TYPE_FOOD
    //   Possible attributes:
    //     - OBJ_ATTR_FROZEN: Makes the world icy for 5 seconds
    //     - OBJ_ATTR_BEER:   Makes the player drunk for 5 seconds
    //     - OBJ_ATTR_GRIP:   Gives the player 80% of grip  (unless the player already had more) until the end of the game
    //     - OBJ_ATTR_SPEED:  Gives the player 80% of speed (unless the player already had more) until the end of the game
    //     - OBJ_ATTR_BRAKES: Gives the player 80% of speed (unless the player already had more) until the end of the game
    //     - OBJ_ATTR_TURBO:  Makes the player get a brief boost of speed
    //
    // Information about players
    // - this.getPosition() - get the player position { x, y }
    // - this.getOrientation() - get the player orientation (in degrees):
    //     0: facing up
    //    90: facing right
    //   180: facing down
    //   270: facing left
    // - this.getOtherPlayersInfo() - get information on the other players. Example of output:
    //   [
    //     { playerNumber: 1, position: { x: 50, y: 100 }, score: 123 },
    //     { playerNumber: 2, position: { x: 12, y: 257 }, score: 456 }
    //   ]
    //
    // Player Actions
    // - this.turn(this.body, angle) - turn the player by angle degrees from its current orientation
    // - this.accelerate(this.body) - move forward
    //     (keep calling this function to keep moving forward. It will accelerate until top speed is reached).
    // - this.brake(this.body)
    //
    // Utility functions
    // - conventionalOrientation(angle) - transform an angle from game convention onto a conventional trigonometric circle
    //   game orientation  |  conventional
    //          0 degrees     90 degrees (PI/2)
    //         90 degrees      0 degrees (0)
    //        180 degrees    -90 degrees (-PI/2)
    //        270 degrees    180 degrees (PI)
    // - randomRange(lo, hi) - get a random number (decimal) between lo and hi
    // - signedAngleBetweenVectors(v1, v2) - calculate the (signed) angle between vectors in radians. See below how to create vectors
    // - degToRad(angle) - transform angle from degrees to radians
    // - radToDeg(angle) - transform angle from radians to degrees
    // - Math.cos(angle) - calculate the cosinus of an angle in radians
    // - Math.sin(angle) - calculate the sinus of an angle in radians
    // - Math.sqrt(n)    - get the square root of n
    // - Math.pow(n, p)  - n^p
    //
    // Other notes and formulas you might find useful:
    // - distance between 2 points p and q: sqrt((q.x-p.x)^2 + (q.y-p.y)^2)
    // - creating a vector (let's re-use what's available in the loaded box2d library): var myVector = new b2d.b2Vec2(x, y);
    // - get the size of an array. Example: var myArray = [ 1, 2, 'test' ]; -> myArray.length == 3

    // TODO: define what to do for every frame
    // tip: find out what's in the world, what to collect to get points, in which order, where the other players are...
    function moveMyPlayer()
    {
        var objectArray = findActiveObjects();
        //for each object remove non food
        var foodArray = [];
        var closeDist = 100000;
        var closeObj;

        if (objectArray.length != 0) {
            for (var i = 0; i < objectArray.length; i++) {
                if (objectArray[i].type != OBJ_TYPE_CAR_PART) {
                    foodArray.push(objectArray[i]);
                }
            }

            var myPos = this.getPosition();

            for (var i = 0; i < foodArray.length; i++) {
                //var distance = Math.abs(Math.sqrt((foodArray[i].position.x-myPos.x)^2 + (foodArray[i].position.y-myPos.y)^2));
                var distance = Math.sqrt(Math.pow((foodArray[i].position.x-myPos.x), 2) + Math.pow((foodArray[i].position.y-myPos.y),2));

                if (distance < closeDist) {
                    closeDist = distance;
                    closeObj = foodArray[i];
                }
            }
            var myOri = this.getOrientation(this.body);
            var wantedAngle = DegToGameDeg(radToDeg(Math.atan((myPos.x - closeObj.position.x)/(myPos.y - closeObj.position.y))));

            if(Math.abs((closeObj.position.x - myPos.x)) < 20 ) {
                if((closeObj.position.y - myPos.y) < 0){
                    this.turn(this.body, 360-myOri);
                } else if((closeObj.position.y - myPos.y) > 0){
                    this.turn(this.body, 180 - myOri);
                }
            }

            else if ((closeObj.position.x - myPos.x) > 0) {
                //this.turn(this.body,((360 - myOri)  + (90 - wantedAngle)));
                this.turn(this.body, (myOri-90));
            } else if((closeObj.position.x - myPos.x) < 0){
                this.turn(this.body, (myOri-270));
            }

//
//        var myVector = new b2d.b2Vec2(myPos.x, myPos.y);
//        var objVector = new b2d.b2Vec2(closeObj.x, closeObj.y);
//        var radAngle = signedAngleBetweenVectors( objVector, myVector);
//        var degAngle = radToDeg(radAngle);

//        var turnAngle = degAngle; //DegToGameDeg(degAngle);

//        var myOrientation = this.getOrientation(this.body);
//        console.log(turnAngle);
//        turnAngle = myOrientation - turnAngle;
//        console.log("after"+turnAngle);
//        this.turn(this.body, turnAngle);


            if(distance > 5) {
                this.accelerate(this.body);
            }
        }
    }

    function DegToGameDeg(degrees)
    {
        return - degrees + 90;
    }

    window.Player1 = Player1; // TODO: change class name here. e.g. window.PlayerN = PlayerN
})(window);