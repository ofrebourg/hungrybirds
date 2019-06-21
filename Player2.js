(function(window) {

    // TODO:
    // 1. Name the player class (e.g. PlayerN with N being between 1 and 4) below and at the bottom of this file
    // 2. Initialise your player and set its attributes (stealing, speed, brakes, pushing, grip).
    //    The sum of the attributes cannot be over 100. Otherwise your player will be disqualified.
    // 3. Implement the player's update function (moveMyPlayer) being called at every frame.
    //    Decide in this function the behaviour of your player.
    //

    function Player2(x, y, angle) {                        // TODO: change class name here (PlayerN with N between 1 and 4). Also change it at the end of the file!
        this.player = new Player(2, x, y, angle);          // TODO: change player number: new Player(N, x, y, angle) with N between 1 and 4)
        this.player.view.playerAIMovement = moveMyPlayer;



        // TODO: set the player's attributes (sum <= 100)
        this.player.view.body.attributes.stealing = 1;
        this.player.view.body.attributes.speed    = 43;
        this.player.view.body.attributes.brakes   = 5;
        this.player.view.body.attributes.pushing  = 1;
        this.player.view.body.attributes.grip     = 50;

        this.player.view.validateAttributes();
    }

    var approximation = 15;
    var boolNeedToChangeAngle = 1;
    var boolNeedToChangeAngleY = 1;
    var starting = 1;

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
        if (starting == 1) {
            this.turn(this.body, 0-this.getOrientation());
            starting = 0;
        }

        var myX = this.getPosition().x;
        var myY = this.getPosition().y;

        var objects = findActiveObjects();

        if (objects.length > 0)
        {
            var maxPoints = 0;
            var maxObject;
            for (var i = 0; i < objects.length; i++) {
                if (objects[i].type == OBJ_TYPE_CAR_PART) {
                    maxObject = objects[i];
                    break;
                }
                if (maxPoints < objects[i].points) {
                    maxPoints = objects[i].points;
                    maxObject = objects[i];
                }
            }
            var objectIWant = maxObject;


            // turn towards next object on x axis
            var currentPosition = this.getPosition();
            var currentOrientation = this.getOrientation();

            // we're ok on the x axis so we're moving on the y axis
            if (objectIWant.position.x >= currentPosition.x-approximation && objectIWant.position.x <= currentPosition.x+approximation)
            {
                // go up (angle=0)
                if (currentPosition.y > objectIWant.position.y)
                {
                    this.turn(this.body, 0-currentOrientation);
                }
                // go down (angle=180)
                else
                {
                    this.turn(this.body, 180-currentOrientation);
                }
            }
            // need to move on the x axis
            else
            {
                // go right (angle=90)
                if (currentPosition.x < objectIWant.position.x)
                {
                    this.turn(this.body, 90-currentOrientation);
                }
                // go left (angle=270)
                else if (currentPosition.x > objectIWant.position.x)
                {
                    this.turn(this.body, 270-currentOrientation);
                }
            }

            // and move forward
            this.accelerate(this.body);
        }
        //console.log("max points: ", maxObject);


//        var xDif;
//        if (boolNeedToChangeAngle == 1) {
//            console.log("here")     ;
//            if ((myX - maxObject.position.x) >= 15) {
//                console.log("here1")     ;
//                this.turn(this.body, -90);
//                boolNeedToChangeAngle = 0;
//            } else if ((maxObject.position.x - myX) >= 15){
//                this.turn(this.body, +90);
//                console.log("here2")     ;
//                boolNeedToChangeAngle = 0;
//            }
//
//        }
//        if (((myX >= maxObject.position.x) && (myX - maxObject.position.x) < 15) ||
//            ((maxObject.position.x >= myX) && (maxObject.position.x - myX) < 15) ) {
//            boolNeedToChangeAngle = 0;
//            this.turn(this.body, 0-this.getOrientation());
//            if (boolNeedToChangeAngleY == 1) {
//                if ((maxObject.position.y - myY) >= 15) {
//                    boolNeedToChangeAngleY = 0;
//                } else if ((myY - maxObject.position.Y) >= 15) {
//                    this.turn(this.body, -180);
//                    boolNeedToChangeAngleY = 0;
//                }
//            }
//
//        }
//
//        if ((((myX >= maxObject.position.x) && (myX - maxObject.position.x) < 15) ||
//            ((maxObject.position.x >= myX) && (maxObject.position.x - myX) < 15) )  &&
//            (((myY >= maxObject.position.y) && (myY - maxObject.position.y) < 15) ||
//            ((maxObject.position.y >= myY) && (maxObject.position.y - myY) < 15))) {
//            boolNeedToChangeAngle = 1;
//            boolNeedToChangeAngleY = 1;
//            starting = 1;
//            console.log("maxObject", maxObject);
//        }
//
//
//        if (myX == maxObject.position.x) {
//            boolNeedToChangeAngle = 0;
//        }
//
//        this.accelerate(this.body);
//
//        //this.turn(this.body, +90);
//
//
//        console.log("xDif ", xDif);
//
//        /*var yDif;
//        if (myY >= maxObject.position.y) {
//
//        } else {
//            yDif = maxObject.position.y - myY;
//        }
//
//        console.log("yDif ", yDif);
//
//        //if (
//
//        var tan = yDif / xDif;
//        var angle = radToDeg(Math.atan(tan));
//
//        console.log("angle ", angle);
//
//
//        var angle = signedAngleBetweenVectors(this.getPosition(), maxObject.position);
//        //this.turn(this.body, angle);
//        console.log("angle: ", angle);
//        this.accelerate(this.body);     */


    }

    window.Player2 = Player2; // TODO: change class name here. e.g. window.PlayerN = PlayerN
})(window);