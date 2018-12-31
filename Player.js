const Circle = require('./Circle');

const RADIUS = 15;

let Player = class extends Circle {
    constructor(id, pos, windowSize, now) {
        super(id, pos, 100 * Math.random(), 'grey');

        this.id = id;
        this.name = this.makeName();
        this.speed = 1/6;
        this.direction = {
            x: -1,
            y: 1
        };
        this.windowSize = windowSize;
        this.lastUpdateTime = now;
    }

    makeName() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      
        for (var i = 0; i < 5; i++)
          text += possible.charAt(Math.floor(Math.random() * possible.length));
      
        return text;
      }

    updatePos(now) {
        const elapsedTime = now - this.lastUpdateTime;
    
        const distance = elapsedTime * this.speed;
    
        this.pos.x += this.direction.x * distance;
        this.pos.y -= this.direction.y * distance;

        if(this.pos.x <= 0+this.radius) this.direction.x = 1;
        else if(this.pos.x > 5000-this.radius) this.direction.x = -1;

        if(this.pos.y <= 0+this.radius) this.direction.y = -1;
        else if(this.pos.y > 2500-this.radius) this.direction.y = 1;

        this.lastUpdateTime = now;
    }

    grow(radius) {
        this.radius += radius;
    }
    absorbPlayer(radius) {
        this.radius = Math.sqrt(this.calcSqr(this.radius) + this.calcSqr(radius));
        // this.radius += (radius / radius**1.44) * 10;
    }
    showCollision() {
        this.color = 'red';
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