import { createjs } from "../lib/createjs";
import {
	OBJ_ATTR_FROZEN,
	OBJ_ATTR_BEER,
	OBJ_ATTR_GRIP,
	OBJ_ATTR_SPEED,
	OBJ_ATTR_BRAKES,
	OBJ_ATTR_TURBO,
	OBJ_LOAD_VEGGIES,
	OBJ_TYPE_VEGGIE,
	OBJ_TYPE_CAR_PART,
	OBJ_TYPE_DRINK,
	OBJ_TYPE_FOOD,
} from "./constants";
import { GameObject } from "./GameObject";
import {
	SOUND_EATING_RANDOM,
	SOUND_BEER,
	SOUND_DRINKING,
	SOUND_CAR_HANDBRAKE,
	SOUND_CAR_BRAKES,
} from "./sounds";
import { gameState, getBoundaries } from "./state";
import { randomRange } from "./util";

export const fruitsAndVeggies = [
	{ img: "food/greens/broccoli", type: OBJ_TYPE_VEGGIE, scale: 1, points: 34, sound: SOUND_EATING_RANDOM },
	{ img: "food/greens/carrot",   type: OBJ_TYPE_VEGGIE, scale: 1, points: 41, sound: SOUND_EATING_RANDOM },
	{ img: "food/greens/eggplant", type: OBJ_TYPE_VEGGIE, scale: 1, points: 24, sound: SOUND_EATING_RANDOM },
	{ img: "food/greens/gherkin",  type: OBJ_TYPE_VEGGIE, scale: 1, points: 17, sound: SOUND_EATING_RANDOM },
	{ img: "food/greens/onion",    type: OBJ_TYPE_VEGGIE, scale: 1, points: 40, sound: SOUND_EATING_RANDOM },
	{ img: "food/greens/pepper",   type: OBJ_TYPE_VEGGIE, scale: 1, points: 31, sound: SOUND_EATING_RANDOM },
	{ img: "food/greens/potato",   type: OBJ_TYPE_VEGGIE, scale: 1, points: 70, sound: SOUND_EATING_RANDOM },
	{ img: "food/greens/tomato",   type: OBJ_TYPE_VEGGIE, scale: 1, points: 18, sound: SOUND_EATING_RANDOM },
	{ img: "food/greens/turnip",   type: OBJ_TYPE_VEGGIE, scale: 1, points: 28, sound: SOUND_EATING_RANDOM },
];

export const frozenFruitsAndVeggies = [
	{ img: "food/greens/frozen_broccoli", type: OBJ_TYPE_VEGGIE, scale: 1, points: 44, sound: SOUND_EATING_RANDOM, attributes: [OBJ_ATTR_FROZEN] },
	{ img: "food/greens/frozen_carrot",   type: OBJ_TYPE_VEGGIE, scale: 1, points: 51, sound: SOUND_EATING_RANDOM, attributes: [OBJ_ATTR_FROZEN] },
	{ img: "food/greens/frozen_eggplant", type: OBJ_TYPE_VEGGIE, scale: 1, points: 34, sound: SOUND_EATING_RANDOM, attributes: [OBJ_ATTR_FROZEN] },
	{ img: "food/greens/frozen_gherkin",  type: OBJ_TYPE_VEGGIE, scale: 1, points: 27, sound: SOUND_EATING_RANDOM, attributes: [OBJ_ATTR_FROZEN] },
	{ img: "food/greens/frozen_onion",    type: OBJ_TYPE_VEGGIE, scale: 1, points: 50, sound: SOUND_EATING_RANDOM, attributes: [OBJ_ATTR_FROZEN] },
	{ img: "food/greens/frozen_pepper",   type: OBJ_TYPE_VEGGIE, scale: 1, points: 41, sound: SOUND_EATING_RANDOM, attributes: [OBJ_ATTR_FROZEN] },
	{ img: "food/greens/frozen_potato",   type: OBJ_TYPE_VEGGIE, scale: 1, points: 80, sound: SOUND_EATING_RANDOM, attributes: [OBJ_ATTR_FROZEN] },
	{ img: "food/greens/frozen_tomato",   type: OBJ_TYPE_VEGGIE, scale: 1, points: 28, sound: SOUND_EATING_RANDOM, attributes: [OBJ_ATTR_FROZEN] },
	{ img: "food/greens/frozen_turnip",   type: OBJ_TYPE_VEGGIE, scale: 1, points: 38, sound: SOUND_EATING_RANDOM, attributes: [OBJ_ATTR_FROZEN] },
];

