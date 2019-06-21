var b2d = {
	b2Vec2 : Box2D.Common.Math.b2Vec2,
	b2BodyDef : Box2D.Dynamics.b2BodyDef,
	b2Body : Box2D.Dynamics.b2Body,
	b2FixtureDef : Box2D.Dynamics.b2FixtureDef,
	b2Fixture : Box2D.Dynamics.b2Fixture,
	b2World : Box2D.Dynamics.b2World,
	b2MassData : Box2D.Collision.Shapes.b2MassData,
	b2PolygonShape : Box2D.Collision.Shapes.b2PolygonShape,
	b2CircleShape : Box2D.Collision.Shapes.b2CircleShape,
	b2DebugDraw : Box2D.Dynamics.b2DebugDraw,
    b2RevoluteJoint: Box2D.Dynamics.Joints.b2RevoluteJoint,
    b2RevoluteJointDef: Box2D.Dynamics.Joints.b2RevoluteJointDef,
    b2PrismaticJointDef: Box2D.Dynamics.Joints.b2PrismaticJointDef,
    b2EdgeShape: Box2D.Collision.Shapes.b2EdgeShape
};

var playerCount = 0;
var SCALE = 30; // important to leave the scale at 30. If we set to 1, forces applied are so insignificant that the players don't move
var FRAMERATE = 30;
var HEADER_HEIGHT = 43;
var DEBUG = "debug" in urlParams;
var stage, world, debug, players = [], objects = [];
var w, h;

var scoreboard, iceWarning;
var debugScores = false;

var wallImgMinDimension=21;

const TIMEOUT_AFTER_GAME_OVER = 10; // seconds
const TIMEOUT_SHOW_WINNER = 2; //seconds

var gameOver = false;
var gameOverCountdown = 0, showWinnerCountdown = 0;

function init() {
    stage = new createjs.Stage(document.getElementById("canvas"));
    debug = new createjs.Stage(document.getElementById("debug"));

    w = stage.canvas.width;
    h = stage.canvas.height;

    walls.push({ id: WALL_BOTTOM, x: w/2, y: (h-wallImgMinDimension/2), width: w/2, height: wallImgMinDimension/2, image: "images/tiles/bottom.png" }); // bottom
    walls.push({ id: WALL_TOP,    x: w/2, y: HEADER_HEIGHT+wallImgMinDimension/2,     width: w/2, height: wallImgMinDimension/2, image: "images/tiles/top.png" }); // top
    walls.push({ id: WALL_LEFT,   x: wallImgMinDimension/2,     y: HEADER_HEIGHT+h/2, width: wallImgMinDimension/2, height: (h-2*wallImgMinDimension)/2, image: "images/tiles/wall_left.png" }); // left
    walls.push({ id: WALL_RIGHT,  x: (w-wallImgMinDimension/2), y: HEADER_HEIGHT+h/2, width: wallImgMinDimension/2, height: (h-2*wallImgMinDimension)/2, image: "images/tiles/wall_right.png" }); // right

    // walls.push({
    //     id: WALL_BOTTOM,
    //     x: 0,
    //     y: (h - wallImgMinDimension),
    //     width: w / 2,
    //     height: wallImgMinDimension / 2,
    //     image: "images/tiles/bottom.png"
    // }); // bottom

    // walls.push({
    //     id: WALL_TOP,
    //     x: 0,
    //     y: HEADER_HEIGHT,
    //     width: w / 2,
    //     height: wallImgMinDimension / 2,
    //     image: "images/tiles/top.png"
    // }); // top

    // walls.push({
    //     id: WALL_LEFT,
    //     x: 0, //wallImgMinDimension / 2,
    //     y: HEADER_HEIGHT + wallImgMinDimension,// + h / 2,
    //     width: wallImgMinDimension / 2,
    //     height: (h - HEADER_HEIGHT - 2 * wallImgMinDimension) / 2,
    //     image: "images/tiles/wall_left.png"
    // }); // left

    // walls.push({
    //     id: WALL_RIGHT,
    //     x: w - wallImgMinDimension,
    //     y: HEADER_HEIGHT + wallImgMinDimension,
    //     width: wallImgMinDimension / 2,
    //     height: (h - HEADER_HEIGHT - 2 * wallImgMinDimension) / 2,
    //     image: "images/tiles/wall_right.png"
    // }); // right

    // set up physics for the world (no gravity etc.)
    setupPhysics();

    // listen to collisions
    addCollisionListener();

    // register sounds
    registerSounds();

    // add objects, walls and players
    createScene();
    addPlayers();

    // add scoreboard now that we know the number of players
    addScoreboard();

    addIceWarning();

    // createjs.Ticker.addListener(this);
    createjs.Ticker.addEventListener("tick", tick);
    // createjs.Ticker.addEventListener("tick", () => { circle.x += 1; testPlayer.x += 1.5; stage.update()});
    createjs.Ticker.setFPS(FRAMERATE);
    createjs.Ticker.useRAF = true;
}

