let Player = class {
    constructor(id, pos, now) {
        this.id = id;
        this.pos = pos;
        this.speed = 1/4;
        this.radius = 15;
        this.color = 'grey'
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

        if(this.pos.x <= 100) this.direction.x = 1;
        else if(this.pos.x > 1000) this.direction.x = -1;

        if(this.pos.y <= 100) this.direction.y = -1;
        else if(this.pos.y > 500) this.direction.y = 1;
    }

    checkCollision(list) {
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