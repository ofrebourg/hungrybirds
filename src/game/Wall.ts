import { createjs } from "../lib/createjs";
import { SCALE, TYPE_WALL } from "./constants";
import { gameState } from "./state";
import { radToDeg } from "./util";

export function Wall(this: any, x: number, y: number, width: number, height: number, image: string) {
	this.view = new createjs.Bitmap(image);
	this.view.regX = width * SCALE;
	this.view.regY = height * SCALE;

	const fixDef = new gameState.b2d.b2FixtureDef();
	fixDef.density = 1;
	fixDef.friction = 1;
	fixDef.restitution = 0.25;

	const bodyDef = new gameState.b2d.b2BodyDef();
	bodyDef.type = gameState.b2d.b2Body.b2_staticBody;
	bodyDef.position.x = x;
	bodyDef.position.y = y;

	fixDef.shape = new gameState.b2d.b2PolygonShape();
	fixDef.shape.SetAsBox(width, height);

	this.view.body = gameState.world.CreateBody(bodyDef);
	this.view.body.CreateFixture(fixDef);
	this.view.on("tick", wallTick);
	this.view.body.SetUserData({ type: TYPE_WALL });
}

function wallTick(this: any) {
	this.x = this.body.GetPosition().x * SCALE;
	this.y = this.body.GetPosition().y * SCALE;
}