function getBoundaries()
{
    var left, right, bottom, top;
    left = right = bottom = top = 0;
    for (var i = 0 ; i < walls.length ; i++)
    {
        switch (walls[i].id)
        {
        case WALL_LEFT:
            left = walls[i].x + walls[i].width;
            break;
        case WALL_RIGHT:
            right = walls[i].x - walls[i].width;
            break;
        case WALL_TOP:
            top = walls[i].y + walls[i].height;
            break;
        case WALL_BOTTOM:
            bottom = walls[i].y - walls[i].height;
            break;
        }
    }
    return { left: left, right: right, bottom: bottom, top: top };
}

function addCollisionListener()
{
    var b2Listener = Box2D.Dynamics.b2ContactListener;

    // Add listeners for contact
    var listener = new b2Listener;

    listener.BeginContact = function(contact) {
        var objectA = contact.GetFixtureA().GetBody().GetUserData();
        var objectB = contact.GetFixtureB().GetBody().GetUserData();

        var soundToPlay = null;

        if (objectA.type == TYPE_PLAYER && objectB.type == TYPE_PLAYER)
        {
            // players can steal points from each other
//            var pointsToMoveFromAToB = (objectB.player.body.attributes.stealing/100)*objectA.player.score;
//            pointsToMoveFromAToB -= (objectA.player.body.attributes.stealing/100)*objectB.player.score;
            var pointsToMoveFromAToB = objectB.player.stealingPower()*objectA.player.score;
            pointsToMoveFromAToB -= objectA.player.stealingPower()*objectB.player.score;
            pointsToMoveFromAToB = Math.floor(pointsToMoveFromAToB);

            if (debugScores)
            {
                console.log("score A("+objectA.player.playerNumber+") B("+objectB.player.playerNumber+") before", objectA.player.score, objectB.player.score);
            }
//            objectA.player.score -= pointsToMoveFromAToB;
//            objectB.player.score += pointsToMoveFromAToB;
            var updateScoreBoard = true;
            if (pointsToMoveFromAToB > 0)
            {
                //console.log("Player "+objectB.player.playerNumber+" stole "+Math.abs(pointsToMoveFromAToB)+" points from player "+objectA.player.playerNumber+"!");
                objectB.player.stealFromPlayer(objectA.player, Math.abs(pointsToMoveFromAToB));
            }
            else if (pointsToMoveFromAToB < 0)
            {
                //console.log("Player "+objectA.player.playerNumber+" stole "+Math.abs(pointsToMoveFromAToB)+" points from player "+objectB.player.playerNumber+"!");
                objectA.player.stealFromPlayer(objectB.player, Math.abs(pointsToMoveFromAToB));
            }
            else
            {
                updateScoreBoard = false;
                soundToPlay = randomNeutralSound();
            }
            if (debugScores)
            {
                console.log("score A("+objectA.player.playerNumber+") B("+objectB.player.playerNumber+") after", objectA.player.score, objectB.player.score);
                console.log("---");
            }

            // players also push each other
            objectA.player.push();

            if (updateScoreBoard)
            {
                scoreboard.updateScore(objectA.player.playerNumber-1, objectA.player.score);
                scoreboard.updateScore(objectB.player.playerNumber-1, objectB.player.score);

                // play sound "hey" from complaining player or "haha" from stealing player (choose randomly)
                // or default collision sound if no one steals anything
                var happyOrAngry = randomRange(0, 1);
                soundToPlay = (happyOrAngry < 0.5 ? randomHappySound() : randomAngrySound());
            }
        }
        else if (objectA.type == TYPE_PLAYER || objectB.type == TYPE_OBJECT)
        {
            // a player can push a dynamic object
            if (objectA.type == TYPE_PLAYER)
                objectA.player.push();
            soundToPlay = randomNeutralSound();
        }
        else if (objectA.type == TYPE_PLAYER || objectB.type == TYPE_PLAYER)
        {
            soundToPlay = randomNeutralSound();
        }
        // uncomment below to have sounds for other objects collising (e.g. dynamic object hitting a wall)
//        else
//        {
//            soundToPlay = SOUND_COLLISION;
//        }

        playSound(soundToPlay);
    }

    listener.EndContact = function(contact) {
    }

    listener.PostSolve = function(contact, impulse) {
    }

    listener.PreSolve = function(contact, oldManifold) {
    }

    this.world.SetContactListener(listener);
}

function setupPhysics() {
    // no gravity (0 on x axis, 0 on y axis)
    // true = allow sleep (when objects are not affected by physics anymore they go to sleep, so take less CPU time)
    world = new b2d.b2World(new b2d.b2Vec2(0, 0), true);

    world.friction = 1; // when not icy
    world.isIcy = false;

    // debug draw:
    var debugDraw = new b2d.b2DebugDraw();
    debugDraw.SetSprite(debug.canvas.getContext("2d"));
    debugDraw.SetDrawScale(SCALE);
    debugDraw.SetFillAlpha(0.5);
    debugDraw.SetFlags(b2d.b2DebugDraw.e_shapeBit | b2d.b2DebugDraw.e_jointBit | b2d.b2DebugDraw.e_centerOfMassBit);
    world.SetDebugDraw(debugDraw);
}

