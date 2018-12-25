const Circle = require('./Circle');

const GROW_RADIUS = 0.2;
const RADIUS = 6;

let Food = class extends Circle {
    constructor(id, pos) {
        super(id, pos, RADIUS, Food.getRandomColor());
        this.growRadius = GROW_RADIUS;
    }

    static getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
      }
}

module.exports = Food;