export const carParts1 = [
	{ img: "car/tyre",   type: OBJ_TYPE_CAR_PART, scale: 1, points:  5, sound: SOUND_CAR_HANDBRAKE, attributes: [OBJ_ATTR_GRIP] },
	{ img: "car/brakes", type: OBJ_TYPE_CAR_PART, scale: 1, points:  5, sound: SOUND_CAR_BRAKES,    attributes: [OBJ_ATTR_BRAKES] },
];

export const carParts2 = [
	{ img: "car/gearbox", type: OBJ_TYPE_CAR_PART, scale: 1, points:  5, sound: SOUND_CAR_HANDBRAKE, attributes: [OBJ_ATTR_SPEED] },
	{ img: "car/turbo",   type: OBJ_TYPE_CAR_PART, scale: 1, points: 15, sound: SOUND_CAR_HANDBRAKE, attributes: [OBJ_ATTR_TURBO] },
];

export const drinksForBreakfast = [
	{ img: "drinks/juice", type: OBJ_TYPE_DRINK, scale: 1, points: 15, sound: SOUND_DRINKING },
	{ img: "drinks/milk",  type: OBJ_TYPE_DRINK, scale: 1, points: 10, sound: SOUND_DRINKING },
	{ img: "drinks/milk2", type: OBJ_TYPE_DRINK, scale: 1, points: 10, sound: SOUND_DRINKING },
];

export const drinksForLunch = [
	{ img: "drinks/beer",  type: OBJ_TYPE_DRINK, scale: 1, points: 25, sound: SOUND_BEER,     attributes: [OBJ_ATTR_BEER] },
	{ img: "drinks/juice", type: OBJ_TYPE_DRINK, scale: 1, points: 15, sound: SOUND_DRINKING },
	{ img: "drinks/water", type: OBJ_TYPE_DRINK, scale: 1, points: 10, sound: SOUND_DRINKING },
];

export const breakfast1 = [
	{ img: "food/breakfast/cereals",      type: OBJ_TYPE_FOOD, scale: 1, points: 210, sound: SOUND_EATING_RANDOM },
	{ img: "food/breakfast/coffee",       type: OBJ_TYPE_FOOD, scale: 1, points:  32, sound: SOUND_EATING_RANDOM },
	{ img: "food/breakfast/croissant",    type: OBJ_TYPE_FOOD, scale: 1, points: 180, sound: SOUND_EATING_RANDOM },
	{ img: "food/breakfast/eggbacon",     type: OBJ_TYPE_FOOD, scale: 1, points: 310, sound: SOUND_EATING_RANDOM },
	{ img: "food/breakfast/jam",          type: OBJ_TYPE_FOOD, scale: 1, points:  50, sound: SOUND_EATING_RANDOM },
	{ img: "food/breakfast/peanutbutter", type: OBJ_TYPE_FOOD, scale: 1, points: 188, sound: SOUND_EATING_RANDOM },
	{ img: "food/breakfast/toasts",       type: OBJ_TYPE_FOOD, scale: 1, points: 140, sound: SOUND_EATING_RANDOM },
];

