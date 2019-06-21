(function(window) {
    function Wall(x, y, width, height, image) {
        this.view = new createjs.Bitmap(image);
        //this.view = new createjs.Bitmap("images/players/playerRound1.png");
        this.view.regX = width*SCALE; // old
        this.view.regY = height*SCALE; // old
        // this.view.x = x; 
        // this.view.y = y;

        var fixDef = new b2d.b2FixtureDef();
        fixDef.density = 1;
        fixDef.friction = 1;
        fixDef.restitution = 0.25;
        var bodyDef = new b2d.b2BodyDef();
        bodyDef.type = b2d.b2Body.b2_staticBody;
        // registration point of the box is in the centre
        bodyDef.position.x = x; // old
        bodyDef.position.y = y; // old
        // bodyDef.position.x = x + width;
        // bodyDef.position.y = y + height;
        fixDef.shape = new b2d.b2PolygonShape();
        // set width and height of the box
        fixDef.shape.SetAsBox(width, height);

        this.view.body = world.CreateBody(bodyDef);
        this.view.body.CreateFixture(fixDef);
        // this.view.onTick = tick; // old
        this.view.on('tick', tick);

        this.view.body.SetUserData({ type: TYPE_WALL });
    }
    function tick() {
        // console.log('Wall tick')
        this.x = this.body.GetPosition().x * SCALE;
        this.y = this.body.GetPosition().y * SCALE;

        //this.rotation = radToDeg(this.body.GetAngle());
    }

    window.Wall = Wall;
})(window);