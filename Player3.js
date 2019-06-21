(function(window) {

    function Player3(x, y, angle) {
        this.player = new Player(3, x, y, angle);
        this.player.view.playerAIMovement = moveMyPlayer;

        this.player.view.body.attributes.stealing = 30;
        this.player.view.body.attributes.speed = 15;
        this.player.view.body.attributes.brakes = 20;
        this.player.view.body.attributes.pushing = 15;
        this.player.view.body.attributes.grip = 20;

        this.player.view.validateAttributes();
    }

    var approximation = 15;

    function moveMyPlayer()
    {
        var objects = findActiveObjects();
        if (objects.length > 0)
        {
            var objectIWant = objects[0];

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
    }

    window.Player3 = Player3;
})(window);