export const breakfast2 = [
	{ img: "food/breakfast/chocolatesyrup", type: OBJ_TYPE_FOOD, scale: 1, points: 109, sound: SOUND_EATING_RANDOM },
	{ img: "food/breakfast/maplesyrup",     type: OBJ_TYPE_FOOD, scale: 1, points:  52, sound: SOUND_EATING_RANDOM },
	{ img: "food/breakfast/pancakes",       type: OBJ_TYPE_FOOD, scale: 1, points: 520, sound: SOUND_EATING_RANDOM },
	{ img: "food/breakfast/pancakes2",      type: OBJ_TYPE_FOOD, scale: 1, points: 180, sound: SOUND_EATING_RANDOM },
	{ img: "food/breakfast/pancakes3",      type: OBJ_TYPE_FOOD, scale: 1, points: 199, sound: SOUND_EATING_RANDOM },
	{ img: "food/breakfast/waffles",        type: OBJ_TYPE_FOOD, scale: 1, points: 395, sound: SOUND_EATING_RANDOM },
	{ img: "food/breakfast/yoghurt",        type: OBJ_TYPE_FOOD, scale: 1, points: 103, sound: SOUND_EATING_RANDOM },
];

export const lunch1 = [
	{ img: "food/lunch/beans",   type: OBJ_TYPE_FOOD, scale: 1, points: 239, sound: SOUND_EATING_RANDOM },
	{ img: "food/lunch/bread",   type: OBJ_TYPE_FOOD, scale: 1, points:  69, sound: SOUND_EATING_RANDOM },
	{ img: "food/lunch/cheese",  type: OBJ_TYPE_FOOD, scale: 1, points: 113, sound: SOUND_EATING_RANDOM },
	{ img: "food/lunch/chicken", type: OBJ_TYPE_FOOD, scale: 1, points: 109, sound: SOUND_EATING_RANDOM },
	{ img: "food/lunch/eggs",    type: OBJ_TYPE_FOOD, scale: 1, points: 102, sound: SOUND_EATING_RANDOM },
	{ img: "food/lunch/ham",     type: OBJ_TYPE_FOOD, scale: 1, points:  46, sound: SOUND_EATING_RANDOM },
	{ img: "food/lunch/salad",   type: OBJ_TYPE_FOOD, scale: 1, points:  33, sound: SOUND_EATING_RANDOM },
];

export const lunch2 = [
	{ img: "food/lunch/nachos",    type: OBJ_TYPE_FOOD, scale: 1, points: 346, sound: SOUND_EATING_RANDOM },
	{ img: "food/lunch/pizza",     type: OBJ_TYPE_FOOD, scale: 1, points: 184, sound: SOUND_EATING_RANDOM },
	{ img: "food/lunch/salmon",    type: OBJ_TYPE_FOOD, scale: 1, points: 185, sound: SOUND_EATING_RANDOM },
	{ img: "food/lunch/soup",      type: OBJ_TYPE_FOOD, scale: 1, points:  60, sound: SOUND_EATING_RANDOM },
	{ img: "food/lunch/spaghetti", type: OBJ_TYPE_FOOD, scale: 1, points: 250, sound: SOUND_EATING_RANDOM },
	{ img: "food/lunch/sushis",    type: OBJ_TYPE_FOOD, scale: 1, points: 285, sound: SOUND_EATING_RANDOM },
	{ img: "food/lunch/wrap",      type: OBJ_TYPE_FOOD, scale: 1, points: 330, sound: SOUND_EATING_RANDOM },
];

export const objectOrder = [
	{ title: "Breakfast",    objects: [breakfast1, drinksForBreakfast] },
	{                        objects: [breakfast2, carParts1] },
	{ title: "Your 5 a day", objects: [OBJ_LOAD_VEGGIES] },
	{ title: "Lunch",        objects: [lunch1, carParts2] },
	{                        objects: [lunch2, drinksForLunch] },
];

const vegImgHalfWidth = 35;
const objImgHalfWidth = 35;

