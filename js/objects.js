/**
 * Created with JetBrains WebStorm.
 * User: Olivier Frebourg <ofrebour@cisco.com>
 * Date: 14 May 2013
 * Time: 6:17 PM
 * Cisco - 2013
 */

const TYPE_PLAYER = 0, TYPE_OBJECT = 1, TYPE_WALL = 2;
const WALL_BOTTOM = 0, WALL_TOP = 1, WALL_LEFT = 2, WALL_RIGHT = 3;
const OBJ_TYPE_VEGGIE = "green", OBJ_TYPE_CAR_PART = "car", OBJ_TYPE_DRINK = "drink", OBJ_TYPE_FOOD = "food";
const OBJ_ATTR_FROZEN = 0, OBJ_ATTR_BEER = 1, OBJ_ATTR_GRIP = 2, OBJ_ATTR_SPEED = 3, OBJ_ATTR_BRAKES = 4, OBJ_ATTR_TURBO = 5;
const OBJ_LOAD_VEGGIES = "LoadVeggies";

const BONUS_OBJ_BRAKES = 80; // 80% brake power when collecting the brakes object
const BONUS_OBJ_GRIP   = 80; // 80% grip when collecting the grip object
const BONUS_OBJ_SPEED  = 80; // 80% speed when collecting the speed object

var walls = [];
var objects = [];
var objectsContainer = new createjs.Container();

var fruitsAndVeggies = [
    { img: "food/greens/broccoli", type: OBJ_TYPE_VEGGIE, scale: 1, points: 34, sound: SOUND_EATING_RANDOM },
    { img: "food/greens/carrot",   type: OBJ_TYPE_VEGGIE, scale: 1, points: 41, sound: SOUND_EATING_RANDOM },
    { img: "food/greens/eggplant", type: OBJ_TYPE_VEGGIE, scale: 1, points: 24, sound: SOUND_EATING_RANDOM },
    { img: "food/greens/gherkin",  type: OBJ_TYPE_VEGGIE, scale: 1, points: 17, sound: SOUND_EATING_RANDOM },
    { img: "food/greens/onion",    type: OBJ_TYPE_VEGGIE, scale: 1, points: 40, sound: SOUND_EATING_RANDOM },
    { img: "food/greens/pepper",   type: OBJ_TYPE_VEGGIE, scale: 1, points: 31, sound: SOUND_EATING_RANDOM },
    { img: "food/greens/potato",   type: OBJ_TYPE_VEGGIE, scale: 1, points: 70, sound: SOUND_EATING_RANDOM },
    { img: "food/greens/tomato",   type: OBJ_TYPE_VEGGIE, scale: 1, points: 18, sound: SOUND_EATING_RANDOM },
    { img: "food/greens/turnip",   type: OBJ_TYPE_VEGGIE, scale: 1, points: 28, sound: SOUND_EATING_RANDOM }
];

var frozenFruitsAndVeggies = [
    { img: "food/greens/frozen_broccoli", type: OBJ_TYPE_VEGGIE, scale: 1, points: 44, sound: SOUND_EATING_RANDOM, attributes: [ OBJ_ATTR_FROZEN ] },
    { img: "food/greens/frozen_carrot",   type: OBJ_TYPE_VEGGIE, scale: 1, points: 51, sound: SOUND_EATING_RANDOM, attributes: [ OBJ_ATTR_FROZEN ] },
    { img: "food/greens/frozen_eggplant", type: OBJ_TYPE_VEGGIE, scale: 1, points: 34, sound: SOUND_EATING_RANDOM, attributes: [ OBJ_ATTR_FROZEN ] },
    { img: "food/greens/frozen_gherkin",  type: OBJ_TYPE_VEGGIE, scale: 1, points: 27, sound: SOUND_EATING_RANDOM, attributes: [ OBJ_ATTR_FROZEN ] },
    { img: "food/greens/frozen_onion",    type: OBJ_TYPE_VEGGIE, scale: 1, points: 50, sound: SOUND_EATING_RANDOM, attributes: [ OBJ_ATTR_FROZEN ] },
    { img: "food/greens/frozen_pepper",   type: OBJ_TYPE_VEGGIE, scale: 1, points: 41, sound: SOUND_EATING_RANDOM, attributes: [ OBJ_ATTR_FROZEN ] },
    { img: "food/greens/frozen_potato",   type: OBJ_TYPE_VEGGIE, scale: 1, points: 80, sound: SOUND_EATING_RANDOM, attributes: [ OBJ_ATTR_FROZEN ] },
    { img: "food/greens/frozen_tomato",   type: OBJ_TYPE_VEGGIE, scale: 1, points: 28, sound: SOUND_EATING_RANDOM, attributes: [ OBJ_ATTR_FROZEN ] },
    { img: "food/greens/frozen_turnip",   type: OBJ_TYPE_VEGGIE, scale: 1, points: 38, sound: SOUND_EATING_RANDOM, attributes: [ OBJ_ATTR_FROZEN ] }
];

