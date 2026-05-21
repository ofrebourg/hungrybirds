import { createjs } from "../lib/createjs";

export const RAD_TO_DEG = 180 / Math.PI;

export function radToDeg(angle: number) { return angle * RAD_TO_DEG; }
export function degToRad(angle: number) { return angle / RAD_TO_DEG; }

export function randomRange(lo: number, hi: number) {
	return (hi - lo) * Math.random() + lo;
}

export function conventionalOrientation(gameOrientation: number) {
	return -gameOrientation + 90;
}

export function signedAngleBetweenVectors(v1: any, v2: any) {
	return Math.atan2(v2.y, v2.x) - Math.atan2(v1.y, v1.x);
}

export const urlParams: Record<string, string> = {};
(function () {
	const pl = /\+/g;
	const search = /([^&=]+)=?([^&]*)/g;
	const decode = (s: string) => decodeURIComponent(s.replace(pl, " "));
	const query = window.location.search.substring(1);
	let match: RegExpExecArray | null;
	while ((match = search.exec(query))) {
		urlParams[decode(match[1])] = decode(match[2]);
	}
})();

// Extend createjs.Bitmap prototype with helpers used throughout the game
const BitmapProto = createjs.Bitmap.prototype;
BitmapProto.multiplyScale = function (scale: number) {
	this.scaleX *= scale;
	this.scaleY *= scale;
};
BitmapProto.recenter = function () {
	this.regX = this.image.width / 2;
	this.regY = this.image.height / 2;
};