export function calculateObjectBoxesBoundaries() {
	const boundaries = getBoundaries();
	const boxCountHorizontally = 6;
	const boxCountVertically = 4;
	gameState.boxWidth = (boundaries.right - boundaries.left) / boxCountHorizontally;
	gameState.boxHeight = (boundaries.bottom - boundaries.top) / boxCountVertically;
	const max = boxCountHorizontally * boxCountVertically;

	for (let i = 0, hori = 0, vert = 0; i < max; i++) {
		let available = true;
		if ((hori === 0 || hori === boxCountHorizontally - 1) && (vert === 0 || vert === boxCountVertically - 1)) {
			available = false;
		}
		gameState.boxesForObjects.push({
			x: boundaries.left + hori * gameState.boxWidth,
			y: boundaries.top + vert * gameState.boxHeight,
			available,
		});
		hori++;
		if (hori === boxCountHorizontally) { hori = 0; vert++; }
	}
}

export function addObjectsContainer() {
	gameState.objectsContainer = new createjs.Container();
	gameState.stage.addChild(gameState.objectsContainer);
}

function pickBox() {
	let boxIndex: number | null = null;
	while (boxIndex === null) {
		const idx = Math.floor(randomRange(0, gameState.boxesForObjects.length));
		if (gameState.boxesForObjects[idx].available) {
			gameState.boxesForObjects[idx].available = false;
			boxIndex = idx;
		}
	}
	return boxIndex;
}

export function loadVeggies() {
	const indexOfFrozenVeg = Math.floor(randomRange(0, fruitsAndVeggies.length));
	for (let i = 0; i < fruitsAndVeggies.length; i++) {
		const veg = i === indexOfFrozenVeg ? frozenFruitsAndVeggies[i] : fruitsAndVeggies[i];
		const boxIndex = pickBox();
		const box = gameState.boxesForObjects[boxIndex];
		const x = randomRange(box.x + vegImgHalfWidth, box.x + gameState.boxWidth - vegImgHalfWidth);
		const y = randomRange(box.y + vegImgHalfWidth, box.y + gameState.boxHeight - vegImgHalfWidth);

		const o = new (GameObject as any)(veg.img, x, y, veg.type, veg.points, veg.sound, (veg as any).attributes);
		gameState.objects.push(o);
		gameState.objectsContainer.addChild(o.view);
		o.view.image.onload = function () {
			o.scaleObject(veg.scale);
			o.view.recenter();
		};
	}
}

export function loadObjects(array: any[], halfWidth: number) {
	for (const obj of array) {
		const boxIndex = pickBox();
		const box = gameState.boxesForObjects[boxIndex];
		const x = randomRange(box.x + halfWidth, box.x + gameState.boxWidth - halfWidth);
		const y = randomRange(box.y + halfWidth, box.y + gameState.boxHeight - halfWidth);

		const o = new (GameObject as any)(obj.img, x, y, obj.type, obj.points, obj.sound, obj.attributes);
		gameState.objects.push(o);
		gameState.objectsContainer.addChild(o.view);
		o.view.image.onload = function () {
			o.scaleObject(obj.scale);
			o.view.recenter();
		};
	}
}

export function removeAllObjects() {
	gameState.objectsContainer.removeAllChildren();
	gameState.objects = [];
}

export function resetBoxes() {
	for (const box of gameState.boxesForObjects) {
		box.available = true;
		for (const p of gameState.players) {
			const pos = p.view.getPosition();
			if (
				pos.x >= box.x && pos.x <= box.x + gameState.boxWidth &&
				pos.y >= box.y && pos.y <= box.y + gameState.boxHeight
			) {
				box.available = false;
				break;
			}
		}
	}
}

export function activeObjectsRemaining() {
	return gameState.objects.some((o) => o.view.displayed);
}

export function findActiveObjects() {
	return gameState.objects
		.filter((o) => o.view.displayed)
		.map((o) => ({
			type: o.view.type,
			position: { x: o.view.x, y: o.view.y },
			points: o.view.points,
			attributes: o.view.attributes,
		}));
}
