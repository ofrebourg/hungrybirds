(function(window) {
    var KEYCODE_LEFT  = 37;
    var KEYCODE_UP    = 38;
    var KEYCODE_RIGHT = 39;
    var KEYCODE_DOWN  = 40;
    var KEYCODE_P     = 80;
    var lfHeld, rtHeld, fwdHeld, bwdHeld; // is the user holding a key
    var turnLeftDone, turnRightDone;

//    var TURN_FACTOR   = 3; // how much the player turns per frame
//    const ACCELERATION = 50; // for ApplyImpulse
    const MIN_SPEED = 0.1;   // if the player allocates 0% on speed, we'll give them a minimum speed
    const MAX_SPEED = 700; // maximum speed if the player allocates 100% on speed

    const MIN_BRAKE_FORCE = 0.005;
    const MAX_BRAKE_FORCE = 0.2;

    const MIN_ANGULAR_BRAKE_FORCE = 0.1;
    const MAX_ANGULAR_BRAKE_FORCE = 0.8;

    const MIN_PUSH = 0.1;
    const MAX_PUSH = 2;

    const NO_STEALING_TIME = 5;
    var debugStealing = true;

    const TIME_TO_GET_SOBER = 5;
    const RANDOM_DRUNK_ANGLE = 45;
    const RANDOM_DRUNK_SPEED_MODIFIER_MIN = 1;
    const RANDOM_DRUNK_SPEED_MODIFIER_MAX = 2;

    // damping allows the player to decelerate (linearly and rotationally) over time
    // the higher the damping, the quicker the player will come to a halt
    const LINEAR_DAMPING = 1.0;  // damping if it's not icy
    const ANGULAR_DAMPING = 1.0; // damping if it's not icy
    const MIN_GRIP = 0.4; // max grip will be 1 if attributes.grip == 100
    const MAX_GRIP = 1;

    var previousPosition;
    var playerOffsetCenter = 5;
    var gamePaused = true;
    var controlsEnabled = true;

    function Player(playerNumber, x, y, startingAngle) {
        var playerRadius = 15;

        this.view = new createjs.Bitmap("images/players/playerRound"+playerNumber+".png");
        // registration point of the circle is in the centre
        this.view.regX = playerRadius+playerOffsetCenter; // old
        this.view.regY = playerRadius+playerOffsetCenter; // old
        // this.view.x = x;// + playerRadius + playerOffsetCenter;
        // this.view.x = y;// + playerRadius + playerOffsetCenter;

        var fixDef = new b2d.b2FixtureDef();
        fixDef.density = 70; // weight of the car
        fixDef.friction = 0.5;
        fixDef.restitution = 0.5; // bounciness (e.g. against the wall) -> gets affected by attributes.pushing
        var bodyDef = new b2d.b2BodyDef();
        bodyDef.type = b2d.b2Body.b2_dynamicBody;
        bodyDef.position = new b2d.b2Vec2(x/SCALE, y/SCALE); // initial position
        fixDef.shape = new b2d.b2CircleShape(playerRadius/SCALE);
        this.view.body = world.CreateBody(bodyDef);
        this.view.body.CreateFixture(fixDef);
        this.view.body.SetAngle(degToRad(startingAngle));
        // this.view.onTick = tick; // old
        this.view.on('tick', tick);

        this.view.turn = turn;
        this.view.accelerate = accelerate;
        this.view.brake = brake;
        this.view.consume = consume;
        this.view.updateFriction = updateFriction;
        this.view.theWorldJustChanged = false;
        this.view.parametersAreCorrect = parametersAreCorrect;

        // set default values to be overridden by implemented players
        this.view.playerAIMovement = defaultPlayerMove;
        this.view.body.attributes = { stealing: 0, speed: 0, brakes: 0, pushing: 0, grip: 0 };
        this.view.validateAttributes = validateAttributes;

        // allow the player to decelerate over time (linearly and rotation-wise too)
        // the higher the number, the more it quicker it slows down
        this.view.body.SetLinearDamping(LINEAR_DAMPING*world.friction);
        this.view.body.SetAngularDamping(ANGULAR_DAMPING*world.friction);

        this.view.body.drunk = false;
        this.view.body.drunkCountdown = 0;

        this.view.playerNumber = playerNumber;
        this.view.score = 0;
        this.view.stealingPower = stealingPower;
        this.view.stealFromPlayer = stealFromPlayer;
        this.view.canSteal = true;
        this.view.stealingEnableCountdown = 0;

        this.view.push = push;
        this.view.turbo = turbo;
        this.view.stop = stop;

        this.view.getOtherPlayersInfo = getOtherPlayersInfo;

        this.view.body.SetUserData({ type: TYPE_PLAYER, player: this.view });

        lfHeld = rtHeld = fwdHeld = bwdHeld = false;
        turnLeftDone = turnRightDone = false;

        previousPosition = { x: x, y: y };

        this.view.getPosition = function() {
            return { x: this.x, y: this.y };
        };
        this.view.getOrientation = function() {
            return this.rotation;
        };

        this.enableControls = enableControls;

        document.onkeydown = handleKeyDown;
        document.onkeyup = handleKeyUp;
    }

    function stop()
    {
        this.canSteal = false;
        brake(this.body);
        gamePaused = true;
    }

    function getOtherPlayersInfo()
    {
        var otherPlayers = [];
        for (var p = 0 ; p < players.length ; p++)
        {
            var player = players[p].view;
            if (player.playerNumber != this.playerNumber)
            {
                otherPlayers.push({ playerNumber: player.playerNumber, position: player.getPosition(), score: player.score });
            }
        }
        return otherPlayers;
    }

    function stealingPower()
    {
        if (debugStealing && !this.canSteal)
        {
            console.log("Player "+this.playerNumber+" cannot steal now!");
        }
        return (this.canSteal ? this.body.attributes.stealing/100 : 0);
    }

    function stealFromPlayer(otherPlayer, points)
    {
        console.log("Player "+this.playerNumber+" stole "+points+" points from player "+otherPlayer.playerNumber+"!");
        this.score += points;
        otherPlayer.score -= points;

        // prevent this player from stealing again for some time
        this.canSteal = false;
        this.stealingEnableCountdown = NO_STEALING_TIME*FRAMERATE;
    }

    function enableControls(c)
    {
        controlsEnabled = c;
    }

    function validateAttributes()
    {
        // nothing to do for stealing, it's taken into account by the collision listener (see Main.js)

        // speed

        // brakes: nothing to do here. The brake properties are being read when trying to brake or turn.

        // pushing: nothing to do here. This property is being used when a collision occurs between dynamic bodies

        // grip: affects the damping
        this.updateFriction();
    }

    function parametersAreCorrect()
    {
        // stealing: between 0 and 100%
        //this.attributes = { stealing: 0 };
        var total = 0;
        if (this.body.attributes.stealing < 0 || this.body.attributes.stealing > 100)
        {
            console.log("Incorrect value for attribute 'stealing'");
            return false;
        }
        total += this.body.attributes.stealing;

        if (this.body.attributes.speed < 0 || this.body.attributes.speed > 100)
        {
            console.log("Incorrect value for attribute 'speed'");
            return false;
        }
        total += this.body.attributes.speed;

        if (this.body.attributes.brakes < 0 || this.body.attributes.brakes > 100)
        {
            console.log("Incorrect value for attribute 'brakes'");
            return false;
        }
        total += this.body.attributes.brakes;

        if (this.body.attributes.pushing < 0 || this.body.attributes.pushing > 100)
        {
            console.log("Incorrect value for attribute 'pushing'");
            return false;
        }
        total += this.body.attributes.pushing;

        if (this.body.attributes.grip < 0 || this.body.attributes.grip > 100)
        {
            console.log("Incorrect value for attribute 'pushing'");
            return false;
        }
        total += this.body.attributes.grip;

        // check total
        if (total > 100)
        {
            console.log("Total of attributes is over 100!");
            return false;
        }
        else if (total < 100)
        {
            console.log("Warning: player "+this.playerNumber+" only has a total of "+total+" out of 100");
        }
        return true;
    }

    function turnLeft(body)
    {
        turn(body, -90);
    }

    function turnRight(body)
    {
        turn(body, 90);
    }

    function push()
    {
        //console.log("Player "+this.playerNumber+" push");

        // get direction and apply an impulse depending on the push capabilities of the player
        var linear = this.body.GetLinearVelocity();
        var forceX, forceY;
        forceX = linear.x*this.body.GetMass();
        forceY = linear.y*this.body.GetMass();

        var forceModifier = getPushingForce(this.body);
        forceX *= forceModifier;
        forceY *= forceModifier;

        // apply linear impulse
        this.body.ApplyImpulse(new b2d.b2Vec2(forceX,forceY), this.body.GetWorldCenter()); // start braking immediately
    }

    function turbo()
    {
        console.log("Player "+this.playerNumber+" is using turbo!");

        // get direction and apply an impulse depending on the push capabilities of the player
        var linear = this.body.GetLinearVelocity();
        var forceX, forceY;
        forceX = linear.x*this.body.GetMass();
        forceY = linear.y*this.body.GetMass();

        var forceModifier = MAX_PUSH;
        forceX *= forceModifier;
        forceY *= forceModifier;

        // apply linear impulse
        this.body.ApplyImpulse(new b2d.b2Vec2(forceX,forceY), this.body.GetWorldCenter()); // start braking immediately
    }

    // turn by a certain angle (in degrees)
    // apply opposite force and reply force in new direction so that the player turns instantly
    function turn(body, angle)
    {
        // if drunk, change direction randomly
        if (body.drunk)
        {
            // twice the random angle
            angle += randomRange(-RANDOM_DRUNK_ANGLE, RANDOM_DRUNK_ANGLE);
        }

        var worldFriction = world.friction;
        // if it's icy but we're equipped with winter tyres, we have a better grip
        if (world.isIcy && body.equippedWithWinterTyres)
        {
            worldFriction = 1;
        }

        var linearFriction = worldFriction*getGrip(body);
        var brakeForce = linearFriction;

        // get the negative x and y components and multiply by the mass
        // to get the amount of impulse needed to stop the player (body)
        // console.log("brake body", body);
        var linear = body.GetLinearVelocity();
        var forceX, forceY, amountToStopX, amountToStopY;
        forceX = amountToStopX = linear.x*body.GetMass();
        forceY = amountToStopY = linear.y*body.GetMass();

        // apply a gradual stop so it's not a sudden stop.
        amountToStopX *= brakeForce;
        amountToStopY *= brakeForce;

        // apply linear impulse
        body.ApplyImpulse(new b2d.b2Vec2(-amountToStopX,-amountToStopY), body.GetWorldCenter()); // start braking immediately
/*
        // calculate angular impulse to stop the player from rotating and apply
        var angularFriction = (icy ? 0 : 1);
        var angularBrakeForce = ANGULAR_BRAKE_FORCE * angularFriction;
        var angular = body.GetAngularVelocity();
        //console.log("angular", angular);
        body.ApplyTorque(-angular * body.GetMass() * angularBrakeForce);
*/
        // set the new direction
        var angleInRadians = degToRad(angle);
        var newAngle = body.GetAngle()+angleInRadians;
        newAngle %= (2*Math.PI);
        body.SetAngle(newAngle);

        var forceInNewDirection = worldFriction*getGrip(body); // hard or impossible to go in a new direction on ice

        // reapply impulse in new direction
        var newForceX = forceInNewDirection * (forceX * Math.cos(angleInRadians) - forceY * Math.sin(angleInRadians));
        var newForceY = forceInNewDirection * (forceX * Math.sin(angleInRadians) + forceY * Math.cos(angleInRadians));
        body.ApplyImpulse(new b2d.b2Vec2(newForceX, newForceY), body.GetWorldCenter()); // same force but in the new direction
    }

    function getGrip(body)
    {
        var grip = MIN_GRIP + body.attributes.grip/100;
        return grip*MAX_GRIP/(MIN_GRIP+1);
    }

    function getBrakes(body)
    {
        var brakes = MIN_BRAKE_FORCE + body.attributes.brakes/100;
        return brakes*MAX_BRAKE_FORCE/(MIN_BRAKE_FORCE+1);
    }

    function getBrakesAngular(body)
    {
        var brakes = MIN_ANGULAR_BRAKE_FORCE + body.attributes.brakes/100;
        return brakes*MAX_ANGULAR_BRAKE_FORCE/(MIN_ANGULAR_BRAKE_FORCE+1);
    }

    function getSpeed(body)
    {
        var speed = MIN_SPEED + body.attributes.speed/100;
        return speed*MAX_SPEED/(MIN_SPEED+1);
    }

    function getPushingForce(body)
    {
        var restitution = MIN_PUSH + body.attributes.pushing/100;
        return restitution*MAX_PUSH/(MIN_PUSH+1);
    }

    function accelerate(body)
    {
        var speed = getSpeed(body);

        // if drunk, accelerate randomly
        if (body.drunk)
        {
            var speedModifier = randomRange(RANDOM_DRUNK_SPEED_MODIFIER_MIN, RANDOM_DRUNK_SPEED_MODIFIER_MAX);
            speed *= speedModifier;
        }

        var angle = body.GetAngle();
        var forceX = Math.sin(angle) * speed;
        var forceY = -Math.cos(angle) * speed;
        var force = new b2d.b2Vec2(forceX, forceY);
        //body.ApplyImpulse(force, body.GetWorldCenter()); // apply force immediately
        body.ApplyForce(force, body.GetWorldCenter()); // apply force progressively
    }

    function brake(body)
    {
        // get the negative x and y components and multiply by the mass
        // to get the amount of impulse needed to stop the player (body)
        // console.log("brake body", body);
        var linear = body.GetLinearVelocity();
        var amountToStopX = -linear.x*body.GetMass();
        var amountToStopY = -linear.y*body.GetMass();

        // apply a gradual stop so it's not a sudden stop.
        amountToStopX *= getBrakes(body)*getGrip(body);
        amountToStopY *= getBrakes(body)*getGrip(body);

        // apply linear impulse
        body.ApplyImpulse(new b2d.b2Vec2(amountToStopX,amountToStopY), body.GetWorldCenter()); // start braking immediately

        // calculate angular impulse to stop the player from rotating and apply
        var angular = body.GetAngularVelocity();
        //console.log("angular", angular);
        body.ApplyTorque(-angular * body.GetMass() * getBrakesAngular(body));
    }

    function updateFriction()
    {
        this.body.SetLinearDamping(LINEAR_DAMPING*world.friction*getGrip(this.body));
        this.body.SetAngularDamping(ANGULAR_DAMPING*world.friction*getGrip(this.body));
    }

    function defaultPlayerMove()
    {
        // handle turning
        if (lfHeld && !turnLeftDone)
        {
            turnLeft(this.body);
            turnLeftDone = true;
        }
        if (rtHeld && !turnRightDone)
        {
            turnRight(this.body);
            turnRightDone = true;
        }
        if (fwdHeld)
        {
            accelerate(this.body);
        }
        if (bwdHeld)
        {
            brake(this.body);
        }
    }

    function tick(e)
    {
        // console.log('player tick')
        if (!gamePaused)
        {
            this.playerAIMovement();
            if (world.isIcy)
            {
                this.theWorldJustChanged = true;
            }
            // we do it this way to make sure that updateFriction() is called once after turning the ice off
            if (this.theWorldJustChanged)
            {
                this.updateFriction();
            }
            if (!world.isIcy)
            {
                this.theWorldJustChanged = false;
            }
            if (!this.canSteal)
            {
                // count down until 0: the player can restart stealing
                this.stealingEnableCountdown--;
                if (this.stealingEnableCountdown <= 0)
                {
                    this.canSteal = true;
                }
            }
            if (this.body.drunk)
            {
                this.body.drunkCountdown--;
                if (this.body.drunkCountdown <= 0)
                {
                    this.body.drunk = false;
                    console.log("Player "+this.playerNumber+" is now sober!");
                }
            }
        }

        update(this);
    }

    function isNotMoving(player)
    {
        var threshold = 0.1;
        var currentPosition = player.getPosition();
        return (Math.abs(previousPosition.x - currentPosition.x) < threshold &&
                Math.abs(previousPosition.y - currentPosition.y) < threshold);
    }

    function update(player)
    {
        player.x = player.body.GetPosition().x * SCALE;
        player.y = player.body.GetPosition().y * SCALE;

        player.rotation = radToDeg(player.body.GetAngle());
    }

    function handleKeyDown(e)
    {
        //cross browser issues exist
        if(!e){ var e = window.event; }
        //console.log("key down", e);
        switch (e.keyCode)
        {
        case KEYCODE_LEFT: // left arrow
            if (controlsEnabled)
                lfHeld = true;
            break;
        case KEYCODE_RIGHT: // right arrow
            if (controlsEnabled)
                rtHeld = true;
            break;
        case KEYCODE_UP:
            if (controlsEnabled)
                fwdHeld = true;
            break;
        case KEYCODE_DOWN:
            if (controlsEnabled)
                bwdHeld = true;
            break;
        case KEYCODE_P:
            gamePaused = !gamePaused;
            console.log("game paused? "+(gamePaused ? "yes" : "no"));
            break;
        case (KEYCODE_P+2): // R
            removeAllObjects();
            resetBoxes();
            loadObjects(breakfast1, objImgHalfWidth);
            break;
        case (KEYCODE_P+3): // S
            removeAllObjects();
            resetBoxes();
            loadObjects(breakfast2, objImgHalfWidth);
            break;
        case (KEYCODE_P+4): // T
            removeAllObjects();
            resetBoxes();
            loadObjects(drinksForBreakfast, objImgHalfWidth);
            break;
        case (KEYCODE_P+5): // U
            removeAllObjects();
            resetBoxes();
            loadObjects(drinksForLunch, objImgHalfWidth);
            break;
        case (KEYCODE_P+6): // V
            removeAllObjects();
            resetBoxes();
            loadObjects(lunch1, objImgHalfWidth);
            break;
        case (KEYCODE_P+7): // W
            removeAllObjects();
            resetBoxes();
            loadObjects(lunch2, objImgHalfWidth);
            break;
        case (KEYCODE_P+8): // X
            removeAllObjects();
            resetBoxes();
            loadObjects(carParts1, objImgHalfWidth);
            loadObjects(carParts2, objImgHalfWidth);
            break;
        }
    }

    function handleKeyUp(e)
    {
        //cross browser issues exist
        if(!e){ var e = window.event; }
        //console.log("key up", e);
        switch (e.keyCode)
        {
        case KEYCODE_LEFT: // left arrow
            lfHeld = false;
            turnLeftDone = false;
            break;
        case KEYCODE_RIGHT: // right arrow
            rtHeld = false;
            turnRightDone = false;
            break;
        case KEYCODE_UP:
            fwdHeld = false;
            break;
        case KEYCODE_DOWN:
            bwdHeld = false;
            break;
        }
    }

    // the player consumed something (food or drink)
    // sometimes it will affect its behaviour
    function consume(object)
    {
        //console.log("Player "+this.playerNumber+" consumed object", this, object);

        if (object.attributes !== undefined)
        {
            for (var i = 0 ; i < object.attributes.length ; i++)
            {
                switch(object.attributes[i])
                {
                // if the object is frozen, make the world icy
                case OBJ_ATTR_FROZEN:
                    makeTheWorldIcy();
                    break;
                case OBJ_ATTR_BEER:
                    console.log("Drinking a beer!");
                    this.body.drunk = true;
                    this.body.drunkCountdown = TIME_TO_GET_SOBER*FRAMERATE;
                    break;
                case OBJ_ATTR_TURBO:
                    this.turbo();
                    break;
                case OBJ_ATTR_BRAKES:
                    console.log("new brakes for player "+this.playerNumber+"!");
                    this.body.attributes.brakes = Math.max(this.body.attributes.brakes, BONUS_OBJ_BRAKES);
                    break;
                case OBJ_ATTR_GRIP:
                    console.log("new grip for player "+this.playerNumber+"!");
                    this.body.attributes.grip = Math.max(this.body.attributes.grip, BONUS_OBJ_GRIP);
                    this.body.equippedWithWinterTyres = true;
                    break;
                case OBJ_ATTR_SPEED:
                    console.log("new speed for player "+this.playerNumber+"!");
                    this.body.attributes.speed = Math.max(this.body.attributes.speed, BONUS_OBJ_SPEED);
                    break;
                }
            }
        }
    }

    window.Player = Player;
})(window);