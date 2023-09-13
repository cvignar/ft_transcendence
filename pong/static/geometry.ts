import { Side } from './common.js';

export class Vec {
	x: number = 0;
	y: number = 0;
	constructor (x: number, y: number) {
		this.x = x;
		this.y = y;
    }
	copy(v: Vec) {
		this.x = v.x;
		this.y = v.y;
	}
	getLength(): number {
		return Math.round(Math.sqrt(this.x * this.x + this.y * this.y));
	}
	getSquaredLength(): number {
		return this.x * this.x + this.y * this.y;
	}
	recalcAtConstLen_byX(x: number) {
		const length: number = this.getLength();
		if (Math.abs(x) < length) {
			this.x = x;
			const signY: number = this.y < 0 ? -1 : 1;
			this.y = signY * Math.round(Math.sqrt(length * length - x * x));
		} else {
			const signX: number = x < 0 ? -1 : 1;
			this.x = signX * length;
			this.y = 0;
		}
	}
	mult(num: number) {
		this.x = Math.round(num * this.x);
		this.y = Math.round(num * this.y);
	}
	multNew(num: number): Vec {
		return new Vec(Math.round(num * this.x), Math.round(num * this.y));
	}
	sum(v: Vec) {
		this.x = Math.round(this.x + v.x);
		this.y = Math.round(this.y + v.y);
	}
	sumNew(v: Vec): Vec {
		return new Vec(this.x + v.x, this.y + v.y);
	}
}

export class Circle {
	center: Vec;
	radius: number = 0;
	constructor (x: number, y: number, r: number) {
		this.center = new Vec(x, y);
		this.radius = r;
	}
}

export class Rectangle {
	v0: Vec;
    v1: Vec;
	constructor (x: number, y: number, w: number, h: number) {	
		this.v0 = new Vec(x, y);
		if (w < 1 || h < 1) {
			this.v1 = new Vec(this.v0.x, this.v0.y);
		} else {
			this.v1 = new Vec(this.v0.x + w - 1, this.v0.y + h - 1);
		}
	}
	pointInside(v: Vec) : boolean {
		if (v.x >= this.v0.x && v.x <= this.v1.x && v.y > this.v0.y && v.y <= this.v1.y)
			return true;
		return false;
	}
	pointOutside(v: Vec) : Side {
		if (v.y < this.v0.y) { return Side.BOTTOM; }
		if (v.y > this.v1.y) { return Side.TOP; }
		if (v.x < this.v0.x) { return Side.LEFT; }
		if (v.x > this.v1.x) { return Side.RIGHT; }
		return Side.NO;
	}
	setY(y: number) {
		const h: number = this.v1.y - this.v0.y;
		this.v0.y = y;
		this.v1.y = y + h;
	}
}
