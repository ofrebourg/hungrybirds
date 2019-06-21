(function(window) {

    var DISAPPEARING_STEPS = 20;
    var CENTER_OFFSET = 25;

    function Object(image, x, y, type, points, sound, attributes) {
        this.view = new createjs.Bitmap("images/"+image+".png");
        this.view.x = x;
        this.view.y = y;
        this.view.regX = this.view.regY = CENTER_OFFSET;
        // this.view.onTick = tick; // old
        this.view.on('tick', tick);

        this.view.displayed = true;
        this.view.disappearingCounter = 0;
        this.view.reappearanceCounter = 0;
        this.view.type = type;
        this.view.points = points;
        this.view.sound = (sound !== undefined ? sound : null);
        this.view.attributes = attributes;

        this.view.initialScale = 1;

        this.scaleObject = function(scale) {
            this.view.initialScale = scale;
            this.view.scale(scale);
        };
    }
/*
    function reset(object)
    {
        object.displayed = true;
        object.visible = true;
        object.alpha = 1;
        object.scaleX = object.scaleY = object.initialScale;
        object.disappearingCounter = 0;
        object.reappearanceCounter = 0;
    }
*/
    function tick(e)
    {
        if (this.displayed)
        {
            // detect collision with players
            for (var p = 0; p < players.length; p++)
            {
                if (players[p].view && this)
                {
                    var intersection = ndgmr.checkPixelCollision(players[p].view, this, 0.5);
                    if (intersection)
                    {
                        //console.log("intersection");
                        this.displayed = false;
                        this.disappearingCounter = 0;
                        this.reappearanceCounter = 0;

                        // add points to the player
                        players[p].view.score += this.points;
                        scoreboard.updateScore(players[p].view.playerNumber-1, players[p].view.score);

                        // play sound
                        var soundToPlay = this.sound;
                        if (soundToPlay == SOUND_EATING_RANDOM)
                        {
                            soundToPlay = randomEatingSound();
                        }
                        playSound(soundToPlay);

                        players[p].view.consume(this);
                    }
                }
            }
        }
        else if (this.disappearingCounter < DISAPPEARING_STEPS)
        {
            this.disappearingCounter++;
            this.scale(1 + this.disappearingCounter/60);
            this.alpha = 1-(this.disappearingCounter/DISAPPEARING_STEPS);
        }
        else
        {
            if (this.reappearanceCounter >= 120)
            {
                //reset(this);
                // TODO: remove the object
            }
            else
            {
                if (this.reappearanceCounter == 0)
                {
                    this.visible = false;
                }
                this.reappearanceCounter++;
            }
        }
    }

    window.Object = Object;
})(window);