function createScene()
{
    // background image
    var bg = new createjs.Bitmap("images/bg_stone2_800x600.jpg");
    bg.x = 0;
    bg.y = HEADER_HEIGHT;
    stage.addChild(bg);

    // walls
    for (var i = 0 ; i < walls.length ; i++)
    {
        var wall = new Wall(walls[i].x/SCALE, walls[i].y/SCALE, walls[i].width/SCALE, walls[i].height/SCALE, walls[i].image);
        stage.addChild(wall.view);
    }

    // dynamic object
    var mo = new MoveableObject(400, 400);
    stage.addChild(mo.view);

    calculateObjectBoxesBoundaries();
    addObjectsContainer();
}

function addScoreboard()
{
    // scoreboard
    scoreboard = new ScoreBoard(playerCount);
    for (var i = 0 ; i < scoreboard.objectsToShow.length ; i++)
    {
        stage.addChild(scoreboard.objectsToShow[i]);
    }
}

function addIceWarning()
{
    // iceWarning
    iceWarning = new IceWarning(wallImgMinDimension, HEADER_HEIGHT+wallImgMinDimension);
    for (var i = 0 ; i < iceWarning.objectsToShow.length ; i++)
    {
        stage.addChild(iceWarning.objectsToShow[i]);
    }
}

function makeTheWorldIcy()
{
    iceWarning.startTimer();
    // make the world icy for all players
    world.friction = 0;
    world.isIcy = true;
}

function makeTheWorldNotIcy()
{
    world.friction = 1;
    world.isIcy = false;
}

function showWinner(playerNumber)
{
    // victory image
    var trophy = new createjs.Bitmap("images/victory.png");
    trophy.x = w/2;
    trophy.y = h/2;
    trophy.visible = false;
    stage.addChild(trophy);
    trophy.image.onload = function()
    {
        trophy.recenter();
        trophy.visible = true;
    }

    // add winner image in the middle
    var winner = new createjs.Bitmap("images/players/player"+playerNumber+"_won.png");
    winner.x = trophy.x;
    winner.y = trophy.y-20;
    winner.regX = winner.regY = 65;
    stage.addChild(winner);

    // add team name
    var teamName = new createjs.Text("Team "+playerNumber, "normal 30px TW Cen MT", "#231f20");
    teamName.textAlign = "center";
    teamName.x = trophy.x;
    teamName.y = trophy.y+126;
    teamName.maxWidth = 200;
    stage.addChild(teamName);
}

// refresh
function tick()
{
    // console.log('showWinnercountdown', showWinnerCountdown, gameOver, activeObjectsRemaining())
    if (showWinnerCountdown > 0)
    {
        showWinnerCountdown--;
        if (showWinnerCountdown == 0)
        {
            // show the winner
            var highestScore = 0;
            var index = 0;
            for (var i = 0 ; i < players.length ; i++)
            {
                if (players[i].view.score > highestScore)
                {
                    highestScore = players[i].view.score;
                    index = i;
                }
            }
            showWinner(players[index].view.playerNumber);
            playSound(SOUND_VICTORY);
        }
    }
    if (gameOverCountdown > 0)
    {
        gameOverCountdown--;
        if (gameOverCountdown == 0)
        {
            gameOver = true;
            console.log("GAME OVER");
        }
    }
    if (gameOver) return;

    // check if there are more objects that haven't been picked up
    if (!activeObjectsRemaining())
    {
        // display the next set of objects (unless the game is finished)
        objectOrderIndex++;
        if (objectOrderIndex < objectOrder.length)
        {
            if (objectOrderIndex > 0)
            {
                removeAllObjects();
                resetBoxes();
            }
            var obj = objectOrder[objectOrderIndex];
            if (obj.title !== undefined)
            {
                console.log("Title: ", obj.title);
            }
            for (var i = 0 ; i < obj.objects.length ; i++)
            {
                if (obj.objects[i] == OBJ_LOAD_VEGGIES)
                {
                    loadVeggies();
                }
                else
                {
                    loadObjects(obj.objects[i], objImgHalfWidth);
                }
            }
        }
        // game is finished
        else
        {
            if (gameOverCountdown == 0)
            {
                gameOverCountdown = TIMEOUT_AFTER_GAME_OVER*FRAMERATE;
                showWinnerCountdown = TIMEOUT_SHOW_WINNER*FRAMERATE;
                for (var i = 0 ; i < players.length ; i++)
                {
                    players[i].view.stop();
                }
                console.log("Game finishing...");
            }
        }
    }

    iceWarning.update();
    stage.update();

    if (DEBUG) { world.DrawDebugData(); }

    // velocity = calculate force (physics). Higher = more physics precision but slower
    // position (physics)
    // world.Step(time step e.g. 1/fps, velocity_iteration, position_iteration)
    world.Step(1/FRAMERATE, 10, 10);
    world.ClearForces();
}
