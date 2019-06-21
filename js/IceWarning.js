(function(window) {

    const TIMER = 5; // in seconds

    function IceWarning(x, y) {
        this.objectsToShow = [];
        this.framesRemaining = TIMER*FRAMERATE;
        this.timerStarted = false;

        // ice warning
        var iceWarningImg = new createjs.Bitmap("images/iceWarning.png");
        iceWarningImg.x = x;
        iceWarningImg.y = y;
        this.objectsToShow.push(iceWarningImg);

        // add Ice!
        var iceWarningTxt = new createjs.Text("Ice!", "normal 24px Crayon", "#568fcb");
        iceWarningTxt.textAlign = "left";
        iceWarningTxt.x = x+37;
        iceWarningTxt.y = y+4;
        iceWarningTxt.maxWidth = 78;
        this.objectsToShow.push(iceWarningTxt);

        // add number of seconds remaining
        this.iceWarningSeconds = new createjs.Text(TIMER.toString(), "normal 24px Crayon", "#568fcb");
        this.iceWarningSeconds.textAlign = "right";
        this.iceWarningSeconds.x = x+109;
        this.iceWarningSeconds.y = y+4;
        this.iceWarningSeconds.maxWidth = 30;
        this.objectsToShow.push(this.iceWarningSeconds);

        for (var i = 0 ; i < this.objectsToShow.length ; i++)
        {
            this.objectsToShow[i].visible = false;
        }

        this.startTimer = startTimer;
        this.stopTimer = stopTimer;
        this.update = update;
    }

    function startTimer()
    {
        this.timerStarted = true;
        for (var i = 0 ; i < this.objectsToShow.length ; i++)
        {
            this.objectsToShow[i].visible = true;
        }
    }

    function stopTimer()
    {
        // reset
        this.framesRemaining = TIMER*FRAMERATE;
        this.timerStarted = false;
        for (var i = 0 ; i < this.objectsToShow.length ; i++)
        {
            this.objectsToShow[i].visible = false;
        }
        // the world is not icy anymore
        makeTheWorldNotIcy();
    }

    function update()
    {
        if (this.timerStarted)
        {
            this.framesRemaining--;
            var secondsRemaining = Math.floor(this.framesRemaining/FRAMERATE);
            this.iceWarningSeconds.text = secondsRemaining.toString();
            if (this.framesRemaining <= 0)
            {
                this.stopTimer();
            }
        }
    }

    window.IceWarning = IceWarning;
})(window);