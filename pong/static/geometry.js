import { Side } from './common.js';
export class Vec {
    constructor(x, y) {
        this.x = 0;
        this.y = 0;
        this.x = x;
        this.y = y;
    }
    copy(v) {
        this.x = v.x;
        this.y = v.y;
    }
    getLength() {
        return Math.round(Math.sqrt(this.x * this.x + this.y * this.y));
    }
    getSquaredLength() {
        return this.x * this.x + this.y * this.y;
    }
    recalcAtConstLen_byX(x) {
        const length = this.getLength();
        if (Math.abs(x) < length) {
            this.x = x;
            const signY = this.y < 0 ? -1 : 1;
            this.y = signY * Math.round(Math.sqrt(length * length - x * x));
        }
        else {
            const signX = x < 0 ? -1 : 1;
            this.x = signX * length;
            this.y = 0;
        }
    }
    mult(num) {
        this.x = Math.round(num * this.x);
        this.y = Math.round(num * this.y);
    }
    multNew(num) {
        return new Vec(Math.round(num * this.x), Math.round(num * this.y));
    }
    sum(v) {
        this.x = Math.round(this.x + v.x);
        this.y = Math.round(this.y + v.y);
    }
    sumNew(v) {
        return new Vec(this.x + v.x, this.y + v.y);
    }
}
export class Circle {
    constructor(x, y, r) {
        this.radius = 0;
        this.center = new Vec(x, y);
        this.radius = r;
    }
}
export class Rectangle {
    constructor(x, y, w, h) {
        this.v0 = new Vec(x, y);
        if (w < 1 || h < 1) {
            this.v1 = new Vec(this.v0.x, this.v0.y);
        }
        else {
            this.v1 = new Vec(this.v0.x + w - 1, this.v0.y + h - 1);
        }
    }
    pointInside(v) {
        if (v.x >= this.v0.x && v.x <= this.v1.x && v.y > this.v0.y && v.y <= this.v1.y)
            return true;
        return false;
    }
    pointOutside(v) {
        if (v.y < this.v0.y) {
            return Side.BOTTOM;
        }
        if (v.y > this.v1.y) {
            return Side.TOP;
        }
        if (v.x < this.v0.x) {
            return Side.LEFT;
        }
        if (v.x > this.v1.x) {
            return Side.RIGHT;
        }
        return Side.NO;
    }
    setY(y) {
        const h = this.v1.y - this.v0.y;
        this.v0.y = y;
        this.v1.y = y + h;
    }
}
