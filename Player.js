const Circle = require('./Circle');

const RADIUS = 15;

let Player = class extends Circle {
    constructor(id, pos, now) {
        super(id, pos, 15, 'grey');

        this.id = id;
        this.speed = 1/4;
        this.direction = {
            x: -1,
            y: -1
        };
        this.lastUpdateTime = now;
    }

    updatePos(now) {
        const elapsedTime = now - this.lastUpdateTime;
    
        const distance = elapsedTime * this.speed;
    
        this.pos.x += this.direction.x * distance;
        this.pos.y -= this.direction.y * distance;

        if(this.pos.x <= 0+this.radius) this.direction.x = 1;
        else if(this.pos.x > 10000-this.radius) this.direction.x = -1;

        if(this.pos.y <= 0+this.radius) this.direction.y = -1;
        else if(this.pos.y > 5000-this.radius) this.direction.y = 1;

        this.lastUpdateTime = now;
    }

    grow(radius) {
        this.radius += radius;
    }
    showCollision() {
        this.color = 'red';
    }


    getCollisions(list) {
        let collisionList = [];

        list.forEach(other => {
            if(other.id === this.id) return;

            const distanceSqr = this.calcDistanceSqr(this.pos, other.pos);

            // Touching at least edge
            if(distanceSqr <= this.calcSqr(this.radius + other.radius)) {
                collisionList.push(other);
            }
        });

        return collisionList;
    }
    getAbsorbedPlayers(list) {
        let absorbedList = [];

        list.forEach(other => {
            if(other.id === this.id) return;

            const distanceSqr = this.calcDistanceSqr(this.pos, other.pos);

            // Touching at least center
            if(distanceSqr <= this.calcSqr(other.radius)) {
                // If 1.5 times larger
                const area = this.calcArea(this.radius);
                const otherArea = this.calcArea(other.radius);
                
                if(area >= 1.5*otherArea){
                    absorbedList.push(other);
                }
            }
        });

        return absorbedList;
    }

    checkCollisionOriginal(list) {
        let collided;
        
        if(Array.isArray(list)) {
            collided = list.some(other => {
                if(other.id === this.id) return false;

                const distanceSqr = this.calcDistanceSqr(this.pos, other.pos);
    
                if(distanceSqr <= this.calcSqr(this.radius + other.radius)) {
                    return true;
                }
                return false;
            });
        }else {
            collided = Object.keys(list).some(id => {
                if(id === this.id) return false;
    
                // console.log(`${key} !== ${player.id}`)
        
                const other = list[id];
                const distanceSqr = this.calcDistanceSqr(this.pos, other.pos);
    
                if(distanceSqr <= this.calcSqr(this.radius + other.radius)) {
                    return true;
                }
                return false;
            });
        }

        this.color = collided ? 'red' : 'grey';
    }

    calcArea(radius) {
        return Math.PI * radius * radius;
    }
    calcDistanceSqr(a, b) {
        const x = a.x - b.x;
        const y = a.y - b.y;
    
        return x*x + y*y;
    }
    calcSqr(a) {
        return a*a;
    }
}

module.exports = Player;