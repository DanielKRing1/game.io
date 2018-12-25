const uuid = require('uuid/v1');

const Rect = require('./Rect');
const QuadTree = require('./Quadtree.js');
const Player = require('./Player');
const Food = require('./Food');
const util = require('./utils/methods');

const MAX_FOOD = 1000;

let Board = class {
    constructor(width, height) {
        this.width = width;
        this.height = height;

        this.playersQuadTree = new QuadTree(0, new Rect(0, 0, this.width, this.height), 10, 4);
        this.players = {};
        this.playerCount = 0;

        this.foodQuadTree = new QuadTree(0, new Rect(0, 0, this.width, this.height), 20, 6);
        this.food = {};
        this.foodCount = 0;
    }

    addPlayer(playerId) {
        this.players[playerId] = new Player(playerId, this.getRandomPos(), util.getNow());
        this.playerCount++;
    }
    removePlayer(player) {
        delete this.players[player.id];
        this.playersQuadTree.remove(player.pos, player.radius);
        this.playerCount--;
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
            if(!player) return;

            player.updatePos(util.getNow());
            this.checkPlayerCollisions(player);
            this.checkFoodCollisions(player);
        });
    }

    updatePlayersQuadTree() {
        this.playersQuadTree.clear();

        Object.keys(this.players).forEach(key => {
            const player = this.players[key];
            this.playersQuadTree.insert(player);
        });
    }
    checkPlayerCollisions(player) {
        const list = this.playersQuadTree.retrieve(player.pos, player.radius);

        // Change color for collision
        const collisions = player.getCollisions(list);
        if(collisions.length > 0) player.color = 'red';
        else player.color = 'grey';

        // Absorb players
        const absorbedPlayers = player.getAbsorbedPlayers(list);
        absorbedPlayers.forEach(other => {
            this.radius += other.radius;
            this.removePlayer(other);
        });
    }
    checkFoodCollisions(player) {
        const list = this.foodQuadTree.retrieve(player.pos, player.radius);
        const collisions = player.getCollisions(list);

        collisions.forEach(col => {
            player.grow(col.growRadius);
            // Delete food bite
            this.removeFood(col);
        });
    }

    addFood() {
        // const foodToAdd = 20;

        // for(let i = 0; i < foodToAdd; i++){
        //     if(this.foodCount >= MAX_FOOD) return;
        //     // console.log(this.foodCount)
        //     const id = uuid();
        //     this.food[id] = new Food(id, this.getRandomPos());
            
        //     // Add to foodQuadTree
        //     this.foodQuadTree.insert(this.food[id])

        //     this.foodCount++;
        // }
    }

    removeFood(food) {
        delete this.food[food.id];
        this.foodQuadTree.remove(food.pos, food.radius);
        this.foodCount--;
    }

    getRandomPos() {
        return {
            x: Math.floor(Math.random() * this.width),
            y: Math.floor(Math.random() * this.height)
        }
    }

    restartBoard() {
        this.players = {};
        this.playersQuadTree.clear();
        this.playerCount = 0;

        this.food = {};
        this.foodQuadTree.clear();
        this.foodCount = 0;
    }
}

module.exports = Board;