var carParts1 = [
    { img: "car/tyre",    type: OBJ_TYPE_CAR_PART, scale: 1, points:  5, sound: SOUND_CAR_HANDBRAKE, attributes: [ OBJ_ATTR_GRIP ] },
    { img: "car/brakes",  type: OBJ_TYPE_CAR_PART, scale: 1, points:  5, sound: SOUND_CAR_BRAKES,    attributes: [ OBJ_ATTR_BRAKES ] }
];

var carParts2 = [
    { img: "car/gearbox", type: OBJ_TYPE_CAR_PART, scale: 1, points:  5, sound: SOUND_CAR_HANDBRAKE, attributes: [ OBJ_ATTR_SPEED ] },
    { img: "car/turbo",   type: OBJ_TYPE_CAR_PART, scale: 1, points: 15, sound: SOUND_CAR_HANDBRAKE, attributes: [ OBJ_ATTR_TURBO ] }
];

var drinksForBreakfast = [
    { img: "drinks/juice", type: OBJ_TYPE_DRINK, scale: 1, points: 15, sound: SOUND_DRINKING },
    { img: "drinks/milk",  type: OBJ_TYPE_DRINK, scale: 1, points: 10, sound: SOUND_DRINKING },
    { img: "drinks/milk2", type: OBJ_TYPE_DRINK, scale: 1, points: 10, sound: SOUND_DRINKING }
];

var drinksForLunch = [
    { img: "drinks/beer",  type: OBJ_TYPE_DRINK, scale: 1, points: 25, sound: SOUND_BEER,   attributes: [ OBJ_ATTR_BEER ] },
    { img: "drinks/juice", type: OBJ_TYPE_DRINK, scale: 1, points: 15, sound: SOUND_DRINKING },
    { img: "drinks/water", type: OBJ_TYPE_DRINK, scale: 1, points: 10, sound: SOUND_DRINKING }
];

var breakfast1 = [
    { img: "food/breakfast/cereals",        type: OBJ_TYPE_FOOD, scale: 1, points: 210, sound: SOUND_EATING_RANDOM },
    { img: "food/breakfast/coffee",         type: OBJ_TYPE_FOOD, scale: 1, points:  32, sound: SOUND_EATING_RANDOM },
    { img: "food/breakfast/croissant",      type: OBJ_TYPE_FOOD, scale: 1, points: 180, sound: SOUND_EATING_RANDOM },
    { img: "food/breakfast/eggbacon",       type: OBJ_TYPE_FOOD, scale: 1, points: 310, sound: SOUND_EATING_RANDOM },
    { img: "food/breakfast/jam",            type: OBJ_TYPE_FOOD, scale: 1, points:  50, sound: SOUND_EATING_RANDOM },
    { img: "food/breakfast/peanutbutter",   type: OBJ_TYPE_FOOD, scale: 1, points: 188, sound: SOUND_EATING_RANDOM },
    { img: "food/breakfast/toasts",         type: OBJ_TYPE_FOOD, scale: 1, points: 140, sound: SOUND_EATING_RANDOM }
];

