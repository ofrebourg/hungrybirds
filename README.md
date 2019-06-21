# Graduate Day at Cisco, May 2013

I designed a game - that I could call Hungry Birds - and the exercise is to implement the Artificial Intelligence
of the players.
The aim of the game is simple: get as many points as possible by collecting objects (food or drinks).
But you have opponents! So how will you do it? By being quicker than the others? Or choosing carefully in which order
you will collect the objects? Or by stealing from the opponents maybe?

--------------
 HOW TO START
--------------

1. Run Chrome (your favourite browser) and check that you can load the following URL: http://localhost/
   If it doesn't work, check that WAMP is running.
   If you can see the game: Open the console (Ctrl-Shift-I) to see if there are any errors. You should see: "Player 1 is ready" in the console
   Press P to start the game. P pauses and restarts the game. But the player is not moving, nothing is happening yet.
2. Rename PlayerTemplate.js PlayerN.js (where N is your player number between 1 and 4)
3. Edit your PlayerN.js file to set the class name and player number (look for the TODOs)
4. Edit addPlayers.js to call the appropriate class name
5. Edit index.html to load the appropriate PlayerN.js file
6. Check you can still load the game correctly in Chrome: http://localhost/ (check the console for errors)
7. Start implementing the player's main loop! i.e. moveMyPlayer() inside your PlayerN.js file

--------------

A few words about the technologies used to create this game:
It's implemented in HTML5/javascript and uses the following libraries:
- CreateJS - the game engine
- box2d - a physics engine

Any feedback (good or bad) will be appreciated.

Good luck!

Olivier Frebourg <ofrebour@cisco.com>, Cisco - 2013
