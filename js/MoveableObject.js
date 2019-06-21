(function(window) {
    // damping allows the object to decelerate (linearly and rotationally) over time
    // the higher the damping, the quicker the player will come to a halt
    const LINEAR_DAMPING = 0.5;
    const ANGULAR_DAMPING = 0.5;

    var centerOffset = 2;

    function MoveableObject(x, y) {
        var radius = 18;

        this.view = new createjs.Bitmap("images/gem.png");
        // registration point of the circle is in the centre
        this.view.regX = radius+centerOffset;
        this.view.regY = radius+centerOffset;

        var fixDef = new b2d.b2FixtureDef();
        fixDef.density = 100; // weight
        fixDef.friction = 0.1;
        fixDef.restitution = 0.8; // bounciness (e.g. against the wall)
        var bodyDef = new b2d.b2BodyDef();
        bodyDef.type = b2d.b2Body.b2_dynamicBody;
        bodyDef.position = new b2d.b2Vec2(x/SCALE, y/SCALE); // initial position
        fixDef.shape = new b2d.b2CircleShape(radius/SCALE);
        this.view.body = world.CreateBody(bodyDef);
        this.view.body.CreateFixture(fixDef);
        // this.view.onTick = tick; // old
        this.view.on('tick', tick);

        // allow the player to decelerate over time (linearly and rotation-wise too)
        // the higher the number, the more it quicker it slows down
        this.view.body.SetLinearDamping(LINEAR_DAMPING);
        this.view.body.SetAngularDamping(ANGULAR_DAMPING);

        this.view.body.SetUserData({ type: TYPE_OBJECT });

        this.view.getPosition = function() {
            return { x: this.x, y: this.y };
        };
        this.view.getOrientation = function() {
            return this.rotation;
        };
    }

    function tick(e)
    {
        this.x = this.body.GetPosition().x * SCALE;
        this.y = this.body.GetPosition().y * SCALE;

        this.rotation = radToDeg(this.body.GetAngle());
    }

    window.MoveableObject = MoveableObject;
})(window);