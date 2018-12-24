const Rect = require('./Rect');
const QuadTree = require('./QuadTree');
const Player = require('./Player');
const Food = require('./Food');
const util = require('./utils/methods');

let Board = class {
    constructor(width, height) {
        this.width = width;
        this.height = height;

        this.foodQuadTree = new QuadTree(0, new Rect(0, 0, this.width, this.height));
        this.playersQuadTree = new QuadTree(0, new Rect(0, 0, this.width, this.height));        
        this.players = {};
    }

    addPlayer(playerId) {
        this.players[playerId] = new Player(playerId, this.getRandomPos(), 15, util.getNow());
    }
    changePlayerDirection(id, dir) {
        const player = this.players[id];
        if(!player) return;

        player.direction.x = (dir.x === 0) ? 0 : (dir.x > 0) ? 1 : -1;
        player.direction.y = (dir.y === 0) ? 0 : (dir.y > 0) ? 1 : -1;
    }
    updateAllPlayerPositions() {
        Object.keys(this.players).forEach(key => {
            const player = this.players[key];
            player.updatePos(util.getNow());
            this.checkPlayerCollisions(player);
        });
    }

    updatePlayersQuadTree() {
        this.playersQuadTree.clear();

        let players = this.players;
        Object.keys(players).forEach(key => {
            const player = players[key];
            this.playersQuadTree.insert(player);
        });
    }
    checkPlayerCollisions(player) {
        const list = this.playersQuadTree.retrieve(player.pos, player.radius);
        player.checkCollision(list);
    }

    getRandomPos() {
        return {
            x: Math.floor(Math.random() * this.width),
            y: Math.floor(Math.random() * this.height)
        }
    }
}

module.exports = Board;