var breakfast2 = [
    { img: "food/breakfast/chocolatesyrup", type: OBJ_TYPE_FOOD, scale: 1, points: 109, sound: SOUND_EATING_RANDOM },
    { img: "food/breakfast/maplesyrup",     type: OBJ_TYPE_FOOD, scale: 1, points:  52, sound: SOUND_EATING_RANDOM },
    { img: "food/breakfast/pancakes",       type: OBJ_TYPE_FOOD, scale: 1, points: 520, sound: SOUND_EATING_RANDOM },
    { img: "food/breakfast/pancakes2",      type: OBJ_TYPE_FOOD, scale: 1, points: 180, sound: SOUND_EATING_RANDOM },
    { img: "food/breakfast/pancakes3",      type: OBJ_TYPE_FOOD, scale: 1, points: 199, sound: SOUND_EATING_RANDOM },
    { img: "food/breakfast/waffles",        type: OBJ_TYPE_FOOD, scale: 1, points: 395, sound: SOUND_EATING_RANDOM },
    { img: "food/breakfast/yoghurt",        type: OBJ_TYPE_FOOD, scale: 1, points: 103, sound: SOUND_EATING_RANDOM }
];

var lunch1 = [
    { img: "food/lunch/beans",     type: OBJ_TYPE_FOOD, scale: 1, points: 239, sound: SOUND_EATING_RANDOM },
    { img: "food/lunch/bread",     type: OBJ_TYPE_FOOD, scale: 1, points: 69,  sound: SOUND_EATING_RANDOM },
    { img: "food/lunch/cheese",    type: OBJ_TYPE_FOOD, scale: 1, points: 113, sound: SOUND_EATING_RANDOM },
    { img: "food/lunch/chicken",   type: OBJ_TYPE_FOOD, scale: 1, points: 109, sound: SOUND_EATING_RANDOM },
    { img: "food/lunch/eggs",      type: OBJ_TYPE_FOOD, scale: 1, points: 102, sound: SOUND_EATING_RANDOM },
    { img: "food/lunch/ham",       type: OBJ_TYPE_FOOD, scale: 1, points: 46,  sound: SOUND_EATING_RANDOM },
    { img: "food/lunch/salad",     type: OBJ_TYPE_FOOD, scale: 1, points: 33,  sound: SOUND_EATING_RANDOM }
];

var lunch2 = [
    { img: "food/lunch/nachos",    type: OBJ_TYPE_FOOD, scale: 1, points: 346, sound: SOUND_EATING_RANDOM },
    { img: "food/lunch/pizza",     type: OBJ_TYPE_FOOD, scale: 1, points: 184, sound: SOUND_EATING_RANDOM },
    { img: "food/lunch/salmon",    type: OBJ_TYPE_FOOD, scale: 1, points: 185, sound: SOUND_EATING_RANDOM },
    { img: "food/lunch/soup",      type: OBJ_TYPE_FOOD, scale: 1, points: 60,  sound: SOUND_EATING_RANDOM },
    { img: "food/lunch/spaghetti", type: OBJ_TYPE_FOOD, scale: 1, points: 250, sound: SOUND_EATING_RANDOM },
    { img: "food/lunch/sushis",    type: OBJ_TYPE_FOOD, scale: 1, points: 285, sound: SOUND_EATING_RANDOM },
    { img: "food/lunch/wrap",      type: OBJ_TYPE_FOOD, scale: 1, points: 330, sound: SOUND_EATING_RANDOM }
];

var objectOrderIndex = -1;
var objectOrder = [
    {
        title: "Breakfast",
        objects: [ breakfast1, drinksForBreakfast ]
    },
    {
        objects: [ breakfast2, carParts1 ]
    },
    {
        title: "Your 5 a day",
        objects: [ OBJ_LOAD_VEGGIES ]
    },
    {
        title: "Lunch",
        objects: [ lunch1, carParts2 ]
    },
    {
        objects: [ lunch2, drinksForLunch ]
    }
];

// TODO: set a title: Hungry Birds

// coordinates of boxes in which 1 and only 1 object can be inserted
var boxesForObjects = [
]

var vegImgHalfWidth = 35;//, drinkImgHalfWidth = breakfastImgHalfWidth = 35, lunchImgHalfWidth = 35;
var objImgHalfWidth = 35;
var boxWidth, boxHeight;

