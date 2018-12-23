let Board = class {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }

    getRandomPos() {
        return {
            x: Math.floor(Math.random() * this.width),
            y: Math.floor(Math.random() * this.height)
        }
    }
}

module.exports = Board;