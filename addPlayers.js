/**
 * Created with JetBrains WebStorm.
 * User: Olivier Frebourg <ofrebour@cisco.com>
 * Date: 15 May 2013
 * Time: 9:42 PM
 * Cisco - 2013
 */

function addPlayers()
{
    var offsetFromCorner = 50;

    // TODO: change player number below to match your PlayerN.js
    var p = new Player1(offsetFromCorner, h-offsetFromCorner, -135);
    if (p.player.view.parametersAreCorrect())
    {
        players.push(p.player);
        stage.addChild(p.player.view);
        console.log('player', p.player)
        playerCount++;
    }
    else
    {
        console.log("Player "+ p.player.view.playerNumber +" is invalid");
        world.DestroyBody(p.player.view.body);
    }

    var p = new Player2(w-offsetFromCorner, HEADER_HEIGHT+offsetFromCorner, 45);
    if (p.player.view.parametersAreCorrect())
    {
        console.log("Player "+p.player.view.playerNumber+" is ready");
        players.push(p.player);
        stage.addChild(p.player.view);
        playerCount++;
    }
    else
    {
        console.log("Player "+ p.player.view.playerNumber +" is invalid");
        world.DestroyBody(p.player.view.body);
    }

   var p = new Player3(w-offsetFromCorner, h-offsetFromCorner, 135);
   if (p.player.view.parametersAreCorrect())
   {
       console.log("Player "+p.player.view.playerNumber+" is ready");
       players.push(p.player);
       stage.addChild(p.player.view);
       playerCount++;
   }
   else
   {
       console.log("Player "+ p.player.view.playerNumber +" is invalid");
       world.DestroyBody(p.player.view.body);
   }

   var p = new Player4(offsetFromCorner, h-offsetFromCorner, -135);
   if (p.player.view.parametersAreCorrect())
   {
       console.log("Player "+p.player.view.playerNumber+" is ready");
       players.push(p.player);
       stage.addChild(p.player.view);
       playerCount++;
   }
   else
   {
       console.log("Player "+ p.player.view.playerNumber +" is invalid");
       world.DestroyBody(p.player.view.body);
   }

}