function calculateObjectBoxesBoundaries()
{
    var boundaries = getBoundaries();

    // calculate the position and size of boxes in which to insert objects
    var boxCountHorizontally = 6, boxCountVertically = 4;
    boxWidth = (boundaries.right-boundaries.left)/boxCountHorizontally;
    boxHeight = (boundaries.bottom-boundaries.top)/boxCountVertically;
    var max = boxCountHorizontally * boxCountVertically;
    for (var i = 0, hori = 0, vert = 0 ; i < max ; i++)
    {
        var available = true;
        if (hori == 0 && vert == 0) available = false;
        else if (hori == 0 && vert == boxCountVertically-1) available = false;
        else if (hori == boxCountHorizontally-1 && vert == 0) available = false;
        else if (hori == boxCountHorizontally-1 && vert == boxCountVertically-1) available = false;

        var newBox = { x: boundaries.left+hori*boxWidth, y: boundaries.top+vert*boxHeight, available: available };
        boxesForObjects.push(newBox);
        hori++;
        if (hori == boxCountHorizontally)
        {
            hori = 0;
            vert++;
        }
    }
}

function addObjectsContainer()
{
    stage.addChild(objectsContainer);
}

function loadVeggies()
{
    // objects to collect
    var indexOfFrozenVeg = Math.floor(randomRange(0, fruitsAndVeggies.length));
    for (var i = 0 ; i < fruitsAndVeggies.length ; i++)
    {
        var veg = (i == indexOfFrozenVeg ? frozenFruitsAndVeggies[i] : fruitsAndVeggies[i]);
        var boxIndex = null;
        while (boxIndex == null)
        {
            var index = Math.floor(randomRange(0, boxesForObjects.length));
            if (boxesForObjects[index].available)
            {
                boxesForObjects[index].available = false;
                boxIndex = index;
            }
        }
        var x = randomRange(boxesForObjects[boxIndex].x+vegImgHalfWidth, boxesForObjects[boxIndex].x+boxWidth-vegImgHalfWidth);
        var y = randomRange(boxesForObjects[boxIndex].y+vegImgHalfWidth, boxesForObjects[boxIndex].y+boxHeight-vegImgHalfWidth);

        // add object to the scene
        var o = new Object(veg.img, x, y, veg.type, veg.points, veg.sound, veg.attributes);
        objects.push(o);
        objectsContainer.addChild(o.view);
        o.view.image.onload = function()
        {
            o.scaleObject(veg.scale);
            o.view.recenter();
        }
    }
}

function loadObjects(array, objHalfWidth)
{
    // objects to collect
    for (var i = 0 ; i < array.length ; i++)
    {
        var obj = array[i];
        var boxIndex = null;
        while (boxIndex == null)
        {
            var index = Math.floor(randomRange(0, boxesForObjects.length));
            if (boxesForObjects[index].available)
            {
                boxesForObjects[index].available = false;
                boxIndex = index;
            }
        }
        var x = randomRange(boxesForObjects[boxIndex].x+objHalfWidth, boxesForObjects[boxIndex].x+boxWidth-objHalfWidth);
        var y = randomRange(boxesForObjects[boxIndex].y+objHalfWidth, boxesForObjects[boxIndex].y+boxHeight-objHalfWidth);

        // add object to the scene
        var o = new Object(obj.img, x, y, obj.type, obj.points, obj.sound, obj.attributes);
        objects.push(o);
        objectsContainer.addChild(o.view);
        o.view.image.onload = function()
        {
            o.scaleObject(obj.scale);
            o.view.recenter();
        }
    }
}

function removeAllObjects()
{
    objectsContainer.removeAllChildren();
    objects = [];
}

function resetBoxes()
{
    for (var i = 0 ; i < boxesForObjects.length ; i++)
    {
        var box = boxesForObjects[i];
        box.available = true;
        // check if there's a player in this box
        for (var p = 0 ; box.available && p < players.length ; p++)
        {
            var pos = players[p].view.getPosition();
            if (pos.x >= box.x && pos.x <= box.x+boxWidth &&
                pos.y >= box.y && pos.y <= box.y+boxHeight)
            {
                box.available = false;
            }
        }
    }
}

function activeObjectsRemaining()
{
    for (var i = 0 ; i < objects.length ; i++)
    {
        if (objects[i].view.displayed)
        {
            return true;
        }
    }
    return false;
}

function findActiveObjects()
{
    var activeObjects = [];
    for (var i = 0 ; i < objects.length ; i++)
    {
        var obj = objects[i].view;
        if (obj.displayed)
        {
            // create an structure containing the object position and other parameters useful for the player
            var o = {
                type: obj.type,
                position: {
                    x: obj.x,
                    y: obj.y
                },
                points: obj.points,
                attributes: obj.attributes
            };
            activeObjects.push(o);
        }
    }
    return activeObjects;
}