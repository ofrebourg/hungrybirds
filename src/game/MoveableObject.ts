import { createjs } from "../lib/createjs";
import { SCALE, TYPE_OBJECT } from "./constants";
import { gameState } from "./state";
import { radToDeg } from "./util";

const LINEAR_DAMPING = 0.5;
const ANGULAR_DAMPING = 0.5;
const centerOffset = 2;

export function MoveableObject(this: any, x: number, y: number) {
	const radius = 18;

	this.view = new createjs.Bitmap("images/gem.png");
	this.view.regX = radius + centerOffset;
	this.view.regY = radius + centerOffset;

	const fixDef = new gameState.b2d.b2FixtureDef();
	fixDef.density = 100;
	fixDef.friction = 0.1;
	fixDef.restitution = 0.8;

	const bodyDef = new gameState.b2d.b2BodyDef();
	bodyDef.type = gameState.b2d.b2Body.b2_dynamicBody;
	bodyDef.position = new gameState.b2d.b2Vec2(x / SCALE, y / SCALE);
	fixDef.shape = new gameState.b2d.b2CircleShape(radius / SCALE);

	this.view.body = gameState.world.CreateBody(bodyDef);
	this.view.body.CreateFixture(fixDef);
	this.view.on("tick", moveableObjectTick);

	this.view.body.SetLinearDamping(LINEAR_DAMPING);
	this.view.body.SetAngularDamping(ANGULAR_DAMPING);
	this.view.body.SetUserData({ type: TYPE_OBJECT });

	this.view.getPosition = function () { return { x: this.x, y: this.y }; };
	this.view.getOrientation = function () { return this.rotation; };
}

function moveableObjectTick(this: any) {
	this.x = this.body.GetPosition().x * SCALE;
	this.y = this.body.GetPosition().y * SCALE;
	this.rotation = radToDeg(this.body.GetAngle());
}
