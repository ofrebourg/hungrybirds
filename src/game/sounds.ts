import { createjs } from "../lib/createjs";
import { randomRange } from "./util";

export const SOUND_COLLISION = "sound_boing";
export const SOUND_BEER = "sound_openBeer";
export const SOUND_BEER2 = "sound_openBeer2";
export const SOUND_SPOON = "sound_spoon";
export const SOUND_CRUNCHING1 = "sound_crunching1";
export const SOUND_CRUNCHING2 = "sound_crunching2";
export const SOUND_CRUNCHING3 = "sound_crunching3";
export const SOUND_CRUNCHING4 = "sound_crunching4";
export const SOUND_CRUNCHING5 = "sound_crunching5";
export const SOUND_CRUNCHING6 = "sound_crunching6";
export const SOUND_CRUNCHING7 = "sound_crunching7";
export const SOUND_LIQUID = "sound_pouringLiquid";
export const SOUND_DRINKING = "sound_drink";
export const SOUND_EATING_RANDOM = "sound_eatingRandom";
export const SOUND_CAR_HANDBRAKE = "sound_carHandbrake";
export const SOUND_CAR_BRAKES = "sound_carBraking";
export const SOUND_VICTORY = "sound_victory";

const soundsEnabled = true;
let freeToPlayNextSound = true;

const playerSounds = {
	happy: [
		{ file: "sounds/FLAWLESS.mp3",         name: "flawless" },
		{ file: "sounds/LAUGH.mp3",             name: "laugh" },
		{ file: "sounds/AMAZING.mp3",           name: "amazing" },
		{ file: "sounds/brilliant.mp3",         name: "brilliant" },
	],
	angry: [
		{ file: "sounds/leavemealone.mp3",      name: "leavemealone" },
		{ file: "sounds/NOOO.mp3",              name: "nooo" },
		{ file: "sounds/OINUTTER.mp3",          name: "nutter" },
		{ file: "sounds/REVENGE.mp3",           name: "revenge" },
		{ file: "sounds/TRAITOR.mp3",           name: "traitor" },
		{ file: "sounds/youllregretthat.mp3",   name: "youllregretthat" },
		{ file: "sounds/BUMMER.mp3",            name: "bummer" },
		{ file: "sounds/UH-OH.mp3",             name: "uhoh" },
	],
	neutral: [
		{ file: "sounds/OW1.mp3", name: "ow1" },
		{ file: "sounds/OW2.mp3", name: "ow2" },
		{ file: "sounds/OW3.mp3", name: "ow3" },
	],
};

const objectSounds = {
	drinking: [
		{ file: "sounds/can-open-3.mp3",      name: SOUND_BEER },
		{ file: "sounds/pouring-beer-1.mp3",  name: SOUND_BEER2 },
		{ file: "sounds/pouring-liquid-2.mp3", name: SOUND_LIQUID },
		{ file: "sounds/drink.mp3",           name: SOUND_DRINKING },
	],
	eating: [
		{ file: "sounds/crunching1.mp3", name: SOUND_CRUNCHING1 },
		{ file: "sounds/crunching2.mp3", name: SOUND_CRUNCHING2 },
		{ file: "sounds/crunching3.mp3", name: SOUND_CRUNCHING3 },
		{ file: "sounds/crunching4.mp3", name: SOUND_CRUNCHING4 },
		{ file: "sounds/crunching5.mp3", name: SOUND_CRUNCHING5 },
		{ file: "sounds/crunching6.mp3", name: SOUND_CRUNCHING6 },
		{ file: "sounds/crunching7.mp3", name: SOUND_CRUNCHING7 },
	],
	other: [{ file: "sounds/coffee-spoon-1.mp3", name: SOUND_SPOON }],
};

const carSounds = [
	{ file: "sounds/handbrake-1.mp3", name: SOUND_CAR_HANDBRAKE },
	{ file: "sounds/car_braking.mp3", name: SOUND_CAR_BRAKES },
];

const victorySounds = [{ file: "sounds/victory.mp3", name: SOUND_VICTORY }];

const allSounds: Record<string, string> = {};

function loadSounds(array: { file: string; name: string }[], manifest: any[]) {
	for (const sound of array) {
		manifest.push({ src: sound.file, id: sound.name });
	}
}

export function registerSounds() {
	const manifest: any[] = [{ src: "sounds/Boing.wav", id: SOUND_COLLISION }];
	loadSounds(playerSounds.happy, manifest);
	loadSounds(playerSounds.angry, manifest);
	loadSounds(playerSounds.neutral, manifest);
	loadSounds(objectSounds.drinking, manifest);
	loadSounds(objectSounds.eating, manifest);
	loadSounds(carSounds, manifest);
	loadSounds(victorySounds, manifest);

	createjs.Sound.alternateExtensions = ["mp3"];
	createjs.Sound.on("fileload", soundLoaded);
	createjs.Sound.registerSounds(manifest, "");
}

function randomSoundInRange(array: { name: string }[]) {
	if (array.length === 0) return null;
	return array[Math.floor(randomRange(0, array.length))].name;
}

export function randomHappySound()   { return randomSoundInRange(playerSounds.happy); }
export function randomAngrySound()   { return randomSoundInRange(playerSounds.angry); }
export function randomNeutralSound() { return randomSoundInRange(playerSounds.neutral); }
export function randomEatingSound()  { return randomSoundInRange(objectSounds.eating); }

function soundLoaded(event: any) {
	allSounds[event.id] = event.src;
}

export function playSound(soundToPlay: string | null) {
	if (soundToPlay != null && soundsEnabled && freeToPlayNextSound) {
		freeToPlayNextSound = false;
		const instance = createjs.Sound.play(allSounds[soundToPlay]);
		if (instance) {
			instance.on("complete", () => { freeToPlayNextSound = true; });
		}
	}
}
