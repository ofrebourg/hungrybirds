/**
 * Created with JetBrains WebStorm.
 * User: Olivier Frebourg <ofrebour@cisco.com>
 * Date: 14 May 2013
 * Time: 6:15 PM
 * Cisco - 2013
 */

var soundsEnabled = true;
var freeToPlayNextSound = true;
var debugSounds = true;
const SOUND_COLLISION = "sound_boing",
      SOUND_BEER = "sound_openBeer",
      SOUND_BEER2 = "sound_openBeer2",
      SOUND_SPOON = "sound_spoon",
      SOUND_CRUNCHING1 = "sound_crunching1",
      SOUND_CRUNCHING2 = "sound_crunching2",
      SOUND_CRUNCHING3 = "sound_crunching3",
      SOUND_CRUNCHING4 = "sound_crunching4",
      SOUND_CRUNCHING5 = "sound_crunching5",
      SOUND_CRUNCHING6 = "sound_crunching6",
      SOUND_CRUNCHING7 = "sound_crunching7",
      SOUND_LIQUID = "sound_pouringLiquid",
      SOUND_DRINKING = "sound_drink",
      SOUND_EATING_RANDOM = "sound_eatingRandom",
      SOUND_CAR_HANDBRAKE = "sound_carHandbrake",
      SOUND_CAR_BRAKES = "sound_carBraking",
      SOUND_VICTORY = "sound_victory";
var playerSounds = {
    happy: [
        { file: "sounds/FLAWLESS.mp3", name: "flawless" },
        { file: "sounds/LAUGH.mp3", name: "laugh" },
        { file: "sounds/AMAZING.mp3", name: "amazing" },
        { file: "sounds/brilliant.mp3", name: "brilliant" }
    ],
    angry: [
        { file: "sounds/leavemealone.mp3", name: "leavemealone" },
        { file: "sounds/NOOO.mp3", name: "nooo" },
        { file: "sounds/OINUTTER.mp3", name: "nutter" },
        { file: "sounds/REVENGE.mp3", name: "revenge" },
        { file: "sounds/TRAITOR.mp3", name: "traitor" },
        { file: "sounds/youllregretthat.mp3", name: "youllregretthat" },
        { file: "sounds/BUMMER.mp3", name: "bummer" },
        { file: "sounds/UH-OH.mp3", name: "uhoh" }
    ],
    neutral: [
        { file: "sounds/OW1.mp3", name: "ow1" },
        { file: "sounds/OW2.mp3", name: "ow2" },
        { file: "sounds/OW3.mp3", name: "ow3" }
    ]
};
var objectSounds = {
    drinking: [
        { file: "sounds/can-open-3.mp3", name: SOUND_BEER },
        { file: "sounds/pouring-beer-1.mp3", name: SOUND_BEER2 },
        { file: "sounds/pouring-liquid-2.mp3", name: SOUND_LIQUID },
        { file: "sounds/drink.mp3", name: SOUND_DRINKING }
    ],
    eating: [
        { file: "sounds/crunching1.mp3", name: SOUND_CRUNCHING1 },
        { file: "sounds/crunching2.mp3", name: SOUND_CRUNCHING2 },
        { file: "sounds/crunching3.mp3", name: SOUND_CRUNCHING3 },
        { file: "sounds/crunching4.mp3", name: SOUND_CRUNCHING4 },
        { file: "sounds/crunching5.mp3", name: SOUND_CRUNCHING5 },
        { file: "sounds/crunching6.mp3", name: SOUND_CRUNCHING6 },
        { file: "sounds/crunching7.mp3", name: SOUND_CRUNCHING7 }
    ],
    other: [
        { file: "sounds/coffee-spoon-1.mp3", name: SOUND_SPOON }
    ]
};
var carSounds = [
    { file: "sounds/handbrake-1.mp3", name: SOUND_CAR_HANDBRAKE },
    { file: "sounds/car_braking.mp3", name: SOUND_CAR_BRAKES }
];
var victorySounds = [
    { file: "sounds/victory.mp3", name: SOUND_VICTORY }
];

let allSounds = {}

function registerSounds()
{
    // preload sounds
    if (!createjs.Sound.initializeDefaultPlugins())
    {
        console.error("Error initialising default sound plugins");
        return;
    }

    var manifest = [
        { src: "sounds/Boing.wav", id: SOUND_COLLISION }
    ]
    // allSounds[SOUND_COLLISION] = 

    loadSounds(playerSounds.happy, manifest);
    loadSounds(playerSounds.angry, manifest);
    loadSounds(playerSounds.neutral, manifest);
    loadSounds(objectSounds.drinking, manifest);
    loadSounds(objectSounds.eating, manifest);
    loadSounds(carSounds, manifest);
    loadSounds(victorySounds, manifest);

    createjs.Sound.alternateExtensions = ["mp3"];
    createjs.Sound.addEventListener("fileload", soundLoaded);
    createjs.Sound.registerManifest(manifest); // for versions before createjs-2014.12.12
    // createjs.Sound.registerSounds(manifest, ''); // for later versions (supposedly)
}

function loadSounds(array, manifest)
{
    for (var i = 0 ; i < array.length ; i++)
    {
        var sound = array[i];
        manifest.push({ src: sound.file, id: sound.name });
    }
}

function randomSoundInRange(array)
{
    if (array.length == 0)
    {
        return null;
    }
    var index = Math.floor(randomRange(0, array.length));
    return array[index].name;
}
function randomHappySound()
{
    return randomSoundInRange(playerSounds.happy);
}
function randomAngrySound()
{
    return randomSoundInRange(playerSounds.angry);
}
function randomNeutralSound()
{
    return randomSoundInRange(playerSounds.neutral);
}

function randomEatingSound()
{
    return randomSoundInRange(objectSounds.eating);
}

function soundLoaded(event)
{
    allSounds[event.id] = event.src
    if (debugSounds)
    {
        console.log("loaded sound '"+event.id+"'", event);
    }
}

function playSound(soundToPlay)
{
    if (debugSounds) {
        console.log(`%cplay sound ${soundToPlay}, freeToPlay=${freeToPlayNextSound}`, 'color: blue')
    }
    if (soundToPlay != null && soundsEnabled)
    {
        freeToPlayNextSound = false;
        var mySound = createjs.Sound.play(allSounds[soundToPlay]);
        mySound.addEventListener("complete", function(e) {
            freeToPlayNextSound = true;
            if (debugSounds) {
                console.log('%cfinished playing', 'color: green', soundToPlay)
            }
        });
    }
}